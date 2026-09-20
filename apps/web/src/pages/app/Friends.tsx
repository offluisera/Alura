import { useState, useEffect } from "react"
import { Users, UserPlus, Check, X, Gamepad2, Mic, Code, Play } from "lucide-react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import logoUrl from "../../../public/logo-sombra.png"
import { AddFriendModal } from "../../components/friends/AddFriendModal"
import { ConfirmModal } from "../../components/shared/ConfirmModal"
import { FriendCard } from "../../components/friends/FriendCard"
import { BlockService } from "../../lib/services/BlockService"
import { BlockedCard } from "../../components/friends/BlockedCard"
import { Ban } from "lucide-react"
import { SpotifyIcon } from "../../components/shared/SpotifyActivityCard"
import { UserProfileHoverCard } from "../../components/shared/UserProfileHoverCard"

type TabType = 'todos' | 'online' | 'offline' | 'bloqueados'

interface FriendRelation {
  id: string
  otherUserId: string
  name: string
  username: string
  title?: string
  avatar_url?: string
  banner_url?: string
  bio?: string
  tags?: string[]
  favorite_games?: string[]
  hobbies?: string[]
  status: 'pending' | 'accepted'
  profileStatus: 'online' | 'idle' | 'dnd' | 'offline'
  isSender: boolean
  spotify_activity?: any
  show_spotify_activity?: boolean
}

export function Friends() {
  const { user } = useOutletContext<{ user: any }>()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<TabType>('todos')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [relations, setRelations] = useState<FriendRelation[]>([])
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados de UI para Modais e Toasts
  const [confirmModalConfig, setConfirmModalConfig] = useState<{isOpen: boolean, targetId: string | null, username: string | null, action: 'remove' | 'block'}>({ isOpen: false, targetId: null, username: null, action: 'remove' })
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const [pinnedFriends, setPinnedFriends] = useState<string[]>(() => JSON.parse(localStorage.getItem('alura_pinned_friends') || '[]'))
  const [mutedFriends, setMutedFriends] = useState<string[]>(() => JSON.parse(localStorage.getItem('alura_muted_friends') || '[]'))

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePin = (userId: string, username: string) => {
    let newPinned;
    if (pinnedFriends.includes(userId)) {
      newPinned = pinnedFriends.filter(id => id !== userId)
      showToast(`@${username} foi desfixado(a).`, 'success')
    } else {
      newPinned = [...pinnedFriends, userId]
      showToast(`@${username} foi fixado(a) com sucesso!`, 'success')
    }
    setPinnedFriends(newPinned)
    localStorage.setItem('alura_pinned_friends', JSON.stringify(newPinned))
  }

  const toggleMute = (userId: string, username: string) => {
    let newMuted;
    if (mutedFriends.includes(userId)) {
      newMuted = mutedFriends.filter(id => id !== userId)
      showToast(`Notificações de @${username} reativadas.`, 'success')
    } else {
      newMuted = [...mutedFriends, userId]
      showToast(`@${username} foi silenciado(a).`, 'success')
    }
    setMutedFriends(newMuted)
    localStorage.setItem('alura_muted_friends', JSON.stringify(newMuted))
  }

  useEffect(() => {
    fetchFriendsData()
    fetchBlocksData()
    if (!user) return
    const channel = supabase.channel('friendships_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriendsData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' }, () => {
        fetchBlocksData()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updated = payload.new as any
        if (!updated?.id) return
        setRelations(prev => prev.map(item => {
          if (item.otherUserId === updated.id) {
            return {
              ...item,
              name: updated.full_name || updated.display_name || item.name,
              username: updated.username || item.username,
              avatar_url: updated.avatar_url ?? item.avatar_url,
              profileStatus: updated.activity_status_visible === false ? 'offline' : (updated.status || 'offline'),
              spotify_activity: updated.spotify_activity,
              show_spotify_activity: updated.show_spotify_activity
            }
          }
          return item
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function fetchFriendsData() {
    if (!user) return
    setLoading(true)
    const { data: rels } = await supabase.from('friendships').select('*').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    
    if (rels) {
      if (rels.length === 0) {
        setRelations([])
        setLoading(false)
        return
      }
      const otherUserIds = rels.map(r => r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1)
      const { data: profs } = await supabase.from('profiles').select('*').in('id', otherUserIds)
      
      const formattedList = rels.map(r => {
        const otherId = r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1
        const profile = profs?.find(p => p.id === otherId)
        return {
           id: r.id, 
           otherUserId: otherId,
           name: profile?.full_name || 'Usuário',
           username: profile?.username || 'usuario',
           title: profile?.title || 'Cargo não informado',
           avatar_url: profile?.avatar_url,
           banner_url: profile?.banner_url,
           bio: profile?.bio,
           tags: profile?.tags || [],
           favorite_games: profile?.favorite_games || profile?.games || [],
           hobbies: profile?.hobbies || [],
           status: r.status,
           isSender: r.user_id_1 === user.id,
           profileStatus: profile?.activity_status_visible === false ? 'offline' : (profile?.status || 'offline'),
           spotify_activity: profile?.spotify_activity,
           show_spotify_activity: profile?.show_spotify_activity
        }
      })
      
      // Remove duplicatas caso haja inconsistência no banco (A->B e B->A)
      const uniqueList = Array.from(new Map(formattedList.map(item => [item.otherUserId, item])).values())
      
      setRelations(uniqueList)
    }
    setLoading(false)
  }

  async function fetchBlocksData() {
    if (!user) return
    try {
      const blocks = await BlockService.getBlockedUsers(user.id)
      setBlockedUsers(blocks)
    } catch (err) {
      console.error("Erro ao buscar bloqueios:", err)
      setBlockedUsers([])
    }
  }

  // Ações de BD
  const handleAccept = async (otherId: string) => { 
    await supabase.from('friendships').update({ status: 'accepted' }).match({ user_id_1: otherId, user_id_2: user.id })
    fetchFriendsData() 
  }
  const handleDecline = async (otherId: string) => { 
    await supabase.from('friendships').delete().match({ user_id_1: otherId, user_id_2: user.id })
    fetchFriendsData() 
  }
  const handleRemove = async (otherId: string) => { 
    await supabase.from('friendships').delete().or(`and(user_id_1.eq.${user.id},user_id_2.eq.${otherId}),and(user_id_1.eq.${otherId},user_id_2.eq.${user.id})`)
    fetchFriendsData() 
  }
  const handleBlock = async (otherId: string) => {
    try {
      await BlockService.blockUser(user.id, otherId)
      fetchBlocksData()
      fetchFriendsData() // Atualiza a lista de amigos na hora para refletir a exclusão via trigger
    } catch (error) {
      showToast("Erro ao bloquear. Você rodou as migrações?", "error")
    }
  }
  const handleUnblock = async (otherId: string) => {
    try {
      await BlockService.unblockUser(user.id, otherId)
      fetchBlocksData()
      fetchFriendsData()
    } catch (error) {
      console.error("Erro ao desbloquear")
    }
  }

  // Filtros
  const friends = relations.filter(r => r.status === 'accepted')
  const requestsReceived = relations.filter(r => r.status === 'pending' && !r.isSender)
  
  // Usando o status real do banco de dados (Realtime Presence / profiles)
  const onlineFriends = friends.filter(f => f.profileStatus !== 'offline')
  const offlineFriends = friends.filter(f => f.profileStatus === 'offline')

  // Aplicando a aba ativa para a Coluna Principal
  let visibleFriends = friends
  if (activeTab === 'online') visibleFriends = onlineFriends
  if (activeTab === 'offline') visibleFriends = offlineFriends

  // Order by pinned
  visibleFriends = [...visibleFriends].sort((a, b) => {
    const aPinned = pinnedFriends.includes(a.otherUserId) ? 1 : 0
    const bPinned = pinnedFriends.includes(b.otherUserId) ? 1 : 0
    return bPinned - aPinned
  })

  return (
    <div className="flex w-full h-full text-alura-textPrimary bg-alura-background">
      
      {/* Coluna Principal (Esquerda) */}
      <div className="flex-1 flex flex-col min-w-0 p-6 pr-0">
        <div className="flex-1 flex flex-col border border-alura-border rounded-[16px] overflow-hidden bg-alura-surface1">
          <div className="p-8 pb-4">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[36px] font-bold text-alura-textPrimary leading-none mb-3">Amigos</h1>
                <p className="text-alura-textMuted text-[15px]">Conecte-se, converse e construa grandes histórias juntos.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="h-10 px-4 bg-alura-accent text-[#0B0D0F] font-bold text-[14px] rounded-[8px] hover:bg-alura-accentBright transition-colors flex items-center gap-2 shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
                Adicionar amigo
              </button>
            </div>

          {/* Filtros em formato de barra contínua */}
          <div className="flex items-center gap-2 p-1.5 bg-alura-surface2 border border-alura-border rounded-[10px] w-fit mb-6">
            <button 
              onClick={() => setActiveTab('todos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${activeTab === 'todos' ? 'bg-alura-accent text-[#0B0D0F]' : 'text-alura-textMuted hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              Todos
            </button>
            <button 
              onClick={() => setActiveTab('online')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${activeTab === 'online' ? 'bg-alura-selected text-alura-accent' : 'text-alura-textMuted hover:text-white'}`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === 'online' ? 'bg-alura-accent' : 'border border-alura-border'}`} />
              Online
              <span className="text-[11px] ml-1">{onlineFriends.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('offline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${activeTab === 'offline' ? 'bg-alura-hover text-alura-textPrimary' : 'text-alura-textMuted hover:text-white'}`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === 'offline' ? 'bg-alura-textPrimary' : 'border border-alura-border'}`} />
              Offline
              <span className="text-[11px] ml-1">{offlineFriends.length}</span>
            </button>
            <div className="w-px h-6 bg-alura-border mx-2"></div>
            <button 
              onClick={() => setActiveTab('bloqueados')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${activeTab === 'bloqueados' ? 'bg-alura-hover text-alura-danger' : 'text-alura-textMuted hover:text-alura-danger'}`}
            >
              <Ban className="w-4 h-4" />
              Bloqueados
              <span className="text-[11px] ml-1">{blockedUsers.length}</span>
            </button>
          </div>
        </div>

        {/* Lista de Amigos Principal */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 text-alura-textMuted">
                <div className="w-10 h-10 rounded-full border-4 border-alura-border border-t-alura-accent animate-spin" />
             </div>
          ) : activeTab === 'bloqueados' ? (
             blockedUsers.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-alura-textMuted border border-dashed border-alura-border rounded-[14px]">
                  <p className="text-sm">Nenhum usuário bloqueado.</p>
               </div>
             ) : (
               <div className="flex flex-col gap-2">
                 {blockedUsers.map(u => (
                   <BlockedCard 
                     key={u.id}
                     id={u.id}
                     name={u.name}
                     username={u.username}
                     avatar_url={u.avatar_url}
                     onUnblock={() => handleUnblock(u.id)}
                   />
                 ))}
               </div>
             )
          ) : visibleFriends.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-alura-textMuted border border-dashed border-alura-border rounded-[14px]">
                <p className="text-sm">Nenhum amigo encontrado nesta categoria.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleFriends.map(f => {
                const isOnline = onlineFriends.some(o => o.id === f.id)
                return (
                  <FriendCard 
                    key={f.id}
                    id={f.otherUserId}
                    name={f.name}
                    username={f.username}
                    status={f.profileStatus}
                    title={f.title}
                    avatar_url={f.avatar_url}
                    profile={f}
                    isPinned={pinnedFriends.includes(f.otherUserId)}
                    isMuted={mutedFriends.includes(f.otherUserId)}
                    spotify_activity={f.spotify_activity}
                    show_spotify_activity={f.show_spotify_activity}
                    onMessage={() => navigate(`/messages/${f.otherUserId}`)}
                    onRemoveFriend={() => {
                       setConfirmModalConfig({ isOpen: true, targetId: f.otherUserId, username: f.username, action: 'remove' })
                    }}
                    onBlock={() => {
                       setConfirmModalConfig({ isOpen: true, targetId: f.otherUserId, username: f.username, action: 'block' })
                    }}
                    onPin={() => togglePin(f.otherUserId, f.username)}
                    onMute={() => toggleMute(f.otherUserId, f.username)}
                  />
                )
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Coluna Contextual (Direita - Sidebar) */}
      <div className="w-[360px] bg-alura-background flex flex-col shrink-0 overflow-hidden relative border-l border-transparent">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Card: Solicitações de amizade */}
          <div className="bg-alura-surface1 border border-alura-border rounded-[16px] overflow-hidden">
             <div className="px-5 py-4 flex items-center justify-between border-b border-alura-border/50">
                <div className="flex items-center gap-2">
                   <h3 className="text-[14px] font-bold text-alura-textPrimary">Solicitações de amizade</h3>
                   {requestsReceived.length > 0 && (
                      <span className="bg-alura-selected text-alura-accent text-[11px] px-2 py-0.5 rounded-full font-bold">
                        {requestsReceived.length}
                      </span>
                   )}
                </div>
                <button className="text-[12px] text-alura-accent hover:underline">Ver todas</button>
             </div>
             <div className="p-2">
                {requestsReceived.length === 0 ? (
                   <p className="text-[13px] text-alura-textMuted p-3 italic">Nenhuma solicitação pendente.</p>
                ) : (
                   <div className="flex flex-col gap-1">
                      {requestsReceived.slice(0,3).map(r => (
                         <div key={r.id} className="flex items-center justify-between p-3 rounded-[10px] hover:bg-alura-hover transition-colors">
                            <div className="flex items-center gap-3">
                               <Avatar className="w-10 h-10 border border-alura-border rounded-full">
                                  {r.avatar_url ? (
                                    <img src={r.avatar_url} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <AvatarFallback className="bg-alura-surface2 text-alura-textMuted text-xs font-bold">{r.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                  )}
                               </Avatar>
                               <div className="flex flex-col">
                                  <span className="text-[13px] font-bold text-alura-textPrimary truncate max-w-[100px]">@{r.username}</span>
                                  <span className="text-[11px] text-alura-textMuted">Quer te adicionar</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => handleAccept(r.otherUserId)} className="px-3 h-7 rounded-[6px] bg-alura-accent text-[#0B0D0F] text-[11px] font-bold hover:bg-alura-accentBright transition-colors">
                                 Aceitar
                               </button>
                               <button onClick={() => handleDecline(r.otherUserId)} className="px-3 h-7 rounded-[6px] bg-transparent border border-alura-border text-alura-textMuted hover:text-white hover:bg-alura-hover text-[11px] font-bold transition-colors">
                                 Recusar
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

          {/* Card: Amigos online */}
          <div className="bg-alura-surface1 border border-alura-border rounded-[16px] overflow-hidden">
             <div className="px-5 py-4 flex items-center justify-between border-b border-alura-border/50">
                <div className="flex items-center gap-2">
                   <h3 className="text-[14px] font-bold text-alura-textPrimary">Amigos online</h3>
                   <span className="bg-alura-selected text-alura-accent text-[11px] px-2 py-0.5 rounded-full font-bold">
                     {onlineFriends.length}
                   </span>
                </div>
                <button className="text-[12px] text-alura-accent hover:underline">Ver todos</button>
             </div>
             <div className="p-2">
                {onlineFriends.length === 0 ? (
                   <p className="text-[13px] text-alura-textMuted p-3 italic">Ninguém online agora.</p>
                ) : (
                   <div className="flex flex-col gap-1">
                      {onlineFriends.map((f) => (
                         <UserProfileHoverCard key={f.id} userId={f.otherUserId} profile={f} side="left" className="w-full">
                            <div className="flex items-center justify-between p-3 rounded-[10px] hover:bg-alura-hover transition-colors cursor-pointer" onClick={() => navigate(`/messages/${f.otherUserId}`)}>
                               <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="w-10 h-10 border border-alura-border rounded-full">
                                        {f.avatar_url ? (
                                          <img src={f.avatar_url} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                          <AvatarFallback className="bg-alura-surface2 text-alura-textMuted text-xs font-bold">{f.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                        )}
                                    </Avatar>
                                     <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-alura-surface1 ${
                                       f.profileStatus === 'dnd' ? 'bg-alura-danger' : f.profileStatus === 'idle' ? 'bg-orange-400' : 'bg-alura-accent'
                                     }`}></div>
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                      <span className="text-[13px] font-bold text-alura-textPrimary truncate max-w-[150px]">@{f.username}</span>
                                      {f.spotify_activity?.isPlaying && f.show_spotify_activity !== false ? (
                                        <div className="text-[11px] text-[#39FF88] truncate flex items-center gap-1.5 font-medium animate-in fade-in duration-200 max-w-[160px]" title={`Ouvindo ${f.spotify_activity.trackName} - ${f.spotify_activity.artistName}`}>
                                          <SpotifyIcon className="w-2.5 h-2.5 shrink-0 text-[#1DB954]" />
                                          <span className="truncate">Ouvindo {f.spotify_activity.trackName}</span>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-alura-textMuted">
                                          {f.profileStatus === 'dnd' ? 'Não perturbe' : f.profileStatus === 'idle' ? 'Ausente' : 'Online'}
                                        </span>
                                      )}
                                   </div>
                               </div>
                            </div>
                         </UserProfileHoverCard>
                      ))}
                   </div>
                )}
             </div>
          </div>
          
          {/* Card Descoberta */}
           <div className="relative bg-alura-surface1 border border-alura-border rounded-[16px] overflow-hidden p-6 mt-4">
              {/* Fundo Gradiente Temático */}
              <div 
                 className="absolute inset-0 z-0 opacity-40 transition-all duration-500"
                 style={{ background: "var(--theme-hero-bg)" }}
              ></div>
             {/* Efeito Visual (Mocking the green waves if background image fails) */}
             <div className="absolute bottom-0 right-0 w-40 h-40 bg-alura-accent opacity-10 blur-[80px] rounded-full pointer-events-none z-0"></div>
             
             <div className="relative z-10 flex flex-col items-start">
               <div className="flex items-start gap-4 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <img src={logoUrl} alt="Alura" className="w-8 h-8 object-contain transition-all duration-300" style={{ filter: "var(--theme-logo-filter)" }} />
                  </div>
                 <h4 className="text-[14px] font-bold text-alura-textPrimary leading-tight">Amizade torna tudo melhor.</h4>
               </div>
               <p className="text-[12px] text-alura-textMuted leading-relaxed mb-4 pl-12">
                 Encontre pessoas que compartilham dos mesmos interesses que você.
               </p>
               <div className="w-full flex justify-end">
                  <button className="w-8 h-8 rounded-full border border-alura-border hover:bg-alura-accent hover:text-[#0B0D0F] hover:border-alura-accent text-alura-textMuted flex items-center justify-center transition-all">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                  </button>
               </div>
             </div>
          </div>

        </div>
      </div>

      <AddFriendModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        currentUser={user} 
      />

      <ConfirmModal 
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.action === 'remove' ? "Remover Amizade" : "Bloquear Usuário"}
        message={confirmModalConfig.action === 'remove' 
          ? `Você tem certeza que deseja remover @${confirmModalConfig.username} da sua lista de amigos?` 
          : `Você tem certeza que deseja bloquear @${confirmModalConfig.username}? Eles não poderão mais enviar mensagens.`}
        confirmText={confirmModalConfig.action === 'remove' ? "Remover" : "Bloquear"}
        isDanger={true}
        onCancel={() => setConfirmModalConfig({ isOpen: false, targetId: null, username: null, action: 'remove' })}
        onConfirm={() => {
           if(confirmModalConfig.targetId) {
             if (confirmModalConfig.action === 'remove') {
               handleRemove(confirmModalConfig.targetId)
               showToast(`@${confirmModalConfig.username} foi removido(a) da sua lista de amigos.`, 'success')
             } else {
               handleBlock(confirmModalConfig.targetId)
               showToast(`@${confirmModalConfig.username} foi bloqueado(a).`, 'success')
             }
           }
           setConfirmModalConfig({ isOpen: false, targetId: null, username: null, action: 'remove' })
        }}
      />

      {/* Custom Toast Simples */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-alura-surface2 border border-alura-border text-alura-textPrimary px-6 py-3 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center gap-3">
            <Check className="w-4 h-4 text-alura-accent" />
            <span className="text-[14px] font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
