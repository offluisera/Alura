import React, { useEffect, useRef } from 'react'
import { Copy, Reply, Trash2, Link, Hash, Check } from 'lucide-react'

export interface ContextMenuPosition {
  x: number
  y: number
}

export interface MessageContextMenuProps {
  isOpen: boolean
  position: ContextMenuPosition
  messageContent?: string
  mediaUrl?: string
  messageId: string
  canDelete?: boolean
  onClose: () => void
  onReply?: () => void
  onDelete?: () => void
  onToast?: (msg: string) => void
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isOpen,
  position,
  messageContent,
  mediaUrl,
  messageId,
  canDelete = false,
  onClose,
  onReply,
  onDelete,
  onToast,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Ajusta coordenadas para não vazar a tela
  const menuWidth = 200
  const menuHeight = 220
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  const adjustedX = position.x + menuWidth > screenWidth ? screenWidth - menuWidth - 12 : position.x
  const adjustedY = position.y + menuHeight > screenHeight ? screenHeight - menuHeight - 12 : position.y

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    onToast?.(`${label} copiado!`)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-[9999] w-48 rounded-xl border border-[#003516] bg-[#001408] p-1.5 shadow-2xl shadow-black/80 text-xs text-zinc-300 animate-in fade-in zoom-in-95 duration-100 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Responder */}
      {onReply && (
        <button
          type="button"
          onClick={() => {
            onReply()
            onClose()
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#002a12] hover:text-[#39ff88] transition-colors"
        >
          <Reply className="w-3.5 h-3.5 text-zinc-400" />
          <span>Responder</span>
        </button>
      )}

      {/* Copiar Texto */}
      {messageContent && (
        <button
          type="button"
          onClick={() => copyToClipboard(messageContent, 'Texto da mensagem')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#002a12] hover:text-white transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span>Copiar Texto</span>
        </button>
      )}

      {/* Copiar Link da Mídia */}
      {mediaUrl && (
        <button
          type="button"
          onClick={() => copyToClipboard(mediaUrl, 'Link da mídia')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#002a12] hover:text-white transition-colors"
        >
          <Link className="w-3.5 h-3.5 text-zinc-400" />
          <span>Copiar Link da Mídia</span>
        </button>
      )}

      {/* Copiar ID da Mensagem */}
      <button
        type="button"
        onClick={() => copyToClipboard(messageId, 'ID da mensagem')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#002a12] hover:text-white transition-colors"
      >
        <Hash className="w-3.5 h-3.5 text-zinc-400" />
        <span>Copiar ID</span>
      </button>

      {/* Excluir Mensagem */}
      {canDelete && onDelete && (
        <>
          <div className="my-1 border-t border-[#002a12]" />
          <button
            type="button"
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Mensagem</span>
          </button>
        </>
      )}
    </div>
  )
}
