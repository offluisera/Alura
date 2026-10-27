import { useRef, useEffect, useState } from 'react'
import {
  Mic, MicOff, Volume2, VolumeX, Video, VideoOff,
  Monitor, MonitorOff, Phone, PhoneOff, PhoneCall, Music2, Sparkles, Check, Minimize2, Maximize2, Play,
  Maximize, Minimize, Scaling, LogOut
} from 'lucide-react'
import type { UseWebRTCCallReturn, CallParticipant, NoiseFilterLevel } from '../../lib/hooks/useWebRTCCall'
import { useVoiceActivity } from '../../lib/hooks/useVoiceActivity'
import { CallSoundboardPanel } from './CallSoundboardPanel'
import { ScreenShareModal } from './ScreenShareModal'
import { SoundService } from '../../lib/services/SoundService'
import { useCall } from '../../contexts/CallContext'

// ── Ringtone via SoundService ────────────────────────────────────────────────
function useRingtone(active: boolean) {
  useEffect(() => {
    if (active) {
      const isSoundEnabled = () => {
        try {
          const saved = localStorage.getItem('alura_sound_toggles')
          if (saved) {
            const toggles = JSON.parse(saved)
            return toggles.incomingCall !== false
          }
        } catch {}
        return true
      }

      if (isSoundEnabled()) {
        SoundService.startRingtone()
      }
    } else {
      SoundService.stopRingtone()
    }

    return () => {
      SoundService.stopRingtone()
    }
  }, [active])
}

interface CallOverlayProps extends Pick<
  UseWebRTCCallReturn,
  | 'callState'
  | 'callType'
  | 'localStream'
  | 'remoteStream'
  | 'screenStream'
  | 'isMuted'
  | 'isDeafened'
  | 'isCameraOn'
  | 'isSharingScreen'
  | 'isRemoteSharingScreen'
  | 'callDuration'
  | 'remoteParticipant'
  | 'noiseFilter'
  | 'setNoiseFilter'
  | 'hangUp'
  | 'toggleMute'
  | 'toggleDeafen'
  | 'toggleCamera'
  | 'startScreenShareWithSource'
  | 'stopScreenShare'
  | 'streamViewers'
  | 'sendStreamViewerSignal'
> {
  myName?: string
  myAvatar?: string
  acceptCall?: () => void
  rejectCall?: () => void
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CallOverlay({
  callState,
  callType,
  localStream,
  remoteStream,
  screenStream,
  isMuted,
  isDeafened,
  isCameraOn,
  isSharingScreen,
  isRemoteSharingScreen,
  callDuration,
  remoteParticipant,
  myName = 'Você',
  myAvatar,
  noiseFilter = 'alura_crisp_smart',
  setNoiseFilter,
  hangUp,
  toggleMute,
  toggleDeafen,
  toggleCamera,
  startScreenShareWithSource,
  stopScreenShare,
  streamViewers = [],
  sendStreamViewerSignal,
  acceptCall,
  rejectCall,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const [showSoundboard, setShowSoundboard] = useState(false)
  const [showNoiseMenu, setShowNoiseMenu] = useState(false)
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false)
  const { isCallOverlayMinimized, setIsCallOverlayMinimized } = useCall()
  const isMinimized = isCallOverlayMinimized
  const setIsMinimized = setIsCallOverlayMinimized

  const isLocalSpeaking = useVoiceActivity(localStream, isMuted)
  const isRemoteSpeaking = useVoiceActivity(remoteStream, isDeafened)

  const [watchingStream, setWatchingStream] = useState<'local' | 'remote' | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>('contain')

  const toggleFullscreen = () => {
    const el = playerContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const isCalling = callState === 'calling'
  const isRinging = callState === 'ringing'
  const isActive = callState === 'active'
  useRingtone(isCalling || isRinging)

  // Quando recebe chamada (ringing), garante que a tela cheia ou card central esteja em foco
  useEffect(() => {
    if (isRinging) {
      setIsMinimized(false)
    }
  }, [isRinging])

  const hasRemoteVideo = !!(
    remoteStream &&
    remoteStream.getVideoTracks().length > 0 &&
    remoteStream.getVideoTracks().some((t) => t.readyState === 'live')
  )
  const isRemoteSharing = !!isRemoteSharingScreen && hasRemoteVideo

  // Reseta visualização se o stream correspondente for finalizado
  useEffect(() => {
    if (!isSharingScreen && watchingStream === 'local') {
      setWatchingStream(null)
    }
  }, [isSharingScreen, watchingStream])

  useEffect(() => {
    if (!isRemoteSharing && !hasRemoteVideo && watchingStream === 'remote') {
      // Transmissão remota encerrada: sai de tela cheia e remove do watchingStream
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      setWatchingStream(null)
    }
  }, [isRemoteSharing, hasRemoteVideo, watchingStream])

  // Sinaliza entrada/saída como espectador da transmissão remota
  useEffect(() => {
    if (watchingStream === 'remote' && isRemoteSharing && sendStreamViewerSignal) {
      sendStreamViewerSignal('join', { name: myName, avatar: myAvatar })
      return () => {
        sendStreamViewerSignal('leave', { name: myName, avatar: myAvatar })
      }
    }
  }, [watchingStream, isRemoteSharing, sendStreamViewerSignal, myName, myAvatar])

  // Sincroniza stream local de vídeo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream, isMinimized])

  // Sincroniza stream de compartilhamento de tela
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
      screenVideoRef.current.play().catch(() => {})
    }
  }, [screenStream, isSharingScreen, watchingStream, isMinimized])

  // Sincroniza stream remoto de vídeo e áudio
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.muted = true
        remoteVideoRef.current.play().catch(() => {})

        const vTrack = remoteStream.getVideoTracks()[0]
        if (vTrack) {
          vTrack.enabled = true
          vTrack.onunmute = () => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
              remoteVideoRef.current.muted = true
              remoteVideoRef.current.play().catch(() => {})
            }
          }
        }
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.play().catch(() => {})
      }
    }
  }, [remoteStream, watchingStream, hasRemoteVideo, isMinimized])

  // Silenciamento garantido da chamada recebida quando "Áudio" (Deafen) é ativado
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isDeafened
      remoteAudioRef.current.volume = isDeafened ? 0 : 1
    }
  }, [isDeafened])

  // Clique no botão de compartilhamento de tela
  const handleScreenShareClick = () => {
    if (isSharingScreen) {
      stopScreenShare()
    } else {
      setIsScreenModalOpen(true)
    }
  }

  // ── Modo Minimizado: Card Flutuante no Canto Inferior Esquerdo ─────────────
  // CAMADA DE ÁUDIO PERMANENTE — nunca desmonta, garante áudio contínuo ao minimizar
  const permanentAudioLayer = (
    <>
      <audio
        ref={remoteAudioRef}
        autoPlay
        muted={isDeafened}
        className="hidden"
      />
      {remoteStream && remoteStream.getAudioTracks().slice(1).map((track) => (
        <audio
          key={track.id}
          autoPlay
          muted={isDeafened}
          ref={(el) => {
            if (el && (!el.srcObject || (el.srcObject as MediaStream).getAudioTracks()[0]?.id !== track.id)) {
              el.srcObject = new MediaStream([track])
              el.play().catch(() => {})
            }
          }}
          className="hidden"
        />
      ))}
    </>
  )

  if (isMinimized && (isActive || isCalling)) {
    return (
      <>
        {permanentAudioLayer}
        <div className="fixed bottom-6 left-6 z-[9999] w-[320px] bg-alura-surface1/95 border border-alura-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-3.5 flex flex-col gap-3 text-alura-textPrimary select-none animate-in slide-in-from-bottom-6 duration-300">

        {/* Header do Card Flutuante */}
        <div className="flex items-center justify-between border-b border-alura-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-alura-textPrimary tracking-wide">
              {isActive ? `Em chamada • ${formatDuration(callDuration)}` : 'Chamando...'}
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="px-2 py-1 rounded-lg bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Maximizar chamada"
          >
            <Maximize2 size={13} />
            <span>Maximizar</span>
          </button>
        </div>

        {/* Participantes / Status */}
        <div className="flex items-center justify-between px-1">
          {/* Participante Remoto */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                isRemoteSpeaking
                  ? 'border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)] scale-105 ring-2 ring-emerald-400/40'
                  : 'border-alura-border bg-alura-surface2'
              }`}>
                {remoteParticipant?.avatar ? (
                  <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-alura-accent">
                    {(remoteParticipant?.name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              {isDeafened && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow">
                  <VolumeX size={9} />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-alura-textPrimary truncate">
                {remoteParticipant?.name || 'Usuário'}
              </span>
              <span className="text-[10px] text-alura-textMuted flex items-center gap-1">
                {isRemoteSharing ? (
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <Monitor size={10} /> Transmitindo
                  </span>
                ) : isRemoteSpeaking ? (
                  <span className="text-emerald-400 font-medium">Falando...</span>
                ) : (
                  'Conectado'
                )}
              </span>
            </div>
          </div>

          {/* Usuário Local */}
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
              isLocalSpeaking
                ? 'border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)] scale-105 ring-2 ring-emerald-400/40'
                : 'border-alura-border bg-alura-surface2'
            }`}>
              {myAvatar ? (
                <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-alura-accent">
                  {(myName || 'V')[0].toUpperCase()}
                </span>
              )}
            </div>
            {isMuted && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow">
                <MicOff size={9} />
              </div>
            )}
          </div>
        </div>

        {/* Botão de Assistir Transmissão (se alguém estiver compartilhando tela) */}
        {isRemoteSharing && (
          <button
            onClick={() => {
              setWatchingStream('remote')
              setIsMinimized(false)
            }}
            className="w-full py-2 px-3 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-alura-accent/20 active:scale-95"
          >
            <Play size={13} fill="currentColor" />
            <span>Assistir transmissão ao vivo</span>
          </button>
        )}

        {/* Controles Rápidos do Card */}
        <div className="flex items-center justify-between pt-1 border-t border-alura-border/60">
          <div className="flex items-center gap-1.5">
            {/* Mic */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary border border-alura-border'
              }`}
              title={isMuted ? 'Desmutar' : 'Mutar microfone'}
            >
              {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Áudio */}
            <button
              onClick={toggleDeafen}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDeafened
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary border border-alura-border'
              }`}
              title={isDeafened ? 'Reativar som' : 'Silenciar chamada'}
            >
              {isDeafened ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Câmera */}
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isCameraOn
                  ? 'bg-alura-accent/20 text-alura-accent border border-alura-accent/30'
                  : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary border border-alura-border'
              }`}
              title={isCameraOn ? 'Desligar câmera' : 'Ligar câmera'}
            >
              {isCameraOn ? <Video size={15} /> : <VideoOff size={15} />}
            </button>

            {/* Tela */}
            <button
              onClick={handleScreenShareClick}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSharingScreen
                  ? 'bg-alura-accent/20 text-alura-accent border border-alura-accent/30'
                  : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary border border-alura-border'
              }`}
              title={isSharingScreen ? 'Parar transmissão' : 'Transmitir tela'}
            >
              {isSharingScreen ? <MonitorOff size={15} /> : <Monitor size={15} />}
            </button>
          </div>

          {/* Encerrar */}
          <button
            onClick={hangUp}
            className="p-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white transition-all cursor-pointer shadow-lg shadow-red-500/20"
            title="Encerrar chamada"
          >
            <PhoneOff size={15} />
          </button>
        </div>

        {/* Modal de Escolha de Tela */}
        <ScreenShareModal
          isOpen={isScreenModalOpen}
          onClose={() => setIsScreenModalOpen(false)}
          onSelectSource={(sourceId, shareAudio) => {
            startScreenShareWithSource(sourceId, shareAudio)
          }}
          onStartShare={() => {
            startScreenShareWithSource(undefined, true)
          }}
        />
      </div>
      </>
    )
  }

  return (
    <div className="call-overlay fixed inset-0 z-[100] w-screen h-screen flex flex-col justify-between items-center bg-[#001408]/96 backdrop-blur-2xl overflow-y-auto overflow-x-hidden">
      <div className="call-overlay__bg" />

      {/* Áudio remoto permanente (nunca desmonta) */}
      {permanentAudioLayer}

      {/* Top Header Row: Navegar na Alura + Status/Ações de Stream */}
      <header className="w-full flex items-center justify-between z-30 shrink-0 h-10 px-2 sm:px-4 pointer-events-auto">
        {/* Esquerda: Botão Navegar na Alura */}
        <button
          onClick={() => setIsMinimized(true)}
          className="px-3.5 py-1.5 rounded-xl bg-alura-surface1/90 hover:bg-alura-surface2 border border-alura-border text-xs font-bold text-alura-textPrimary flex items-center gap-2 backdrop-blur-md shadow-lg transition-all cursor-pointer active:scale-95 group"
          title="Minimizar chamada para navegar livremente na plataforma"
        >
          <Minimize2 size={14} className="text-alura-accent group-hover:scale-110 transition-transform" />
          <span>Navegar na Alura</span>
        </button>

        {/* Centro: Info de Transmissão (quando ativa) */}
        {watchingStream === 'local' ? (
          <div className="px-3.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <Monitor size={14} className="text-alura-accent" />
            <span>Sua tela • {formatDuration(callDuration)}</span>
            {streamViewers.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold flex items-center gap-1" title={streamViewers.map(v => v.name).join(', ')}>
                👁️ {streamViewers.length}
              </span>
            )}
          </div>
        ) : watchingStream === 'remote' ? (
          <div className="px-3.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <Monitor size={14} className="text-alura-accent" />
            <span>Transmissão de {remoteParticipant?.name || 'Usuário'} • {formatDuration(callDuration)}</span>
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Direita: Ações do Header */}
        <div className="flex items-center gap-2">
          {watchingStream && (
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-xl bg-alura-surface1/95 hover:bg-alura-surface2 border border-alura-accent/50 hover:border-alura-accent text-alura-accent text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(var(--alura-accent-rgb),0.25)] backdrop-blur-md transition-all cursor-pointer active:scale-95"
              title={isFullscreen ? 'Restaurar janela' : 'Maximizar transmissão de tela em tela cheia'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? 'Restaurar' : 'Maximizar Transmissão'}</span>
            </button>
          )}

          {watchingStream === 'local' && (
            <button
              onClick={stopScreenShare}
              className="px-3 py-1.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white border border-red-500/40 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              title="Parar transmissão"
            >
              <MonitorOff size={13} />
              <span>Parar Transmissão</span>
            </button>
          )}

          {watchingStream === 'remote' && (
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {})
                }
                setWatchingStream(null)
              }}
              className="px-3 py-1.5 rounded-xl bg-alura-surface2/90 hover:bg-alura-surface3 text-alura-textSecondary hover:text-white border border-alura-border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              title="Voltar para a chamada"
            >
              <LogOut size={13} />
              <span>Sair da Transmissão</span>
            </button>
          )}

          {!watchingStream && <div className="w-24 sm:w-28" />}
        </div>
      </header>

      {/* Área Central: Tela Compartilhada (Local ou Remota) ou Modo Avatares */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center relative z-10 px-2 sm:px-4 py-1">
        {watchingStream === 'local' ? (
          <div
            ref={playerContainerRef}
            className={`relative w-full h-full max-w-full max-h-full flex items-center justify-center bg-black/95 overflow-hidden shadow-2xl transition-all ${
              isFullscreen
                ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none border-none'
                : 'rounded-2xl border border-alura-border'
            }`}
          >
            {screenStream ? (
              <video
                ref={(el) => {
                  (screenVideoRef as any).current = el
                  if (el && screenStream) {
                    if (el.srcObject !== screenStream) {
                      el.srcObject = screenStream
                    }
                    el.muted = true
                    el.play().catch(() => {})
                  }
                }}
                className={`w-full h-full max-h-full ${videoFit === 'cover' ? 'object-cover' : 'object-contain'} cursor-pointer`}
                autoPlay
                playsInline
                muted
                onDoubleClick={toggleFullscreen}
                onLoadedMetadata={(e) => {
                  const vid = e.currentTarget
                  vid.muted = true
                  vid.play().catch(() => {})
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-alura-textSecondary">
                <div className="w-8 h-8 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Carregando transmissão...</span>
              </div>
            )}

            {/* Opções no Canto Inferior Direito: Ajuste de Tamanho, Tela Cheia, Sair da Transmissão */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30 pointer-events-auto bg-black/85 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.85)] animate-in fade-in duration-200">
              {/* Ajuste de Tamanho */}
              <button
                onClick={() => setVideoFit((f) => (f === 'contain' ? 'cover' : 'contain'))}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title={videoFit === 'contain' ? 'Preencher tela (cortar bordas)' : 'Ajustar à tela (proporção original)'}
              >
                <Scaling size={13} className="text-alura-accent" />
                <span>{videoFit === 'contain' ? 'Ajustar' : 'Preencher'}</span>
              </button>

              {/* Maximizar Transmissão */}
              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-1 rounded-lg bg-alura-accent/15 hover:bg-alura-accent/25 text-alura-accent border border-alura-accent/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title={isFullscreen ? 'Restaurar janela' : 'Maximizar transmissão de tela'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isFullscreen ? 'Restaurar' : 'Maximizar Transmissão'}</span>
              </button>

              <div className="w-[1px] h-4 bg-white/20 my-auto" />

              {/* Sair da Transmissão (sem sair da chamada/chat) */}
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {})
                  }
                  setWatchingStream(null)
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sair da transmissão e voltar para os avatares"
              >
                <LogOut size={13} />
                <span>Sair da transmissão</span>
              </button>
            </div>
          </div>
        ) : watchingStream === 'remote' ? (
          <div
            ref={playerContainerRef}
            className={`relative w-full h-full max-w-full max-h-full flex items-center justify-center bg-black/95 overflow-hidden shadow-2xl transition-all ${
              isFullscreen
                ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none border-none'
                : 'rounded-2xl border border-alura-border'
            }`}
          >
            {/* O elemento de vídeo com muted, autoPlay e playsInline garantidos */}
            <video
              ref={(el) => {
                (remoteVideoRef as any).current = el
                if (el && remoteStream) {
                  if (el.srcObject !== remoteStream) {
                    el.srcObject = remoteStream
                  }
                  el.muted = true
                  el.play().catch(() => {})
                }
              }}
              className={`w-full h-full max-h-full ${videoFit === 'cover' ? 'object-cover' : 'object-contain'} cursor-pointer ${
                hasRemoteVideo ? '' : 'hidden'
              }`}
              autoPlay
              playsInline
              muted
              onDoubleClick={toggleFullscreen}
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget
                vid.muted = true
                vid.play().catch(() => {})
              }}
            />
            {!hasRemoteVideo && (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-alura-textSecondary">
                <div className="w-8 h-8 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Conectando à transmissão de {remoteParticipant?.name || 'Usuário'}...</span>
              </div>
            )}

            {/* Opções no Canto Inferior Direito: Ajuste de Tamanho, Tela Cheia, Sair da Transmissão */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30 pointer-events-auto bg-black/85 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.85)] animate-in fade-in duration-200">
              {/* Ajuste de Tamanho: Contain vs Cover */}
              <button
                onClick={() => setVideoFit((f) => (f === 'contain' ? 'cover' : 'contain'))}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title={videoFit === 'contain' ? 'Preencher tela (cortar bordas)' : 'Ajustar à tela (proporção original)'}
              >
                <Scaling size={13} className="text-alura-accent" />
                <span>{videoFit === 'contain' ? 'Ajustar' : 'Preencher'}</span>
              </button>

              {/* Maximizar Transmissão */}
              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-1 rounded-lg bg-alura-accent/15 hover:bg-alura-accent/25 text-alura-accent border border-alura-accent/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title={isFullscreen ? 'Restaurar janela' : 'Maximizar transmissão de tela'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isFullscreen ? 'Restaurar' : 'Maximizar Transmissão'}</span>
              </button>

              <div className="w-[1px] h-4 bg-white/20 my-auto" />

              {/* Sair da Transmissão (sem sair do chat/chamada) */}
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {})
                  }
                  setWatchingStream(null)
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sair da transmissão e voltar para os avatares (continua na chamada)"
              >
                <LogOut size={13} />
                <span>Sair da transmissão</span>
              </button>
            </div>
          </div>
        ) : isRinging ? (
          /* ── ESTÁGIO DEDICADO: CHAMADA RECEBIDA (ANEXO 2 REFINADO) ── */
          <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-300 max-w-md w-full">
            <div className="w-full bg-alura-surface1/95 border border-alura-border rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
              {/* Luz ambiente esmeralda de fundo */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-alura-accent/10 rounded-full blur-3xl pointer-events-none" />

              {/* Tag / Badge no topo */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-alura-surface2 border border-alura-border text-[11px] font-bold text-alura-accent mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alura-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alura-accent" />
                </span>
                <span>CHAMADA {callType === 'video' ? 'DE VÍDEO' : 'DE VOZ'} RECEBIDA</span>
              </div>

              {/* Avatar do chamador com halo suave */}
              <div className="relative mb-5">
                <div className="relative w-28 h-28 rounded-full p-1 border-2 border-alura-accent/40 shadow-[0_0_24px_rgba(57,255,136,0.2)] flex items-center justify-center bg-alura-surface2">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-alura-surface3">
                    {remoteParticipant?.avatar ? (
                      <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-alura-accent">
                        {(remoteParticipant?.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nome e status */}
              <h2 className="text-xl sm:text-2xl font-black text-alura-textPrimary tracking-tight">
                @{remoteParticipant?.name || 'Usuário'}
              </h2>
              <p className="text-xs text-alura-textSecondary mt-1 mb-8">
                Chamada de voz privada na Alura
              </p>

              {/* Ações Centrais Táteis: Recusar / Atender */}
              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  onClick={rejectCall || hangUp}
                  className="flex-1 h-12 rounded-2xl bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-300 hover:text-white border border-red-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  title="Recusar chamada"
                >
                  <PhoneOff size={16} />
                  <span>Recusar</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 h-12 rounded-2xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(57,255,136,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Atender chamada"
                >
                  <Phone size={16} />
                  <span>Atender</span>
                </button>
              </div>
            </div>
          </div>
        ) : isCalling ? (
          /* ── ESTÁGIO DEDICADO: LIGANDO / CHAMANDO (ANEXO 2 REFINADO) ── */
          <div className="flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-300 max-w-md w-full">
            <div className="w-full bg-alura-surface1/95 border border-alura-border rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
              {/* Luz ambiente de fundo */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-alura-accent/10 rounded-full blur-3xl pointer-events-none" />

              {/* Tag / Badge no topo */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-alura-surface2 border border-alura-border text-[11px] font-bold text-alura-accent mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alura-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alura-accent" />
                </span>
                <span>LIGANDO...</span>
              </div>

              {/* Avatar do destinatário */}
              <div className="relative mb-5">
                <div className="relative w-28 h-28 rounded-full p-1 border-2 border-alura-border shadow-[0_0_24px_rgba(0,0,0,0.5)] flex items-center justify-center bg-alura-surface2">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-alura-surface3">
                    {remoteParticipant?.avatar ? (
                      <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-alura-accent">
                        {(remoteParticipant?.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nome e subtítulo */}
              <h2 className="text-xl sm:text-2xl font-black text-alura-textPrimary tracking-tight">
                @{remoteParticipant?.name || 'Usuário'}
              </h2>
              <p className="text-xs text-alura-textSecondary mt-1 mb-8 animate-pulse">
                Aguardando resposta do usuário...
              </p>

              {/* Botão de Cancelar */}
              <div className="flex items-center justify-center w-full">
                <button
                  onClick={hangUp}
                  className="w-full h-11 rounded-2xl bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-300 hover:text-white border border-red-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Cancelar chamada"
                >
                  <PhoneOff size={15} />
                  <span>Cancelar Chamada</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── ESTÁGIO: CHAMADA CONECTADA / ATIVA (ANEXO 1 REFINADO) ── */
          <div className="call-overlay__avatars flex items-center justify-center gap-10 sm:gap-16 w-full max-w-4xl px-4">
            {/* Participante Remoto */}
            {isRemoteSharing ? (
              <div className="w-[320px] sm:w-[380px] h-[210px] sm:h-[240px] rounded-2xl border border-alura-border bg-alura-surface1 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center p-5 animate-in zoom-in-95 duration-200 group">
                {/* Badge Ao Vivo */}
                <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_14px_rgba(239,68,68,0.7)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>Ao Vivo</span>
                </div>

                {/* Indicador de Transmissão */}
                <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-alura-surface2 border border-alura-border text-alura-textSecondary text-[11px] font-medium flex items-center gap-1.5">
                  <Monitor size={12} className="text-alura-accent" />
                  <span>Transmissão</span>
                </div>

                {/* Conteúdo Central */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-full bg-alura-surface2 border-2 border-alura-accent/30 overflow-hidden flex items-center justify-center shadow-lg">
                    {remoteParticipant?.avatar ? (
                      <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-alura-accent">
                        {(remoteParticipant?.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-alura-textPrimary">{remoteParticipant?.name || 'Usuário'}</div>
                    <div className="text-xs text-alura-textMuted">está transmitindo a tela</div>
                  </div>
                  <button
                    onClick={() => setWatchingStream('remote')}
                    className="mt-1 px-5 py-2.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-alura-accent/25 active:scale-95 transition-all cursor-pointer group/btn"
                  >
                    <Play size={14} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
                    <span>Assistir transmissão</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="call-overlay__participant call-overlay__participant--remote relative flex flex-col items-center">
                <div className="relative">
                  <div className={`call-overlay__avatar-ring ${
                    isRemoteSpeaking ? 'call-overlay__avatar-ring--speaking' : 'call-overlay__avatar-ring--active'
                  }`}>
                    {remoteParticipant?.avatar ? (
                      <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="call-overlay__avatar-img" />
                    ) : (
                      <span className="call-overlay__avatar-initials">
                        {(remoteParticipant?.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <span className="call-overlay__participant-name mt-2 text-sm font-bold text-alura-textPrimary">
                  {remoteParticipant?.name || 'Conectando...'}
                </span>

                <div className="flex flex-col items-center gap-1 mt-1.5 min-h-[22px]">
                  {isDeafened && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm animate-in fade-in duration-150">
                      <VolumeX size={11} /> Chamada Silenciada
                    </span>
                  )}
                  {isRemoteSpeaking && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm animate-in fade-in duration-150">
                      Falando...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Usuário Local */}
            {isSharingScreen ? (
              <div className="w-[320px] sm:w-[380px] h-[210px] sm:h-[240px] rounded-2xl border border-alura-border bg-alura-surface1 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center p-5 animate-in zoom-in-95 duration-200 group">
                {/* Badge Ao Vivo */}
                <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_14px_rgba(239,68,68,0.7)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>Ao Vivo</span>
                </div>

                {/* Indicador de Transmissão */}
                <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-alura-surface2 border border-alura-border text-alura-textSecondary text-[11px] font-medium flex items-center gap-1.5">
                  <Monitor size={12} className="text-alura-accent" />
                  <span>Sua tela</span>
                </div>

                {/* Conteúdo Central */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-full bg-alura-surface2 border-2 border-alura-accent/30 overflow-hidden flex items-center justify-center shadow-lg">
                    {myAvatar ? (
                      <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-alura-accent">
                        {(myName || 'V')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-alura-textPrimary">{myName}</div>
                    <div className="text-xs text-alura-textMuted">Você está transmitindo tela</div>
                  </div>
                  <button
                    onClick={() => setWatchingStream('local')}
                    className="mt-1 px-5 py-2.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-alura-accent/25 active:scale-95 transition-all cursor-pointer group/btn"
                  >
                    <Play size={14} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
                    <span>Assistir transmissão</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="call-overlay__participant call-overlay__participant--local relative flex flex-col items-center">
                <div className="relative">
                  <div className={`call-overlay__avatar-ring ${
                    isLocalSpeaking ? 'call-overlay__avatar-ring--speaking' : 'call-overlay__avatar-ring--active'
                  }`}>
                    {myAvatar ? (
                      <img src={myAvatar} alt={myName} className="call-overlay__avatar-img" />
                    ) : (
                      <span className="call-overlay__avatar-initials">{(myName || 'V')[0].toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <span className="call-overlay__participant-name mt-2 text-sm font-bold text-alura-textPrimary">
                  {myName}
                </span>

                {/* Status abaixo do usuário */}
                <div className="flex flex-col items-center gap-1 mt-1.5 min-h-[22px]">
                  {isMuted && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                      <MicOff size={11} /> Microfone mudo
                    </span>
                  )}
                  {isDeafened && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                      <VolumeX size={11} /> Áudio silenciado
                    </span>
                  )}
                  {isLocalSpeaking && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm animate-in fade-in duration-150">
                      Falando...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pip local de câmera — apenas se câmera estiver ligada */}
      {isCameraOn && (
        <div className="call-overlay__local-pip">
          <video
            ref={localVideoRef}
            className="call-overlay__local-video"
            autoPlay
            playsInline
            muted
          />
          {isMuted && (
            <div className="call-overlay__pip-badge"><MicOff size={10} /></div>
          )}
        </div>
      )}

      {/* Footer: Status (apenas quando não assistindo transmissão) e Controles */}
      {/* Footer: Status e Controles (apenas quando não assistindo transmissão) */}
      {!watchingStream && !isRinging && (
        <footer className="shrink-0 flex flex-col items-center gap-1.5 z-20 pointer-events-auto">
          {/* Status / duração no modo avatares */}
          <div className="call-overlay__status">
            {isCalling && (
              <span className="call-overlay__status-label call-overlay__status-label--calling">
                Chamando {remoteParticipant?.name}...
              </span>
            )}
            {isActive && (
              <span className="call-overlay__status-label">
                {formatDuration(callDuration)}
              </span>
            )}
          </div>

      {/* Popover flutuante para ajuste do Filtro de Ruído — SEGUINDO TEMA DO USUÁRIO */}
      {showNoiseMenu && (
        <div className="absolute bottom-[92px] left-1/2 -translate-x-1/2 z-[60] bg-alura-surface1 border border-alura-border shadow-[0_16px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl rounded-2xl p-3 w-[270px] animate-in slide-in-from-bottom-3 duration-200">
          <div className="text-[11px] font-bold text-alura-textSecondary uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <Sparkles size={12} className="text-alura-accent" />
            Filtro de Ruído (Voz)
          </div>

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
            {[
              {
                id: 'alura_crisp_smart',
                legacyId: 'krisp',
                label: 'Alura Crisp Inteligente',
                desc: 'Equilíbrio contra teclado mecânico e ventilador',
                badge: 'Recomendado',
              },
              {
                id: 'alura_crisp_studio',
                legacyId: null,
                label: 'Alura Crisp Estúdio',
                desc: 'Resposta aberta até 18kHz para podcasts e música',
                badge: 'Fidelidade',
              },
              {
                id: 'alura_crisp_aggressive',
                legacyId: 'cleanvoice',
                label: 'Alura Crisp Agressivo',
                desc: 'Isolamento profundo para ambientes extremos',
                badge: 'Extremo',
              },
              {
                id: 'standard',
                legacyId: null,
                label: 'Padrão WebRTC',
                desc: 'Supressão suave acústica do navegador',
              },
              {
                id: 'passthrough',
                legacyId: null,
                label: 'Pass-Through',
                desc: 'Direto para RTX Voice, Elgato ou Sonar',
              },
              {
                id: 'off',
                legacyId: null,
                label: 'Desativado',
                desc: 'Áudio analógico puro sem filtros',
              },
            ].map((opt) => {
              const isSelected = noiseFilter === opt.id || (opt.legacyId && noiseFilter === opt.legacyId)
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setNoiseFilter?.(opt.id as any)
                    setShowNoiseMenu(false)
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-alura-surface2 border border-alura-border text-alura-textPrimary'
                      : 'hover:bg-alura-surface2/60 text-alura-textSecondary hover:text-alura-textPrimary'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-alura-textPrimary">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[9px] bg-alura-accent/15 text-alura-accent font-bold px-1.5 py-0.2 rounded-full border border-alura-accent/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-alura-textMuted leading-tight">{opt.desc}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-alura-accent shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="call-overlay__controls">
        {/* Microfone */}
            <button
              className={`call-ctrl ${isMuted ? 'call-ctrl--active' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Ativar microfone' : 'Silenciar microfone (Mudo)'}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              <span className="call-ctrl__label">{isMuted ? 'Mudo' : 'Mic'}</span>
            </button>

            {/* Áudio (Silenciar chamada / Deafen) */}
            <button
              className={`call-ctrl ${isDeafened ? 'call-ctrl--active' : ''}`}
              onClick={toggleDeafen}
              title={isDeafened ? 'Reativar áudio da chamada' : 'Silenciar áudio da chamada'}
            >
              {isDeafened ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="call-ctrl__label">{isDeafened ? 'Silenciado' : 'Áudio'}</span>
            </button>

            {/* Filtro de Ruído */}
            <button
              className={`call-ctrl ${showNoiseMenu ? 'call-ctrl--sb-on' : ''}`}
              onClick={() => setShowNoiseMenu((v) => !v)}
              title="Ajustar Filtro de Ruído"
            >
              <Sparkles size={18} className={noiseFilter?.includes('crisp') || noiseFilter === 'cleanvoice' || noiseFilter === 'krisp' ? 'text-alura-accent' : ''} />
              <span className="call-ctrl__label">
                {noiseFilter?.includes('crisp') || noiseFilter === 'krisp' || noiseFilter === 'cleanvoice' ? 'Alura Crisp' : noiseFilter === 'standard' ? 'Padrão' : noiseFilter === 'off' ? 'Desativado' : 'Ruído'}
              </span>
            </button>

            {/* Câmera */}
            <button
              className={`call-ctrl ${isCameraOn ? 'call-ctrl--cam-on' : ''}`}
              onClick={toggleCamera}
              title={isCameraOn ? 'Desligar câmera' : 'Ligar câmera'}
            >
              {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
              <span className="call-ctrl__label">Câmera</span>
            </button>

            {/* Tela */}
            <button
              className={`call-ctrl ${isSharingScreen ? 'call-ctrl--screen-on' : ''}`}
              onClick={handleScreenShareClick}
              title={isSharingScreen ? 'Parar transmissão' : 'Transmitir tela ou aplicativo'}
            >
              {isSharingScreen ? <MonitorOff size={18} /> : <Monitor size={18} />}
              <span className="call-ctrl__label">Tela</span>
            </button>

            {/* Sons / Soundboard */}
            <button
              className={`call-ctrl ${showSoundboard ? 'call-ctrl--sb-on' : ''}`}
              onClick={() => {
                setShowSoundboard((s) => !s)
                setShowNoiseMenu(false)
              }}
              title="Efeitos & Emojis do Soundboard"
            >
              <Music2 size={18} />
              <span className="call-ctrl__label">Sons</span>
            </button>

            {/* Minimizar / Navegar na Alura */}
            <button
              className="call-ctrl"
              onClick={() => setIsMinimized(true)}
              title="Minimizar chamada para navegar na plataforma"
            >
              <Minimize2 size={18} />
              <span className="call-ctrl__label">Minimizar</span>
            </button>

            <div className="call-ctrl-divider" />

            {/* Encerrar */}
            <button
              className="call-ctrl call-ctrl--hangup"
              onClick={hangUp}
              title="Encerrar chamada"
            >
              <PhoneOff size={18} />
              <span className="call-ctrl__label">Encerrar</span>
            </button>
          </div>
        </footer>
      )}

      {/* Painel soundboard com emojis */}
      {showSoundboard && (
        <CallSoundboardPanel
          localStream={localStream}
          onClose={() => setShowSoundboard(false)}
        />
      )}

      {/* Modal de Escolha de Tela / Janela com Áudio */}
      <ScreenShareModal
        isOpen={isScreenModalOpen}
        onClose={() => setIsScreenModalOpen(false)}
        onSelectSource={(sourceId, shareAudio) => {
          startScreenShareWithSource(sourceId, shareAudio)
        }}
        onStartShare={() => {
          startScreenShareWithSource(undefined, true)
        }}
      />
    </div>
  )
}
