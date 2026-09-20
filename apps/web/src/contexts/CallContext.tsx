import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useWebRTCCall } from '../lib/hooks/useWebRTCCall'
import type { UseWebRTCCallReturn, CallParticipant, CallType } from '../lib/hooks/useWebRTCCall'
import type { PhoenixCallSignal as CallSignal } from '../lib/services/PhoenixCallSignalingService'

interface CallContextType extends UseWebRTCCallReturn {
  activeDmUserId: string | null
  setActiveDmUserId: (userId: string | null) => void
  pendingSignal: CallSignal | null
  callerProfile: CallParticipant | null
  isDnd: boolean
  startCallWithProfile: (
    toUserId: string,
    participant: CallParticipant,
    type?: CallType,
    dmChannelId?: string | null
  ) => Promise<void>
  acceptIncomingCall: () => Promise<void>
  rejectIncomingCall: () => Promise<void>
}

const CallContext = createContext<CallContextType | null>(null)

export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall deve ser usado dentro de um CallProvider')
  }
  return context
}

interface CallProviderProps {
  children: React.ReactNode
  user: any
  profile: any
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function CallProvider({ children, user, profile }: CallProviderProps) {
  const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null)
  const [currentDmChannelId, setCurrentDmChannelId] = useState<string | null>(null)
  const [pendingSignal, setPendingSignal] = useState<CallSignal | null>(null)
  const [callerProfile, setCallerProfile] = useState<CallParticipant | null>(null)

  const isDnd = profile?.status === 'dnd'
  const callDurationRef = useRef(0)
  const activeCallPartnerRef = useRef<{ userId: string; name: string; channelId?: string | null } | null>(null)
  const wasConnectedRef = useRef(false)

  const getElectronIPC = () => {
    if (typeof window === 'undefined') return null
    return (window as any).electronIPC || (window as any).require?.('electron')?.ipcRenderer || null
  }

  // ── Helper para inserir mensagem de log no chat da DM ───────────────────────
  const sendChatSystemMessage = useCallback(async (channelId: string, content: string) => {
    if (!channelId || !user?.id) return
    try {
      await supabase.from('direct_messages').insert({
        dm_channel_id: channelId,
        user_id: user.id,
        content,
      })
    } catch (err) {
      console.warn('[CallContext] Falha ao registrar mensagem de chamada no chat:', err)
    }
  }, [user?.id])

  // ── Busca ou cria o canal de DM para mensagens de log ──────────────────────
  const getOrCreateDmChannel = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user?.id || !otherUserId) return null
    try {
      const { data: existing } = await supabase
        .from('dm_channels')
        .select('id')
        .or(`and(user_1_id.eq.${user.id},user_2_id.eq.${otherUserId}),and(user_1_id.eq.${otherUserId},user_2_id.eq.${user.id})`)
        .maybeSingle()

      if (existing) return existing.id

      const { data: created, error } = await supabase
        .from('dm_channels')
        .insert({ user_1_id: user.id, user_2_id: otherUserId })
        .select('id')
        .single()

      if (error) return null
      return created?.id || null
    } catch {
      return null
    }
  }, [user?.id])

  // ── Callback quando chega chamada recebida ──────────────────────────────────
  const handleIncomingCall = useCallback((signal: CallSignal, fromUserId: string) => {
    setPendingSignal(signal)
    const callerName = (signal.payload?.callerName as string) || 'Usuário'
    const callerAvatar = (signal.payload?.callerAvatar as string) || undefined

    const participant: CallParticipant = {
      userId: fromUserId,
      name: callerName,
      avatar: callerAvatar,
    }
    setCallerProfile(participant)
    activeCallPartnerRef.current = { userId: fromUserId, name: callerName }

    // Notifica janela nativa do Electron (se em ambiente desktop)
    const ipc = getElectronIPC()
    const activeTheme = typeof window !== 'undefined' ? (localStorage.getItem('alura_theme') || 'forest') : 'forest'
    ipc?.send('show-incoming-call', {
      callerId: fromUserId,
      callerName,
      callerAvatar: callerAvatar || null,
      callType: signal.payload?.callType || 'audio',
      theme: activeTheme,
    })
  }, [])

  const webrtc = useWebRTCCall(user?.id || '', handleIncomingCall)

  // Atualiza referência de duração
  useEffect(() => {
    callDurationRef.current = webrtc.callDuration
    if (webrtc.callState === 'active') {
      wasConnectedRef.current = true
    }
  }, [webrtc.callDuration, webrtc.callState])

  // ── Monitora transições de estado para mensagens no chat ───────────────────
  const prevCallStateRef = useRef(webrtc.callState)

  useEffect(() => {
    const prevState = prevCallStateRef.current
    const currentState = webrtc.callState
    prevCallStateRef.current = currentState

    // 1. Chamada foi atendida e conectou
    if (prevState !== 'active' && currentState === 'active') {
      wasConnectedRef.current = true
    }

    // 2. Chamada foi encerrada
    if ((prevState === 'active' || prevState === 'calling' || prevState === 'ringing') && currentState === 'ended') {
      const partner = activeCallPartnerRef.current
      const duration = callDurationRef.current
      const wasConnected = wasConnectedRef.current

      if (partner) {
        getOrCreateDmChannel(partner.userId).then((chId) => {
          if (!chId) return
          if (wasConnected && duration > 0) {
            // Chamada atendida e finalizada com tempo
            sendChatSystemMessage(chId, `[call:ended] Chamada encerrada — tempo total: ${formatDuration(duration)}`)
          } else if (prevState === 'ringing') {
            // Chamada recebida não atendida (perdida)
            sendChatSystemMessage(chId, `[call:missed] Você perdeu uma ligação de @${partner.name} às ${getFormattedTime()}`)
          }
        })
      }

      // Reset
      wasConnectedRef.current = false
      setPendingSignal(null)
      setCallerProfile(null)
    }
  }, [webrtc.callState, getOrCreateDmChannel, sendChatSystemMessage])

  // ── Escuta ações da janela nativa do Electron (Atender/Recusar) ─────────────
  useEffect(() => {
    const ipc = getElectronIPC()
    if (!ipc) return

    const handler = (arg1: any, arg2?: any) => {
      const data = (arg2 !== undefined && arg2 !== null) ? arg2 : arg1
      if (!data) return

      if (data.action === 'accept' && pendingSignal && callerProfile) {
        webrtc.acceptCall(pendingSignal, callerProfile)
        setPendingSignal(null)
      } else if (data.action === 'reject' && pendingSignal) {
        webrtc.rejectCall(pendingSignal)
        setPendingSignal(null)
      } else if (data.action === 'timeout' && pendingSignal) {
        webrtc.rejectCall(pendingSignal)
        setPendingSignal(null)
      }
    }

    const unsub = ipc.on('call-action-from-native', handler)
    return () => {
      if (typeof unsub === 'function') {
        unsub()
      } else if (ipc.removeListener) {
        ipc.removeListener('call-action-from-native', handler)
      }
    }
  }, [pendingSignal, callerProfile, webrtc])

  // ── Iniciar chamada com registro no chat ────────────────────────────────────
  const startCallWithProfile = useCallback(async (
    toUserId: string,
    participant: CallParticipant,
    type: CallType = 'audio',
    dmChannelId?: string | null
  ) => {
    activeCallPartnerRef.current = { userId: toUserId, name: participant.name, channelId: dmChannelId }
    wasConnectedRef.current = false

    const myProfile = {
      name: profile?.username || profile?.display_name || user?.user_metadata?.username || 'Você',
      avatar: profile?.avatar_url || user?.user_metadata?.avatar_url,
    }

    // Registra mensagem no chat de início
    if (dmChannelId) {
      sendChatSystemMessage(dmChannelId, `[call:started] Chamada iniciada — ${getFormattedTime()}`)
    } else {
      getOrCreateDmChannel(toUserId).then((chId) => {
        if (chId) sendChatSystemMessage(chId, `[call:started] Chamada iniciada — ${getFormattedTime()}`)
      })
    }

    await webrtc.startCall(toUserId, participant, type, myProfile)
  }, [profile, user, webrtc, sendChatSystemMessage, getOrCreateDmChannel])

  // ── Atender chamada pendente ───────────────────────────────────────────────
  const acceptIncomingCall = useCallback(async () => {
    if (pendingSignal && callerProfile) {
      await webrtc.acceptCall(pendingSignal, callerProfile)
      setPendingSignal(null)
    }
  }, [pendingSignal, callerProfile, webrtc])

  // ── Rejeitar chamada pendente ──────────────────────────────────────────────
  const rejectIncomingCall = useCallback(async () => {
    if (pendingSignal) {
      await webrtc.rejectCall(pendingSignal)
      setPendingSignal(null)
    } else {
      webrtc.hangUp()
    }
  }, [pendingSignal, webrtc])

  return (
    <CallContext.Provider
      value={{
        ...webrtc,
        activeDmUserId,
        setActiveDmUserId,
        pendingSignal,
        callerProfile,
        isDnd,
        startCallWithProfile,
        acceptIncomingCall,
        rejectIncomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  )
}
