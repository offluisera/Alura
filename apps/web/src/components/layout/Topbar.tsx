import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Search, Bell, LogOut, Heart, MessageSquare, UserPlus, FileText, Check, ChevronDown, ChevronRight, ChevronLeft, User, Users, Server, Settings, HelpCircle, Activity, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { NotificationCenterModal } from "../notifications/NotificationCenterModal"
import { usePresence } from "../../contexts/PresenceContext"

interface TopbarProps {
  user: any
  profile?: any
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

interface Notification {
  id: string
  type: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

export function Topbar({ user, profile, isSidebarCollapsed = false, onToggleSidebar }: TopbarProps) {
  const { getUserStatus } = usePresence()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Estado de Busca Global
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    users: Array<{ id: string; username: string; display_name: string; avatar_url?: string; bio?: string; status?: string }>
    servers: Array<{ id: string; name: string; icon_url?: string; description?: string }>
  }>({ users: [], servers: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        searchInputRef.current?.focus()
        setShowSearchDropdown(true)
      }
      if (event.key === 'Escape') {
        setShowSearchDropdown(false)
        setShowNotifications(false)
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Efeito de busca com debounce
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 1) {
      setSearchResults({ users: [], servers: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const cleanTerm = trimmed.replace(/^@/, '')
        const { data: usersData, error: uErr } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio, status')
          .or(`username.ilike.%${cleanTerm}%,display_name.ilike.%${cleanTerm}%`)
          .limit(8)

        if (uErr) {
          console.warn("Erro ao buscar usuários:", uErr)
        }

        const { data: serversData, error: sErr } = await supabase
          .from('servers')
          .select('id, name, icon_url, description')
          .ilike('name', `%${cleanTerm}%`)
          .limit(4)

        if (sErr) {
          console.warn("Erro ao buscar servidores:", sErr)
        }

        setSearchResults({
          users: usersData || [],
          servers: serversData || []
        })
      } catch (err) {
        console.warn("Erro na busca:", err)
      } finally {
        setIsSearching(false)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if(!user) return
    fetchNotifications()
    
    // Assinatura Realtime para ouvir os triggers no BD
    const subscription = supabase.channel('notif-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
         setNotifications(prev => [payload.new as Notification, ...prev])
         setUnreadCount(prev => prev + 1)
      }).subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [user])

  async function fetchNotifications() {
     const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
     if(data) {
       setNotifications(data as Notification[])
       setUnreadCount(data.filter(n => !n.is_read).length)
     }
  }

  async function markAsRead(id: string) {
     await supabase.from('notifications').update({ is_read: true }).eq('id', id)
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
     setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
     if(unreadCount === 0) return
     await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
     setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
     setUnreadCount(0)
  }

  async function handleNotificationClick(n: Notification) {
    if (!n.is_read) {
      await markAsRead(n.id)
    }
    setShowNotifications(false)

    if (n.link) {
      let target = n.link
      if (target.startsWith('/app/post/') || target.startsWith('/post/')) {
        navigate('/')
        return
      }
      if (target.startsWith('/app/')) {
        target = target.replace('/app/', '/')
      }
      navigate(target)
      return
    }

    if (n.type === 'like' || n.type === 'comment' || n.type === 'friend_post') {
      navigate('/')
    } else if (n.type === 'friend_request') {
      navigate('/requests')
    } else if (n.type === 'dm' || n.type === 'message') {
      navigate('/messages')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-alura-accent" />
      case 'comment': return <MessageSquare className="w-4 h-4 text-[#4facfe]" />
      case 'friend_request': return <UserPlus className="w-4 h-4 text-[#ff0844]" />
      case 'friend_post': return <FileText className="w-4 h-4 text-[#43e97b]" />
      default: return <Bell className="w-4 h-4 text-alura-textSecondary" />
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000)
    if (diffMins < 60) return `${Math.max(1, diffMins)}m atrás`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`
    return `${Math.floor(diffMins / 1440)}d atrás`
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const displayName = user?.user_metadata?.full_name || "Usuário"
  const username = user?.user_metadata?.username ? `@${user.user_metadata.username}` : "@usuario"
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <header className="h-16 pl-6 pr-[140px] w-full flex items-center justify-between bg-alura-background border-b border-alura-border shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-30 shrink-0">
      
      {/* Busca Global */}
      <div className="flex items-center gap-3 w-full max-w-[540px]">
        <div className="relative flex-1" ref={searchRef}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-alura-accent animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-alura-textMuted" />
          )}
        </div>
        <input 
          ref={searchInputRef}
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowSearchDropdown(true)
          }}
          onFocus={() => setShowSearchDropdown(true)}
          placeholder="Buscar amigos, usuários, servidores..." 
          className="w-full h-10 bg-alura-surface1 border border-alura-border focus:border-alura-borderStrong focus:shadow-[0_0_15px_rgba(0,223,160,0.15)] rounded-[10px] pl-10 pr-10 text-sm text-alura-textPrimary placeholder:text-alura-textDisabled outline-none transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {searchQuery ? (
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults({ users: [], servers: [] }); }} 
              className="text-alura-textDisabled hover:text-alura-textPrimary p-1 rounded-md hover:bg-alura-surface2 transition-colors"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-alura-textDisabled bg-alura-surface2 px-1.5 py-0.5 rounded border border-alura-border pointer-events-none">/</span>
          )}
        </div>

        {/* Dropdown de Resultados da Busca */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-2 left-0 w-full bg-alura-surface1 border border-alura-borderStrong shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {/* Usuários encontrados */}
              {searchResults.users.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-alura-textMuted flex items-center gap-1.5">
                    <User className="w-3 h-3 text-alura-accent" />
                    Usuários
                  </div>
                  {searchResults.users.map((u) => {
                    const initials = (u.display_name || u.username || "U").substring(0, 2).toUpperCase()
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setShowSearchDropdown(false)
                          setSearchQuery("")
                          const handle = u.username ? `@${u.username}` : u.id
                          navigate(`/profile/${handle}`)
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-alura-surface2 cursor-pointer transition-colors group"
                      >
                        <div className="relative">
                          <Avatar className="w-9 h-9 border border-alura-border group-hover:border-alura-accent group-hover:shadow-[0_0_8px_var(--alura-accent)] transition-all">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <AvatarFallback className="bg-alura-surface2 text-alura-textPrimary text-xs font-semibold">
                                {initials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {(() => {
                            const uStatus = getUserStatus(u)
                            return (
                              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-alura-surface1 ${
                                uStatus === 'online' ? 'bg-alura-success' :
                                uStatus === 'dnd' ? 'bg-alura-danger' :
                                uStatus === 'idle' ? 'bg-amber-500' : 'bg-zinc-500'
                              }`} />
                            )
                          })()}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-alura-textPrimary group-hover:text-alura-accent transition-colors truncate">
                              {u.display_name || u.username}
                            </span>
                            {u.username && (
                              <span className="text-[12px] text-alura-accent drop-shadow-[0_0_5px_var(--alura-accent)] font-medium">
                                @{u.username}
                              </span>
                            )}
                          </div>
                          {u.bio && (
                            <span className="text-[11px] text-alura-textMuted truncate">
                              {u.bio}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-alura-textMuted group-hover:text-alura-accent group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Servidores encontrados */}
              {searchResults.servers.length > 0 && (
                <div className="pt-2 border-t border-alura-border/30">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-alura-textMuted flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-alura-accent" />
                    Servidores
                  </div>
                  {searchResults.servers.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setShowSearchDropdown(false)
                        setSearchQuery("")
                        navigate(`/servers/${s.id}`)
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-alura-surface2 cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-alura-surface2 border border-alura-border group-hover:border-alura-accent flex items-center justify-center font-bold text-sm text-alura-textPrimary transition-all">
                        {s.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-alura-textPrimary group-hover:text-alura-accent transition-colors truncate">
                          {s.name}
                        </span>
                        {s.description && (
                          <span className="text-[11px] text-alura-textMuted truncate">
                            {s.description}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-alura-textMuted group-hover:text-alura-accent group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* Nenhum resultado */}
              {!isSearching && searchResults.users.length === 0 && searchResults.servers.length === 0 && (
                <div className="p-6 text-center text-alura-textMuted text-[13px]">
                  Nenhum resultado encontrado para "<strong className="text-alura-textPrimary">{searchQuery}</strong>"
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Ações e Menus do Topo (compatíveis com alura-menus-topo.html e personalização) */}
      <div className="flex items-center space-x-3 ml-6">
        
        {/* Notificações Popover */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileDropdown(false)
            }} 
            className={`relative w-[38px] h-[38px] rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              showNotifications 
                ? 'bg-alura-surface2 text-alura-textPrimary border border-alura-border' 
                : 'text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2'
            }`}
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-alura-accent text-black font-extrabold text-[10px] flex items-center justify-center border-2 border-alura-background shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-[min(390px,calc(100vw-24px))] bg-alura-surface1 border border-alura-border rounded-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.65)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Header */}
              <div className="h-[52px] px-4 flex items-center justify-between border-b border-alura-border bg-alura-surface1">
                <b className="text-[15px] text-alura-textPrimary font-semibold">Notificações</b>
                <button 
                  type="button"
                  onClick={markAllAsRead} 
                  disabled={unreadCount === 0}
                  className="text-alura-accent hover:underline text-[13px] font-semibold transition-colors disabled:text-alura-textDisabled disabled:no-underline disabled:cursor-default cursor-pointer"
                >
                  Marcar todas como lidas
                </button>
              </div>

              {/* Lista de Notificações */}
              <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center text-alura-textMuted py-10 px-4">
                    <b className="block text-alura-textPrimary text-[14px] mb-1">Tudo em dia</b>
                    <span className="text-xs">Você não tem novas notificações.</span>
                  </div>
                ) : (
                  notifications.map(n => {
                    const isReq = n.type === 'friend_request'
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)} 
                        className={`relative flex items-start gap-3 p-2.5 rounded-[10px] cursor-pointer transition-colors ${
                          !n.is_read ? 'bg-alura-surface2/60 hover:bg-alura-surface2' : 'hover:bg-alura-surface2/40'
                        }`}
                      >
                        {/* Ícone com badge redonda */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isReq ? 'bg-[#ff6b6b]/15 text-[#ff6b6b]' : 'bg-alura-accent/15 text-alura-accent'
                        }`}>
                          {getNotificationIcon(n.type)}
                        </div>

                        {/* Corpo */}
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-[13px] leading-snug text-alura-textPrimary m-0">
                            <span className="font-semibold">{n.message}</span>
                          </p>
                          <time className="text-[11px] text-alura-textMuted mt-1 block">
                            {formatTime(n.created_at)}
                          </time>

                          {/* Ações de Solicitação de Amizade */}
                          {isReq && (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(n.id)
                                  navigate('/requests')
                                }}
                                className="h-[28px] px-3 rounded-md bg-alura-accent text-black text-xs font-bold hover:brightness-95 transition-all cursor-pointer"
                              >
                                Ver Solicitação
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Ponto indicador de não lida */}
                        {!n.is_read && (
                          <div className="w-2 h-2 rounded-full bg-alura-accent shrink-0 mt-2 mr-1"></div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Rodapé: Central de Notificações */}
              <div className="p-1 border-t border-alura-border bg-alura-surface1">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false)
                    setShowNotificationCenter(true)
                  }}
                  className="w-full h-10 rounded-lg text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                >
                  Abrir central de notificações
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Logout direto na Topbar (Mantido conforme solicitado) */}
        <button 
          type="button"
          onClick={handleLogout} 
          title="Sair da conta" 
          aria-label="Sair da conta"
          className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-alura-textMuted hover:text-alura-danger hover:bg-alura-danger/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
        
        {/* Símbolo do Perfil na Topbar com Menu Tray (alura-menus-topo.html) */}
        <div className="relative pl-2 border-l border-alura-border" ref={dropdownRef}>
          <button 
            type="button"
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-alura-surface2 transition-all cursor-pointer group"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown)
              setShowNotifications(false)
            }}
            aria-haspopup="true"
            aria-expanded={showProfileDropdown}
            aria-label="Menu do perfil"
          >
            <div className="relative">
              <Avatar className="w-9 h-9 border-2 border-alura-border group-hover:border-alura-accent transition-colors shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-alura-surface2 text-alura-accent text-xs font-bold">{initials}</AvatarFallback>
                )}
              </Avatar>
              <i className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-alura-background ${
                profile?.status === 'dnd' ? 'bg-[#ff6b6b]' : 
                profile?.status === 'idle' ? 'bg-[#f5c451]' : 
                profile?.status === 'offline' ? 'bg-[#6b7570]' : 
                'bg-[#3ddc84]'
              }`} />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-alura-textMuted transition-transform duration-200 ${showProfileDropdown ? 'rotate-180 text-alura-textPrimary' : ''}`} />
          </button>

          {/* Bandeja de Perfil (panel menu de alura-menus-topo.html) */}
          {showProfileDropdown && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-[300px] bg-alura-surface1 border border-alura-border rounded-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Usuário */}
              <div className="p-4 flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar className="w-[52px] h-[52px] border-2 border-alura-border">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-alura-surface2 text-alura-accent font-bold text-base">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <i className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-alura-surface1 ${
                    profile?.status === 'dnd' ? 'bg-[#ff6b6b]' : 
                    profile?.status === 'idle' ? 'bg-[#f5c451]' : 
                    profile?.status === 'offline' ? 'bg-[#6b7570]' : 
                    'bg-[#3ddc84]'
                  }`} />
                </div>
                <div className="min-w-0 line-tight">
                  <b className="block text-[15px] font-bold text-alura-textPrimary truncate">{displayName}</b>
                  <small className="text-[12px] text-alura-textMuted truncate block">{username}</small>
                </div>
              </div>

              {profile?.bio && (
                <div className="px-4 pb-3 text-[13px] text-alura-textMuted line-clamp-2">
                  {profile.bio}
                </div>
              )}

              {/* Status Picker Selector */}
              <div className="mx-2 mb-2">
                <div className="p-1.5 rounded-lg bg-alura-surface2 flex items-center gap-2.5 text-[13px] font-semibold text-alura-textPrimary">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    profile?.status === 'dnd' ? 'bg-[#ff6b6b]' : 
                    profile?.status === 'idle' ? 'bg-[#f5c451]' : 
                    profile?.status === 'offline' ? 'bg-[#6b7570]' : 
                    'bg-[#3ddc84]'
                  }`} />
                  <span className="flex-1 truncate">
                    {profile?.status === 'dnd' ? 'Não perturbe' :
                     profile?.status === 'idle' ? 'Ausente' :
                     profile?.status === 'offline' ? 'Invisível' :
                     'Online'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-alura-border my-1.5"></div>

              {/* Navegação da Conta */}
              <nav className="p-1.5 space-y-0.5" aria-label="Conta">
                <button
                  type="button"
                  onClick={() => { navigate('/profile'); setShowProfileDropdown(false) }}
                  className="w-full flex items-center gap-3 h-10 px-2.5 rounded-lg text-alura-textPrimary hover:bg-alura-surface2 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <User className="w-[18px] h-[18px] text-alura-textMuted" />
                  <span>Meu perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => { navigate('/friends'); setShowProfileDropdown(false) }}
                  className="w-full flex items-center gap-3 h-10 px-2.5 rounded-lg text-alura-textPrimary hover:bg-alura-surface2 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Users className="w-[18px] h-[18px] text-alura-textMuted" />
                  <span>Amigos</span>
                </button>

                <button
                  type="button"
                  onClick={() => { navigate('/servers'); setShowProfileDropdown(false) }}
                  className="w-full flex items-center gap-3 h-10 px-2.5 rounded-lg text-alura-textPrimary hover:bg-alura-surface2 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Server className="w-[18px] h-[18px] text-alura-textMuted" />
                  <span>Servidores</span>
                </button>

                <button
                  type="button"
                  onClick={() => { navigate('/settings'); setShowProfileDropdown(false) }}
                  className="w-full flex items-center gap-3 h-10 px-2.5 rounded-lg text-alura-textPrimary hover:bg-alura-surface2 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Settings className="w-[18px] h-[18px] text-alura-textMuted" />
                  <span>Configurações</span>
                </button>
              </nav>

              <div className="h-px bg-alura-border my-1.5"></div>

              {/* Ajuda e Info */}
              <nav className="p-1.5 space-y-0.5" aria-label="Ajuda">
                <button
                  type="button"
                  onClick={() => { navigate('/settings'); setShowProfileDropdown(false) }}
                  className="w-full flex items-center gap-3 h-9 px-2.5 rounded-lg text-alura-textPrimary hover:bg-alura-surface2 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-[18px] h-[18px] text-alura-textMuted" />
                  <span>Ajuda e suporte</span>
                </button>

                <div className="flex items-center justify-between h-9 px-2.5 rounded-lg text-alura-textPrimary text-[13px] font-medium">
                  <div className="flex items-center gap-3">
                    <Activity className="w-[18px] h-[18px] text-alura-textMuted" />
                    <span>Sobre a Alura</span>
                  </div>
                  <span className="text-[11px] font-semibold text-alura-textMuted bg-alura-surface2 px-2 py-0.5 rounded-md">v2.0.0</span>
                </div>
              </nav>

              <div className="h-px bg-alura-border my-1.5"></div>

              {/* Sair da Conta */}
              <div className="p-1.5 pb-2">
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 h-10 px-2.5 rounded-lg text-[#ff6b6b] hover:bg-[#ff6b6b]/10 text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-[18px] h-[18px] text-[#ff6b6b]" />
                  <span>Sair da conta</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <NotificationCenterModal
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        currentUserId={user?.id}
        onNotificationsUpdated={fetchNotifications}
      />
    </header>
  )
}
