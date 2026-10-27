import { useState, useEffect, useRef, useCallback } from 'react'
import { PhoenixCallSignalingService } from '../services/PhoenixCallSignalingService'
import type { PhoenixCallSignal as CallSignal } from '../services/PhoenixCallSignalingService'
import { CleanvoiceService } from '../services/CleanvoiceService'
import { SoundService } from '../services/SoundService'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'ended'
export type CallType = 'audio' | 'video'
export type NoiseFilterLevel = 'cleanvoice' | 'krisp' | 'standard' | 'off'

export interface CallParticipant {
  userId: string
  name: string
  avatar?: string
}

export interface UseWebRTCCallReturn {
  callState: CallState
  callType: CallType
  callId: string | null
  remoteParticipant: CallParticipant | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  screenStream: MediaStream | null
  isMuted: boolean
  isDeafened: boolean
  isCameraOn: boolean
  isSharingScreen: boolean
  isRemoteSharingScreen: boolean
  callDuration: number
  noiseFilter: NoiseFilterLevel
  setNoiseFilter: (level: NoiseFilterLevel) => Promise<void>
  startCall: (toUserId: string, participant: CallParticipant, type?: CallType, myProfile?: { name?: string; avatar?: string }) => Promise<void>
  acceptCall: (signal: CallSignal, participant: CallParticipant) => Promise<void>
  rejectCall: (signal: CallSignal) => Promise<void>
  hangUp: () => void
  toggleMute: () => void
  toggleDeafen: () => void
  toggleCamera: () => Promise<void>
  startScreenShareWithSource: (sourceId?: string, shareAudio?: boolean) => Promise<void>
  stopScreenShare: () => void
  streamViewers: Array<{ userId: string; name: string; avatar?: string }>
  sendStreamViewerSignal: (action: 'join' | 'leave', myInfo: { name: string; avatar?: string }) => void
}

// ─── ICE Servers ──────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWebRTCCall(
  myUserId: string,
  onIncomingCall?: (signal: CallSignal, from: string) => void
): UseWebRTCCallReturn {
  const [callState, setCallState] = useState<CallState>('idle')
  const [callType, setCallType] = useState<CallType>('audio')
  const [callId, setCallId] = useState<string | null>(null)
  const [remoteParticipant, setRemoteParticipant] = useState<CallParticipant | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [isRemoteSharingScreen, setIsRemoteSharingScreen] = useState(false)
  const [streamViewers, setStreamViewers] = useState<Array<{ userId: string; name: string; avatar?: string }>>([])
  const [callDuration, setCallDuration] = useState(0)
  const [noiseFilter, setNoiseFilterState] = useState<NoiseFilterLevel>(() => {
    try {
      return (localStorage.getItem('alura_noise_suppression') as NoiseFilterLevel) || 'krisp'
    } catch {
      return 'krisp'
    }
  })

  // Referências para evitar stale closures
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const signalingRef = useRef<PhoenixCallSignalingService | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream>(new MediaStream())
  const screenStreamRef = useRef<MediaStream | null>(null)
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([])
  const callIdRef = useRef<string | null>(null)
  const remoteParticipantRef = useRef<CallParticipant | null>(null)
  const callStateRef = useRef(callState)
  const onIncomingCallRef = useRef(onIncomingCall)
  const isMutedRef = useRef(isMuted)
  const rawStreamRef = useRef<MediaStream | null>(null)
  const liveFilterCleanupRef = useRef<(() => void) | null>(null)
  const liveFilterSetMutedRef = useRef<((m: boolean) => void) | null>(null)
  const screenMixerCtxRef = useRef<AudioContext | null>(null)
  const mixerMicGainRef = useRef<GainNode | null>(null)
  const mixerScreenGainRef = useRef<GainNode | null>(null)
  const originalMicTrackRef = useRef<MediaStreamTrack | null>(null)
  const mixedAudioTrackRef = useRef<MediaStreamTrack | null>(null)

  callStateRef.current = callState
  onIncomingCallRef.current = onIncomingCall
  callIdRef.current = callId
  remoteParticipantRef.current = remoteParticipant
  isMutedRef.current = isMuted

  const updateLocalStream = (stream: MediaStream | null) => {
    localStreamRef.current = stream
    setLocalStream(stream)
  }

  const updateScreenStream = (stream: MediaStream | null) => {
    screenStreamRef.current = stream
    setScreenStream(stream)
  }

  // ── Inicializa serviço de sinalização ─────────────────────────────────────

  useEffect(() => {
    if (!myUserId) return
    signalingRef.current = new PhoenixCallSignalingService(myUserId)

    signalingRef.current.listenForIncomingCalls((signal) => {
      if (callStateRef.current === 'idle' || callStateRef.current === 'ended') {
        setCallId(signal.call_id)
        setCallState('ringing')
        const callerName = (signal.payload?.callerName as string) || 'Usuário'
        const callerAvatar = (signal.payload?.callerAvatar as string) || undefined
        const participant: CallParticipant = {
          userId: signal.from_user_id,
          name: callerName,
          avatar: callerAvatar,
        }
        setRemoteParticipant(participant)
        onIncomingCallRef.current?.(signal, signal.from_user_id)
      }
    })

    return () => {
      signalingRef.current?.disconnect()
      signalingRef.current = null
    }
  }, [myUserId])

  // ── Timer de duração ──────────────────────────────────────────────────────

  useEffect(() => {
    if (callState === 'active') {
      setCallDuration(0)
      durationTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1)
      }, 1000)
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
        durationTimerRef.current = null
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
  }, [callState])

  // ── Ajuste do Filtro de Ruído em Tempo Real ────────────────────────────────

  const setNoiseFilter = useCallback(async (level: NoiseFilterLevel) => {
    setNoiseFilterState(level)
    try {
      localStorage.setItem('alura_noise_suppression', level)
    } catch {}

    const pc = pcRef.current
    const oldStream = localStreamRef.current
    if (!pc || !oldStream) return

    try {
      // 1. Limpa filtro anterior
      if (liveFilterCleanupRef.current) {
        liveFilterCleanupRef.current()
        liveFilterCleanupRef.current = null
      }

      // 2. Obtém novo stream de microfone
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: level !== 'off',
          autoGainControl: true,
        },
      })

      let finalAudioTrack = rawStream.getAudioTracks()[0]
      if (!finalAudioTrack) return

      // 3. Aplica o Noise Gate do Cleanvoice se ativo
      if (level !== 'off') {
        const { filteredStream, setMuted, cleanup } = CleanvoiceService.createLiveFilter(rawStream, level)
        liveFilterCleanupRef.current = cleanup
        liveFilterSetMutedRef.current = setMuted
        if (isMutedRef.current) {
          setMuted(true)
        }
        const filteredTrack = filteredStream.getAudioTracks()[0]
        if (filteredTrack) finalAudioTrack = filteredTrack
      }

      rawStreamRef.current = rawStream
      rawStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMutedRef.current
      })
      finalAudioTrack.enabled = !isMutedRef.current

      // 4. Substitui no PeerConnection
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio')
      if (sender) {
        await sender.replaceTrack(finalAudioTrack)
      }

      // 5. Atualiza stream local
      oldStream.getAudioTracks().forEach((t) => {
        t.stop()
        oldStream.removeTrack(t)
      })
      oldStream.addTrack(finalAudioTrack)
      updateLocalStream(new MediaStream(oldStream.getTracks()))
    } catch (err) {
      console.warn('[WebRTC] Falha ao ajustar filtro de ruído:', err)
    }
  }, [])

  // ── Criação da RTCPeerConnection ──────────────────────────────────────────

  const createPeerConnection = useCallback(
    (currentCallId: string, toUserId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

      // Garante transceivers de áudio (sendrecv) e vídeo inicial como receptor apenas (recvonly) para não gerar stream fantasma
      try {
        if (!pc.getTransceivers().some((t) => t.receiver.track.kind === 'audio')) {
          pc.addTransceiver('audio', { direction: 'sendrecv' })
        }
        if (!pc.getTransceivers().some((t) => t.receiver.track.kind === 'video')) {
          pc.addTransceiver('video', { direction: 'recvonly' })
        }
      } catch (err) {
        console.warn('[WebRTC] Falha ao pré-alocar transceivers:', err)
      }

      pc.onicecandidate = async (event) => {
        if (event.candidate && signalingRef.current) {
          await signalingRef.current.send(currentCallId, toUserId, 'ice_candidate', {
            candidate: event.candidate.toJSON(),
          })
        }
      }

      pc.ontrack = (event) => {
        console.log('[WebRTC] ontrack recebido:', event.track.kind, event.track.id)
        event.track.enabled = true
        const currentTracks = remoteStreamRef.current.getTracks()
        if (!currentTracks.some((t) => t.id === event.track.id)) {
          remoteStreamRef.current.addTrack(event.track)
        }
        const updated = new MediaStream(remoteStreamRef.current.getTracks())
        setRemoteStream(updated)

        if (event.track.kind === 'video') {
          // Apenas marca compartilhamento se explicitamente sinalizado ou chamada de vídeo ativa
          event.track.onended = () => {
            console.log('[WebRTC] Track de vídeo remota finalizada (onended).')
            setIsRemoteSharingScreen(false)
            remoteStreamRef.current.removeTrack(event.track)
            setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()))
          }
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          hangUp()
        }
      }

      return pc
    },
    []
  )

  // ── Handlers de sinais recebidos ──────────────────────────────────────────

  const handleSignal = useCallback(async (signal: CallSignal) => {
    const pc = pcRef.current
    if (!pc) return

    if (signal.type === 'stream_viewer_join') {
      const viewer = {
        userId: signal.from_user_id,
        name: (signal.payload?.name as string) || 'Usuário',
        avatar: signal.payload?.avatar as string | undefined,
      }
      setStreamViewers((prev) => {
        if (prev.some((v) => v.userId === viewer.userId)) return prev
        return [...prev, viewer]
      })
    }

    if (signal.type === 'stream_viewer_leave') {
      setStreamViewers((prev) => prev.filter((v) => v.userId !== signal.from_user_id))
    }

    if (signal.type === 'screen_share_start') {
      setIsRemoteSharingScreen(true)
      const vTrack = pc.getReceivers().find((r) => r.track && r.track.kind === 'video')?.track
      if (vTrack) {
        vTrack.enabled = true
        if (!remoteStreamRef.current.getTracks().some((t) => t.id === vTrack.id)) {
          remoteStreamRef.current.addTrack(vTrack)
        }
        setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()))
      }
    }

    if (signal.type === 'screen_share_stop') {
      console.log('[WebRTC] Transmissão remota encerrada.')
      setIsRemoteSharingScreen(false)
      setStreamViewers([])
      remoteStreamRef.current.getVideoTracks().forEach((vt) => {
        remoteStreamRef.current.removeTrack(vt)
      })
      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()))
    }

    if (signal.type === 'answer') {
      const desc = new RTCSessionDescription(signal.payload.sdp as RTCSessionDescriptionInit)
      await pc.setRemoteDescription(desc)
      // Flush pending ICE candidates
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []
      setCallState('active')
    }

    if (signal.type === 'offer') {
      try {
        if (signal.payload?.isScreenShare) {
          setIsRemoteSharingScreen(true)
        }
        const remoteDesc = new RTCSessionDescription(signal.payload.sdp as RTCSessionDescriptionInit)
        await pc.setRemoteDescription(remoteDesc)
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(candidate)
        }
        pendingCandidatesRef.current = []
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        const targetUserId = signal.from_user_id || remoteParticipantRef.current?.userId
        const targetCallId = signal.call_id || callIdRef.current
        if (signalingRef.current && targetCallId && targetUserId) {
          await signalingRef.current.send(targetCallId, targetUserId, 'answer', {
            sdp: answer,
          })
        }
        const vTrack = pc.getReceivers().find((r) => r.track && r.track.kind === 'video')?.track
        if (vTrack) {
          vTrack.enabled = true
          if (!remoteStreamRef.current.getTracks().some((t) => t.id === vTrack.id)) {
            remoteStreamRef.current.addTrack(vTrack)
          }
          setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()))
        }
      } catch (err) {
        console.warn('[WebRTC] Erro ao responder renegotiation offer:', err)
      }
    }

    if (signal.type === 'ice_candidate') {
      const candidate = new RTCIceCandidate(signal.payload.candidate as RTCIceCandidateInit)
      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate)
      } else {
        pendingCandidatesRef.current.push(candidate)
      }
    }

    if (signal.type === 'call_end' || signal.type === 'call_reject') {
      SoundService.playCallEnd()
      cleanup()
      setCallState('ended')
      setTimeout(() => setCallState('idle'), 2000)
    }
  }, [])

  // ── Obter mídia local com constraints reais ────────────────────────────────

  const getLocalMedia = async (type: CallType): Promise<MediaStream> => {
    try {
      if (liveFilterCleanupRef.current) {
        liveFilterCleanupRef.current()
        liveFilterCleanupRef.current = null
      }

      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: noiseFilter !== 'off',
          autoGainControl: true,
        },
        video: type === 'video',
      })

      rawStreamRef.current = rawStream
      rawStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMutedRef.current
      })

      let finalStream = rawStream

      if (noiseFilter !== 'off') {
        const { filteredStream, setMuted, cleanup } = CleanvoiceService.createLiveFilter(rawStream, noiseFilter)
        liveFilterCleanupRef.current = cleanup
        liveFilterSetMutedRef.current = setMuted
        if (isMutedRef.current) {
          setMuted(true)
        }
        const filteredAudioTrack = filteredStream.getAudioTracks()[0]
        if (filteredAudioTrack) {
          finalStream = new MediaStream([filteredAudioTrack, ...rawStream.getVideoTracks()])
        }
      }

      updateLocalStream(finalStream)
      setIsCameraOn(type === 'video')
      return finalStream
    } catch (err) {
      console.warn('[WebRTC] Falha na captura de mídia:', {
        name: (err as Error)?.name,
        message: (err as Error)?.message,
      }, err)
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      })
      updateLocalStream(fallbackStream)
      setIsCameraOn(type === 'video')
      return fallbackStream
    }
  }

  // ── Iniciar chamada ───────────────────────────────────────────────────────

  const startCall = async (
    toUserId: string,
    participant: CallParticipant,
    type: CallType = 'audio',
    myProfile?: { name?: string; avatar?: string }
  ): Promise<void> => {
    if (!signalingRef.current) return

    const newCallId = crypto.randomUUID()
    setCallId(newCallId)
    setCallType(type)
    setRemoteParticipant(participant)
    setCallState('calling')
    setIsRemoteSharingScreen(false)
    setIsSharingScreen(false)
    setStreamViewers([])
    remoteStreamRef.current = new MediaStream()
    setRemoteStream(null)

    try {
      const stream = await getLocalMedia(type)
      const pc = createPeerConnection(newCallId, toUserId)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      await signalingRef.current.listen(newCallId, handleSignal)

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await signalingRef.current.send(newCallId, toUserId, 'offer', {
        sdp: offer,
        callType: type,
        callerName: myProfile?.name || 'Usuário',
        callerAvatar: myProfile?.avatar || null,
      })
    } catch (err) {
      const error = err as Error
      console.error(
        `[WebRTC] Erro ao iniciar chamada: ${error?.name || 'Error'}: ${error?.message || String(err)} | callId=${newCallId} | toUserId=${toUserId}`,
        err
      )
      cleanup()
      setCallState('idle')
    }
  }

  // ── Aceitar chamada ───────────────────────────────────────────────────────

  const acceptCall = async (signal: CallSignal, participant: CallParticipant): Promise<void> => {
    if (!signalingRef.current) return

    const type = (signal.payload.callType as CallType) || 'audio'
    setCallType(type)
    setCallId(signal.call_id)
    callIdRef.current = signal.call_id
    setRemoteParticipant(participant)
    setCallState('active')
    setIsRemoteSharingScreen(false)
    setIsSharingScreen(false)
    setStreamViewers([])
    remoteStreamRef.current = new MediaStream()
    setRemoteStream(null)

    try {
      const stream = await getLocalMedia(type)
      const pc = createPeerConnection(signal.call_id, signal.from_user_id)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      await signalingRef.current.listen(signal.call_id, handleSignal)

      const remoteDesc = new RTCSessionDescription(signal.payload.sdp as RTCSessionDescriptionInit)
      await pc.setRemoteDescription(remoteDesc)

      // Flush pending ICE
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidatesRef.current = []

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      await signalingRef.current.send(signal.call_id, signal.from_user_id, 'answer', {
        sdp: answer,
      })
    } catch (err) {
      console.error('[WebRTC] Erro ao aceitar chamada:', err)
      cleanup()
      setCallState('idle')
    }
  }

  // ── Rejeitar chamada ──────────────────────────────────────────────────────

  const rejectCall = async (signal: CallSignal): Promise<void> => {
    SoundService.playCallEnd()
    if (signalingRef.current) {
      await signalingRef.current.send(signal.call_id, signal.from_user_id, 'call_reject', {}).catch(() => {})
    }
    cleanup()
    setCallState('ended')
    setTimeout(() => setCallState('idle'), 1500)
    setCallId(null)
  }

  // ── Encerrar chamada ──────────────────────────────────────────────────────

  const hangUp = useCallback(() => {
    SoundService.playCallEnd()
    const activeCallId = callIdRef.current
    const activePartner = remoteParticipantRef.current

    if (signalingRef.current && activeCallId && activePartner) {
      signalingRef.current
        .send(activeCallId, activePartner.userId, 'call_end', {})
        .catch(() => {})
    }
    cleanup()
    setCallState('ended')
    setTimeout(() => setCallState('idle'), 1500)
  }, [])

  // ── Mudo do Microfone (100% garantido no stream e nos senders) ─────────────

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      // 1. Muta o stream de hardware bruto (microfone)
      if (rawStreamRef.current) {
        rawStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next
        })
      }
      // 2. Muta no stream filtrado local
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next
        })
      }
      // 3. Trava o Noise Gate do Cleanvoice em 0.0 (silêncio absoluto)
      if (liveFilterSetMutedRef.current) {
        liveFilterSetMutedRef.current(next)
      }
      // 4. Se houver mixer de tela ativo, controla o ganho do mic sem mutar o áudio do jogo/tela
      if (mixerMicGainRef.current) {
        mixerMicGainRef.current.gain.value = next ? 0 : 1
      } else if (pcRef.current) {
        // Se não houver mixer, muta diretamente os senders de áudio
        pcRef.current.getSenders().forEach((s) => {
          if (s.track && s.track.kind === 'audio') {
            s.track.enabled = !next
          }
        })
      }
      // 5. Toca o tom de microfone (mutado/desmutado)
      SoundService.playMicToggle(next)
      return next
    })
  }, [])

  // ── Ensurdecer / Silenciar a chamada recebida ──────────────────────────────

  const toggleDeafen = useCallback(() => {
    setIsDeafened((prev) => {
      const next = !prev
      // Silencia o áudio remoto recebido nas tracks
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next
        })
      }
      // Ao ensurdecer, silencia também o microfone por segurança
      if (rawStreamRef.current) {
        rawStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next
        })
      }
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next
        })
      }
      if (liveFilterSetMutedRef.current) {
        liveFilterSetMutedRef.current(next)
      }
      if (mixerMicGainRef.current) {
        mixerMicGainRef.current.gain.value = next ? 0 : 1
      } else if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => {
          if (s.track && s.track.kind === 'audio') {
            s.track.enabled = !next
          }
        })
      }
      setIsMuted(next)
      SoundService.playDeafenToggle(next)
      return next
    })
  }, [])

  // ── Alternar Câmera ───────────────────────────────────────────────────────

  const toggleCamera = useCallback(async () => {
    const pc = pcRef.current
    const stream = localStreamRef.current
    if (!pc || !stream) return

    if (isCameraOn) {
      stream.getVideoTracks().forEach((t) => {
        t.stop()
        stream.removeTrack(t)
        const sender = pc.getSenders().find((s) => s.track === t)
        if (sender) pc.removeTrack(sender)
      })
      updateLocalStream(new MediaStream(stream.getTracks()))
      setIsCameraOn(false)
    } else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const videoTrack = videoStream.getVideoTracks()[0]
        if (!videoTrack) return
        stream.addTrack(videoTrack)
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(videoTrack)
        } else {
          pc.addTrack(videoTrack, stream)
        }
        updateLocalStream(new MediaStream(stream.getTracks()))
        setIsCameraOn(true)
      } catch (err) {
        console.warn('[WebRTC] Não foi possível ativar câmera:', err)
      }
    }
  }, [isCameraOn])

  // ── Compartilhar Tela com Fonte e Áudio Opcional ──────────────────────────

  const startScreenShareWithSource = useCallback(async (sourceId?: string, shareAudio: boolean = true) => {
    const pc = pcRef.current
    if (!pc) return

    try {
      let display: MediaStream | null = null

      const isElectron = Boolean(
        typeof window !== 'undefined' &&
          ((window as any).electronIPC?.isElectron?.() ||
            (window as any).electronAPI ||
            (window as any).isElectron ||
            (window as any).ipcRenderer)
      )

      if (isElectron && sourceId) {
        try {
          const ipc = (window as any).electronIPC || (window as any).electronAPI
          if (ipc?.invoke) {
            await ipc.invoke('set-selected-screen-source', sourceId)
          }
        } catch (e) {
          console.warn('[WebRTC] Erro ao sincronizar fonte no Electron:', e)
        }
      }

      // Tentativa 1 (Mais estável e de alta qualidade): getDisplayMedia
      try {
        display = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30, max: 60 },
          },
          audio: shareAudio,
        })
      } catch (dispErr) {
        console.warn('[WebRTC] getDisplayMedia falhou ou foi cancelado:', dispErr)
      }

      // Tentativa 2 (Fallback Electron): getUserMedia com desktopCapturer sem travas de resolução
      if (!display && sourceId) {
        let streamCaptured: MediaStream | null = null
        if (shareAudio) {
          try {
            streamCaptured = await (navigator.mediaDevices as any).getUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                },
              },
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sourceId,
                  maxFrameRate: 60,
                },
              },
            })
          } catch (audioErr) {
            console.warn('[WebRTC] Falha áudio desktop:', audioErr)
          }
        }

        if (!streamCaptured) {
          streamCaptured = await (navigator.mediaDevices as any).getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
                maxFrameRate: 60,
              },
            },
          })
        }
        display = streamCaptured
      }

      if (!display) {
        throw new Error('Não foi possível capturar a tela selecionada.')
      }

      updateScreenStream(display)
      setIsSharingScreen(true)

      // Notifica participante remoto que iniciamos compartilhamento de tela
      if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
        signalingRef.current.send(
          callIdRef.current,
          remoteParticipantRef.current.userId,
          'screen_share_start',
          {}
        ).catch(() => {})
      }

      const screenVideoTrack = display.getVideoTracks()[0]
      const screenAudioTrack = display.getAudioTracks()[0]

      console.log('[WebRTC] Compartilhamento iniciado. Tracks capturadas:', {
        video: screenVideoTrack ? screenVideoTrack.label : null,
        audio: screenAudioTrack ? screenAudioTrack.label : null,
      })

      // Injeta vídeo da tela no PeerConnection habilitando envio ativo (sendrecv)
      if (screenVideoTrack) {
        const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video')
        if (videoTransceiver) {
          videoTransceiver.direction = 'sendrecv'
        }

        const sender = pc.getSenders().find((s) => s.track?.kind === 'video' || (!s.track && (s as any).kind === 'video'))
        if (sender) {
          await sender.replaceTrack(screenVideoTrack)
        } else if (videoTransceiver && videoTransceiver.sender) {
          await videoTransceiver.sender.replaceTrack(screenVideoTrack)
        } else {
          if (localStreamRef.current) pc.addTrack(screenVideoTrack, localStreamRef.current)
          else pc.addTrack(screenVideoTrack, display)
        }

        // Renegociação WebRTC obrigatória para que o outro peer receba a track de vídeo
        if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            await signalingRef.current.send(
              callIdRef.current,
              remoteParticipantRef.current.userId,
              'offer',
              {
                sdp: offer,
                callType: 'video',
                isScreenShare: true,
              }
            )
          } catch (negErr) {
            console.warn('[WebRTC] Erro na renegociação de tela:', negErr)
          }
        }

        screenVideoTrack.onended = () => {
          stopScreenShare()
        }
      }

      // ── Audio Mixer: Mixa áudio da tela (jogo/aplicativo) com o microfone ───
      if (screenAudioTrack) {
        console.log('[WebRTC] Ativando Audio Mixer para transmitir áudio do aplicativo/jogo...')
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          if (AudioContextClass) {
            const mixer = new AudioContextClass()
            screenMixerCtxRef.current = mixer

            const dest = mixer.createMediaStreamDestination()

            // Conecta microfone se disponível
            const micTrack = localStreamRef.current?.getAudioTracks()[0] || rawStreamRef.current?.getAudioTracks()[0]
            if (micTrack) {
              originalMicTrackRef.current = micTrack
              const micSource = mixer.createMediaStreamSource(new MediaStream([micTrack]))
              const micGain = mixer.createGain()
              micGain.gain.value = isMutedRef.current ? 0 : 1
              micSource.connect(micGain)
              micGain.connect(dest)
              mixerMicGainRef.current = micGain
            }

            // Conecta áudio da tela/aplicativo
            const screenSource = mixer.createMediaStreamSource(new MediaStream([screenAudioTrack]))
            const screenGain = mixer.createGain()
            screenGain.gain.value = 1
            screenSource.connect(screenGain)
            screenGain.connect(dest)
            mixerScreenGainRef.current = screenGain

            const mixedTrack = dest.stream.getAudioTracks()[0]
            mixedAudioTrackRef.current = mixedTrack

            // Injeta a track de áudio mixada no sender do PeerConnection
            const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio' || (!s.track && (s as any).kind === 'audio'))
            if (audioSender) {
              await audioSender.replaceTrack(mixedTrack)
              console.log('[WebRTC] Track de áudio mixado (mic + som do app) atribuída ao audioSender com sucesso!')
            } else {
              pc.addTrack(mixedTrack, localStreamRef.current || new MediaStream())
              console.log('[WebRTC] Track de áudio mixado adicionada ao PC.')
            }
          }
        } catch (mixErr) {
          console.error('[WebRTC] Erro ao inicializar Audio Mixer:', mixErr)
        }
      }
    } catch (err) {
      console.warn('[WebRTC] Compartilhamento de tela cancelado ou falhou:', err)
    }
  }, [])

  const stopScreenShare = useCallback(async () => {
    const pc = pcRef.current
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    updateScreenStream(null)
    setIsSharingScreen(false)

    // Restaura microfone original no sender
    if (pc && originalMicTrackRef.current) {
      const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio' || (!s.track && (s as any).kind === 'audio'))
      if (audioSender) {
        await audioSender.replaceTrack(originalMicTrackRef.current).catch(() => {})
        console.log('[WebRTC] Microfone original restaurado após transmissão de tela.')
      }
    }

    // Fecha e limpa o Audio Mixer
    if (screenMixerCtxRef.current) {
      screenMixerCtxRef.current.close().catch(() => {})
      screenMixerCtxRef.current = null
      mixerMicGainRef.current = null
      mixerScreenGainRef.current = null
      originalMicTrackRef.current = null
      mixedAudioTrackRef.current = null
    }

    // Notifica participante remoto que encerramos compartilhamento
    if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
      signalingRef.current.send(
        callIdRef.current,
        remoteParticipantRef.current.userId,
        'screen_share_stop',
        {}
      ).catch(() => {})
    }

    // Restaura câmera se estava ligada antes ou desanexa track de vídeo sem destruir o transceiver
    if (pc) {
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video' || (!s.track && (s as any).kind === 'video'))
      if (videoSender) {
        if (isCameraOn) {
          try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true })
            const camTrack = camStream.getVideoTracks()[0]
            if (camTrack) await videoSender.replaceTrack(camTrack)
          } catch {}
        } else {
          try {
            await videoSender.replaceTrack(null)
          } catch (e) {
            console.warn('[WebRTC] Erro ao desanexar vídeo:', e)
          }
        }
      }
    }
  }, [isCameraOn])

  // ── Limpeza ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (liveFilterCleanupRef.current) {
      liveFilterCleanupRef.current()
      liveFilterCleanupRef.current = null
    }
    liveFilterSetMutedRef.current = null
    if (screenMixerCtxRef.current) {
      screenMixerCtxRef.current.close().catch(() => {})
      screenMixerCtxRef.current = null
      mixerMicGainRef.current = null
      mixerScreenGainRef.current = null
      originalMicTrackRef.current = null
      mixedAudioTrackRef.current = null
    }
    rawStreamRef.current?.getTracks().forEach((t) => t.stop())
    rawStreamRef.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    remoteStreamRef.current = new MediaStream()
    signalingRef.current?.unlisten()
    updateLocalStream(null)
    updateScreenStream(null)
    setRemoteStream(null)
    setCallId(null)
    setRemoteParticipant(null)
    setIsMuted(false)
    setIsDeafened(false)
    setIsCameraOn(false)
    setIsSharingScreen(false)
    setIsRemoteSharingScreen(false)
    setStreamViewers([])
    setCallDuration(0)
  }, [])

  // ── Sinalização de Espectador de Transmissão ──────────────────────────────
  const sendStreamViewerSignal = useCallback(
    (action: 'join' | 'leave', myInfo: { name: string; avatar?: string }) => {
      if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
        const signalType = action === 'join' ? 'stream_viewer_join' : 'stream_viewer_leave'
        signalingRef.current
          .send(callIdRef.current, remoteParticipantRef.current.userId, signalType as any, {
            name: myInfo.name,
            avatar: myInfo.avatar,
          })
          .catch(() => {})
      }
    },
    []
  )

  return {
    callState,
    callType,
    callId,
    remoteParticipant,
    localStream,
    remoteStream,
    screenStream,
    isMuted,
    isDeafened,
    isCameraOn,
    isSharingScreen,
    isRemoteSharingScreen,
    callDuration,
    noiseFilter,
    setNoiseFilter,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    startScreenShareWithSource,
    stopScreenShare,
    streamViewers,
    sendStreamViewerSignal,
  }
}
