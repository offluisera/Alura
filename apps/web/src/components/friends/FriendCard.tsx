import { useState, useRef, useEffect } from "react"
import { MessageSquare, MoreHorizontal, User, Ban, UserMinus, BellOff, Pin, PinOff, Bell, Phone } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { UserProfileHoverCard } from "../shared/UserProfileHoverCard"
import { getUserSubtitle } from "../../lib/utils/userSubtitle"

interface FriendCardProps {
  id: string
  name: string
  username: string
  status: 'online' | 'offline' | 'idle' | 'dnd'
  title?: string
  avatar_url?: string
  profile?: any
  isPinned?: boolean
  isMuted?: boolean
  spotify_activity?: any
  show_spotify_activity?: boolean
  onMessage?: () => void
  onCall?: () => void
  onRemoveFriend?: () => void
  onBlock?: () => void
  onMute?: () => void
  onPin?: () => void
}

function NoteIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3v11.3A3.5 3.5 0 1010.5 17V8l8-2V3z" />
    </svg>
  )
}

export function FriendCard({ 
  id,
  name, 
  username, 
  status, 
  title, 
  avatar_url,
  profile,
  isPinned = false,
  isMuted = false,
  spotify_activity,
  show_spotify_activity = true,
  onMessage,
  onCall,
  onRemoveFriend,
  onBlock,
  onMute,
  onPin
}: FriendCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const initials = name ? name.substring(0, 2).toUpperCase() : (username ? username.substring(0, 2).toUpperCase() : "AL")
  
  const getStatusClass = () => {
    switch(status) {
      case 'online': return 'on'
      case 'idle': return 'away'
      case 'dnd': return 'dnd'
      default: return 'off'
    }
  }

  const getStatusText = () => {
    switch(status) {
      case 'online': return 'Online'
      case 'idle': return 'Ausente'
      case 'dnd': return 'Ocupado'
      default: return 'Offline'
    }
  }

  const statusClass = getStatusClass()
  const statusText = getStatusText()

  const subtitle = getUserSubtitle({ title, ...(profile || {}) }, '')

  return (
    <div 
      className="amigos-friend group"
      onClick={() => onMessage?.()}
    >
      <UserProfileHoverCard userId={id} profile={profile} side="right" className="flex items-center flex-1 min-w-0">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="amigos-av">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shrink-0">
              {avatar_url ? (
                <img 
                  src={avatar_url} 
                  alt={name || username} 
                  className="w-full h-full aspect-square rounded-full object-cover shrink-0" 
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <i className={`st ${statusClass}`} />
          </div>

          <div className="t">
            <div className="n">
              <b>@{username}</b>
              {isPinned && <Pin className="w-3.5 h-3.5 text-[var(--amigos-accent)] shrink-0" />}
              {isMuted && <BellOff className="w-3.5 h-3.5 text-[var(--amigos-muted)] shrink-0" />}
              <span className={`amigos-stt ${statusClass}`}>
                {statusText}
              </span>
            </div>

            {spotify_activity?.isPlaying && show_spotify_activity !== false ? (
              <p className="sp-line" title={`Ouvindo ${spotify_activity.trackName} · ${spotify_activity.artistName}`}>
                <NoteIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Ouvindo {spotify_activity.trackName} · {spotify_activity.artistName}</span>
              </p>
            ) : subtitle ? (
              <p title={subtitle}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </UserProfileHoverCard>

      <div className="amigos-acts" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onMessage?.(); }}
          className="amigos-icon-btn"
          title="Enviar mensagem"
          aria-label="Enviar mensagem"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {status !== 'offline' && onCall && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onCall?.(); }}
            className="amigos-icon-btn"
            title="Ligar"
            aria-label="Ligar"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="amigos-icon-btn"
            title="Mais opções"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div 
              className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--amigos-card)] border border-[var(--amigos-line)] rounded-[12px] shadow-[0_16px_32px_rgba(0,0,0,0.6)] z-30 py-1.5 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button"
                onClick={() => { setIsMenuOpen(false); onMessage?.(); }} 
                className="w-full text-left px-3.5 py-2 text-[13px] text-[var(--amigos-text)] hover:bg-[var(--amigos-card-2)] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[var(--amigos-muted)]" /> 
                <span>Visitar perfil</span>
              </button>

              <button 
                type="button"
                onClick={() => { setIsMenuOpen(false); onPin?.(); }} 
                className="w-full text-left px-3.5 py-2 text-[13px] text-[var(--amigos-text)] hover:bg-[var(--amigos-card-2)] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                {isPinned ? <PinOff className="w-3.5 h-3.5 text-[var(--amigos-accent)]" /> : <Pin className="w-3.5 h-3.5 text-[var(--amigos-muted)]" />} 
                <span>{isPinned ? 'Desfixar amigo' : 'Fixar no topo'}</span>
              </button>

              <button 
                type="button"
                onClick={() => { setIsMenuOpen(false); onMute?.(); }} 
                className="w-full text-left px-3.5 py-2 text-[13px] text-[var(--amigos-text)] hover:bg-[var(--amigos-card-2)] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                {isMuted ? <Bell className="w-3.5 h-3.5 text-[var(--amigos-accent)]" /> : <BellOff className="w-3.5 h-3.5 text-[var(--amigos-muted)]" />} 
                <span>{isMuted ? 'Reativar notificações' : 'Silenciar notificações'}</span>
              </button>

              <div className="h-px bg-[var(--amigos-line)] my-1" />

              <button 
                type="button"
                onClick={() => { setIsMenuOpen(false); onRemoveFriend?.(); }} 
                className="w-full text-left px-3.5 py-2 text-[13px] text-[var(--amigos-dnd)] hover:bg-[var(--amigos-dnd)]/10 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5" /> 
                <span>Remover amizade</span>
              </button>

              <button 
                type="button"
                onClick={() => { setIsMenuOpen(false); onBlock?.(); }} 
                className="w-full text-left px-3.5 py-2 text-[13px] text-[var(--amigos-dnd)] hover:bg-[var(--amigos-dnd)]/10 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" /> 
                <span>Bloquear usuário</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
