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
      if (callStateRef.current === 'idle') {
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

      pc.onicecandidate = async (event) => {
        if (event.candidate && signalingRef.current) {
          await signalingRef.current.send(currentCallId, toUserId, 'ice_candidate', {
            candidate: event.candidate.toJSON(),
          })
        }
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0])
        } else {
          remoteStreamRef.current.addTrack(event.track)
          setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()))
        }
        if (event.track.kind === 'video') {
          setIsRemoteSharingScreen(true)
          event.track.onended = () => {
            setIsRemoteSharingScreen(false)
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

    if (signal.type === 'screen_share_start') {
      setIsRemoteSharingScreen(true)
    }

    if (signal.type === 'screen_share_stop') {
      setIsRemoteSharingScreen(false)
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
        const remoteDesc = new RTCSessionDescription(signal.payload.sdp as RTCSessionDescriptionInit)
        await pc.setRemoteDescription(remoteDesc)
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(candidate)
        }
        pendingCandidatesRef.current = []
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
          await signalingRef.current.send(callIdRef.current, remoteParticipantRef.current.userId, 'answer', {
            sdp: answer,
          })
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
      console.warn('[WebRTC] Fallback para constraints básicas de áudio:', err)
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

    try {
      const stream = await getLocalMedia(type)
      const pc = createPeerConnection(newCallId, toUserId)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      signalingRef.current.listen(newCallId, handleSignal)

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await signalingRef.current.send(newCallId, toUserId, 'offer', {
        sdp: offer,
        callType: type,
        callerName: myProfile?.name || 'Usuário',
        callerAvatar: myProfile?.avatar || null,
      })
    } catch (err) {
      console.error('[WebRTC] Erro ao iniciar chamada:', err)
      cleanup()
      setCallState('idle')
    }
  }

  // ── Aceitar chamada ───────────────────────────────────────────────────────

  const acceptCall = async (signal: CallSignal, participant: CallParticipant): Promise<void> => {
    if (!signalingRef.current) return

    const type = (signal.payload.callType as CallType) || 'audio'
    setCallType(type)
    setRemoteParticipant(participant)
    setCallState('active')

    try {
      const stream = await getLocalMedia(type)
      const pc = createPeerConnection(signal.call_id, signal.from_user_id)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      signalingRef.current.listen(signal.call_id, handleSignal)

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
    if (!signalingRef.current) return
    await signalingRef.current.send(signal.call_id, signal.from_user_id, 'call_reject', {})
    setCallState('idle')
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
      // 4. Muta nos senders do PeerConnection
      if (pcRef.current) {
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
      if (pcRef.current) {
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
      let display: MediaStream

      // Se temos sourceId de tela ou janela do Electron
      if (sourceId && (sourceId.startsWith('screen:') || sourceId.startsWith('window:'))) {
        try {
          display = await (navigator.mediaDevices as any).getUserMedia({
            audio: shareAudio
              ? {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                  },
                }
              : false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080,
                minFrameRate: 30,
                maxFrameRate: 60,
              },
            },
          })
        } catch (audioErr) {
          console.warn('[WebRTC] Falha ao capturar com áudio, tentando sem áudio:', audioErr)
          display = await (navigator.mediaDevices as any).getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
              },
            },
          })
        }
      } else {
        // Modo Web ou seleção genérica
        display = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: shareAudio,
        })
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

      // Injeta vídeo da tela no PeerConnection
      if (screenVideoTrack) {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video' || (!s.track && (s as any).kind === 'video'))
        if (sender) {
          await sender.replaceTrack(screenVideoTrack)
        } else {
          if (localStreamRef.current) pc.addTrack(screenVideoTrack, localStreamRef.current)
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

      // Se houver áudio da tela (som do sistema), transmite para o peer
      if (screenAudioTrack && localStreamRef.current) {
        const audioSender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio')
        // Adiciona a track de áudio da tela ao stream local
        localStreamRef.current.addTrack(screenAudioTrack)
        if (!audioSender) {
          pc.addTrack(screenAudioTrack, localStreamRef.current)
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

    // Notifica participante remoto que encerramos compartilhamento
    if (signalingRef.current && callIdRef.current && remoteParticipantRef.current) {
      signalingRef.current.send(
        callIdRef.current,
        remoteParticipantRef.current.userId,
        'screen_share_stop',
        {}
      ).catch(() => {})
    }

    // Restaura câmera se estava ligada antes
    if (isCameraOn && localStreamRef.current && pc) {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const camTrack = camStream.getVideoTracks()[0]
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender && camTrack) await sender.replaceTrack(camTrack)
      } catch {}
    }
  }, [isCameraOn])

  // ── Limpeza ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (liveFilterCleanupRef.current) {
      liveFilterCleanupRef.current()
      liveFilterCleanupRef.current = null
    }
    liveFilterSetMutedRef.current = null
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
    setCallDuration(0)
  }, [])

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
  }
}
