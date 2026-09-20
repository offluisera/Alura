import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type SignalType =
  | 'offer'
  | 'answer'
  | 'ice_candidate'
  | 'call_end'
  | 'call_reject'
  | 'call_busy'
  | 'screen_share_start'
  | 'screen_share_stop'

export interface CallSignal {
  id: string
  call_id: string
  from_user_id: string
  to_user_id: string
  type: SignalType
  payload: Record<string, unknown>
  created_at: string
}

export type SignalHandler = (signal: CallSignal) => void

// ─── Adaptador de Sinalização Híbrido (Broadcast WebSocket + Fallback DB) ───
// Usa Broadcast de alta velocidade (zero banco de dados, zero latência)
// e fallback transparente no banco se a tabela existir.

export class CallSignalingService {
  private callRoomChannel: RealtimeChannel | null = null
  private incomingChannel: RealtimeChannel | null = null
  private myUserId: string

  constructor(userId: string) {
    this.myUserId = userId
  }

  private async ensureChannelJoined(channel: RealtimeChannel): Promise<boolean> {
    if (channel.state === 'joined') return true
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        resolve(channel.state === 'joined')
      }, 3000)

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timer)
          resolve(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timer)
          resolve(false)
        }
      })
    })
  }

  /** Envia um sinal de sinalização para o outro participante */
  async send(
    callId: string,
    toUserId: string,
    type: SignalType,
    payload: Record<string, unknown>
  ): Promise<void> {
    const signal: CallSignal = {
      id: crypto.randomUUID(),
      call_id: callId,
      from_user_id: this.myUserId,
      to_user_id: toUserId,
      type,
      payload,
      created_at: new Date().toISOString(),
    }

    console.log(`[CallSignaling] Enviando sinal [${type}] para ${toUserId} (call: ${callId})`)

    // 1. Se for oferta inicial, envia diretamente no canal pessoal do destinatário
    if (type === 'offer') {
      const targetUserChannel = supabase.channel(`user_calls_${toUserId}`, {
        config: { broadcast: { self: false } }
      })

      const joined = await this.ensureChannelJoined(targetUserChannel)
      if (joined) {
        try {
          const res = await targetUserChannel.send({
            type: 'broadcast',
            event: 'incoming_call',
            payload: signal,
          })
          console.log(`[CallSignaling] Oferta transmitida com sucesso para user_calls_${toUserId}:`, res)
        } catch (err) {
          console.warn('[CallSignaling] Erro ao enviar broadcast de oferta:', err)
        }
      } else {
        console.warn(`[CallSignaling] Não foi possível conectar ao canal user_calls_${toUserId}`)
      }
    }

    // 2. Transmite também na sala da chamada (call_room_${callId})
    const room = this.callRoomChannel || supabase.channel(`call_room_${callId}`, {
      config: { broadcast: { self: false } }
    })
    const roomJoined = await this.ensureChannelJoined(room)
    if (roomJoined) {
      room.send({
        type: 'broadcast',
        event: 'signal',
        payload: signal,
      }).catch((err) => {
        console.warn('[CallSignaling] Erro ao enviar no callRoom:', err)
      })
    }

    // 3. Fallback no banco de dados (não-bloqueante, não quebra se a tabela não existir)
    supabase.from('call_signals').insert({
      call_id: callId,
      from_user_id: this.myUserId,
      to_user_id: toUserId,
      type,
      payload,
    }).then(({ error }) => {
      if (error) {
        console.warn('[CallSignaling] Nota DB fallback:', error.message)
      }
    }).catch(() => {})
  }

  /** Escuta sinais direcionados a este usuário para um call_id específico */
  listen(callId: string, onSignal: SignalHandler): void {
    this.unlisten()

    console.log(`[CallSignaling] Conectando à sala call_room_${callId}`)

    this.callRoomChannel = supabase
      .channel(`call_room_${callId}`, {
        config: { broadcast: { self: false } }
      })
      .on('broadcast', { event: 'signal' }, (event) => {
        const signal = event.payload as CallSignal
        if (signal.from_user_id !== this.myUserId) {
          console.log(`[CallSignaling] Sinal recebido via broadcast [${signal.type}]:`, signal)
          onSignal(signal)
        }
      })
      // Fallback Postgres changes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `to_user_id=eq.${this.myUserId}`,
        },
        (event) => {
          const signal = event.new as CallSignal
          if (signal.call_id === callId && signal.from_user_id !== this.myUserId) {
            console.log(`[CallSignaling] Sinal recebido via postgres_changes [${signal.type}]:`, signal)
            onSignal(signal)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[CallSignaling] Status do canal call_room_${callId}:`, status)
      })
  }

  /** Escuta sinais de chamada recebida para notificação */
  listenForIncomingCalls(onOffer: SignalHandler): RealtimeChannel {
    if (this.incomingChannel) {
      supabase.removeChannel(this.incomingChannel)
    }

    console.log(`[CallSignaling] Ouvindo chamadas recebidas em user_calls_${this.myUserId}`)

    const channel = supabase
      .channel(`user_calls_${this.myUserId}`, {
        config: { broadcast: { self: false } }
      })
      // 1. Broadcast instantâneo
      .on('broadcast', { event: 'incoming_call' }, (event) => {
        const signal = event.payload as CallSignal
        console.log('[CallSignaling] Chamada recebida via broadcast!', signal)
        if (signal.type === 'offer') {
          onOffer(signal)
        }
      })
      // 2. Fallback Postgres changes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `to_user_id=eq.${this.myUserId}`,
        },
        (event) => {
          const signal = event.new as CallSignal
          console.log('[CallSignaling] Chamada recebida via postgres_changes!', signal)
          if (signal.type === 'offer') {
            onOffer(signal)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[CallSignaling] Status do canal user_calls_${this.myUserId}:`, status)
      })

    this.incomingChannel = channel
    return channel
  }

  /** Para de escutar sinais */
  unlisten(): void {
    if (this.callRoomChannel) {
      supabase.removeChannel(this.callRoomChannel)
      this.callRoomChannel = null
    }
  }
}
