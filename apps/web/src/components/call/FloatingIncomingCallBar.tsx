import React from 'react'
import { Phone, PhoneOff, Video, Mic } from 'lucide-react'
import { useCall } from '../../contexts/CallContext'

export function FloatingIncomingCallBar() {
  const {
    callState,
    callType,
    callerProfile,
    pendingSignal,
    isDnd,
    acceptIncomingCall,
    rejectIncomingCall,
    isCallOverlayMinimized,
  } = useCall()

  // O alerta flutuante de topo SÓ aparece quando a chamada está tocando E o overlay principal estiver minimizado
  // Isso evita duplicar botões na tela quando o usuário já está com a chamada em foco.
  if (callState !== 'ringing' || !isCallOverlayMinimized) {
    return null
  }

  const callerName = callerProfile?.name || (pendingSignal?.payload?.callerName as string) || 'Usuário'
  const callerAvatar = callerProfile?.avatar || (pendingSignal?.payload?.callerAvatar as string) || undefined
  const isVideo = callType === 'video' || pendingSignal?.payload?.callType === 'video'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center justify-between gap-4 sm:gap-6 px-5 sm:px-6 py-3.5 rounded-2xl bg-alura-surface1/95 border-2 border-alura-accent shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(var(--alura-accent-rgb),0.35)] backdrop-blur-2xl animate-in slide-in-from-top-6 duration-300 max-w-[94vw] w-[560px] select-none"
    >
      {/* Lado Esquerdo: Avatar Pulsante e Informações */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          {/* Ondas pulsantes de chamada */}
          <span className="absolute -inset-1 rounded-full bg-alura-accent opacity-40 animate-ping" />
          <span className="absolute -inset-2 rounded-full bg-alura-accent/20 animate-pulse" />

          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-alura-accent shadow-md flex items-center justify-center bg-alura-surface2">
            {callerAvatar ? (
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-alura-accent font-extrabold text-base">
                {callerName[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          {/* Ponto indicador de chamada recebida */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-alura-accent border-2 border-alura-surface1 flex items-center justify-center text-[#001609] animate-pulse">
            {isVideo ? <Video size={9} /> : <Phone size={9} />}
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-alura-textPrimary truncate max-w-[160px] sm:max-w-[220px]">
              @{callerName}
            </span>
            <span className="text-[11px] font-medium text-alura-textSecondary hidden sm:inline shrink-0">
              está te chamando
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap sm:flex-nowrap">
            <span className="text-xs text-alura-accent font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              {isVideo ? <Video size={13} /> : <Mic size={13} />}
              Chamada de {isVideo ? 'vídeo' : 'voz'} recebida
            </span>

            {isDnd && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 shrink-0">
                Não Perturbe
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Atender e Recusar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          onClick={rejectIncomingCall}
          className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-white px-3.5 sm:px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500 border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Recusar chamada"
        >
          <PhoneOff size={16} />
          <span className="hidden sm:inline">Recusar</span>
        </button>

        <button
          onClick={acceptIncomingCall}
          className="flex items-center gap-2 bg-alura-accent hover:bg-alura-accentBright text-alura-surface0 font-extrabold text-xs sm:text-sm h-10 px-5 sm:px-6 rounded-xl transition-all cursor-pointer border border-alura-accent/50 shadow-[0_0_20px_rgba(var(--alura-accent-rgb),0.55)] hover:scale-105 active:scale-95 animate-pulse"
          title="Atender chamada"
        >
          <Phone size={16} />
          <span>Atender</span>
        </button>
      </div>
    </div>
  )
}
