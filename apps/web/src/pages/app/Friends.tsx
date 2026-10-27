import { useState, useEffect, useMemo, useCallback } from "react"
import { Users, Ban, Plus, Check } from "lucide-react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { AddFriendModal } from "../../components/friends/AddFriendModal"
import { ConfirmModal } from "../../components/shared/ConfirmModal"
import { FriendCard } from "../../components/friends/FriendCard"
import { BlockedCard } from "../../components/friends/BlockedCard"
import { BlockService } from "../../lib/services/BlockService"
import { UserProfileHoverCard } from "../../components/shared/UserProfileHoverCard"
import { usePresence, type UserStatusType } from "../../contexts/PresenceContext"
import { useCall } from "../../contexts/CallContext"
import { getUserSubtitle } from "../../lib/utils/userSubtitle"

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
  activity_status_visible?: boolean
  isSender: boolean
  spotify_activity?: any
  show_spotify_activity?: boolean
}

export function Friends() {
  const { user } = useOutletContext<{ user: any }>()
  const navigate = useNavigate()
  const { getUserStatus } = usePresence()
  const { startCallWithProfile } = useCall()
  
  const [activeTab, setActiveTab] = useState<TabType>('todos')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [relations, setRelations] = useState<FriendRelation[]>([])
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados de UI para Modais e Toasts
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean
    targetId: string | null
    username: string | null
    action: 'remove' | 'block'
  }>({ isOpen: false, targetId: null, username: null, action: 'remove' })

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const [pinnedFriends, setPinnedFriends] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alura_pinned_friends') || '[]')
    } catch {
      return []
    }
  })

  const [mutedFriends, setMutedFriends] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alura_muted_friends') || '[]')
    } catch {
      return []
    }
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePin = (userId: string, username: string) => {
    let newPinned: string[]
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
    let newMuted: string[]
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
    const { data: rels } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    
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
           name: profile?.full_name || profile?.display_name || 'Usuário',
           username: profile?.username || 'usuario',
           title: getUserSubtitle(profile, 'Membro Alura'),
           profile: profile,
           avatar_url: profile?.avatar_url,
           banner_url: profile?.banner_url,
           bio: profile?.bio,
           tags: profile?.tags || [],
           favorite_games: profile?.favorite_games || profile?.games || [],
           hobbies: profile?.hobbies || [],
           status: r.status,
           isSender: r.user_id_1 === user.id,
           profileStatus: profile?.activity_status_visible === false ? 'offline' : (profile?.status || 'offline'),
           activity_status_visible: profile?.activity_status_visible,
           spotify_activity: profile?.spotify_activity,
           show_spotify_activity: profile?.show_spotify_activity
        }
      })
      
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
      fetchFriendsData()
    } catch (error) {
      showToast("Erro ao bloquear usuário.", "error")
    }
  }
  const handleUnblock = async (otherId: string) => {
    try {
      await BlockService.unblockUser(user.id, otherId)
      fetchBlocksData()
      fetchFriendsData()
    } catch (error) {
      console.error("Erro ao desbloquear:", error)
    }
  }

  const handleStartCall = (f: FriendRelation) => {
    startCallWithProfile(
      f.otherUserId,
      {
        id: f.otherUserId,
        username: f.username,
        display_name: f.name,
        avatar_url: f.avatar_url,
      },
      'voice'
    )
  }

  // Filtros
  const friends = useMemo(() => relations.filter(r => r.status === 'accepted'), [relations])
  const requestsReceived = useMemo(() => relations.filter(r => r.status === 'pending' && !r.isSender), [relations])
  
  // Status efetivo baseado em presença em tempo real
  const getFriendEffectiveStatus = useCallback((f: FriendRelation): UserStatusType => {
    return getUserStatus({
      id: f.otherUserId,
      status: f.profileStatus,
      activity_status_visible: f.activity_status_visible,
    }, f.profileStatus)
  }, [getUserStatus])

  const onlineFriends = useMemo(() => {
    return friends.filter(f => getFriendEffectiveStatus(f) !== 'offline')
  }, [friends, getFriendEffectiveStatus])

  const offlineFriends = useMemo(() => {
    return friends.filter(f => getFriendEffectiveStatus(f) === 'offline')
  }, [friends, getFriendEffectiveStatus])

  // Aplicando a aba ativa para a Coluna Principal
  let visibleFriends = friends
  if (activeTab === 'online') visibleFriends = onlineFriends
  if (activeTab === 'offline') visibleFriends = offlineFriends

  visibleFriends = [...visibleFriends].sort((a, b) => {
    const aPinned = pinnedFriends.includes(a.otherUserId) ? 1 : 0
    const bPinned = pinnedFriends.includes(b.otherUserId) ? 1 : 0
    return bPinned - aPinned
  })

  const emptyMsgs: Record<TabType, [string, string]> = {
    todos: ['Nenhum amigo ainda', 'Conecte-se e adicione amigos para conversar e compartilhar momentos.'],
    online: ['Ninguém online', 'Seus amigos aparecem aqui quando estiverem conectados.'],
    offline: ['Ninguém offline', 'Todos os seus amigos estão online no momento.'],
    bloqueados: ['Nenhum bloqueado', 'Quem você bloquear aparece aqui.']
  }

  return (
    <div className="amigos-page-root flex w-full h-full overflow-hidden">
      
      {/* Coluna Central */}
      <section className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="amigos-page custom-scrollbar">
          <div className="amigos-col">
            
            {/* Cabeçalho */}
            <div className="amigos-head">
              <div>
                <h1>Amigos</h1>
                <p>Conecte-se, converse e construa grandes histórias juntos.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="amigos-btn"
              >
                <Plus className="w-4 h-4 stroke-[2.4]" />
                <span>Adicionar amigo</span>
              </button>
            </div>

            {/* Abas */}
            <div className="amigos-tabs" role="tablist">
              <button 
                type="button"
                className="amigos-tab" 
                role="tab" 
                aria-selected={activeTab === 'todos'} 
                onClick={() => setActiveTab('todos')}
              >
                <span>Todos</span>
                <small>{friends.length}</small>
              </button>
              <button 
                type="button"
                className="amigos-tab" 
                role="tab" 
                aria-selected={activeTab === 'online'} 
                onClick={() => setActiveTab('online')}
              >
                <span>Online</span>
                <small>{onlineFriends.length}</small>
              </button>
              <button 
                type="button"
                className="amigos-tab" 
                role="tab" 
                aria-selected={activeTab === 'offline'} 
                onClick={() => setActiveTab('offline')}
              >
                <span>Offline</span>
                <small>{offlineFriends.length}</small>
              </button>
              <button 
                type="button"
                className="amigos-tab" 
                role="tab" 
                aria-selected={activeTab === 'bloqueados'} 
                onClick={() => setActiveTab('bloqueados')}
              >
                <span>Bloqueados</span>
                <small>{blockedUsers.length}</small>
              </button>
            </div>

            {/* Lista Principal de Amigos */}
            <div id="friends" className="flex flex-col gap-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--amigos-muted)]">
                  <div className="w-9 h-9 rounded-full border-2 border-[var(--amigos-line)] border-t-[var(--amigos-accent)] animate-spin" />
                </div>
              ) : activeTab === 'bloqueados' ? (
                blockedUsers.length === 0 ? (
                  <div className="amigos-empty">
                    <Ban className="w-9 h-9 mx-auto mb-2.5 opacity-60 text-[var(--amigos-muted)]" />
                    <b>{emptyMsgs.bloqueados[0]}</b>
                    <span>{emptyMsgs.bloqueados[1]}</span>
                  </div>
                ) : (
                  blockedUsers.map(u => (
                    <BlockedCard 
                      key={u.id}
                      id={u.id}
                      name={u.name}
                      username={u.username}
                      avatar_url={u.avatar_url}
                      onUnblock={() => handleUnblock(u.id)}
                    />
                  ))
                )
              ) : visibleFriends.length === 0 ? (
                <div className="amigos-empty">
                  <Users className="w-9 h-9 mx-auto mb-2.5 opacity-60 text-[var(--amigos-muted)]" />
                  <b>{emptyMsgs[activeTab][0]}</b>
                  <span>{emptyMsgs[activeTab][1]}</span>
                </div>
              ) : (
                visibleFriends.map(f => {
                  const effectiveStatus = getFriendEffectiveStatus(f)
                  return (
                    <FriendCard 
                      key={f.id}
                      id={f.otherUserId}
                      name={f.name}
                      username={f.username}
                      status={effectiveStatus}
                      title={f.title}
                      avatar_url={f.avatar_url}
                      profile={{ ...f, id: f.otherUserId, status: effectiveStatus }}
                      isPinned={pinnedFriends.includes(f.otherUserId)}
                      isMuted={mutedFriends.includes(f.otherUserId)}
                      spotify_activity={f.spotify_activity}
                      show_spotify_activity={f.show_spotify_activity}
                      onMessage={() => navigate(`/messages/${f.otherUserId}`)}
                      onCall={() => handleStartCall(f)}
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
                })
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Coluna Direita (Fiel ao alura-amigos.html) */}
      <aside className="amigos-right custom-scrollbar">
        
        {/* Seção 1: Solicitações de amizade */}
        <section>
          <h2>
            <span>
              Solicitações de amizade
              {requestsReceived.length > 0 && (
                <span className="ml-1.5 text-[11px] bg-[var(--amigos-accent-soft)] text-[var(--amigos-accent)] px-2 py-0.5 rounded-full font-bold">
                  {requestsReceived.length}
                </span>
              )}
            </span>
            <button 
              type="button"
              onClick={() => navigate('/requests')}
              className="bg-transparent border-0 p-0 text-[13px] font-medium text-[var(--amigos-accent)] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </h2>

          {requestsReceived.length === 0 ? (
            <p className="note">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {requestsReceived.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-[10px] hover:bg-[var(--amigos-card-2)] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#243029] text-[var(--amigos-accent)] font-bold text-[13px] flex items-center justify-center shrink-0 overflow-hidden aspect-square">
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt={r.name || r.username} className="w-full h-full aspect-square rounded-full object-cover shrink-0" />
                      ) : (
                        <span>{(r.name || r.username || "U").substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <b className="text-[13px] font-semibold text-[var(--amigos-text)] truncate max-w-[90px]">@{r.username}</b>
                      <span className="text-[11px] text-[var(--amigos-muted)]">Quer te adicionar</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleAccept(r.otherUserId)}
                      className="h-7 px-2.5 rounded-[6px] bg-[var(--amigos-accent)] text-[var(--amigos-on-accent)] text-[11px] font-bold hover:brightness-95 transition-all cursor-pointer"
                    >
                      Aceitar
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDecline(r.otherUserId)}
                      className="h-7 px-2.5 rounded-[6px] bg-transparent border border-[var(--amigos-line)] text-[var(--amigos-muted)] hover:text-[var(--amigos-text)] hover:bg-[var(--amigos-card-2)] text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção 2: Amigos online */}
        <section>
          <h2>
            <span>
              Amigos online
              {onlineFriends.length > 0 && (
                <span className="ml-1.5 text-[11px] bg-[var(--amigos-accent-soft)] text-[var(--amigos-accent)] px-2 py-0.5 rounded-full font-bold">
                  {onlineFriends.length}
                </span>
              )}
            </span>
            <button 
              type="button"
              onClick={() => setActiveTab('online')}
              className="bg-transparent border-0 p-0 text-[13px] font-medium text-[var(--amigos-accent)] hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </h2>

          {onlineFriends.length === 0 ? (
            <p className="note">Ninguém online agora.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {onlineFriends.map((f) => {
                const fStatus = getFriendEffectiveStatus(f)
                const fStatusClass = fStatus === 'online' ? 'on' : fStatus === 'dnd' ? 'dnd' : fStatus === 'idle' ? 'away' : 'off'
                return (
                  <UserProfileHoverCard 
                    key={f.id} 
                    userId={f.otherUserId} 
                    profile={{ ...f, id: f.otherUserId, status: fStatus }} 
                    side="left" 
                    className="w-full"
                  >
                    <div 
                      className="amigos-row"
                      onClick={() => navigate(`/messages/${f.otherUserId}`)}
                    >
                      <div className="av">
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shrink-0">
                          {f.avatar_url ? (
                            <img src={f.avatar_url} alt={f.name || f.username} className="w-full h-full aspect-square rounded-full object-cover shrink-0" />
                          ) : (
                            <span>{f.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <i className={`st ${fStatusClass}`} />
                      </div>
                      <div className="t">
                        <b>@{f.username}</b>
                        <small>
                          {f.spotify_activity?.isPlaying && f.show_spotify_activity !== false ? (
                            `Ouvindo ${f.spotify_activity.trackName}`
                          ) : fStatus === 'dnd' ? (
                            'Ocupado'
                          ) : fStatus === 'idle' ? (
                            'Ausente'
                          ) : (
                            'Online'
                          )}
                        </small>
                      </div>
                    </div>
                  </UserProfileHoverCard>
                )
              })}
            </div>
          )}
        </section>

      </aside>

      {/* Modal Adicionar Amigo */}
      <AddFriendModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        currentUser={user} 
      />

      {/* Modal de Confirmação */}
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
          if (confirmModalConfig.targetId) {
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
          <div className="bg-[var(--amigos-card-2)] border border-[var(--amigos-line)] text-[var(--amigos-text)] px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[var(--amigos-accent)]" />
            <span className="text-[13px] font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  )
}
