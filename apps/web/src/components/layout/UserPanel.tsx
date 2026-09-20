import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Check, User, BellOff, Moon, Circle, Mic, MicOff, Headphones, VolumeX, Settings as SettingsIcon, ChevronRight } from 'lucide-react'
import { SpotifyIcon } from '../shared/SpotifyActivityCard'

type StatusType = 'online' | 'idle' | 'dnd' | 'offline'

export function UserPanel({ user, profile }: { user: any, profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user || !profile) return null

  const handleStatusChange = async (e: React.MouseEvent, newStatus: StatusType) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsOpen(false)
    if (profile.status === newStatus) return
    
    try {
      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id)
      if (error) console.error("Erro ao atualizar status:", error)
    } catch (error) {
      console.error("Erro inesperado ao atualizar status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-alura-success'
      case 'idle': return 'bg-[#F5A623]'
      case 'dnd': return 'bg-alura-danger'
      case 'offline': return 'bg-alura-textDisabled'
      default: return 'bg-alura-textDisabled'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Check className="w-2.5 h-2.5 text-[#0B0D0F]" />
      case 'idle': return <Moon className="w-2.5 h-2.5 text-[#0B0D0F]" fill="currentColor" />
      case 'dnd': return <div className="w-2 h-[2px] bg-[#0B0D0F] rounded-full" />
      case 'offline': return <div className="w-1.5 h-1.5 bg-[#0B0D0F] rounded-full" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'idle': return 'Ausente'
      case 'dnd': return 'Não Perturbe'
      case 'offline': return 'Invisível'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="relative px-3 py-2.5 bg-alura-surface1 border-t border-alura-border flex items-center justify-between gap-1">
      
      {/* Popover de Status e Ações Rápidas */}
      {isOpen && (
        <div ref={menuRef} className="absolute bottom-[115%] left-3 w-64 bg-alura-surface2 border border-alura-border rounded-[14px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Header do Usuário no Popover */}
          <div className="p-3 border-b border-alura-border/60 bg-alura-surface1/60">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-alura-surface3 flex items-center justify-center text-alura-textMuted font-bold text-xs">
                    {(profile.display_name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-alura-surface2 ${getStatusColor(profile.status)}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{profile.display_name || profile.username}</span>
                <span className="text-[11px] text-alura-textMuted block truncate">@{profile.username || "usuario"}</span>
              </div>
            </div>
          </div>

          <div className="p-2 border-b border-alura-border/40">
            <p className="text-[10px] font-bold text-alura-textDisabled uppercase tracking-wider px-2 py-1">Definir Status</p>
            <div className="space-y-0.5">
              
              <button onClick={(e) => handleStatusChange(e, 'online')} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-alura-hover transition-colors group cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-alura-success"></div>
                  <span className="text-[12px] text-alura-textPrimary group-hover:text-white transition-colors">Online</span>
                </div>
                {profile.status === 'online' && <Check className="w-3.5 h-3.5 text-alura-accent" />}
              </button>

              <button onClick={(e) => handleStatusChange(e, 'idle')} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-alura-hover transition-colors group cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]"></div>
                  <span className="text-[12px] text-alura-textPrimary group-hover:text-white transition-colors">Ausente</span>
                </div>
                {profile.status === 'idle' && <Check className="w-3.5 h-3.5 text-alura-accent" />}
              </button>

              <button onClick={(e) => handleStatusChange(e, 'dnd')} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-alura-hover transition-colors group cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-alura-danger flex items-center justify-center">
                    <div className="w-1.5 h-[1.5px] bg-alura-surface2 rounded-full"></div>
                  </div>
                  <span className="text-[12px] text-alura-textPrimary group-hover:text-white transition-colors">Não Perturbe</span>
                </div>
                {profile.status === 'dnd' && <Check className="w-3.5 h-3.5 text-alura-accent" />}
              </button>

              <button onClick={(e) => handleStatusChange(e, 'offline')} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-alura-hover transition-colors group cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-alura-textDisabled flex items-center justify-center">
                    <div className="w-1 h-1 bg-alura-surface2 rounded-full"></div>
                  </div>
                  <span className="text-[12px] text-alura-textPrimary group-hover:text-white transition-colors">Invisível</span>
                </div>
                {profile.status === 'offline' && <Check className="w-3.5 h-3.5 text-alura-accent" />}
              </button>

            </div>
          </div>

          {/* Links Rápidos do Menu */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => { setIsOpen(false); navigate('/profile') }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-alura-hover text-alura-textSecondary hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-alura-accent" />
                <span>Ver Meu Perfil</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-alura-textMuted" />
            </button>

            <button
              onClick={() => { setIsOpen(false); navigate('/settings') }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-alura-hover text-alura-textSecondary hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-3.5 h-3.5 text-alura-accent" />
                <span>Configurações</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-alura-textMuted" />
            </button>
          </div>

        </div>
      )}

      {/* Perfil (Avatar + Nome) - Clicável para abrir popover */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-alura-hover transition-all cursor-pointer group flex-1 min-w-0 text-left"
        title="Clique para gerenciar status e perfil"
      >
        <div className="relative shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-alura-surface2 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-alura-textMuted" />
            </div>
          )}
          {/* Indicador de Status */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-alura-surface1 flex items-center justify-center ${getStatusColor(profile.status)}`}>
            {getStatusIcon(profile.status)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-alura-textPrimary truncate group-hover:text-white transition-colors">
            {profile.display_name || profile.username}
          </div>
          {profile?.spotify_activity?.isPlaying && profile?.show_spotify_activity !== false ? (
            <div className="text-[11px] text-[#39FF88] truncate flex items-center gap-1 font-medium animate-in fade-in duration-200">
              <SpotifyIcon className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{profile.spotify_activity.trackName}</span>
            </div>
          ) : (
            <div className="text-[11px] text-alura-textDisabled truncate transition-colors group-hover:text-alura-textMuted">
              {getStatusText(profile.status)}
            </div>
          )}
        </div>
      </button>

      {/* Botões Rápidos de Ação: Mic, Áudio, Engrenagem */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isMuted 
              ? "text-alura-danger bg-alura-danger/10 hover:bg-alura-danger/20" 
              : "text-alura-textMuted hover:text-white hover:bg-alura-hover"
          }`}
          title={isMuted ? "Ativar Microfone" : "Silenciar Microfone"}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsDeafened(!isDeafened)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isDeafened 
              ? "text-alura-danger bg-alura-danger/10 hover:bg-alura-danger/20" 
              : "text-alura-textMuted hover:text-white hover:bg-alura-hover"
          }`}
          title={isDeafened ? "Ativar Áudio" : "Ensurdecer Áudio"}
        >
          {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-alura-textMuted hover:text-alura-accent hover:bg-alura-hover transition-colors cursor-pointer"
          title="Configurações do Usuário"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  )
}
