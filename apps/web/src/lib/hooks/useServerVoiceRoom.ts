import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { CleanvoiceService } from '../services/CleanvoiceService'
import { SoundService } from '../services/SoundService'
import { MyInstantsService } from '../services/MyInstantsService'

export interface VoiceParticipant {
  id: string
  name: string
  avatar?: string
  isMuted?: boolean
  isDeafened?: boolean
  hasCamera?: boolean
  isSharingScreen?: boolean
}

export interface UseServerVoiceRoomReturn {
  connectedServerId: string | null
  connectedServerName: string | null
  connectedRoomId: string | null
  connectedRoomName: string | null
  viewingServerId: string | null
  setViewingServerId: (serverId: string | null) => void
  voiceParticipants: Record<string, VoiceParticipant[]>
  localAudioStream: MediaStream | null
  localCameraStream: MediaStream | null
  localScreenStream: MediaStream | null
  isLocalAudioMuted: boolean
  isDeafened: boolean
  isLocalSpeaking: boolean
  remoteSpeakingUsers: Record<string, boolean>
  voiceNoiseFilter: string
  setVoiceNoiseFilter: (filter: string) => void
  joinVoiceRoom: (server: { id: string; name: string }, room: { id: string; name: string }) => Promise<void>
  leaveVoiceRoom: () => void
  toggleAudioMute: () => Promise<void>
  toggleDeafen: () => void
  toggleCamera: () => Promise<void>
  remoteScreenStreams: Map<string, MediaStream>
  startScreenShareWithStream: (stream: MediaStream) => void
  stopScreenShare: () => void
  requestScreenStream: (streamerId: string) => void
  /** Define qual transmissão o usuário está assistindo (null = nenhuma). Controla vídeo e áudio da tela. */
  setWatchedStreamer: (streamerId: string | null) => void
  changeNoiseFilter: (newFilter: string) => Promise<void>
}

// ─── Topologia de mídia do mesh ───────────────────────────────────────────────
//
// Cada par de participantes compartilha UMA RTCPeerConnection com três
// transceivers fixos, criados apenas pelo participante de menor ID (ofertante)
// nesta ordem. A ordem das m-lines é preservada dos dois lados, então o índice
// do transceiver identifica a mídia sem depender de `kind` (existem dois de áudio).
//
// Iniciar/parar a transmissão de tela apenas troca a track do sender
// (`replaceTrack`), sem renegociar SDP. Antes, `removeTrack` + renegociação
// deixava m-lines órfãs e receivers inativos, e a segunda transmissão ficava
// presa em "Conectando" até o usuário sair e entrar na sala.
const SLOT_MIC = 0
const SLOT_SCREEN_VIDEO = 1
const SLOT_SCREEN_AUDIO = 2
const SLOT_COUNT = 3

const SCREEN_AUDIO_SUFFIX = ':screen'
const SCREEN_MAX_BITRATE = 6_000_000
const INITIAL_OFFER_RETRY_MS = 5000
const PEER_GRACE_PERIOD_MS = 5000

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

async function replaceSenderTrack(sender: RTCRtpSender, track: MediaStreamTrack | null) {
  if (sender.track === track) return
  try {
    await sender.replaceTrack(track)
  } catch (err) {
    console.warn('[WebRTC] Falha ao trocar track do sender:', err)
  }
}

/** Eleva o teto de bitrate do vídeo da tela (o padrão do Chrome deixa texto borrado). */
async function tuneScreenSender(sender: RTCRtpSender) {
  try {
    const params = sender.getParameters()
    if (!params.encodings || params.encodings.length === 0) return
    if (params.encodings[0].maxBitrate === SCREEN_MAX_BITRATE) return
    params.encodings[0].maxBitrate = SCREEN_MAX_BITRATE
    await sender.setParameters(params)
  } catch {
    // Alguns navegadores não permitem antes da negociação; o padrão continua funcionando.
  }
}

export function useServerVoiceRoom(user: any, profile: any, showToast?: (toast: any) => void): UseServerVoiceRoomReturn {
  const [connectedServerId, setConnectedServerId] = useState<string | null>(null)
  const [connectedServerName, setConnectedServerName] = useState<string | null>(null)
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(null)
  const [connectedRoomName, setConnectedRoomName] = useState<string | null>(null)
  const [viewingServerId, setViewingServerId] = useState<string | null>(null)

  const [voiceParticipants, setVoiceParticipants] = useState<Record<string, VoiceParticipant[]>>({})
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null)
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null)
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null)
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<Map<string, MediaStream>>(new Map())

  const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false)
  const [remoteSpeakingUsers, setRemoteSpeakingUsers] = useState<Record<string, boolean>>({})

  const [voiceNoiseFilter, setVoiceNoiseFilter] = useState<string>(() => {
    return localStorage.getItem('alura_voice_noise_filter') || 'cleanvoice'
  })

  // Refs para manter valores síncronos sem disparar recriação de canais Supabase
  const isLocalAudioMutedRef = useRef(isLocalAudioMuted)
  isLocalAudioMutedRef.current = isLocalAudioMuted

  const isDeafenedRef = useRef(isDeafened)
  isDeafenedRef.current = isDeafened

  const localCameraStreamRef = useRef(localCameraStream)
  localCameraStreamRef.current = localCameraStream

  const localScreenStreamRef = useRef(localScreenStream)
  localScreenStreamRef.current = localScreenStream

  const localAudioStreamRef = useRef(localAudioStream)
  localAudioStreamRef.current = localAudioStream

  const connectedRoomIdRef = useRef(connectedRoomId)
  connectedRoomIdRef.current = connectedRoomId

  const profileRef = useRef(profile)
  profileRef.current = profile

  const userIdRef = useRef<string | undefined>(user?.id)
  userIdRef.current = user?.id

  const rawAudioStreamRef = useRef<MediaStream | null>(null)
  const voiceLiveFilterCleanupRef = useRef<(() => void) | null>(null)
  const voiceChannelRef = useRef<any>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const peerCreatedAtRef = useRef<Map<string, number>>(new Map())
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const watchedStreamerRef = useRef<string | null>(null)

  // ── Utilitários de sinalização ────────────────────────────────────────────

  const sendSignal = useCallback((payload: Record<string, unknown>) => {
    const channel = voiceChannelRef.current
    const myId = userIdRef.current
    if (!channel || !myId) return
    channel.send({
      type: 'broadcast',
      event: 'voice_signal',
      payload: { ...payload, senderId: myId },
    })
  }, [])

  // Fila de ICE candidates para evitar descartes antes de setRemoteDescription
  const queueIceCandidate = useCallback((peerId: string, candidate: RTCIceCandidateInit) => {
    const list = pendingCandidatesRef.current.get(peerId) || []
    list.push(candidate)
    pendingCandidatesRef.current.set(peerId, list)
  }, [])

  const flushIceCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const list = pendingCandidatesRef.current.get(peerId)
    if (!list || list.length === 0) return
    pendingCandidatesRef.current.delete(peerId)
    for (const cand of list) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand))
      } catch (err) {
        console.warn('[WebRTC] Erro ao aplicar candidate enfileirado:', err)
      }
    }
  }, [])

  // ── Mídia local → senders ─────────────────────────────────────────────────

  /** Garante que cada slot envie a track local correta (ou nada). Idempotente. */
  const syncLocalTracks = useCallback(async (pc: RTCPeerConnection) => {
    if (pc.signalingState === 'closed') return
    const tx = pc.getTransceivers()
    if (tx.length < SLOT_COUNT) return

    const mic = localAudioStreamRef.current?.getAudioTracks()[0] ?? null
    const screen = localScreenStreamRef.current
    const screenVideo = screen?.getVideoTracks()[0] ?? null
    const screenAudio = screen?.getAudioTracks()[0] ?? null

    await Promise.all([
      replaceSenderTrack(tx[SLOT_MIC].sender, mic),
      replaceSenderTrack(tx[SLOT_SCREEN_VIDEO].sender, screenVideo),
      replaceSenderTrack(tx[SLOT_SCREEN_AUDIO].sender, screenAudio),
    ])
    if (screenVideo) tuneScreenSender(tx[SLOT_SCREEN_VIDEO].sender)
  }, [])

  // ── Mídia remota → elementos de áudio / streams de tela ───────────────────

  const isScreenAudioMuted = (peerId: string) =>
    isDeafenedRef.current || watchedStreamerRef.current !== peerId

  /** Áudio da transmissão só toca para quem está assistindo (como no Discord). */
  const applyAudioMuting = useCallback(() => {
    remoteAudioElementsRef.current.forEach((el, key) => {
      if (key.endsWith(SCREEN_AUDIO_SUFFIX)) {
        el.muted = isScreenAudioMuted(key.slice(0, -SCREEN_AUDIO_SUFFIX.length))
      } else {
        el.muted = isDeafenedRef.current
      }
    })
  }, [])

  const playRemoteAudio = useCallback((peerId: string, track: MediaStreamTrack, isScreen: boolean) => {
    const key = isScreen ? `${peerId}${SCREEN_AUDIO_SUFFIX}` : peerId
    let el = remoteAudioElementsRef.current.get(key)
    if (!el) {
      el = new Audio()
      el.autoplay = true
      remoteAudioElementsRef.current.set(key, el)
    }
    const current = el.srcObject as MediaStream | null
    if (!current || current.getAudioTracks()[0] !== track) {
      el.srcObject = new MediaStream([track])
    }
    el.muted = isScreen ? isScreenAudioMuted(peerId) : isDeafenedRef.current
    el.play().catch(() => {})
  }, [])

  const dropRemoteScreen = useCallback((peerId: string) => {
    setRemoteScreenStreams((prev) => {
      if (!prev.has(peerId)) return prev
      const next = new Map(prev)
      next.delete(peerId)
      return next
    })
  }, [])

  /**
   * Publica o vídeo da tela do peer para a UI. Sempre cria um MediaStream novo
   * quando a entrada não existe, para o <video> recarregar ao retomar a transmissão.
   */
  const publishRemoteScreen = useCallback((peerId: string) => {
    const tx = peerConnectionsRef.current.get(peerId)?.getTransceivers()
    if (!tx || tx.length < SLOT_COUNT) return
    const track = tx[SLOT_SCREEN_VIDEO].receiver.track
    if (!track || track.readyState === 'ended') return
    setRemoteScreenStreams((prev) => {
      const existing = prev.get(peerId)
      if (existing && existing.getVideoTracks()[0] === track) return prev
      const next = new Map(prev)
      next.set(peerId, new MediaStream([track]))
      return next
    })
  }, [])

  const bindRemoteMedia = useCallback(
    (peerId: string, pc: RTCPeerConnection) => {
      const tx = pc.getTransceivers()
      if (tx.length < SLOT_COUNT) return
      playRemoteAudio(peerId, tx[SLOT_MIC].receiver.track, false)
      playRemoteAudio(peerId, tx[SLOT_SCREEN_AUDIO].receiver.track, true)
      if (watchedStreamerRef.current === peerId) publishRemoteScreen(peerId)
    },
    [playRemoteAudio, publishRemoteScreen]
  )

  // ── Ciclo de vida das conexões ────────────────────────────────────────────

  const disposePeer = useCallback(
    (peerId: string) => {
      const pc = peerConnectionsRef.current.get(peerId)
      if (pc) {
        pc.onicecandidate = null
        pc.ontrack = null
        pc.onconnectionstatechange = null
        pc.close()
      }
      peerConnectionsRef.current.delete(peerId)
      peerCreatedAtRef.current.delete(peerId)
      pendingCandidatesRef.current.delete(peerId)
      ;[peerId, `${peerId}${SCREEN_AUDIO_SUFFIX}`].forEach((key) => {
        const el = remoteAudioElementsRef.current.get(key)
        if (el) {
          el.pause()
          el.srcObject = null
          remoteAudioElementsRef.current.delete(key)
        }
      })
      dropRemoteScreen(peerId)
    },
    [dropRemoteScreen]
  )

  const sendOffer = useCallback(
    async (peerId: string, pc: RTCPeerConnection, options?: { iceRestart?: boolean; fresh?: boolean }) => {
      try {
        const offer = await pc.createOffer(options?.iceRestart ? { iceRestart: true } : undefined)
        await pc.setLocalDescription(offer)
        sendSignal({ targetId: peerId, type: 'offer', sdp: offer, fresh: !!options?.fresh })
      } catch (err) {
        console.warn('[WebRTC] Erro ao criar oferta:', err)
      }
    },
    [sendSignal]
  )

  /**
   * Cria (ou recupera) a conexão com um peer. Só o lado de menor ID cria os
   * transceivers e envia a oferta inicial; o outro lado apenas responde.
   */
  const ensurePeer = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      const existing = peerConnectionsRef.current.get(remoteUserId)
      if (existing && existing.signalingState !== 'closed') return existing

      const isOfferer = (userIdRef.current || '') < remoteUserId
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      peerConnectionsRef.current.set(remoteUserId, pc)
      peerCreatedAtRef.current.set(remoteUserId, Date.now())

      if (isOfferer) {
        pc.addTransceiver('audio', { direction: 'sendrecv' }) // SLOT_MIC
        pc.addTransceiver('video', { direction: 'sendrecv' }) // SLOT_SCREEN_VIDEO
        pc.addTransceiver('audio', { direction: 'sendrecv' }) // SLOT_SCREEN_AUDIO
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({ targetId: remoteUserId, type: 'ice-candidate', candidate: event.candidate.toJSON() })
        }
      }

      pc.ontrack = () => bindRemoteMedia(remoteUserId, pc)

      // Recupera quedas de rede sem exigir que o usuário saia e entre na sala
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' && isOfferer && pc.signalingState === 'stable') {
          try {
            pc.restartIce()
          } catch {}
          sendOffer(remoteUserId, pc, { iceRestart: true })
        }
      }

      if (isOfferer) {
        syncLocalTracks(pc).finally(() => sendOffer(remoteUserId, pc, { fresh: true }))
        // Reenvia a oferta se ela se perder (ex.: canal do outro lado reconectando)
        setTimeout(() => {
          if (
            peerConnectionsRef.current.get(remoteUserId) === pc &&
            pc.signalingState === 'have-local-offer' &&
            pc.localDescription
          ) {
            sendSignal({ targetId: remoteUserId, type: 'offer', sdp: pc.localDescription.toJSON(), fresh: false })
          }
        }, INITIAL_OFFER_RETRY_MS)
      }

      return pc
    },
    [sendSignal, sendOffer, syncLocalTracks, bindRemoteMedia]
  )

  // Ajusta o mute dos elementos remotos ao alterar ensurdecimento (deafen)
  useEffect(() => {
    applyAudioMuting()
  }, [isDeafened, applyAudioMuting])

  // Atualiza o rastreamento de presença sem recriar o canal Supabase
  const trackVoicePresence = useCallback(
    (overrides?: {
      roomId?: string | null
      isMuted?: boolean
      isDeafened?: boolean
      hasCamera?: boolean
      isSharingScreen?: boolean
    }) => {
      if (!voiceChannelRef.current || !user?.id) return
      const activeRoomId = overrides?.roomId !== undefined ? overrides.roomId : connectedRoomIdRef.current
      if (!activeRoomId) return

      const prof = profileRef.current
      const muted = overrides?.isMuted !== undefined ? overrides.isMuted : isLocalAudioMutedRef.current
      const deaf = overrides?.isDeafened !== undefined ? overrides.isDeafened : isDeafenedRef.current
      const cam = overrides?.hasCamera !== undefined ? overrides.hasCamera : !!localCameraStreamRef.current
      const screen = overrides?.isSharingScreen !== undefined ? overrides.isSharingScreen : !!localScreenStreamRef.current

      voiceChannelRef.current
        .track({
          user_id: user.id,
          room_id: activeRoomId,
          username: prof?.username || 'user',
          display_name: prof?.display_name || prof?.username || 'Você',
          avatar_url: prof?.avatar_url,
          is_muted: muted,
          is_deafened: deaf,
          has_camera: cam,
          is_sharing_screen: screen,
          isSharingScreen: screen,
          online_at: new Date().toISOString(),
        })
        .catch((err: any) => {
          console.warn('[useServerVoiceRoom] Erro ao rastrear presença de voz:', err)
        })
    },
    [user?.id]
  )

  // Servidor que devemos escutar (se conectado em voz, prevalece o conectado; senão, o que está sendo visualizado)
  const targetServerId = connectedServerId || viewingServerId

  // Presença e sinalização WebRTC em tempo real via Supabase Channel
  // ESTE EFFECT NÃO DEVE DEPENDER DE MUTE, DEAFEN OU STREAMS PARA NÃO RECRIAR O CANAL!
  useEffect(() => {
    if (!targetServerId || !user?.id) {
      if (voiceChannelRef.current) {
        supabase.removeChannel(voiceChannelRef.current)
        voiceChannelRef.current = null
      }
      setVoiceParticipants({})
      return
    }

    const channelName = `server_voice_${targetServerId}`
    const voicePresenceChannel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    })
    voiceChannelRef.current = voicePresenceChannel

    voicePresenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = voicePresenceChannel.presenceState()
        const byRoom: Record<string, VoiceParticipant[]> = {}
        const userMapByRoom: Record<string, Map<string, VoiceParticipant>> = {}

        // DEDUPLICAÇÃO ESTRITA: Cada user_id pode aparecer no máximo UMA vez por sala
        Object.entries(state).forEach(([presenceKey, presences]: [string, any]) => {
          if (!Array.isArray(presences) || presences.length === 0) return
          // Ordena pelo timestamp online_at para pegar o estado mais recente e verdadeiro
          const sorted = presences.slice().sort((a: any, b: any) => {
            const timeA = a?.online_at ? new Date(a.online_at).getTime() : 0
            const timeB = b?.online_at ? new Date(b.online_at).getTime() : 0
            return timeA - timeB
          })
          const p = sorted[sorted.length - 1]
          const userId = p?.user_id || presenceKey
          const roomId = p?.room_id

          if (roomId && userId) {
            // Se for o próprio usuário, só pode constar na sala em que ele está efetivamente conectado
            if (userId === user?.id) {
              if (!connectedRoomIdRef.current || roomId !== connectedRoomIdRef.current) {
                return
              }
            }

            if (!userMapByRoom[roomId]) {
              userMapByRoom[roomId] = new Map()
            }
            // Apenas o registro mais recente (p) determina se está transmitindo ou não
            const isSharing = p?.is_sharing_screen === true || p?.isSharingScreen === true
            const hasCam = p?.has_camera === true || p?.hasCamera === true

            if (!isSharing) {
              dropRemoteScreen(userId)
            }

            userMapByRoom[roomId].set(userId, {
              id: userId,
              name: p.display_name || p.username || 'Membro',
              avatar: p.avatar_url,
              isMuted: p.is_muted ?? false,
              isDeafened: p.is_deafened ?? false,
              hasCamera: hasCam,
              isSharingScreen: isSharing,
            })
          }
        })

        // Converte os Maps únicos em arrays finais por sala
        Object.entries(userMapByRoom).forEach(([roomId, map]) => {
          byRoom[roomId] = Array.from(map.values())
        })

        setVoiceParticipants(byRoom)
      })
      .on('broadcast', { event: 'voice_speaking' }, ({ payload }) => {
        if (payload?.userId) {
          setRemoteSpeakingUsers((prev) => ({
            ...prev,
            [payload.userId]: payload.isSpeaking,
          }))
        }
      })
      .on('broadcast', { event: 'voice_signal' }, async ({ payload }) => {
        if (!payload) return
        const fromUserId = payload.senderId
        if (!fromUserId || fromUserId === user?.id) return

        if (payload.type === 'voice_leave') {
          const leftUserId = payload.userId || fromUserId
          setVoiceParticipants((prev) => {
            const next: Record<string, VoiceParticipant[]> = {}
            Object.entries(prev).forEach(([roomId, list]) => {
              next[roomId] = list.filter((p) => p.id !== leftUserId)
            })
            return next
          })
          disposePeer(leftUserId)
          return
        }

        if (payload.type === 'screen_share_start') {
          setVoiceParticipants((prev) => {
            const next = { ...prev }
            Object.keys(next).forEach((roomId) => {
              next[roomId] = next[roomId].map((p) =>
                p.id === fromUserId ? { ...p, isSharingScreen: true } : p
              )
            })
            return next
          })
          if (watchedStreamerRef.current === fromUserId) publishRemoteScreen(fromUserId)
          return
        }

        if (payload.type === 'screen_share_stop') {
          dropRemoteScreen(fromUserId)
          setVoiceParticipants((prev) => {
            const next = { ...prev }
            Object.keys(next).forEach((roomId) => {
              next[roomId] = next[roomId].map((p) =>
                p.id === fromUserId ? { ...p, isSharingScreen: false } : p
              )
            })
            return next
          })
          return
        }

        if (payload.targetId !== user?.id && payload.targetId !== 'all') return

        try {
          if (payload.type === 'request_stream') {
            // Com slots fixos não há renegociação: apenas garante que a tela esteja no sender.
            const pc = peerConnectionsRef.current.get(fromUserId)
            if (pc) await syncLocalTracks(pc)
          } else if (payload.type === 'offer') {
            // Oferta inicial de uma sessão nova (peer reentrou): descarta a conexão antiga.
            const previous = peerConnectionsRef.current.get(fromUserId)
            if (payload.fresh && previous && previous.remoteDescription) {
              disposePeer(fromUserId)
            }

            const pc = ensurePeer(fromUserId)
            // Perfect negotiation: o lado de maior ID é o "polite" e cede em colisões.
            const polite = user.id > fromUserId
            if (pc.signalingState !== 'stable') {
              if (!polite) return
              await pc.setLocalDescription({ type: 'rollback' })
            }

            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
            // Transceivers criados pela oferta nascem como recvonly; habilita envio.
            pc.getTransceivers().forEach((t) => {
              if (t.direction === 'recvonly' || t.direction === 'inactive') t.direction = 'sendrecv'
            })
            await syncLocalTracks(pc)
            await flushIceCandidates(fromUserId, pc)

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            sendSignal({ targetId: fromUserId, type: 'answer', sdp: answer })
            bindRemoteMedia(fromUserId, pc)
          } else if (payload.type === 'answer') {
            const pc = peerConnectionsRef.current.get(fromUserId)
            if (pc && pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
              await flushIceCandidates(fromUserId, pc)
              bindRemoteMedia(fromUserId, pc)
            }
          } else if (payload.type === 'ice-candidate') {
            if (!payload.candidate) return
            const pc = peerConnectionsRef.current.get(fromUserId)
            if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
              queueIceCandidate(fromUserId, payload.candidate)
            } else {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
              } catch (err) {
                console.warn('[WebRTC] Erro ao adicionar ICE candidate imediato:', err)
              }
            }
          }
        } catch (err) {
          console.error('[WebRTC Mesh Global] Erro ao processar sinal de voz:', err)
        }
      })
      .on('broadcast', { event: 'soundboard' }, ({ payload }) => {
        if (payload?.mp3Url) {
          try {
            const vol = Number(localStorage.getItem('alura_soundboard_volume') || '80')
            MyInstantsService.play(payload.mp3Url, vol)
          } catch {
            new Audio(payload.mp3Url).play().catch(() => {})
          }
        } else if (payload?.soundId) {
          SoundService.playSoundboard(payload.soundId as any)
        }
        if (showToast) {
          showToast({
            type: 'info',
            title: `${payload?.emoji || '🎵'} ${payload?.senderName || 'Alguém'} tocou:`,
            message: payload?.label || 'Efeito Sonoro',
          })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && connectedRoomIdRef.current) {
          const prof = profileRef.current
          await voicePresenceChannel.track({
            user_id: user.id,
            room_id: connectedRoomIdRef.current,
            username: prof?.username || 'user',
            display_name: prof?.display_name || prof?.username || 'Você',
            avatar_url: prof?.avatar_url,
            is_muted: isLocalAudioMutedRef.current,
            is_deafened: isDeafenedRef.current,
            has_camera: !!localCameraStreamRef.current,
            is_sharing_screen: !!localScreenStreamRef.current,
            isSharingScreen: !!localScreenStreamRef.current,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      voiceChannelRef.current = null
      supabase.removeChannel(voicePresenceChannel)
    }
  }, [
    targetServerId,
    user?.id,
    showToast,
    ensurePeer,
    disposePeer,
    syncLocalTracks,
    bindRemoteMedia,
    publishRemoteScreen,
    dropRemoteScreen,
    flushIceCandidates,
    queueIceCandidate,
    sendSignal,
  ])

  // Mantém o mesh alinhado à presença: conecta novos participantes e remove os que saíram
  useEffect(() => {
    if (!connectedRoomId || !user?.id || !voiceChannelRef.current) return

    const roomParticipants = voiceParticipants[connectedRoomId] || []
    const activeParticipantIds = new Set(roomParticipants.map((p) => p.id))
    const now = Date.now()

    Array.from(peerConnectionsRef.current.keys()).forEach((peerId) => {
      if (activeParticipantIds.has(peerId)) return
      // Tolerância para presença atrasada: a oferta pode chegar antes do sync.
      const createdAt = peerCreatedAtRef.current.get(peerId) || 0
      if (now - createdAt < PEER_GRACE_PERIOD_MS) return
      disposePeer(peerId)
    })

    // Apenas o lado de menor ID inicia; o outro cria a conexão ao receber a oferta.
    roomParticipants.forEach((participant) => {
      if (participant.id === user.id) return
      if (user.id < participant.id) ensurePeer(participant.id)
    })
  }, [voiceParticipants, connectedRoomId, user?.id, ensurePeer, disposePeer])

  // Microfone novo (entrada na sala, troca de filtro) → atualiza todas as conexões
  useEffect(() => {
    peerConnectionsRef.current.forEach((pc) => {
      syncLocalTracks(pc)
    })
  }, [localAudioStream, syncLocalTracks])

  // Detecção de voz (VAD) via Web Audio API
  useEffect(() => {
    if (!localAudioStream || isLocalAudioMuted) {
      setIsLocalSpeaking(false)
      return
    }

    let audioCtx: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let animationFrameId: number
    let timeoutId: any = null

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new AudioContextClass()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.4
      source = audioCtx.createMediaStreamSource(localAudioStream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkSpeaking = () => {
        if (!analyser) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const avg = sum / bufferLength
        if (avg > 10) {
          setIsLocalSpeaking(true)
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            setIsLocalSpeaking(false)
          }, 350)
        }
        animationFrameId = requestAnimationFrame(checkSpeaking)
      }

      checkSpeaking()
    } catch {
      // Ignora erro de AudioContext
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (timeoutId) clearTimeout(timeoutId)
      if (source) source.disconnect()
      if (analyser) analyser.disconnect()
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {})
    }
  }, [localAudioStream, isLocalAudioMuted])

  // Transmite status de fala (isSpeaking) para os outros participantes
  useEffect(() => {
    if (voiceChannelRef.current && user?.id && connectedRoomId) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'voice_speaking',
        payload: {
          userId: user.id,
          isSpeaking: isLocalSpeaking,
        },
      })
    }
  }, [isLocalSpeaking, user?.id, connectedRoomId])

  // Entrar na sala de voz
  const joinVoiceRoom = useCallback(
    async (server: { id: string; name: string }, room: { id: string; name: string }) => {
      setConnectedServerId(server.id)
      setConnectedServerName(server.name)
      setConnectedRoomId(room.id)
      setConnectedRoomName(room.name)
      connectedRoomIdRef.current = room.id

      if (!localAudioStream) {
        try {
          const constraints = CleanvoiceService.getAudioConstraints(voiceNoiseFilter)
          const rawStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints,
            video: false,
          })
          rawAudioStreamRef.current = rawStream

          let effectiveStream = rawStream
          try {
            if (voiceNoiseFilter === 'cleanvoice' || voiceNoiseFilter === 'krisp') {
              const { filteredStream, cleanup } = CleanvoiceService.applyFilterChain(rawStream, voiceNoiseFilter)
              effectiveStream = filteredStream
              voiceLiveFilterCleanupRef.current = cleanup
            }
          } catch {
            effectiveStream = rawStream
          }

          setLocalAudioStream(effectiveStream)
        } catch (err) {
          console.warn('[useServerVoiceRoom] Microfone não disponível:', err)
          if (showToast) {
            showToast({
              type: 'warning',
              title: 'Microfone Desativado',
              message: 'Permita o acesso ao microfone no navegador para falar na sala de voz.',
            })
          }
        }
      }

      // Rastreia imediatamente se o canal já estiver pronto
      if (voiceChannelRef.current) {
        trackVoicePresence({ roomId: room.id })
      }

      SoundService.play('voiceJoin')
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Voz Conectada',
          message: `Você entrou na sala de voz #${room.name}.`,
        })
      }
    },
    [localAudioStream, voiceNoiseFilter, showToast, trackVoicePresence]
  )

  // Sair da sala de voz
  const leaveVoiceRoom = useCallback(() => {
    // 1. Zera estados de conexão imediatamente de forma síncrona
    connectedRoomIdRef.current = null
    watchedStreamerRef.current = null
    setConnectedRoomId(null)
    setConnectedRoomName(null)
    setConnectedServerId(null)
    setConnectedServerName(null)
    setIsLocalAudioMuted(false)
    isLocalAudioMutedRef.current = false
    setIsDeafened(false)
    isDeafenedRef.current = false
    setRemoteSpeakingUsers({})

    // 2. Remove imediatamente o usuário local dos participantes na UI
    setVoiceParticipants((prev) => {
      const next: Record<string, VoiceParticipant[]> = {}
      Object.entries(prev).forEach(([roomId, list]) => {
        next[roomId] = list.filter((p) => p.id !== user?.id)
      })
      return next
    })

    // 3. Para todas as faixas de mídia locais
    if (voiceLiveFilterCleanupRef.current) {
      voiceLiveFilterCleanupRef.current()
      voiceLiveFilterCleanupRef.current = null
    }
    if (rawAudioStreamRef.current) {
      rawAudioStreamRef.current.getTracks().forEach((t) => t.stop())
      rawAudioStreamRef.current = null
    }
    if (localAudioStream) {
      localAudioStream.getTracks().forEach((t) => t.stop())
      setLocalAudioStream(null)
    }
    if (localCameraStream) {
      localCameraStream.getTracks().forEach((t) => t.stop())
      setLocalCameraStream(null)
      localCameraStreamRef.current = null
    }
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach((t) => t.stop())
      setLocalScreenStream(null)
      localScreenStreamRef.current = null
    }

    // 4. Fecha todas as conexões WebRTC ativas e libera áudio remoto
    Array.from(peerConnectionsRef.current.keys()).forEach((peerId) => disposePeer(peerId))
    pendingCandidatesRef.current.clear()
    remoteAudioElementsRef.current.forEach((audio) => {
      audio.srcObject = null
      audio.pause()
    })
    remoteAudioElementsRef.current.clear()
    setRemoteScreenStreams(new Map())

    // 5. Notifica todos os participantes da sala via broadcast instantâneo
    if (voiceChannelRef.current && user?.id) {
      try {
        sendSignal({ targetId: 'all', type: 'voice_leave', userId: user.id })
      } catch (err) {
        console.warn('[useServerVoiceRoom] Erro ao enviar broadcast de saída:', err)
      }

      // Untrack assíncrono no Supabase Realtime sem travar a interface
      voiceChannelRef.current.untrack().catch((err: any) => {
        console.warn('[useServerVoiceRoom] untrack error:', err)
      })
    }

    SoundService.play('voiceLeave')
    if (showToast) {
      showToast({
        type: 'info',
        title: 'Desconectado',
        message: 'Você saiu da sala de voz.',
      })
    }
  }, [localAudioStream, localCameraStream, user?.id, showToast, disposePeer, sendSignal])

  // Alternar Mute do Microfone
  const toggleAudioMute = useCallback(async () => {
    if (!localAudioStream) {
      try {
        const constraints = CleanvoiceService.getAudioConstraints(voiceNoiseFilter)
        const rawStream = await navigator.mediaDevices.getUserMedia({
          audio: constraints,
          video: false,
        })
        rawAudioStreamRef.current = rawStream
        setLocalAudioStream(rawStream)
        setIsLocalAudioMuted(false)
        isLocalAudioMutedRef.current = false
        SoundService.play('unmute')
        trackVoicePresence({ isMuted: false })
        return
      } catch {
        return
      }
    }

    const nextMuted = !isLocalAudioMuted
    localAudioStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsLocalAudioMuted(nextMuted)
    isLocalAudioMutedRef.current = nextMuted
    SoundService.play(nextMuted ? 'mute' : 'unmute')

    // Atualiza a presença sem recriar o canal
    trackVoicePresence({ isMuted: nextMuted })
  }, [localAudioStream, isLocalAudioMuted, voiceNoiseFilter, trackVoicePresence])

  // Alternar Deafen
  const toggleDeafen = useCallback(() => {
    const nextDeafened = !isDeafened
    setIsDeafened(nextDeafened)
    isDeafenedRef.current = nextDeafened

    let muted = isLocalAudioMutedRef.current
    if (nextDeafened && !isLocalAudioMuted && localAudioStream) {
      localAudioStream.getAudioTracks().forEach((track) => {
        track.enabled = false
      })
      setIsLocalAudioMuted(true)
      isLocalAudioMutedRef.current = true
      muted = true
    }

    SoundService.play(nextDeafened ? 'mute' : 'unmute')

    // Atualiza a presença sem recriar o canal
    trackVoicePresence({
      isDeafened: nextDeafened,
      isMuted: muted,
    })
  }, [isDeafened, isLocalAudioMuted, localAudioStream, trackVoicePresence])

  // Alternar Câmera
  const toggleCamera = useCallback(async () => {
    if (localCameraStream) {
      localCameraStream.getTracks().forEach((t) => t.stop())
      setLocalCameraStream(null)
      localCameraStreamRef.current = null
      trackVoicePresence({ hasCamera: false })
      if (showToast) showToast({ type: 'info', title: 'Câmera desligada' })
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        setLocalCameraStream(stream)
        localCameraStreamRef.current = stream
        trackVoicePresence({ hasCamera: true })
        if (showToast) showToast({ type: 'success', title: 'Câmera ativada' })
      } catch {
        if (showToast) showToast({ type: 'error', title: 'Erro na câmera', message: 'Dispositivo indisponível.' })
      }
    }
  }, [localCameraStream, showToast, trackVoicePresence])

  // Parar compartilhamento de tela (idempotente; pode ser chamado pelo botão ou pelo "Parar" do navegador)
  const stopScreenShare = useCallback(() => {
    const stream = localScreenStreamRef.current
    if (!stream) return

    localScreenStreamRef.current = null
    setLocalScreenStream(null)
    stream.getTracks().forEach((t) => t.stop())

    // Esvazia os slots de tela; a sessão WebRTC permanece intacta para a próxima transmissão
    peerConnectionsRef.current.forEach((pc) => {
      syncLocalTracks(pc)
    })

    trackVoicePresence({ isSharingScreen: false })
    sendSignal({ targetId: 'all', type: 'screen_share_stop' })
  }, [trackVoicePresence, syncLocalTracks, sendSignal])

  // Iniciar (ou trocar a fonte do) compartilhamento de tela com stream recebido
  const startScreenShareWithStream = useCallback(
    (stream: MediaStream) => {
      const previous = localScreenStreamRef.current
      if (previous && previous !== stream) {
        previous.getTracks().forEach((t) => {
          if (!stream.getTracks().includes(t)) t.stop()
        })
      }

      localScreenStreamRef.current = stream
      setLocalScreenStream(stream)
      trackVoicePresence({ isSharingScreen: true })
      sendSignal({ targetId: 'all', type: 'screen_share_start' })

      peerConnectionsRef.current.forEach((pc) => {
        syncLocalTracks(pc)
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        // addEventListener para não sobrescrever handlers definidos por quem capturou o stream
        videoTrack.addEventListener('ended', () => {
          if (localScreenStreamRef.current === stream) stopScreenShare()
        })
      }
    },
    [trackVoicePresence, stopScreenShare, syncLocalTracks, sendSignal]
  )

  /** Marca a transmissão assistida: libera o áudio da tela desse peer e publica o vídeo. */
  const setWatchedStreamer = useCallback(
    (streamerId: string | null) => {
      if (watchedStreamerRef.current === streamerId) return
      watchedStreamerRef.current = streamerId
      applyAudioMuting()
      if (streamerId) publishRemoteScreen(streamerId)
    },
    [applyAudioMuting, publishRemoteScreen]
  )

  // Solicitar transmissão de tela de um apresentador específico
  const requestScreenStream = useCallback(
    (streamerId: string) => {
      if (!streamerId) return
      watchedStreamerRef.current = streamerId
      applyAudioMuting()
      publishRemoteScreen(streamerId)
      // Pede ao apresentador para garantir a tela no sender (recupera estados inconsistentes)
      sendSignal({ targetId: streamerId, type: 'request_stream' })
    },
    [applyAudioMuting, publishRemoteScreen, sendSignal]
  )

  // Alterar filtro DSP em tempo real
  const changeNoiseFilter = useCallback(async (newFilter: string) => {
    setVoiceNoiseFilter(newFilter)
    localStorage.setItem('alura_voice_noise_filter', newFilter)

    if (localAudioStream) {
      if (voiceLiveFilterCleanupRef.current) {
        voiceLiveFilterCleanupRef.current()
        voiceLiveFilterCleanupRef.current = null
      }
      try {
        if (rawAudioStreamRef.current) {
          rawAudioStreamRef.current.getTracks().forEach((t) => t.stop())
        }
        const constraints = CleanvoiceService.getAudioConstraints(newFilter)
        const rawStream = await navigator.mediaDevices.getUserMedia({
          audio: constraints,
          video: false,
        })
        rawAudioStreamRef.current = rawStream

        let effectiveStream = rawStream
        if (newFilter === 'cleanvoice' || newFilter === 'krisp') {
          const { filteredStream, cleanup } = CleanvoiceService.applyFilterChain(rawStream, newFilter)
          effectiveStream = filteredStream
          voiceLiveFilterCleanupRef.current = cleanup
        }
        // Preserva o estado de mute ao trocar de filtro
        effectiveStream.getAudioTracks().forEach((t) => {
          t.enabled = !isLocalAudioMutedRef.current
        })
        setLocalAudioStream(effectiveStream)
      } catch (err) {
        console.warn('[useServerVoiceRoom] Erro ao trocar filtro:', err)
      }
    }
  }, [localAudioStream])

  return {
    connectedServerId,
    connectedServerName,
    connectedRoomId,
    connectedRoomName,
    viewingServerId,
    setViewingServerId,
    voiceParticipants,
    localAudioStream,
    localCameraStream,
    localScreenStream,
    remoteScreenStreams,
    isLocalAudioMuted,
    isDeafened,
    isLocalSpeaking,
    remoteSpeakingUsers,
    voiceNoiseFilter,
    setVoiceNoiseFilter,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleAudioMute,
    toggleDeafen,
    toggleCamera,
    startScreenShareWithStream,
    stopScreenShare,
    requestScreenStream,
    setWatchedStreamer,
    changeNoiseFilter,
  }
}
