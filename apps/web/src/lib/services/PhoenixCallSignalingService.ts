import { supabase } from '../supabase'

export type PhoenixSignalType =
  | 'offer' | 'answer' | 'ice_candidate' | 'call_end' | 'call_reject'
  | 'call_busy' | 'screen_share_start' | 'screen_share_stop'

export interface PhoenixCallSignal {
  id: string
  call_id: string
  from_user_id: string
  to_user_id: string
  type: PhoenixSignalType
  payload: Record<string, unknown>
  created_at: string
}

type Handler = (signal: PhoenixCallSignal) => void

const WS_URL = import.meta.env.VITE_PHOENIX_WS_URL || 'wss://ws.alura.net.br/socket/websocket'

export class PhoenixCallSignalingService {
  private socket: WebSocket | null = null
  private connectPromise: Promise<void> | null = null
  private myUserId: string
  private ref = 0
  private heartbeat: ReturnType<typeof setInterval> | null = null
  private joined = new Set<string>()
  private joinWaiters = new Map<string, { topic: string; promise: Promise<void>; resolve: () => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>()
  private roomHandlers = new Map<string, Handler>()
  private incomingHandler: Handler | null = null

  constructor(userId: string) {
    this.myUserId = userId
  }

  private nextRef() {
    return String(++this.ref)
  }

  private async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return
    if (this.connectPromise) return this.connectPromise

    this.connectPromise = (async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error('Sessão Supabase ausente')

    const url = new URL(WS_URL)
    url.searchParams.set('vsn', '2.0.0')
    url.searchParams.set('token', token)
    url.searchParams.set('user_id', this.myUserId)

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url.toString())
      this.socket = ws
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('Timeout Phoenix WebSocket'))
      }, 8000)

      ws.onopen = () => {
        clearTimeout(timeout)
        this.heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify([null, this.nextRef(), 'phoenix', 'heartbeat', {}]))
          }
        }, 20000)
        resolve()
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Falha no Phoenix WebSocket'))
      }

      ws.onclose = () => {
        if (this.heartbeat) clearInterval(this.heartbeat)
        this.heartbeat = null
        this.socket = null
        this.joined.clear()
        for (const waiter of this.joinWaiters.values()) {
          clearTimeout(waiter.timer)
          waiter.reject(new Error('Phoenix WebSocket desconectado'))
        }
        this.joinWaiters.clear()
      }

      ws.onmessage = (event) => {
        try {
          const [joinRef, ref, topic, eventName, payload] = JSON.parse(event.data)
          if (eventName === 'signal' && payload) {
            const signal = payload as PhoenixCallSignal
            if (signal.from_user_id === this.myUserId) return
            if (topic === `user:${this.myUserId}`) {
              this.roomHandlers.get(signal.call_id)?.(signal) || this.incomingHandler?.(signal)
            } else if (topic.startsWith('call:')) {
              this.roomHandlers.get(topic.slice(5))?.(signal)
            }
          }

          if (eventName === 'phx_reply' && payload?.status === 'ok' && joinRef) {
            const waiter = this.joinWaiters.get(ref)
            if (waiter) {
              clearTimeout(waiter.timer)
              this.joined.add(topic)
              this.joinWaiters.delete(ref)
              waiter.resolve()
            }
          }

          if (eventName === 'phx_reply' && payload?.status !== 'ok' && ref) {
            const waiter = this.joinWaiters.get(ref)
            if (waiter) {
              clearTimeout(waiter.timer)
              this.joinWaiters.delete(ref)
              const reason = payload?.response?.reason || payload?.reason || 'unknown'
                waiter.reject(new Error(`Phoenix recusou join: ${topic} (${reason})`))
            }
          }
        } catch {}
      }
    })
    })().finally(() => {
      this.connectPromise = null
    })

    return this.connectPromise
  }

  private async join(topic: string) {
    await this.connect()
    if (this.joined.has(topic)) return

    const pending = Array.from(this.joinWaiters.values()).find((waiter) => waiter.topic === topic)
    if (pending) {
      await pending.promise
      return
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Phoenix WebSocket desconectado')
    }

    const ref = this.nextRef()
    let resolveJoin!: () => void
    let rejectJoin!: (e: Error) => void
    const promise = new Promise<void>((resolve, reject) => {
      resolveJoin = resolve
      rejectJoin = reject
    })
    const timer = setTimeout(() => {
      this.joinWaiters.delete(ref)
      rejectJoin(new Error(`Timeout Phoenix join: ${topic}`))
    }, 8000)

    this.joinWaiters.set(ref, { topic, promise, resolve: resolveJoin, reject: rejectJoin, timer })
    this.socket!.send(JSON.stringify([ref, ref, topic, 'phx_join', {}]))
    await promise
  }

  private async push(topic: string, event: string, payload: unknown) {
    await this.join(topic)
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) throw new Error('Phoenix WebSocket desconectado')
    this.socket.send(JSON.stringify([null, this.nextRef(), topic, event, payload]))
  }

  async send(callId: string, toUserId: string, type: PhoenixSignalType, payload: Record<string, unknown>) {
    const signal: PhoenixCallSignal = {
      id: crypto.randomUUID(),
      call_id: callId,
      from_user_id: this.myUserId,
      to_user_id: toUserId,
      type,
      payload,
      created_at: new Date().toISOString(),
    }
    if (type === 'offer') {
      // O UserChannel só pode ser ingressado pelo próprio usuário.
      // O backend encaminha o sinal para o canal do destinatário.
      await this.push(`user:${this.myUserId}`, 'signal', signal)
    } else {
      await this.push(`call:${callId}`, 'signal', signal)
    }
  }

  async listen(callId: string, onSignal: Handler) {
    this.roomHandlers.set(callId, onSignal)
    await this.join(`call:${callId}`)
  }

  async listenForIncomingCalls(onOffer: Handler) {
    this.incomingHandler = (signal) => {
      if (signal.type === 'offer') onOffer(signal)
    }
    await this.join(`user:${this.myUserId}`)
  }

  unlisten() {
    this.roomHandlers.clear()
  }

  disconnect() {
    this.unlisten()
    this.incomingHandler = null
    this.joined.clear()
    this.joinWaiters.clear()
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = null
    this.socket?.close()
    this.socket = null
  }
}
