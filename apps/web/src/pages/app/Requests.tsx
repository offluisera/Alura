import { useState, useEffect } from "react"
import { UserPlus, Check, X, Users, MessageSquare } from "lucide-react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { PrivacyService } from "../../lib/services/PrivacyService"
import logoUrl from "../../../public/logo-sombra.png"

type TabType = 'novas' | 'enviadas'

interface RequestRelation {
  id: string
  otherUserId: string
  name: string
  username: string
  title?: string
  avatar_url?: string
  created_at: string
  message?: string
  isSender: boolean
}

export function Requests() {
  const { user } = useOutletContext<{ user: any }>()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<TabType>('novas')
  const [requests, setRequests] = useState<RequestRelation[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [totalFriends, setTotalFriends] = useState(0)
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

    // Buscar todas as amizades e solicitações do usuário
    const { data: rels } = await supabase.from('friendships').select('*').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    
    if (rels) {
      const friendsList = rels.filter(r => r.status === 'accepted')
      setTotalFriends(friendsList.length)

      const pendingList = rels.filter(r => r.status === 'pending')
      if (pendingList.length > 0) {
        const otherUserIds = pendingList.map(r => r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1)
        const { data: profs } = await supabase.from('profiles').select('*').in('id', otherUserIds)
        
        const formattedList = pendingList.map(r => {
          const otherId = r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1
          const profile = profs?.find(p => p.id === otherId)
          return {
             id: r.id, 
             otherUserId: otherId,
             name: profile?.full_name || 'Usuário',
             username: profile?.username || 'usuario',
             title: profile?.title,
             avatar_url: profile?.avatar_url,
             created_at: r.created_at,
             isSender: r.user_id_1 === user.id,
             // Mensagem fictícia/mock caso não exista no DB para manter fidelidade
             message: profile?.title === 'Desenvolvedor Frontend' ? '"Olá! Adorei seu perfil e gostaria de te adicionar!"' : 
                      profile?.title === 'Designer UI/UX' ? '"Oi! Vi seu trabalho e achei incrível. Vamos trocar uma ideia?"' : 
                      profile?.title === 'Full Stack Developer' ? '"Olá! Gostaria de fazer parte da sua rede. :)"' : undefined
          }
        })
        setRequests(formattedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      } else {
        setRequests([])
      }

      // Sugestões (Pessoas que não são amigos e não têm solicitação pendente)
      const existingUserIds = [user.id, ...rels.map(r => r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1)]
      const { data: suggestData } = await supabase.from('profiles')
        .select('*')
        .not('id', 'in', `(${existingUserIds.join(',')})`)
        .limit(4)
      
      if(suggestData) {
        setSuggestions(suggestData)
      }
    }
    setLoading(false)
  }

  const handleAccept = async (otherId: string) => { 
    await supabase.from('friendships').update({ status: 'accepted' }).match({ user_id_1: otherId, user_id_2: user.id })
    fetchData() 
  }
  const handleDecline = async (otherId: string) => { 
    await supabase.from('friendships').delete().match({ user_id_1: otherId, user_id_2: user.id })
    fetchData() 
  }
  const handleCancel = async (otherId: string) => { 
    await supabase.from('friendships').delete().match({ user_id_1: user.id, user_id_2: otherId })
    fetchData() 
  }
  const { showToast } = useNotification()

  const handleSendRequest = async (otherId: string) => {
    if (!user) return
    const check = await PrivacyService.checkCanSendFriendRequest(user.id, otherId)
    if (!check.allowed) {
      showToast({
        type: "warning",
        title: "Solicitação Não Permitida",
        message: check.reason || "Este usuário não aceita solicitações de amizade no momento."
      })
      return
    }

    try {
      await supabase.from('friendships').insert({ user_id_1: user.id, user_id_2: otherId, status: 'pending' })
      showToast({
        type: "success",
        title: "Solicitação Enviada",
        message: "Pedido de amizade enviado com sucesso."
      })
      fetchData()
    } catch (e: any) {
      showToast({
        type: "error",
        title: "Erro",
        message: e.message || "Erro ao enviar solicitação."
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000)
    if (diff < 60) return `há ${Math.max(1, diff)} min`
    if (diff < 1440) return `há ${Math.floor(diff / 60)} h`
    if (diff < 2880) return `ontem`
    return `há ${Math.floor(diff / 1440)} dias`
  }

  const receivedRequests = requests.filter(r => !r.isSender)
  const sentRequests = requests.filter(r => r.isSender)

  const visibleList = activeTab === 'novas' ? receivedRequests : sentRequests

  return (
    <div className="flex w-full h-full text-alura-textPrimary bg-alura-background">
      
      {/* Coluna Principal (Esquerda) */}
      <div className="flex-1 flex flex-col min-w-0 p-6 pr-0">
        <div className="flex-1 flex flex-col border border-alura-border rounded-[16px] overflow-hidden bg-alura-surface1">
          <div className="p-8 pb-4">
            <div className="flex items-start gap-4 mb-6">
              <UserPlus className="w-10 h-10 text-alura-accent mt-1" strokeWidth={1.5} />
              <div>
                <h1 className="text-[36px] font-bold text-alura-textPrimary leading-none mb-3">Solicitações</h1>
                <p className="text-alura-textMuted text-[15px]">Pessoas que querem adicionar você como amigo.</p>
              </div>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('novas')}
                className={`flex items-center gap-2 px-6 py-2 rounded-[8px] text-[13px] font-bold transition-all border ${activeTab === 'novas' ? 'bg-alura-accent text-[#0B0D0F] border-alura-accent' : 'bg-transparent text-alura-textMuted hover:text-white border-alura-border'}`}
              >
                Novas ({receivedRequests.length})
              </button>
              <button 
                onClick={() => setActiveTab('enviadas')}
                className={`flex items-center gap-2 px-6 py-2 rounded-[8px] text-[13px] font-bold transition-all border ${activeTab === 'enviadas' ? 'bg-alura-accent text-[#0B0D0F] border-alura-accent' : 'bg-transparent text-alura-textMuted hover:text-white border-alura-border'}`}
              >
                Enviadas ({sentRequests.length})
              </button>
            </div>
          </div>

          {/* Lista de Solicitações */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-40 text-alura-textMuted">
                  <div className="w-10 h-10 rounded-full border-4 border-alura-border border-t-alura-accent animate-spin" />
               </div>
            ) : visibleList.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-alura-textMuted border border-dashed border-alura-border rounded-[14px]">
                  <p className="text-sm">{activeTab === 'novas' ? 'Nenhuma solicitação recebida.' : 'Nenhuma solicitação enviada.'}</p>
               </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleList.map((req, i) => (
                  <div key={req.id} className="group relative flex items-start justify-between p-[18px] rounded-[14px] bg-alura-surface2 border border-alura-border hover:bg-alura-hover transition-all">
                    
                    <div className="flex items-start gap-4 flex-1 overflow-hidden">
                      <div className="relative shrink-0">
                        <Avatar className="w-[68px] h-[68px] rounded-full">
                          {req.avatar_url ? (
                            <img src={req.avatar_url} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-alura-surface2 text-alura-textSecondary font-semibold text-lg">{req.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <div className="flex flex-col justify-center overflow-hidden w-full pt-1">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-[15px] text-alura-textPrimary truncate">@{req.username}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-alura-textDisabled"></div>
                              <span className="text-[12px] font-medium text-alura-textMuted">Offline</span>
                           </div>
                           <span className="text-[12px] text-alura-textMuted">{formatTimeAgo(req.created_at)}</span>
                        </div>
                        
                        <span className="text-[13px] text-alura-textMuted mt-0.5 truncate">
                          {req.title || 'Cargo não informado'}
                        </span>
                        
                        {/* Mock de Amigos em Comum para fidelidade */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-alura-textSecondary text-[12px]">
                           <Users className="w-3.5 h-3.5" />
                           <span>{(i * 3 + 2)} amigos em comum</span>
                        </div>

                        {req.message && (
                           <p className="text-[13px] text-alura-textPrimary mt-3 italic">
                             {req.message}
                           </p>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-[18px] bottom-[18px] flex items-center gap-3 shrink-0">
                      {!req.isSender ? (
                         <>
                           <button 
                             onClick={() => handleAccept(req.otherUserId)}
                             className="px-5 h-9 flex items-center justify-center rounded-[8px] bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentBright font-bold text-[13px] transition-colors gap-1.5 shadow-sm"
                           >
                             <Check className="w-4 h-4" strokeWidth={3} /> Aceitar
                           </button>
                           <button 
                             onClick={() => handleDecline(req.otherUserId)}
                             className="px-4 h-9 flex items-center justify-center rounded-[8px] bg-transparent border border-alura-border text-alura-textPrimary hover:bg-alura-hover font-medium text-[13px] transition-colors gap-1.5 shadow-sm"
                           >
                             <X className="w-4 h-4" /> Recusar
                           </button>
                         </>
                      ) : (
                         <button 
                           onClick={() => handleCancel(req.otherUserId)}
                           className="px-4 h-9 flex items-center justify-center rounded-[8px] bg-transparent border border-alura-border text-alura-textPrimary hover:bg-alura-hover hover:text-alura-danger hover:border-alura-danger font-medium text-[13px] transition-colors gap-1.5 shadow-sm"
                         >
                           <X className="w-4 h-4" /> Cancelar
                         </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coluna Contextual (Direita - Sidebar) */}
      <div className="w-[360px] bg-alura-background flex flex-col shrink-0 overflow-hidden relative border-l border-transparent">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Card Institucional */}
          <div className="relative bg-alura-surface1 border border-alura-border rounded-[16px] overflow-hidden p-6 mt-4">
             {/* Fundo Gradiente Temático */}
             <div 
                className="absolute inset-0 z-0 opacity-40 transition-all duration-500"
                style={{ background: "var(--theme-hero-bg)" }}
             ></div>
             
             <div className="absolute bottom-0 right-0 w-40 h-40 bg-alura-accent opacity-10 blur-[80px] rounded-full pointer-events-none z-0"></div>
             
             <div className="relative z-10 flex flex-col items-start">
               <div className="flex items-start gap-4 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <img src={logoUrl} alt="Alura" className="w-8 h-8 object-contain transition-all duration-300" style={{ filter: "var(--theme-logo-filter)" }} />
                  </div>
                 <h4 className="text-[14px] font-bold text-alura-textPrimary leading-tight">
                    Conecte-se.<br/>Compartilhe. Evolua.
                 </h4>
               </div>
               <p className="text-[12px] text-alura-textMuted leading-relaxed mb-4 pl-12">
                 Adicione amigos para trocar ideias, participar de comunidades e crescer juntos.
               </p>
             </div>
          </div>

          {/* Progresso Social */}
          <div className="bg-alura-surface1 border border-alura-border rounded-[16px] p-5">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-alura-accent rounded-full"></div>
                <h3 className="text-[14px] font-bold text-alura-textPrimary">Seu progresso social</h3>
             </div>
             
             <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex flex-col items-center gap-1">
                   <div className="flex items-center gap-2 text-alura-accent">
                      <Users className="w-4 h-4" />
                      <span className="text-[18px] font-bold">{totalFriends}</span>
                   </div>
                   <span className="text-[11px] text-alura-textMuted">Amigos</span>
                </div>
                
                <div className="w-px h-10 bg-alura-border"></div>

                <div className="flex flex-col items-center gap-1">
                   <div className="flex items-center gap-2 text-alura-accent">
                      <UserPlus className="w-4 h-4" />
                      <span className="text-[18px] font-bold">{receivedRequests.length + sentRequests.length}</span>
                   </div>
                   <span className="text-[11px] text-alura-textMuted">Solicitações</span>
                </div>

                <div className="w-px h-10 bg-alura-border"></div>

                <div className="flex flex-col items-center gap-1">
                   <div className="flex items-center gap-2 text-alura-textMuted">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[18px] font-bold">0</span>
                   </div>
                   <span className="text-[11px] text-alura-textMuted">Mensagens</span>
                </div>
             </div>
          </div>

          {/* Sugestões para você */}
          <div className="bg-alura-surface1 border border-alura-border rounded-[16px] overflow-hidden">
             <div className="px-5 py-4 flex items-center justify-between border-b border-alura-border/50">
                <h3 className="text-[14px] font-bold text-alura-textPrimary">Sugestões para você</h3>
                <button className="text-[12px] text-alura-accent hover:underline">Ver todos</button>
             </div>
             <div className="p-2">
                {suggestions.length === 0 ? (
                   <p className="text-[13px] text-alura-textMuted p-3 italic">Nenhuma sugestão.</p>
                ) : (
                   <div className="flex flex-col gap-1">
                      {suggestions.map(sug => (
                         <div key={sug.id} className="flex items-center justify-between p-3 rounded-[10px] hover:bg-alura-hover transition-colors">
                            <div className="flex items-center gap-3">
                               <Avatar className="w-[38px] h-[38px] border border-alura-border rounded-full">
                                  {sug.avatar_url ? (
                                    <img src={sug.avatar_url} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <AvatarFallback className="bg-alura-surface2 text-alura-textMuted text-xs font-bold">{sug.full_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                                  )}
                               </Avatar>
                               <div className="flex flex-col">
                                  <span className="text-[13px] font-bold text-alura-textPrimary truncate max-w-[100px]">@{sug.username}</span>
                                  <span className="text-[11px] text-alura-textMuted truncate max-w-[120px]">{sug.title || 'Usuário'}</span>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleSendRequest(sug.id)}
                              className="px-3 h-7 rounded-[6px] bg-transparent border border-alura-border text-alura-accent hover:text-[#0B0D0F] hover:bg-alura-accent text-[11px] font-bold transition-colors"
                            >
                              Adicionar
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
