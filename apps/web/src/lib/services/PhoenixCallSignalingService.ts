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
  private myUserId: string
  private ref = 0
  private heartbeat: ReturnType<typeof setInterval> | null = null
  private joined = new Set<string>()
  private joinWaiters = new Map<string, Promise<void>>()
  private roomHandlers = new Map<string, Handler>()
  private incomingHandler: Handler | null = null

  constructor(userId: string) {
    this.myUserId = userId
  }

  private nextRef() { return String(++this.ref) }

  private async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return

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
      const timeout = setTimeout(() => reject(new Error('Timeout Phoenix WebSocket')), 8000)

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
      }

      ws.onmessage = (event) => {
        try { this.handleMessage(JSON.parse(event.data)) } catch {}
      }
    })
  }

  private handleMessage(frame: unknown[]) {
    const [, , topic, event, payload] = frame as any[]

    if (event === 'signal' && payload) {
      const signal = payload as PhoenixCallSignal
      if (signal.from_user_id === this.myUserId) return

      if (topic === `user:${this.myUserId}`) {
        const activeHandler = this.roomHandlers.get(signal.call_id)
        if (activeHandler) activeHandler(signal)
        else this.incomingHandler?.(signal)
      } else if (topic.startsWith('call:')) {
        this.roomHandlers.get(topic.slice(5))?.(signal)
      }
    }

    if (event === 'phx_reply' && payload?.status === 'ok' && topic) {
      this.joined.add(topic)
    }
  }

  private async join(topic: string) {
    await this.connect()
    if (this.joined.has(topic)) return
    const existing = this.joinWaiters.get(topic)
    if (existing) return existing

    const promise = new Promise<void>((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('Phoenix WebSocket desconectado'))
        return
      }

      const ref = this.nextRef()
      const timer = setTimeout(() => reject(new Error(`Timeout Phoenix join: ${topic}`)), 8000)

      const previous = this.socket.onmessage
      this.socket.onmessage = (event) => {
        previous?.call(this.socket, event)
        try {
          const frame = JSON.parse(event.data)
          const [, responseRef, responseTopic, responseEvent, responsePayload] = frame
          if (
            responseEvent === 'phx_reply' &&
            responseRef === ref &&
            responseTopic === topic
          ) {
            clearTimeout(timer)
            this.socket!.onmessage = previous
            if (responsePayload?.status === 'ok') {
              this.joined.add(topic)
              resolve()
            } else {
              reject(new Error(`Phoenix recusou join: ${topic}`))
            }
          }
        } catch {}
      }

      this.socket.send(JSON.stringify([ref, ref, topic, 'phx_join', {}]))
    })

    this.joinWaiters.set(topic, promise)
    try { await promise } finally { this.joinWaiters.delete(topic) }
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
      await this.push(`user:${toUserId}`, 'signal', signal)
    } else {
      await this.push(`call:${callId}`, 'signal', signal)
    }
  }

  listen(callId: string, onSignal: Handler) {
    this.roomHandlers.set(callId, onSignal)
    this.join(`call:${callId}`).catch((err) => console.error('[PhoenixCall] join:', err))
  }

  listenForIncomingCalls(onOffer: Handler) {
    this.incomingHandler = (signal) => {
      if (signal.type === 'offer') onOffer(signal)
    }
    this.join(`user:${this.myUserId}`).catch((err) => console.error('[PhoenixCall] incoming:', err))
  }

  unlisten() {
    this.roomHandlers.clear()
  }

  disconnect() {
    this.unlisten()
    this.incomingHandler = null
    this.joined.clear()
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = null
    this.socket?.close()
    this.socket = null
  }
}
