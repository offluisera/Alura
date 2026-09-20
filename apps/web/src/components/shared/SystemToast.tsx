import { useEffect } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"

export interface SystemToastData {
  id: string
  type: "success" | "error" | "warning" | "info"
  title?: string
  message: string
  duration?: number
}

interface SystemToastProps {
  toast: SystemToastData
  onClose: (id: string) => void
  isClosing: boolean
}

export function SystemToast({ toast, onClose, isClosing }: SystemToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 4500)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-alura-accent shrink-0" />,
          border: "border-alura-accent/40 hover:border-alura-accent",
          glow: "shadow-[0_12px_35px_-8px_rgba(57,255,136,0.25)]",
          indicator: "bg-alura-accent"
        }
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5 text-alura-danger shrink-0" />,
          border: "border-alura-danger/40 hover:border-alura-danger",
          glow: "shadow-[0_12px_35px_-8px_rgba(255,92,108,0.25)]",
          indicator: "bg-alura-danger"
        }
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#F5A623] shrink-0" />,
          border: "border-[#F5A623]/40 hover:border-[#F5A623]",
          glow: "shadow-[0_12px_35px_-8px_rgba(245,166,35,0.25)]",
          indicator: "bg-[#F5A623]"
        }
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-[#00E5FF] shrink-0" />,
          border: "border-[#00E5FF]/40 hover:border-[#00E5FF]",
          glow: "shadow-[0_12px_35px_-8px_rgba(0,229,255,0.25)]",
          indicator: "bg-[#00E5FF]"
        }
    }
  }

  const s = getStyle()

  return (
    <div 
      className={`
        relative flex items-start gap-3.5 p-4 mb-3 rounded-2xl border
        bg-alura-surface2/95 backdrop-blur-md ${s.glow} ${s.border}
        w-[360px] max-w-[calc(100vw-32px)] cursor-pointer transition-all duration-300 pointer-events-auto
        ${isClosing 
          ? 'opacity-0 translate-x-4 pointer-events-none' 
          : 'animate-in fade-in slide-in-from-right-8 duration-300 ease-out'}
      `}
      onClick={() => onClose(toast.id)}
    >
      {/* Indicador sutil na borda esquerda */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${s.indicator}`}></div>

      <div className="pl-1 pt-0.5">
        {s.icon}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {toast.title && (
          <h4 className="text-[13px] font-bold text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
        )}
        <p className="text-[12px] text-alura-textSecondary leading-relaxed break-words mt-0.5">
          {toast.message}
        </p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation()
          onClose(toast.id)
        }}
        className="text-alura-textMuted hover:text-white transition-colors rounded-full p-1 hover:bg-alura-hover shrink-0"
        aria-label="Fechar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
