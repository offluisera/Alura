import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Search, Bell, LogOut, Heart, MessageSquare, UserPlus, FileText, Check, ChevronDown, ChevronRight, User, Users, Server, Settings, HelpCircle, Activity, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"

interface TopbarProps {
  user: any
  profile?: any
}

interface Notification {
  id: string
  type: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

export function Topbar({ user, profile }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
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
      navigate(n.link)
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
      <div className="relative w-full max-w-[480px]" ref={searchRef}>
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
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-alura-surface1 ${
                            u.status === 'online' ? 'bg-alura-success' :
                            u.status === 'dnd' ? 'bg-alura-danger' :
                            u.status === 'idle' ? 'bg-amber-500' : 'bg-zinc-500'
                          }`} />
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

      {/* Ações e Usuário */}
      <div className="flex items-center space-x-6 ml-6">
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-hover rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-1.5 right-2 w-2 h-2 bg-alura-accent rounded-full ring-2 ring-alura-background shadow-[0_0_8px_rgba(0,223,160,0.6)]"></div>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full mt-3 right-0 w-[360px] bg-alura-surface1 border border-alura-borderStrong shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex items-center justify-between p-4 border-b border-alura-border/50 bg-alura-surface2">
                   <h3 className="text-white font-semibold text-[15px]">Notificações</h3>
                   {unreadCount > 0 && (
                     <button onClick={markAllAsRead} className="text-alura-textMuted hover:text-alura-accent text-[12px] font-medium transition-colors flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Marcar lidas</button>
                   )}
                 </div>
                 <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="p-8 text-center text-alura-textMuted text-[13px]">Nenhuma notificação por aqui.</div>
                   ) : (
                     notifications.map(n => (
                       <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-alura-border/30 flex items-start gap-3 transition-colors cursor-pointer ${!n.is_read ? 'bg-alura-selected hover:bg-alura-hover' : 'hover:bg-alura-surface2'}`}>
                         <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                         <div className="flex flex-col flex-1 overflow-hidden">
                           <span className={`text-[13px] leading-snug ${!n.is_read ? 'text-alura-textPrimary font-medium' : 'text-alura-textSecondary'}`}>{n.message}</span>
                           <span className="text-[11px] text-alura-textMuted mt-1">{formatTime(n.created_at)}</span>
                         </div>
                         {!n.is_read && <div className="w-2 h-2 rounded-full bg-alura-accent shrink-0 mt-1"></div>}
                       </div>
                     ))
                   )}
                 </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout} 
            title="Sair da conta" 
            className="relative p-2 text-alura-textMuted hover:text-alura-danger hover:bg-alura-danger/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 pl-4 border-l border-alura-border relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-alura-borderStrong group-hover:border-alura-accent transition-colors shadow-[0_0_15px_rgba(0,223,160,0.15)]">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-alura-surface2 text-alura-accent text-sm font-semibold">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-alura-background rounded-full ${
                profile?.status === 'dnd' ? 'bg-alura-danger' : 
                profile?.status === 'idle' ? 'bg-[#F5A623]' : 
                profile?.status === 'offline' ? 'bg-alura-textDisabled' : 
                'bg-alura-success'
              }`}></div>
            </div>
            <ChevronDown className={`w-4 h-4 text-alura-textMuted transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showProfileDropdown && (
            <div className="absolute top-full right-0 mt-4 w-[320px] bg-alura-surface1 border border-alura-borderStrong rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Header */}
              <div className="p-4 border-b border-alura-border/40 relative">
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-alura-accent">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-alura-surface2 text-alura-accent font-semibold">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-alura-surface1 rounded-full ${
                      profile?.status === 'dnd' ? 'bg-alura-danger' : 
                      profile?.status === 'idle' ? 'bg-[#F5A623]' : 
                      profile?.status === 'offline' ? 'bg-alura-textDisabled' : 
                      'bg-alura-success'
                    }`}></div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white font-semibold text-[15px] truncate">{displayName}</span>
                    <span className="text-alura-textMuted text-[13px] truncate">{username}</span>
                    <div className="flex items-center text-[12px] font-medium text-alura-success mt-1 cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-alura-success mr-1.5 animate-pulse"></div>
                      Online <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="mt-4 text-[12px] text-alura-textSecondary leading-relaxed break-words">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-0.5">
                <div onClick={() => { navigate('/profile'); setShowProfileDropdown(false) }} className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover hover:border-alura-border border border-transparent cursor-pointer transition-colors bg-alura-selected">
                  <User className="w-5 h-5 text-alura-accent" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-white font-medium">Meu perfil</span>
                    <span className="text-[11px] text-alura-textSecondary">Veja e edite suas informações</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>
                
                <div onClick={() => { navigate('/friends'); setShowProfileDropdown(false) }} className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover cursor-pointer transition-colors group">
                  <Users className="w-5 h-5 text-alura-textMuted group-hover:text-white transition-colors" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-alura-textPrimary group-hover:text-white transition-colors">Amigos</span>
                    <span className="text-[11px] text-alura-textSecondary">Gerencie sua lista de amigos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>

                <div onClick={() => { navigate('/servers'); setShowProfileDropdown(false) }} className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover cursor-pointer transition-colors group">
                  <Server className="w-5 h-5 text-alura-textMuted group-hover:text-white transition-colors" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-alura-textPrimary group-hover:text-white transition-colors">Servidores</span>
                    <span className="text-[11px] text-alura-textSecondary">Seus servidores e comunidades</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>

                <div onClick={() => { navigate('/settings'); setShowProfileDropdown(false) }} className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover cursor-pointer transition-colors group">
                  <Settings className="w-5 h-5 text-alura-textMuted group-hover:text-white transition-colors" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-alura-textPrimary group-hover:text-white transition-colors">Configurações</span>
                    <span className="text-[11px] text-alura-textSecondary">Ajustes da sua conta e do app</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>
              </div>

              <div className="h-px w-full bg-alura-border/50"></div>

              <div className="p-2 space-y-0.5">
                <div className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover cursor-pointer transition-colors group">
                  <HelpCircle className="w-5 h-5 text-alura-textMuted group-hover:text-white transition-colors" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-alura-textPrimary group-hover:text-white transition-colors">Ajuda e suporte</span>
                    <span className="text-[11px] text-alura-textSecondary">Tire suas dúvidas</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-[10px] hover:bg-alura-hover cursor-pointer transition-colors group">
                  <Activity className="w-5 h-5 text-alura-textMuted group-hover:text-white transition-colors" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] text-alura-textPrimary group-hover:text-white transition-colors">Sobre a Alura</span>
                    <span className="text-[11px] text-alura-textSecondary">Versão 2.0.0</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-alura-textMuted" />
                </div>
              </div>

              <div className="p-3 bg-alura-surface2 border-t border-alura-border/50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-[10px] border border-alura-border text-alura-accent hover:bg-alura-hover hover:border-alura-accent transition-all group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium text-[14px]">Sair da conta</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

    </header>
  )
}
