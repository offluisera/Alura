import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type PhoenixSignalType =
  | 'offer' | 'answer' | 'ice_candidate' | 'call_end' | 'call_reject'
  | 'call_busy' | 'screen_share_start' | 'screen_share_stop'
  | 'stream_viewer_join' | 'stream_viewer_leave'

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
  private topicJoinRefs = new Map<string, string>()
  private joinWaiters = new Map<string, { topic: string; promise: Promise<void>; resolve: () => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>()
  private roomHandlers = new Map<string, Handler>()
  private incomingHandler: Handler | null = null

  // Fallback e Dual Signaling com Supabase Realtime (Broadcast + Postgres Changes)
  private supabaseIncomingChannel: RealtimeChannel | null = null
  private supabaseRoomChannels = new Map<string, RealtimeChannel>()
  private supabaseTargetChannels = new Map<string, RealtimeChannel>()
  private processedSignals = new Set<string>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(userId: string) {
    this.myUserId = userId
  }

  private nextRef() {
    return String(++this.ref)
  }

  private isDuplicate(signal: PhoenixCallSignal): boolean {
    let uniquePart = signal.id || ''
    if (signal.type === 'ice_candidate') {
      const cand = (signal.payload?.candidate as any)?.candidate || JSON.stringify(signal.payload?.candidate || '')
      uniquePart = cand.slice(0, 40)
    }
    const key = `${signal.call_id || ''}_${signal.type}_${uniquePart}`
    if (this.processedSignals.has(key)) return true
    this.processedSignals.add(key)
    setTimeout(() => this.processedSignals.delete(key), 8000)
    return false
  }

  private async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return
    if (this.connectPromise) return this.connectPromise

    this.connectPromise = (async () => {
      let token = ''
      try {
        const { data } = await supabase.auth.getSession()
        token = data.session?.access_token || ''
      } catch {
        // Ignora erro de sessão no connect inicial
      }

      const url = new URL(WS_URL)
      url.searchParams.set('vsn', '2.0.0')
      if (token) url.searchParams.set('token', token)
      url.searchParams.set('user_id', this.myUserId)

      await new Promise<void>((resolve, reject) => {
        console.log('[Phoenix WS] Conectando:', url.toString())
        const ws = new WebSocket(url.toString())
        this.socket = ws

        const timeout = setTimeout(() => {
          ws.close()
          reject(new Error('Timeout Phoenix WebSocket'))
        }, 8000)

        ws.onopen = () => {
          clearTimeout(timeout)
          console.log('[Phoenix WS] Conectado com sucesso')
          this.heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify([null, this.nextRef(), 'phoenix', 'heartbeat', {}]))
            }
          }, 20000)
          resolve()
        }

        ws.onclose = (event) => {
          console.log('[Phoenix WS] Fechou:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          })
          if (this.heartbeat) clearInterval(this.heartbeat)
          this.heartbeat = null
          this.socket = null
          this.joined.clear()
          this.topicJoinRefs.clear()
          for (const waiter of this.joinWaiters.values()) {
            clearTimeout(waiter.timer)
            waiter.reject(new Error('Phoenix WebSocket desconectado'))
          }
          this.joinWaiters.clear()

          // Auto-reconexão
          if (this.incomingHandler || this.roomHandlers.size > 0) {
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
            this.reconnectTimer = setTimeout(() => {
              console.log('[Phoenix WS] Reconectando automaticamente...')
              this.reconnect()
            }, 3000)
          }
        }

        ws.onerror = (event) => {
          clearTimeout(timeout)
          console.error('[Phoenix WS] Erro de conexão:', {
            url: ws.url,
            readyState: ws.readyState,
            event,
          })
          reject(new Error(`Falha no Phoenix WebSocket: ${ws.url}`))
        }

        ws.onmessage = (event) => {
          try {
            const [joinRef, ref, topic, eventName, payload] = JSON.parse(event.data)
            if (eventName === 'signal' && payload) {
              const signal = payload as PhoenixCallSignal

              if (topic.startsWith('call:') && !signal.call_id) {
                signal.call_id = topic.slice(5)
              }

              if (signal.from_user_id === this.myUserId) return
              if (this.isDuplicate(signal)) return

              console.log('[Phoenix WS] Sinal recebido:', { topic, signal })

              if (topic === `user:${this.myUserId}`) {
                const handler = this.roomHandlers.get(signal.call_id)
                if (handler) {
                  handler(signal)
                } else {
                  this.incomingHandler?.(signal)
                }
              } else if (topic.startsWith('call:')) {
                const callId = topic.slice(5)
                this.roomHandlers.get(callId)?.(signal)
              }
            }

            if (eventName === 'phx_reply' && payload?.status === 'ok' && joinRef) {
              const waiter = this.joinWaiters.get(ref)
              if (waiter) {
                clearTimeout(waiter.timer)
                this.joined.add(topic)
                this.topicJoinRefs.set(topic, joinRef)
                this.joinWaiters.delete(ref)
                console.log(`[Phoenix WS] Join confirmado: ${topic} (joinRef: ${joinRef})`)
                waiter.resolve()
              }
            }

            if (eventName === 'phx_reply' && payload?.status !== 'ok' && ref) {
              const waiter = this.joinWaiters.get(ref)
              if (waiter) {
                clearTimeout(waiter.timer)
                this.joinWaiters.delete(ref)
                const reason = payload?.response?.reason || payload?.reason || 'unknown'
                console.warn(`[Phoenix WS] Join recusado: ${topic} (${reason})`)
                waiter.reject(new Error(`Phoenix recusou join: ${topic} (${reason})`))
              }
            }
          } catch (err) {
            console.warn('[Phoenix WS] Erro ao processar mensagem recebida:', err)
          }
        }
      })
    })().finally(() => {
      this.connectPromise = null
    })

    return this.connectPromise
  }

  private async reconnect() {
    try {
      await this.connect()
      if (this.incomingHandler) {
        await this.join(`user:${this.myUserId}`)
      }
      for (const callId of this.roomHandlers.keys()) {
        await this.join(`call:${callId}`)
      }
    } catch (err) {
      console.warn('[Phoenix WS] Falha na reconexão:', err)
    }
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
    console.log(`[Phoenix WS] Enviando phx_join: ${topic} (ref: ${ref})`)
    this.socket!.send(JSON.stringify([ref, ref, topic, 'phx_join', {}]))
    await promise
  }

  private async push(topic: string, event: string, payload: unknown) {
    await this.join(topic)
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) throw new Error('Phoenix WebSocket desconectado')
    const joinRef = this.topicJoinRefs.get(topic) || null
    console.log(`[Phoenix WS] Enviando [${event}] em ${topic} (joinRef: ${joinRef}):`, payload)
    this.socket.send(JSON.stringify([joinRef, this.nextRef(), topic, event, payload]))
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

    // 1. Envio via Phoenix WebSocket (Stack Oficial)
    const sendPhoenix = (async () => {
      try {
        await this.push(`user:${this.myUserId}`, 'signal', signal)
        if (toUserId) {
          await this.push(`user:${toUserId}`, 'signal', signal).catch(() => {})
        }
        if (callId) {
          await this.push(`call:${callId}`, 'signal', signal).catch(() => {})
        }
      } catch (err) {
        console.warn('[Phoenix WS] Erro ao enviar sinal via WS:', err)
      }
    })()

    // 2. Broadcast via Supabase Realtime (baixa latência)
    const sendSupabaseBroadcast = (async () => {
      try {
        const isRenegotiation = type === 'offer' && this.roomHandlers.has(callId)

        // Envia diretamente no canal pessoal do usuário alvo (oferta, recusa ou encerramento)
        if ((type === 'offer' && !isRenegotiation) || type === 'call_reject' || type === 'call_end') {
          let targetUserChannel = this.supabaseTargetChannels.get(toUserId)
          if (!targetUserChannel) {
            targetUserChannel = supabase.channel(`user_calls_${toUserId}`, {
              config: { broadcast: { self: false } }
            })
            this.supabaseTargetChannels.set(toUserId, targetUserChannel)
          }

          const sendDirect = () => {
            const eventName = type === 'offer' && !isRenegotiation ? 'incoming_call' : 'signal'
            targetUserChannel!.send({
              type: 'broadcast',
              event: eventName,
              payload: signal,
            }).catch(() => {})
          }

          if ((targetUserChannel as any).state === 'joined') {
            sendDirect()
          } else {
            targetUserChannel.subscribe((status) => {
              if (status === 'SUBSCRIBED') sendDirect()
            })
          }
        }

        // Envia também no canal da sala se callId existir
        if (callId) {
          let room = this.supabaseRoomChannels.get(callId)
          if (!room) {
            room = supabase.channel(`call_room_${callId}`, {
              config: { broadcast: { self: false } }
            })
            this.supabaseRoomChannels.set(callId, room)
          }

          const sendRoom = () => {
            room!.send({
              type: 'broadcast',
              event: 'signal',
              payload: signal,
            }).catch(() => {})
          }

          if ((room as any).state === 'joined') {
            sendRoom()
          } else {
            room.subscribe((status) => {
              if (status === 'SUBSCRIBED') sendRoom()
            })
          }
        }
      } catch (err) {
        console.warn('[Supabase Realtime] Erro no envio de broadcast:', err)
      }
    })()

    // 3. Fallback Garantido no Banco PostgreSQL (Tabela call_signals)
    const sendDatabase = (async () => {
      try {
        await supabase.from('call_signals').insert({
          call_id: callId,
          from_user_id: this.myUserId,
          to_user_id: toUserId,
          type,
          payload,
        })
      } catch (err) {
        // Tabela opcional ou RLS
      }
    })()

    // Dispara as 3 vias em paralelo com garantia total de entrega
    await Promise.allSettled([sendPhoenix, sendSupabaseBroadcast, sendDatabase])
  }

  async listen(callId: string, onSignal: Handler) {
    this.roomHandlers.set(callId, onSignal)

    // 1. Phoenix WebSocket
    try {
      await this.join(`call:${callId}`)
    } catch (err) {
      console.warn(`[Phoenix WS] Falha ao entrar na call:${callId}:`, err)
    }

    // 2. Supabase Realtime Fallback (Broadcast + Postgres Changes)
    let room = this.supabaseRoomChannels.get(callId)
    if (!room) {
      room = supabase
        .channel(`call_room_${callId}`, {
          config: { broadcast: { self: false } }
        })
        .on('broadcast', { event: 'signal' }, (event) => {
          const signal = event.payload as PhoenixCallSignal
          if (signal.from_user_id !== this.myUserId && !this.isDuplicate(signal)) {
            console.log('[Supabase Realtime] Sinal recebido via broadcast:', signal)
            onSignal(signal)
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'call_signals',
            filter: `call_id=eq.${callId}`,
          },
          (event) => {
            const signal = event.new as PhoenixCallSignal
            if (signal.from_user_id !== this.myUserId && !this.isDuplicate(signal)) {
              console.log('[Supabase Postgres] Sinal recebido via banco de dados na sala:', signal)
              onSignal(signal)
            }
          }
        )
        .subscribe()
      this.supabaseRoomChannels.set(callId, room)
    }
  }

  async listenForIncomingCalls(onOffer: Handler) {
    this.incomingHandler = (signal) => {
      if (signal.type === 'offer') {
        if (this.roomHandlers.has(signal.call_id)) {
          this.roomHandlers.get(signal.call_id)?.(signal)
        } else {
          onOffer(signal)
        }
      }
    }

    // 1. Phoenix WebSocket
    this.join(`user:${this.myUserId}`).catch((err) => {
      console.warn('[Phoenix WS] Falha ao entrar no canal de usuário:', err)
    })

    // 2. Supabase Realtime Fallback (Broadcast + Postgres Changes)
    if (this.supabaseIncomingChannel) {
      supabase.removeChannel(this.supabaseIncomingChannel)
    }

    this.supabaseIncomingChannel = supabase
      .channel(`user_calls_${this.myUserId}`, {
        config: { broadcast: { self: false } }
      })
      // 2a. Broadcast de oferta de chamada
      .on('broadcast', { event: 'incoming_call' }, (event) => {
        const signal = event.payload as PhoenixCallSignal
        if (signal.type === 'offer' && !this.isDuplicate(signal)) {
          console.log('[Supabase Realtime] Oferta de chamada recebida via broadcast:', signal)
          if (this.roomHandlers.has(signal.call_id)) {
            this.roomHandlers.get(signal.call_id)?.(signal)
          } else {
            onOffer(signal)
          }
        }
      })
      // 2b. Broadcast de sinal direto
      .on('broadcast', { event: 'signal' }, (event) => {
        const signal = event.payload as PhoenixCallSignal
        if (signal.from_user_id === this.myUserId) return
        if (this.isDuplicate(signal)) return
        console.log('[Supabase Realtime] Sinal direto recebido via broadcast:', signal)
        if (signal.type === 'offer' && !this.roomHandlers.has(signal.call_id)) {
          onOffer(signal)
        } else {
          this.roomHandlers.get(signal.call_id)?.(signal)
        }
      })
      // 2c. Postgres Changes Garantido no banco de dados
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `to_user_id=eq.${this.myUserId}`,
        },
        (event) => {
          const signal = event.new as PhoenixCallSignal
          if (signal.from_user_id === this.myUserId) return
          if (this.isDuplicate(signal)) return
          console.log('[Supabase Postgres] Sinal recebido via banco de dados:', signal)
          if (signal.type === 'offer') {
            if (this.roomHandlers.has(signal.call_id)) {
              this.roomHandlers.get(signal.call_id)?.(signal)
            } else {
              onOffer(signal)
            }
          } else {
            this.roomHandlers.get(signal.call_id)?.(signal)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Canal de chamadas status: ${status}`)
      })
  }

  unlisten() {
    this.roomHandlers.clear()
    for (const room of this.supabaseRoomChannels.values()) {
      supabase.removeChannel(room)
    }
    this.supabaseRoomChannels.clear()

    for (const target of this.supabaseTargetChannels.values()) {
      supabase.removeChannel(target)
    }
    this.supabaseTargetChannels.clear()
  }

  disconnect() {
    this.unlisten()
    this.incomingHandler = null
    if (this.supabaseIncomingChannel) {
      supabase.removeChannel(this.supabaseIncomingChannel)
      this.supabaseIncomingChannel = null
    }
    this.joined.clear()
    this.topicJoinRefs.clear()
    this.joinWaiters.clear()
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = null
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    this.socket?.close()
    this.socket = null
  }
}
