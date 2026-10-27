import React, { useEffect, useRef } from 'react'
import { Pin, PinOff, Link2, LogOut, ShieldAlert, Check } from 'lucide-react'
import type { ServerItem } from '../../lib/hooks/useServers'

interface ServerContextDropdownProps {
  server: ServerItem
  isPinned: boolean
  onTogglePin: () => void
  onLeave?: () => void
  isOpen: boolean
  onClose: () => void
}

export function ServerContextDropdown({
  server,
  isPinned,
  onTogglePin,
  onLeave,
  isOpen,
  onClose,
}: ServerContextDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/#/channels/${server.id}`
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      onClose()
    }, 1500)
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-10 z-50 w-56 p-1.5 rounded-2xl bg-alura-surface1 border border-alura-border shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-alura-textPrimary"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Fixar / Desafixar na Barra Lateral */}
      <button
        onClick={() => {
          onTogglePin()
          onClose()
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-alura-surface2 transition-all cursor-pointer text-alura-textPrimary"
      >
        <span className="flex items-center gap-2">
          {isPinned ? <PinOff size={14} className="text-amber-400" /> : <Pin size={14} className="text-alura-accent" />}
          {isPinned ? 'Desafixar da sidebar' : 'Fixar na barra lateral'}
        </span>
      </button>

      {/* Copiar Link de Convite */}
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-alura-surface2 transition-all cursor-pointer text-alura-textPrimary"
      >
        <span className="flex items-center gap-2">
          {copied ? <Check size={14} className="text-alura-accent" /> : <Link2 size={14} className="text-alura-textSecondary" />}
          {copied ? 'Link copiado!' : 'Copiar link de convite'}
        </span>
      </button>

      <div className="my-1 border-t border-alura-border/60" />

      {/* Sair do Servidor (se for membro) */}
      {server.is_member && onLeave && (
        <button
          onClick={() => {
            onLeave()
            onClose()
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut size={14} />
            Sair da comunidade
          </span>
        </button>
      )}

      {/* Denunciar */}
      <button
        onClick={() => {
          alert(`Denúncia enviada para a moderação da Alura para o servidor "${server.name}".`)
          onClose()
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <ShieldAlert size={14} />
          Denunciar servidor
        </span>
      </button>
    </div>
  )
}
