import { useState, useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { PrivacyService } from "../../lib/services/PrivacyService"
import { UserProfileHoverCard } from "../../components/shared/UserProfileHoverCard"
import { getUserSubtitle } from "../../lib/utils/userSubtitle"

type TabType = 'received' | 'sent'

interface RequestRelation {
  id: string
  otherUserId: string
  name: string
  username: string
  title?: string
  avatar_url?: string
  status?: string
  created_at: string
  isSender: boolean
  profile?: any
}

interface SuggestionProfile {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  title?: string
  [key: string]: any
}

export function Requests() {
  const { user } = useOutletContext<{ user: any }>()
  const navigate = useNavigate()
  const { showToast, refreshPendingRequests } = useNotification()
  
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const [requests, setRequests] = useState<RequestRelation[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionProfile[]>([])
  const [sentSuggestionIds, setSentSuggestionIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    if (!user) return
    const channel = supabase.channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchData()
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function fetchData() {
    if (!user) return
    setLoading(true)

    try {
      // 1. Busca todas as amizades e solicitações do usuário
      const { data: rels, error: relsErr } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      
      if (relsErr) throw relsErr

      if (rels) {
        const pendingList = rels.filter(r => r.status === 'pending')
        if (pendingList.length > 0) {
          const otherUserIds = pendingList.map(r => r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1)
          const { data: profs, error: profsErr } = await supabase
            .from('profiles')
            .select('*')
            .in('id', otherUserIds)
          
          if (profsErr) console.warn("Erro ao buscar perfis das solicitações:", profsErr)

          const formattedList: RequestRelation[] = pendingList.map(r => {
            const otherId = r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1
            const profile = profs?.find(p => p.id === otherId)
            const resolvedName = profile?.display_name || profile?.username || 'Usuário'
            const resolvedUsername = profile?.username || 'usuario'
            return {
              id: r.id, 
              otherUserId: otherId,
              name: resolvedName,
              username: resolvedUsername,
              title: getUserSubtitle(profile, 'Membro Alura'),
              avatar_url: profile?.avatar_url,
              status: profile?.activity_status_visible === false ? 'offline' : (profile?.status || 'offline'),
              created_at: r.created_at,
              isSender: r.user_id_1 === user.id,
              profile
            }
          })
          setRequests(formattedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        } else {
          setRequests([])
        }

        // 2. Busca sugestões para você (perfis sem solicitação nem amizade)
        const existingIds = [user.id, ...rels.map(r => r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1)]
        const { data: suggestData, error: suggestErr } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${existingIds.join(',')})`)
          .limit(8)
        
        if (suggestErr) console.warn("Erro ao buscar sugestões:", suggestErr)

        if (suggestData) {
          setSuggestions(suggestData)
        }
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (otherId: string) => { 
    try {
      await supabase.from('friendships').update({ status: 'accepted' }).match({ user_id_1: otherId, user_id_2: user.id })
      showToast({
        type: "success",
        title: "Amizade Aceita",
        message: "Vocês agora são amigos na Alura!"
      })
      refreshPendingRequests?.()
      fetchData()
    } catch {
      showToast({
        type: "error",
        title: "Erro",
        message: "Não foi possível aceitar a solicitação."
      })
    }
  }

  const handleDecline = async (otherId: string) => { 
    try {
      await supabase.from('friendships').delete().match({ user_id_1: otherId, user_id_2: user.id })
      showToast({
        type: "info",
        title: "Solicitação Recusada",
        message: "A solicitação foi removida."
      })
      refreshPendingRequests?.()
      fetchData()
    } catch {
      showToast({
        type: "error",
        title: "Erro",
        message: "Não foi possível recusar a solicitação."
      })
    }
  }

  const handleCancel = async (otherId: string) => { 
    try {
      await supabase.from('friendships').delete().match({ user_id_1: user.id, user_id_2: otherId })
      showToast({
        type: "info",
        title: "Solicitação Cancelada",
        message: "O pedido de amizade foi cancelado."
      })
      refreshPendingRequests?.()
      fetchData()
    } catch {
      showToast({
        type: "error",
        title: "Erro",
        message: "Não foi possível cancelar o pedido."
      })
    }
  }

  const handleSendSuggestion = async (targetId: string) => {
    if (!user) return
    const check = await PrivacyService.checkCanSendFriendRequest(user.id, targetId)
    if (!check.allowed) {
      showToast({
        type: "warning",
        title: "Solicitação Não Permitida",
        message: check.reason || "Este usuário não aceita solicitações no momento."
      })
      return
    }

    try {
      await supabase.from('friendships').insert({ user_id_1: user.id, user_id_2: targetId, status: 'pending' })
      setSentSuggestionIds(prev => new Set(prev).add(targetId))
      showToast({
        type: "success",
        title: "Solicitação Enviada",
        message: "Pedido de amizade enviado."
      })
      fetchData()
    } catch (e: any) {
      showToast({
        type: "error",
        title: "Erro",
        message: e.message || "Erro ao enviar pedido."
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000)
    if (diff < 1) return `agora mesmo`
    if (diff < 60) return `há ${diff} min`
    if (diff < 1440) return `há ${Math.floor(diff / 60)} h`
    if (diff < 2880) return `ontem`
    return `há ${Math.floor(diff / 1440)} dias`
  }

  const receivedRequests = requests.filter(r => !r.isSender)
  const sentRequests = requests.filter(r => r.isSender)

  const visibleList = activeTab === 'received' ? receivedRequests : sentRequests

  const emptyTexts = {
    received: {
      title: "Nenhuma solicitação recebida",
      desc: "Quando alguém quiser ser seu amigo, aparece aqui."
    },
    sent: {
      title: "Nenhuma solicitação enviada",
      desc: "Use as sugestões ao lado ou a tela de Amigos para convidar alguém."
    }
  }

  return (
    <div className="flex w-full h-full text-[var(--text)] bg-[var(--bg)] overflow-hidden">
      
      {/* Coluna Central / Principal (fiel a alura-solicitacoes.html) */}
      <section className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="solic-page custom-scrollbar">
          <div className="solic-col">
            
            {/* Cabeçalho */}
            <div className="solic-head">
              <h1>Solicitações</h1>
              <p>Pessoas que querem adicionar você como amigo.</p>
            </div>

            {/* Abas */}
            <div className="solic-tabs" role="tablist">
              <button 
                type="button"
                className="solic-tab" 
                role="tab" 
                aria-selected={activeTab === 'received'} 
                onClick={() => setActiveTab('received')}
              >
                <span>Recebidas</span>
                <small>{receivedRequests.length}</small>
              </button>
              <button 
                type="button"
                className="solic-tab" 
                role="tab" 
                aria-selected={activeTab === 'sent'} 
                onClick={() => setActiveTab('sent')}
              >
                <span>Enviadas</span>
                <small>{sentRequests.length}</small>
              </button>
            </div>

            {/* Lista de Solicitações ou Estado Vazio */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[var(--muted)]">
                <div className="w-9 h-9 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin" />
              </div>
            ) : visibleList.length === 0 ? (
              <div className="solic-empty">
                <svg 
                  className="w-9 h-9 mx-auto mb-2.5 opacity-60 text-[var(--muted)]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="8" r="3.5" />
                  <path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M19 8v6M16 11h6" />
                </svg>
                <b>{emptyTexts[activeTab].title}</b>
                <span>{emptyTexts[activeTab].desc}</span>
              </div>
            ) : (
              <div id="list" className="flex flex-col gap-1">
                {visibleList.map((req) => {
                  const displayName = req.name && req.name !== 'Usuário' ? req.name : (req.username ? `@${req.username}` : "Usuário")
                  const initials = (req.name || req.username || "U").substring(0, 2).toUpperCase()
                  const note = formatTimeAgo(req.created_at)
                  const stClass = req.status === 'online' ? 'on' : req.status === 'dnd' ? 'dnd' : req.status === 'away' ? 'away' : 'off'

                  return (
                    <div key={req.id} className="solic-req group">
                      
                      {/* Avatar e Dados do Usuário */}
                      <UserProfileHoverCard 
                        userId={req.otherUserId} 
                        profile={req.profile}
                        side="right" 
                        className="flex items-center gap-3.5 flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer">
                          <div className="av">
                            {req.avatar_url ? (
                              <img 
                                src={req.avatar_url} 
                                alt={displayName} 
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                            <i className={`st ${stClass}`} />
                          </div>

                          <div className="t">
                            <b className="group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5 flex-wrap">
                              {req.name && req.name !== req.username && req.name !== 'Usuário' ? (
                                <>
                                  <span className="truncate">{req.name}</span>
                                  <span className="text-[12px] font-normal text-[var(--muted)]">@{req.username}</span>
                                </>
                              ) : (
                                <span>@{req.username}</span>
                              )}
                            </b>
                            <small>{note}</small>
                          </div>
                        </div>
                      </UserProfileHoverCard>

                      {/* Botões de Ação */}
                      <div className="acts" onClick={(e) => e.stopPropagation()}>
                        {activeTab === 'received' ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => handleAccept(req.otherUserId)}
                              className="solic-btn"
                            >
                              Aceitar
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDecline(req.otherUserId)}
                              className="solic-btn sec"
                            >
                              Recusar
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => handleCancel(req.otherUserId)}
                            className="solic-btn sec"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Coluna Direita (Sugestões para você - fiel a alura-solicitacoes.html) */}
      <aside className="solic-right custom-scrollbar">
        <section>
          <h2>
            <span>Sugestões para você</span>
            <button 
              type="button"
              onClick={() => navigate('/friends')}
            >
              Ver todos
            </button>
          </h2>

          <div className="flex flex-col gap-1">
            {suggestions.length === 0 ? (
              <p className="text-[13px] text-[var(--muted)] p-2 italic">
                Nenhuma sugestão no momento.
              </p>
            ) : (
              suggestions.map((sug) => {
                const isSent = sentSuggestionIds.has(sug.id)
                const sugDisplayName = sug.display_name || sug.username || "Usuário"
                const sugInitials = sugDisplayName.substring(0, 2).toUpperCase()
                const subtitle = getUserSubtitle(sug, 'Membro Alura')

                return (
                  <div key={sug.id} className="solic-row">
                    <UserProfileHoverCard 
                      userId={sug.id} 
                      profile={sug}
                      side="left" 
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <div className="av">
                          {sug.avatar_url ? (
                            <img 
                              src={sug.avatar_url} 
                              alt={sug.username} 
                            />
                          ) : (
                            <span>{sugInitials}</span>
                          )}
                        </div>
                        <div className="t">
                          <b className="hover:text-[var(--accent)] transition-colors flex items-center gap-1 flex-wrap">
                            {sug.display_name && sug.display_name !== sug.username ? (
                              <>
                                <span className="truncate">{sug.display_name}</span>
                                <span className="text-[11px] font-normal text-[var(--muted)] shrink-0">@{sug.username}</span>
                              </>
                            ) : (
                              <span>@{sug.username}</span>
                            )}
                          </b>
                          <small>{subtitle}</small>
                        </div>
                      </div>
                    </UserProfileHoverCard>
                    <button
                      type="button"
                      disabled={isSent}
                      onClick={() => handleSendSuggestion(sug.id)}
                      className="solic-add"
                    >
                      {isSent ? 'Enviada' : 'Adicionar'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </aside>

    </div>
  )
}
