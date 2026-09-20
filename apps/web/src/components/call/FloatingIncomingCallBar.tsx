import React from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import { useCall } from '../../contexts/CallContext'

export function FloatingIncomingCallBar() {
  const {
    callState,
    callType,
    callerProfile,
    isDnd,
    acceptIncomingCall,
    rejectIncomingCall,
  } = useCall()

  // Exibe a barra apenas quando há chamada recebida (ringing) E o usuário estiver em DND (Não Perturbe)
  if (callState !== 'ringing' || !isDnd || !callerProfile) {
    return null
  }

  const callerName = callerProfile.name || 'Usuário'
  const callerAvatar = callerProfile.avatar
  const isVideo = callType === 'video'

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-between gap-6 px-6 py-3.5 rounded-2xl bg-alura-surface1/95 border border-alura-border shadow-[0_16px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in slide-in-from-bottom-6 duration-300 max-w-[90vw] w-[600px]">
      {/* Lado Esquerdo: Avatar e Informações */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-alura-accent shadow-sm flex items-center justify-center bg-alura-surface2">
            {callerAvatar ? (
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-alura-textPrimary font-bold text-sm">
                {callerName[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          {/* Indicador de status chamando pulsante */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-alura-accent border-2 border-alura-surface1 animate-pulse" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-alura-textPrimary truncate">
              @{callerName}
            </span>
            <span className="text-[11px] font-medium text-alura-textSecondary hidden sm:inline">
              está te ligando
            </span>
          </div>
          <span className="text-xs text-alura-accent truncate font-medium">
            Chamada de {isVideo ? 'vídeo' : 'voz'} • Modo Não Perturbe
          </span>
        </div>
      </div>

      {/* Lado Direito: Ações Atender e Recusar */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={rejectIncomingCall}
          className="flex items-center gap-2 text-xs font-semibold text-alura-danger hover:text-white px-3.5 py-2 rounded-xl bg-alura-danger/10 hover:bg-alura-danger border border-alura-danger/30 transition-all cursor-pointer shadow-sm"
          title="Recusar chamada"
        >
          <PhoneOff size={15} />
          <span className="hidden sm:inline">Recusar</span>
        </button>

        <button
          onClick={acceptIncomingCall}
          className="flex items-center gap-2 bg-alura-accent text-white font-bold text-xs h-9 px-5 rounded-xl hover:bg-alura-accentHover transition-all cursor-pointer border border-alura-accent/40 shadow-[0_0_15px_rgba(var(--alura-accent-rgb),0.4)]"
          title="Atender chamada"
        >
          <Phone size={15} />
          <span>Atender</span>
        </button>
      </div>
    </div>
  )
}
