import { useState, useRef, useEffect } from "react"
import { MessageSquare, MoreHorizontal, User, Ban, UserMinus, BellOff, Pin, PinOff, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { SpotifyIcon } from "../shared/SpotifyActivityCard"
import { UserProfileHoverCard } from "../shared/UserProfileHoverCard"

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
  onRemoveFriend?: () => void
  onBlock?: () => void
  onMute?: () => void
  onPin?: () => void
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

  const initials = name.substring(0, 2).toUpperCase()
  
  const getStatusColor = () => {
    switch(status) {
      case 'online': return 'bg-alura-accent'
      case 'idle': return 'bg-orange-400'
      case 'dnd': return 'bg-alura-danger'
      default: return 'bg-alura-textDisabled'
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

  return (
    <div className="group flex items-center justify-between p-4 h-[76px] rounded-[14px] bg-alura-surface1 border border-alura-border hover:bg-alura-surface2 transition-all cursor-pointer">
      
      <UserProfileHoverCard userId={id} profile={profile} side="right">
        <div className="flex items-center space-x-4 overflow-hidden">
          <div className="relative shrink-0">
            <Avatar className="w-[56px] h-[56px] rounded-full">
              {avatar_url ? (
                 <img src={avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : (
                 <AvatarFallback className="bg-alura-surface2 text-alura-textSecondary font-semibold">{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-alura-surface1 group-hover:border-alura-surface2 transition-colors ${getStatusColor()}`}></div>
          </div>
          
          <div className="flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] text-alura-textPrimary truncate hover:underline">@{username}</span>
              {isPinned && <Pin className="w-3.5 h-3.5 text-alura-accent shrink-0" />}
              {isMuted && <BellOff className="w-3.5 h-3.5 text-alura-textMuted shrink-0" />}
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></div>
              <span className={`text-[12px] font-medium ${status === 'online' ? 'text-alura-accent' : 'text-alura-textDisabled'}`}>
                {getStatusText()}
              </span>
            </div>

            {spotify_activity?.isPlaying && show_spotify_activity !== false ? (
              <div className="text-[12px] text-[#39FF88] mt-0.5 truncate flex items-center gap-1.5 font-medium animate-in fade-in duration-200">
                <SpotifyIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Ouvindo {spotify_activity.trackName} - {spotify_activity.artistName}</span>
              </div>
            ) : (
              <span className="text-[13px] text-alura-textMuted mt-0.5 truncate">
                {title || 'Cargo não informado'}
              </span>
            )}
          </div>
        </div>
      </UserProfileHoverCard>

      <div className={`flex items-center gap-3 shrink-0 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onMessage?.(); }}
          className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-transparent hover:bg-alura-surface2 border border-alura-border hover:border-alura-borderStrong text-alura-textMuted hover:text-alura-textPrimary transition-colors"
          title="Enviar Mensagem"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`w-10 h-10 flex items-center justify-center rounded-[10px] border transition-colors ${isMenuOpen ? 'bg-alura-surface2 border-alura-borderStrong text-alura-textPrimary' : 'bg-transparent hover:bg-alura-surface2 border-alura-border hover:border-alura-borderStrong text-alura-textMuted hover:text-alura-textPrimary'}`}
            title="Mais opções"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-alura-surface1 border border-alura-borderStrong rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 py-1.5 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-hover flex items-center gap-2">
                 <User className="w-3.5 h-3.5" /> Visitar perfil
              </button>
              
              <button onClick={() => { setIsMenuOpen(false); onPin?.(); }} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-hover flex items-center gap-2">
                 {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />} 
                 {isPinned ? 'Desfixar' : 'Fixar'}
              </button>
              
              <button onClick={() => { setIsMenuOpen(false); onMute?.(); }} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-hover flex items-center gap-2">
                 {isMuted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />} 
                 {isMuted ? 'Reativar' : 'Silenciar'}
              </button>
              
              <button onClick={() => { setIsMenuOpen(false); onRemoveFriend?.(); }} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                 <UserMinus className="w-3.5 h-3.5" /> Remover amizade
              </button>
              <button onClick={() => { setIsMenuOpen(false); onBlock?.(); }} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                 <Ban className="w-3.5 h-3.5" /> Bloquear
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
