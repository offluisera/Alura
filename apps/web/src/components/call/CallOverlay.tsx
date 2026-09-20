import { useRef, useEffect, useState } from 'react'
import {
  Mic, MicOff, Volume2, VolumeX, Video, VideoOff,
  Monitor, MonitorOff, Phone, PhoneOff, Music2, Sparkles, Check, Minimize2, Play
} from 'lucide-react'
import type { UseWebRTCCallReturn, CallParticipant, NoiseFilterLevel } from '../../lib/hooks/useWebRTCCall'
import { CallSoundboardPanel } from './CallSoundboardPanel'
import { ScreenShareModal } from './ScreenShareModal'
import { SoundService } from '../../lib/services/SoundService'

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
  | 'hangUp'
  | 'toggleMute'
  | 'toggleDeafen'
  | 'toggleCamera'
  | 'startScreenShareWithSource'
  | 'stopScreenShare'
> {
  remoteParticipant: CallParticipant | null
  myName: string
  myAvatar?: string
  noiseFilter?: NoiseFilterLevel
  setNoiseFilter?: (level: NoiseFilterLevel) => Promise<void>
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
  myName,
  myAvatar,
  noiseFilter = 'krisp',
  setNoiseFilter,
  hangUp,
  toggleMute,
  toggleDeafen,
  toggleCamera,
  startScreenShareWithSource,
  stopScreenShare,
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

  const [watchingStream, setWatchingStream] = useState<'local' | 'remote' | null>(null)

  const isCalling = callState === 'calling'
  const isRinging = callState === 'ringing'
  const isActive = callState === 'active'
  useRingtone(isCalling || isRinging)

  const hasRemoteVideo = !!(remoteStream && remoteStream.getVideoTracks().length > 0)
  const isRemoteSharing = !!(isRemoteSharingScreen || (hasRemoteVideo && callType === 'audio'))

  // Reseta visualização se o stream correspondente for finalizado
  useEffect(() => {
    if (!isSharingScreen && watchingStream === 'local') {
      setWatchingStream(null)
    }
  }, [isSharingScreen, watchingStream])

  useEffect(() => {
    if (!isRemoteSharing && !hasRemoteVideo && watchingStream === 'remote') {
      setWatchingStream(null)
    }
  }, [isRemoteSharing, hasRemoteVideo, watchingStream])

  // Sincroniza stream local de vídeo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Sincroniza stream de compartilhamento de tela
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
      screenVideoRef.current.play().catch(() => {})
    }
  }, [screenStream, isSharingScreen, watchingStream])

  // Sincroniza stream remoto de vídeo e áudio
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.muted = true
        remoteVideoRef.current.play().catch(() => {})
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.play().catch(() => {})
      }
    }
  }, [remoteStream, watchingStream, hasRemoteVideo])

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

  return (
    <div className="call-overlay">
      <div className="call-overlay__bg" />

      {/* Áudio remoto com controle estrito de mudo */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        muted={isDeafened}
        className="call-overlay__audio"
      />

      {/* Área Central: Tela Compartilhada (Local ou Remota) ou Modo Avatares */}
      {watchingStream === 'local' ? (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="relative max-w-full max-h-[78vh] w-full flex items-center justify-center bg-black/90 rounded-2xl border border-alura-border overflow-hidden shadow-2xl">
            {screenStream ? (
              <video
                ref={screenVideoRef}
                className="w-full h-full max-h-[78vh] object-contain"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-alura-textSecondary">
                <div className="w-8 h-8 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Carregando transmissão...</span>
              </div>
            )}
            {/* Barra superior de controles da transmissão */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-2.5 shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <Monitor size={15} className="text-alura-accent" />
                <span>Você está compartilhando sua tela</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWatchingStream(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-alura-surface1/90 hover:bg-alura-surface2 border border-alura-border text-xs font-bold text-alura-textPrimary flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                  title="Minimizar para avatares"
                >
                  <Minimize2 size={14} />
                  <span>Minimizar</span>
                </button>
                <button
                  onClick={stopScreenShare}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white border border-red-500/40 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                  title="Parar transmissão"
                >
                  <MonitorOff size={14} />
                  <span>Parar Transmissão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : watchingStream === 'remote' ? (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="relative max-w-full max-h-[78vh] w-full flex items-center justify-center bg-black/90 rounded-2xl border border-alura-border overflow-hidden shadow-2xl">
            {hasRemoteVideo ? (
              <video
                ref={remoteVideoRef}
                className="w-full h-full max-h-[78vh] object-contain"
                autoPlay
                playsInline
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-alura-textSecondary">
                <div className="w-8 h-8 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Conectando à transmissão de {remoteParticipant?.name || 'Usuário'}...</span>
              </div>
            )}
            {/* Barra superior de controles da transmissão */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-2.5 shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <Monitor size={15} className="text-alura-accent" />
                <span>Transmissão de {remoteParticipant?.name || 'Participante'}</span>
              </div>
              <button
                onClick={() => setWatchingStream(null)}
                className="px-3.5 py-1.5 rounded-xl bg-alura-surface1/90 hover:bg-alura-surface2 border border-alura-border text-xs font-bold text-alura-textPrimary flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title="Minimizar para avatares"
              >
                <Minimize2 size={14} />
                <span>Minimizar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Avatares — modo padrão ou minimizado */
        <div className="call-overlay__avatars">
          {/* Participante remoto: se estiver compartilhando tela, exibe retângulo arredondado com o botão no lugar do perfil */}
          {isRemoteSharing ? (
            <div className="w-[320px] sm:w-[380px] h-[200px] sm:h-[230px] rounded-2xl border border-alura-border bg-alura-surface1 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center p-5 animate-in zoom-in-95 duration-200 group">
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
            <div className="call-overlay__participant call-overlay__participant--remote relative">
              <div className="relative">
                <div className={`call-overlay__avatar-ring ${isActive ? 'call-overlay__avatar-ring--active' : ''}`}>
                  {remoteParticipant?.avatar ? (
                    <img src={remoteParticipant.avatar} alt={remoteParticipant.name} className="call-overlay__avatar-img" />
                  ) : (
                    <span className="call-overlay__avatar-initials">
                      {(remoteParticipant?.name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <span className="call-overlay__participant-name">
                {remoteParticipant?.name || 'Conectando...'}
              </span>

              <div className="flex flex-col items-center gap-1 mt-1.5 min-h-[22px]">
                {isDeafened && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm animate-in fade-in duration-150">
                    <VolumeX size={11} /> Chamada Silenciada
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Usuário local: se estiver compartilhando tela, exibe retângulo arredondado com o botão no lugar do perfil */}
          {isSharingScreen ? (
            <div className="w-[320px] sm:w-[380px] h-[200px] sm:h-[230px] rounded-2xl border border-alura-border bg-alura-surface1 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center p-5 animate-in zoom-in-95 duration-200 group">
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
            <div className="call-overlay__participant call-overlay__participant--local relative">
              <div className="relative">
                <div className={`call-overlay__avatar-ring ${!isMuted ? 'call-overlay__avatar-ring--speaking' : ''}`}>
                  {myAvatar ? (
                    <img src={myAvatar} alt={myName} className="call-overlay__avatar-img" />
                  ) : (
                    <span className="call-overlay__avatar-initials">{(myName || 'V')[0].toUpperCase()}</span>
                  )}
                </div>
              </div>

              <span className="call-overlay__participant-name">
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
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Status / duração */}
      <div className="call-overlay__status">
        {isCalling && (
          <span className="call-overlay__status-label call-overlay__status-label--calling">
            Chamando {remoteParticipant?.name}...
          </span>
        )}
        {isRinging && (
          <span className="call-overlay__status-label call-overlay__status-label--calling animate-pulse">
            Chamada recebida de {remoteParticipant?.name || 'Usuário'}...
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

          <div className="flex flex-col gap-1">
            {[
              {
                id: 'cleanvoice',
                label: 'Cleanvoice AI',
                desc: 'Supressão avançada de ruídos e estalos',
                badge: 'Ativo',
              },
              {
                id: 'krisp',
                label: 'Krisp (IA Alura)',
                desc: 'Cancelamento inteligente padrão',
              },
              {
                id: 'standard',
                label: 'Padrão',
                desc: 'Supressão básica de eco e ruído',
              },
              {
                id: 'off',
                label: 'Desativado',
                desc: 'Áudio puro sem filtros',
              },
            ].map((opt) => {
              const isSelected = noiseFilter === opt.id
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
        {isRinging ? (
          <>
            <button
              className="call-ctrl call-ctrl--accept"
              onClick={acceptCall}
              title="Atender chamada"
            >
              <Phone size={20} />
              <span className="call-ctrl__label">Atender</span>
            </button>
            <button
              className="call-ctrl call-ctrl--hangup"
              onClick={rejectCall || hangUp}
              title="Recusar chamada"
            >
              <PhoneOff size={20} />
              <span className="call-ctrl__label">Recusar</span>
            </button>
          </>
        ) : (
          <>
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
              <Sparkles size={18} className={noiseFilter === 'cleanvoice' || noiseFilter === 'krisp' ? 'text-alura-accent' : ''} />
              <span className="call-ctrl__label">
                {noiseFilter === 'cleanvoice' ? 'Cleanvoice' : noiseFilter === 'krisp' ? 'Krisp' : noiseFilter === 'standard' ? 'Padrão' : 'Ruído'}
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
          </>
        )}
      </div>

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
      />
    </div>
  )
}
