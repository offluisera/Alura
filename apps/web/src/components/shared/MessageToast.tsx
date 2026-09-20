import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@alura/ui"
import { useEffect, useState } from "react"

export interface ToastData {
  id: string
  username: string
  avatar_url?: string
  message: string
  time: string
  onClick?: () => void
}

interface MessageToastProps {
  toast: ToastData
  onClose: (id: string) => void
  isClosing: boolean
}

export function MessageToast({ toast, onClose, isClosing }: MessageToastProps) {
  useEffect(() => {
    // Auto-close after 6 seconds
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 6000)
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div 
      className={`
        relative flex items-start gap-4 p-4 mb-3 rounded-[16px] border border-alura-border
        bg-alura-surface2/95 backdrop-blur-md shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8)]
        w-[380px] cursor-pointer transition-all duration-300 pointer-events-auto
        hover:border-alura-accent/50
        ${isClosing 
          ? 'opacity-0 translate-x-4 pointer-events-none' 
          : 'animate-in fade-in slide-in-from-right-8 duration-400 ease-out'}
      `}
      onClick={() => {
        toast.onClick?.()
        onClose(toast.id)
      }}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation()
          onClose(toast.id)
        }}
        className="absolute top-3 right-3 text-alura-textMuted hover:text-alura-textPrimary transition-colors rounded-full p-1 hover:bg-alura-hover"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative shrink-0 mt-1">
        <Avatar className="w-12 h-12 rounded-full border border-alura-border">
          <AvatarImage src={toast.avatar_url} alt={toast.username} />
          <AvatarFallback className="bg-alura-surface3 text-alura-textPrimary font-bold">
            {toast.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Indicador Online no avatar da notificação */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-alura-accent border-[2.5px] border-alura-surface2 rounded-full"></div>
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="font-semibold text-[15px] text-alura-textPrimary truncate">
            @{toast.username}
          </span>
          <span className="text-[11px] text-alura-textMuted font-medium shrink-0 ml-2">
            {toast.time}
          </span>
        </div>
        <p className="text-[13px] text-alura-textSecondary line-clamp-2 leading-relaxed font-normal">
          {toast.message}
        </p>
      </div>
    </div>
  )
}
