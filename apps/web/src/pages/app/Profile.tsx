import { useState, useEffect } from "react"
import { useOutletContext, useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Button } from "@alura/ui"
import { 
  Edit, Mail, MapPin, Phone, Calendar, Code, Crown, Star, Plus, Check, 
  Link as LinkIcon, Github, Twitch, Youtube, Activity, MessageSquare, 
  Server, Users, User, Share2, Shield, Flame, Trophy, Lock, 
  Sparkles, ExternalLink, Gamepad2, Heart, Award
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { GAMES_DB } from "../onboarding/steps/StepGames"
import { HOBBIES_DB } from "../onboarding/steps/StepHobbies"
import { AVAILABLE_TAGS } from "../onboarding/steps/StepProfile"
import { PrivacyService } from "../../lib/services/PrivacyService"
import { SpotifyActivityCard, SpotifyIcon } from "../../components/shared/SpotifyActivityCard"
import { getActiveConnections, ConnectionIcon } from "../../components/shared/ConnectionIcons"

export function Profile() {
  const { user, profile: myProfile } = useOutletContext<any>()
  const { targetUserId } = useParams<{ targetUserId?: string }>()
  const navigate = useNavigate()
  const { showToast } = useNotification()
  
  const cleanTarget = targetUserId ? decodeURIComponent(targetUserId).trim() : undefined
  const isUuid = cleanTarget ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanTarget) : false
  const rawUsername = cleanTarget ? cleanTarget.replace(/^@/, '') : undefined

  const isOwnProfile = !cleanTarget || 
    cleanTarget === user?.id || 
    (myProfile?.username && rawUsername?.toLowerCase() === myProfile.username.toLowerCase())

  const [profile, setProfile] = useState<any>(isOwnProfile ? myProfile : null)
  const [loading, setLoading] = useState(!isOwnProfile)
  const [activeTab, setActiveTab] = useState<"Sobre" | "Jogos" | "Hobbies" | "Conquistas">("Sobre")
  
  // Estatísticas reais
  const [realFriendsCount, setRealFriendsCount] = useState(0)
  const [realPostsCount, setRealPostsCount] = useState(0)
  const [realServersCount, setRealServersCount] = useState(1)
  const [friendshipStatus, setFriendshipStatus] = useState<"none" | "pending" | "accepted" | "self">(isOwnProfile ? "self" : "none")
  const [copiedLink, setCopiedLink] = useState(false)

  // Carrega dados de perfil e escuta atualizações de atividade do Spotify em tempo real
  useEffect(() => {
    if (isOwnProfile) {
      let current = { ...myProfile }
      if (typeof window !== 'undefined' && user?.id) {
        const localAct = localStorage.getItem(`alura_spotify_act_${user.id}`)
        if (localAct) {
          try {
            current.spotify_activity = JSON.parse(localAct)
          } catch (e) {}
        }
      }
      setProfile(current)
      setLoading(false)
      // Se acessado diretamente via UUID e for o próprio perfil com username, ajusta URL para @username
      if (cleanTarget && isUuid && myProfile?.username) {
        navigate(`/profile/@${myProfile.username}`, { replace: true })
      }
    } else {
      async function fetchOtherProfile() {
        setLoading(true)
        try {
          let query = supabase.from('profiles').select('*')
          if (isUuid) {
            query = query.eq('id', cleanTarget)
          } else if (rawUsername) {
            query = query.ilike('username', rawUsername)
          }

          const { data, error } = await query.single()

          if (!error && data) {
            setProfile(data)
            // Se entrou com UUID mas o usuário possui username, atualiza a URL para @username
            if (isUuid && data.username) {
              navigate(`/profile/@${data.username}`, { replace: true })
            }
          } else {
            console.warn("Perfil não encontrado:", error)
            setProfile(null)
          }
        } catch (err) {
          console.error("Erro ao buscar perfil:", err)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
      fetchOtherProfile()
    }

    const resolvedId = isOwnProfile ? user?.id : profile?.id
    if (!resolvedId) return

    // Canal Realtime para receber atualizações do perfil (música, status)
    const channel = supabase.channel(`profile_music_${resolvedId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${resolvedId}`
        },
        (payload: any) => {
          if (payload.new) {
            setProfile((prev: any) => ({ ...prev, ...payload.new }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cleanTarget, myProfile, isOwnProfile, user?.id, isUuid, rawUsername])

  // Carrega estatísticas reais e relação de amizade
  useEffect(() => {
    const profileId = isOwnProfile ? user?.id : profile?.id
    if (!profileId) return

    async function loadStatsAndRelation() {
      // Amigos
      const { count: fCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`user_id_1.eq.${profileId},user_id_2.eq.${profileId}`)
      if (fCount !== null) setRealFriendsCount(fCount)

      // Posts no feed
      const { count: pCount } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
      if (pCount !== null) setRealPostsCount(pCount)

      // Servidores
      const { count: sCount } = await supabase
        .from('server_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
      if (sCount !== null && sCount > 0) setRealServersCount(sCount)

      // Se for perfil de terceiro, verifica se somos amigos
      if (!isOwnProfile && user && profileId) {
        const { data: rel } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${user.id})`)
          .maybeSingle()

        if (rel) {
          setFriendshipStatus(rel.status as any)
        } else {
          setFriendshipStatus("none")
        }
      }
    }

    loadStatsAndRelation()
  }, [profile?.id, isOwnProfile, user?.id])

  // Ação de adicionar amigo
  async function handleAddFriend() {
    const targetId = profile?.id
    if (!user || isOwnProfile || !targetId) return
    try {
      const check = await PrivacyService.checkCanSendFriendRequest(user.id, targetId, profile)
      if (!check.allowed) {
        showToast({
          type: "warning",
          title: "Solicitação Não Permitida",
          message: check.reason || "Este usuário não aceita pedidos de amizade no momento."
        })
        return
      }

      await supabase.from('friendships').insert({
        user_id_1: user.id,
        user_id_2: targetId,
        status: 'pending'
      })
      setFriendshipStatus('pending')
      showToast({
        type: "success",
        title: "Solicitação Enviada",
        message: `Pedido de amizade enviado para ${displayName}.`
      })
    } catch (err) {
      console.error("Erro ao adicionar amigo:", err)
      showToast({
        type: "error",
        title: "Erro",
        message: "Não foi possível enviar a solicitação de amizade."
      })
    }
  }

  // Copiar link do perfil com @username
  const handleShareProfile = () => {
    const handle = profile?.username ? `@${profile.username}` : (profile?.id || "")
    const shareUrl = `${window.location.origin}${window.location.pathname}#/profile/${handle}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    showToast({
      type: "success",
      title: "Link Copiado!",
      message: `Link do perfil (${handle}) copiado com sucesso.`
    })
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Enviar mensagem direta respeitando permissões de privacidade
  const handleOpenDM = async () => {
    const targetId = profile?.id
    if (!user || !targetId) return
    const dmCheck = await PrivacyService.checkCanSendDirectMessage(user.id, targetId, profile)
    if (!dmCheck.allowed) {
      showToast({
        type: "warning",
        title: "Mensagens Restritas",
        message: dmCheck.reason || "Este usuário não aceita mensagens diretas de não-amigos."
      })
      return
    }
    navigate(`/messages/${targetId}`)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alura-background text-alura-textMuted">
        <div className="w-8 h-8 border-3 border-alura-accent border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Carregando perfil...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alura-background text-center p-6">
        <Shield className="w-12 h-12 text-alura-textDisabled mb-3" />
        <h2 className="text-xl font-bold text-white mb-1">Perfil não encontrado</h2>
        <p className="text-sm text-alura-textMuted mb-6">Este usuário pode não existir ou ter alterado o identificador.</p>
        <Button onClick={() => navigate('/friends')} variant="outline" className="border-alura-border text-white">
          Voltar para Amigos
        </Button>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Usuário"
  const username = profile?.username ? `@${profile.username}` : "@usuario"
  const initials = displayName.substring(0, 2).toUpperCase()
  const bannerUrl = profile?.banner_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
  const avatarUrl = profile?.avatar_url
  
  // Format dates
  const birthDate = profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : "Não informado"
  
  const calculateAge = (dob?: string) => {
    if (!dob) return "Não informado"
    const diff_ms = Date.now() - new Date(dob).getTime()
    const age_dt = new Date(diff_ms) 
    return Math.abs(age_dt.getUTCFullYear() - 1970) + " anos"
  }
  const age = profile?.age ? `${profile.age} anos` : calculateAge(profile?.birth_date)

  const favoriteGames = profile?.favorite_games?.length > 0 
    ? profile.favorite_games 
    : ['cs2', 'gta5', 'rdr2']

  const favoriteGamesData = favoriteGames.map((id: string) => {
    const clean = String(id).toLowerCase()
    return GAMES_DB.find(g => g.id.toLowerCase() === clean || g.name.toLowerCase() === clean) || { 
      id, 
      name: id, 
      genre: "Jogo", 
      image: 'https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900.jpg' 
    }
  })

  const hobbiesList = profile?.hobbies?.length > 0 
    ? profile.hobbies 
    : ['dev', 'gym', 'music']

  const hobbiesData = hobbiesList.map((id: string) => {
    const clean = String(id).toLowerCase()
    return HOBBIES_DB.find(h => h.id.toLowerCase() === clean || h.name.toLowerCase() === clean) || { 
      id, 
      name: id, 
      category: "Interesse", 
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
      icon: Activity 
    }
  })

  const isStatusPublic = isOwnProfile || profile?.activity_status_visible !== false
  const effectiveStatus = isStatusPublic ? (profile?.status || 'offline') : 'offline'

  const statusBgColor = effectiveStatus === 'dnd' ? 'bg-alura-danger' : 
                      effectiveStatus === 'idle' ? 'bg-[#F5A623]' : 
                      effectiveStatus === 'offline' ? 'bg-alura-textDisabled' : 
                      'bg-alura-success'

  const statusTextColor = effectiveStatus === 'dnd' ? 'text-alura-danger' : 
                      effectiveStatus === 'idle' ? 'text-[#F5A623]' : 
                      effectiveStatus === 'offline' ? 'text-alura-textDisabled' : 
                      'text-alura-success'

  const statusLabel = effectiveStatus === 'dnd' ? 'Não perturbe' : 
                      effectiveStatus === 'idle' ? 'Ausente' : 
                      effectiveStatus === 'offline' ? 'Invisível' : 
                      'Online'

  // Conquistas com cálculo dinâmico de desbloqueio
  const ACHIEVEMENTS = [
    {
      id: "founder",
      title: "Membro Fundador",
      desc: "Um dos pioneiros a construir a comunidade Alura.",
      icon: Crown,
      unlocked: true,
      color: "text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/30"
    },
    {
      id: "beta",
      title: "Beta Tester",
      desc: "Participando ativamente da fase beta da plataforma.",
      icon: Code,
      unlocked: true,
      color: "text-alura-accent bg-alura-accent/10 border-alura-accent/30"
    },
    {
      id: "voice",
      title: "Voz da Comunidade",
      desc: "Publicou publicações ativas no feed social.",
      icon: MessageSquare,
      unlocked: realPostsCount > 0,
      color: "text-[#4facfe] bg-[#4facfe]/10 border-[#4facfe]/30"
    },
    {
      id: "social",
      title: "Socializador",
      desc: "Adicionou amigos e formou laços na comunidade.",
      icon: Users,
      unlocked: realFriendsCount > 0,
      color: "text-[#43e97b] bg-[#43e97b]/10 border-[#43e97b]/30"
    },
    {
      id: "legendary",
      title: "Perfil Lendário",
      desc: "Personalizou biografia, foto de perfil e jogos favoritos.",
      icon: Sparkles,
      unlocked: Boolean(profile?.bio && profile?.avatar_url && favoriteGames.length > 0),
      color: "text-[#ff0844] bg-[#ff0844]/10 border-[#ff0844]/30"
    }
  ]

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-alura-background">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[1400px] mx-auto p-6 lg:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pb-10">
            
            {/* Esquerda e Centro (Banner + Abas) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Top Banner & Info Section */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-alura-border bg-alura-surface1 shadow-xl">
                
                {/* Banner Image */}
                <div className="h-52 md:h-64 w-full relative">
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-alura-surface1 via-black/20 to-transparent"></div>
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/settings')}
                      className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-alura-accent" /> Alterar capa
                    </button>
                  )}
                </div>
                
                {/* Profile Info Overlay */}
                <div className="px-8 pb-8 relative -mt-16 flex flex-col md:flex-row items-end md:items-start justify-between gap-6">
                  
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                    <div className="relative shrink-0">
                      <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-alura-surface1 shadow-2xl">
                        {avatarUrl ? (
                          <img src={avatarUrl} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-alura-surface2 text-alura-accent text-4xl font-bold">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-alura-surface1 rounded-full ${statusBgColor}`}></div>
                    </div>

                    <div className="flex flex-col text-center md:text-left mb-1">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{displayName}</h1>
                        <div className="bg-alura-accent/20 text-alura-accent p-1 rounded-full"><Check className="w-3.5 h-3.5" /></div>
                      </div>
                      <span className="text-alura-textSecondary text-sm font-medium mt-0.5">{username}</span>
                      
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${statusBgColor} ${profile?.status !== 'offline' ? 'animate-pulse' : ''}`}></div>
                        <span className={`${statusTextColor} text-xs font-semibold`}>{statusLabel}</span>
                      </div>
                      
                      <p className="mt-3 max-w-md text-alura-textPrimary text-sm leading-relaxed">
                        {profile?.bio || "Nenhuma biografia definida ainda."}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Perfil */}
                  <div className="flex gap-2.5 mb-2 shrink-0">
                    {isOwnProfile ? (
                      <>
                        <Button 
                          onClick={() => navigate('/settings')}
                          className="flex items-center gap-2 bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-10 px-5 rounded-xl shadow-[0_0_15px_rgba(57,255,136,0.2)]"
                        >
                          <Edit className="w-4 h-4" /> Editar Perfil
                        </Button>
                        <Button 
                          onClick={handleShareProfile}
                          variant="outline"
                          className="border-alura-border hover:border-alura-accent text-alura-textSecondary hover:text-white bg-alura-surface2/80 h-10 px-3.5 rounded-xl"
                          title="Compartilhar Perfil"
                        >
                          <Share2 className="w-4 h-4" />
                          {copiedLink && <span className="text-[11px] text-alura-accent ml-1.5">Copiado!</span>}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleOpenDM}
                          className="flex items-center gap-2 bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-10 px-5 rounded-xl shadow-[0_0_15px_rgba(57,255,136,0.2)] cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" /> Enviar Mensagem
                        </Button>

                        {friendshipStatus === "none" && (
                          <Button 
                            onClick={handleAddFriend}
                            variant="outline"
                            className="border-alura-border hover:border-alura-accent text-alura-textSecondary hover:text-white bg-alura-surface2 h-10 px-4 rounded-xl text-xs font-semibold"
                          >
                            <Plus className="w-4 h-4 mr-1.5" /> Adicionar Amigo
                          </Button>
                        )}
                        {friendshipStatus === "pending" && (
                          <span className="h-10 px-4 rounded-xl bg-alura-surface2 border border-alura-border text-alura-textMuted text-xs flex items-center font-medium">
                            Solicitação Enviada
                          </span>
                        )}
                        {friendshipStatus === "accepted" && (
                          <span className="h-10 px-4 rounded-xl bg-alura-selected border border-alura-accent/30 text-alura-accent text-xs flex items-center font-bold">
                            <Check className="w-3.5 h-3.5 mr-1" /> Amigos
                          </span>
                        )}
                      </>
                    )}
                  </div>

                </div>

                {/* Navegação de Abas do Perfil */}
                <div className="flex border-t border-alura-border/60 px-8 bg-alura-surface2/30">
                  {(["Sobre", "Jogos", "Hobbies", "Conquistas"] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                        activeTab === tab 
                          ? 'text-alura-accent border-alura-accent bg-alura-accent/5 font-bold shadow-[inset_0_-2px_10px_rgba(57,255,136,0.1)]' 
                          : 'text-alura-textSecondary border-transparent hover:text-white hover:bg-alura-surface1'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

              </div>

              {/* ABA 1: SOBRE */}
              {activeTab === "Sobre" && (
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-6 w-full">
                  
                  {/* Coluna Esquerda: Informações Pessoais */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/80 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-6 text-alura-accent">
                        <User className="w-5 h-5" />
                        <h2 className="font-semibold text-[15px]">Informações Pessoais</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3 text-alura-textSecondary">
                            <Calendar className="w-4 h-4" /> Idade
                          </div>
                          <span className="text-white font-medium">{age}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3 text-alura-textSecondary">
                            <Calendar className="w-4 h-4" /> Nascimento
                          </div>
                          <span className="text-white font-medium">{birthDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3 text-alura-textSecondary">
                            <Phone className="w-4 h-4" /> Telefone
                          </div>
                          <span className="text-white font-medium">{profile?.phone || "Não informado"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3 text-alura-textSecondary">
                            <MapPin className="w-4 h-4" /> Cidade
                          </div>
                          <span className="text-white font-medium">{profile?.city || "Brasil"}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-alura-border/50">
                        <div className="flex items-center gap-2 mb-4 text-alura-accent">
                          <Mail className="w-4 h-4" />
                          <h2 className="font-semibold text-[15px]">Conta & Membresia</h2>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-alura-textMuted" />
                            <span className="text-alura-textSecondary truncate">{profile?.email || user?.email || "email@alura.com"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-alura-textMuted" />
                            <span className="text-alura-textSecondary">
                              Membro desde {new Date(profile?.created_at || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-alura-border/50">
                        <span className="text-xs font-bold text-alura-textMuted uppercase tracking-wider block mb-3">Tags & Interesses</span>
                        <div className="flex flex-wrap gap-2">
                          {(profile?.tags && profile.tags.length > 0 ? profile.tags : ["gamer", "programmer"]).map((tagId: string, i: number) => {
                            const found = AVAILABLE_TAGS.find(t => t.id === tagId)
                            return (
                              <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-alura-surface2 text-alura-accent border border-alura-accent/20">
                                #{found ? found.label : tagId}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Central: Jogos e Hobbies Prévias */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Jogos Favoritos Preview */}
                    <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-alura-accent">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-alura-accent/15"><Gamepad2 className="w-4 h-4" /></div>
                          <h2 className="font-semibold text-[15px]">Jogos Favoritos</h2>
                        </div>
                        <button 
                          onClick={() => setActiveTab("Jogos")}
                          className="text-xs font-semibold text-alura-textSecondary hover:text-alura-accent transition-colors cursor-pointer"
                        >
                          Ver todos ({favoriteGamesData.length})
                        </button>
                      </div>
                      
                      {!isStatusPublic ? (
                        <div className="py-6 px-4 rounded-xl border border-alura-border/60 bg-alura-surface2/50 text-center flex flex-col items-center justify-center">
                          <Lock className="w-5 h-5 text-alura-textMuted mb-2" />
                          <p className="text-xs text-alura-textMuted font-medium">Status de atividade oculto pelas configurações de privacidade do usuário.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {favoriteGamesData.slice(0, 4).map((game: any, i: number) => (
                            <div key={i} className="relative h-24 rounded-xl overflow-hidden group cursor-pointer border border-alura-border/60 hover:border-alura-accent/50 transition-colors">
                              <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                              <div className="absolute bottom-2 left-3 right-3">
                                <span className="text-white font-semibold text-xs truncate block">{game.name}</span>
                                <span className="text-[10px] text-alura-accent font-medium">{game.genre || "Game"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hobbies Preview */}
                    <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-alura-accent">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-alura-accent/15"><Activity className="w-4 h-4" /></div>
                          <h2 className="font-semibold text-[15px]">Hobbies & Passatempos</h2>
                        </div>
                        <button 
                          onClick={() => setActiveTab("Hobbies")}
                          className="text-xs font-semibold text-alura-textSecondary hover:text-alura-accent transition-colors cursor-pointer"
                        >
                          Ver todos ({hobbiesData.length})
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {hobbiesData.slice(0, 4).map((hobby: any, i: number) => (
                          <div key={i} className="relative h-24 rounded-xl overflow-hidden group cursor-pointer border border-alura-border/60 hover:border-alura-accent/50 transition-colors">
                            <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                            <div className="absolute bottom-2 left-3 right-3">
                              <span className="text-white font-semibold text-xs truncate block">{hobby.name}</span>
                              <span className="text-[10px] text-alura-textMuted font-medium">{hobby.category || "Hobby"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ABA 2: JOGOS (GALERIA COMPLETA) */}
              {activeTab === "Jogos" && (
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Biblioteca de Jogos Favoritos</h2>
                      <p className="text-xs text-alura-textMuted mt-0.5">Títulos que fazem parte da rotina gamer de {displayName}.</p>
                    </div>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => navigate('/settings')}
                        variant="outline"
                        className="text-xs border-alura-border text-alura-textSecondary hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5 text-alura-accent" /> Gerenciar Jogos
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {favoriteGamesData.map((game: any, i: number) => (
                      <div 
                        key={i} 
                        className="group relative rounded-xl overflow-hidden border border-alura-border bg-alura-surface2 flex flex-col hover:border-alura-accent/50 transition-all hover:shadow-[0_0_20px_rgba(57,255,136,0.15)]"
                      >
                        <div className="h-44 w-full overflow-hidden relative">
                          <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-alura-surface2 via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="p-3.5 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-xs font-bold text-white block truncate">{game.name}</span>
                            <span className="text-[10px] text-alura-accent font-semibold">{game.genre || "Gamer"}</span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-alura-border/40 flex items-center justify-between text-[11px] text-alura-textMuted">
                            <span>Na biblioteca</span>
                            <Check className="w-3.5 h-3.5 text-alura-success" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: HOBBIES (COMPLETA) */}
              {activeTab === "Hobbies" && (
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Hobbies & Interesses</h2>
                      <p className="text-xs text-alura-textMuted mt-0.5">Atividades, esportes e projetos que movem {displayName}.</p>
                    </div>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => navigate('/settings')}
                        variant="outline"
                        className="text-xs border-alura-border text-alura-textSecondary hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5 text-alura-accent" /> Gerenciar Hobbies
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hobbiesData.map((hobby: any, i: number) => (
                      <div 
                        key={i} 
                        className="group relative rounded-xl overflow-hidden border border-alura-border bg-alura-surface2 flex flex-col hover:border-alura-accent/50 transition-all hover:shadow-[0_0_20px_rgba(57,255,136,0.15)]"
                      >
                        <div className="h-44 w-full overflow-hidden relative">
                          <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-alura-surface2 via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="p-3.5 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-xs font-bold text-white block truncate">{hobby.name}</span>
                            <span className="text-[10px] text-alura-textMuted font-semibold">{hobby.category || "Interesse"}</span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-alura-border/40 flex items-center justify-between text-[11px] text-alura-textMuted">
                            <span>Interesse ativo</span>
                            <Check className="w-3.5 h-3.5 text-alura-success" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 4: CONQUISTAS */}
              {activeTab === "Conquistas" && (
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Conquistas da Comunidade</h2>
                      <p className="text-xs text-alura-textMuted mt-0.5">Badges de honra, participação e marcos atingidos na Alura.</p>
                    </div>
                    <span className="text-xs font-bold text-alura-accent bg-alura-accent/15 px-3 py-1.5 rounded-full border border-alura-accent/30 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" /> {unlockedCount} de {ACHIEVEMENTS.length} Desbloqueadas
                    </span>
                  </div>

                  {/* Barra de Progresso Geral */}
                  <div className="h-2 w-full bg-alura-surface2 rounded-full overflow-hidden border border-alura-border">
                    <div 
                      className="h-full bg-alura-accent rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(57,255,136,0.5)]"
                      style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {ACHIEVEMENTS.map((ach) => {
                      const Icon = ach.icon
                      return (
                        <div 
                          key={ach.id}
                          className={`p-5 rounded-xl border flex items-start gap-4 transition-all ${
                            ach.unlocked 
                              ? "bg-alura-surface2/90 border-alura-border/80 shadow-md" 
                              : "bg-alura-surface1/40 border-alura-border/30 opacity-40 grayscale"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${ach.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-white truncate">{ach.title}</h3>
                              {ach.unlocked ? (
                                <span className="text-[10px] font-bold uppercase text-alura-accent flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Desbloqueado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase text-alura-textDisabled flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Bloqueado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-alura-textMuted mt-1 leading-relaxed">{ach.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Coluna Direita (Estatísticas, Redes Sociais, Badges Resumo, Spotify) */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Atividade Ao Vivo do Spotify (visível aos amigos e no próprio perfil) */}
                {profile?.spotify_activity?.isPlaying && profile?.show_spotify_activity !== false && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <SpotifyActivityCard 
                      track={profile.spotify_activity} 
                      userName={profile.display_name || profile.username} 
                    />
                  </div>
                )}

                {/* Estatísticas Reais */}
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-5 text-alura-accent">
                    <Activity className="w-5 h-5" />
                    <h2 className="font-semibold text-[15px]">Estatísticas</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3 text-alura-textSecondary"><Users className="w-4 h-4" /> Amigos</div>
                      <span className="text-white font-bold">{realFriendsCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3 text-alura-textSecondary"><Server className="w-4 h-4" /> Servidores</div>
                      <span className="text-white font-bold">{realServersCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3 text-alura-textSecondary"><MessageSquare className="w-4 h-4" /> Posts Feed</div>
                      <span className="text-white font-bold">{realPostsCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3 text-alura-textSecondary"><Activity className="w-4 h-4" /> Status</div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusBgColor}`}></div>
                        <span className={`${statusTextColor} font-medium text-xs`}>{statusLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais Conectadas */}
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm">
                  {(() => {
                    const activeConnections = getActiveConnections(profile?.social_links)

                    return (
                      <>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2 text-alura-accent">
                            <LinkIcon className="w-5 h-5" />
                            <h2 className="font-semibold text-[15px]">Redes Conectadas</h2>
                          </div>
                          {activeConnections.length > 0 && (
                            <span className="text-[11px] font-bold text-alura-accent bg-alura-accent/10 px-2.5 py-0.5 rounded-full border border-alura-accent/30">
                              {activeConnections.length} {activeConnections.length === 1 ? "ativa" : "ativas"}
                            </span>
                          )}
                        </div>

                        {activeConnections.length > 0 ? (
                          <div className="space-y-3">
                            {activeConnections.map((conn) => {
                              const display = conn.getDisplay ? conn.getDisplay(conn.value) : conn.value
                              const url = conn.getUrl ? conn.getUrl(conn.value) : null

                              if (conn.isCopyOnly || !url) {
                                return (
                                  <div
                                    key={conn.id}
                                    onClick={() => {
                                      navigator.clipboard.writeText(display)
                                      showToast({
                                        type: "success",
                                        title: "Copiado!",
                                        message: `${conn.label} (${display}) copiado para a área de transferência.`
                                      })
                                    }}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-alura-surface2/50 border border-alura-border/60 hover:border-alura-border hover:bg-alura-surface2 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className="w-8 h-8 rounded-lg bg-alura-surface3 flex items-center justify-center shrink-0 border border-alura-border/60"
                                        style={{ color: conn.color }}
                                      >
                                        <ConnectionIcon id={conn.id} className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-white leading-tight">{conn.label}</span>
                                        <span className="text-xs text-alura-textSecondary group-hover:text-alura-accent transition-colors truncate leading-tight mt-0.5">
                                          {display}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[11px] text-alura-textMuted group-hover:text-alura-accent font-medium transition-colors shrink-0">
                                      Copiar
                                    </span>
                                  </div>
                                )
                              }

                              return (
                                <a
                                  key={conn.id}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-alura-surface2/50 border border-alura-border/60 hover:border-alura-border hover:bg-alura-surface2 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-8 h-8 rounded-lg bg-alura-surface3 flex items-center justify-center shrink-0 border border-alura-border/60"
                                      style={{ color: conn.color }}
                                    >
                                      <ConnectionIcon id={conn.id} className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium text-white leading-tight">{conn.label}</span>
                                      <span className="text-xs text-alura-textSecondary group-hover:text-alura-accent transition-colors truncate leading-tight mt-0.5">
                                        {display}
                                      </span>
                                    </div>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-alura-textDisabled group-hover:text-alura-accent transition-colors shrink-0" />
                                </a>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-alura-textMuted text-xs">
                            <p>Nenhuma rede conectada no momento.</p>
                            {isOwnProfile && (
                              <button
                                onClick={() => navigate("/settings")}
                                className="mt-2 text-alura-accent hover:underline font-semibold cursor-pointer block mx-auto"
                              >
                                Conectar redes nas Configurações
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Resumo de Conquistas */}
                <div className="p-6 rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-alura-accent">
                      <Crown className="w-5 h-5" />
                      <h2 className="font-semibold text-[15px]">Conquistas</h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab("Conquistas")}
                      className="text-xs font-semibold text-alura-textSecondary hover:text-alura-accent transition-colors cursor-pointer"
                    >
                      Ver todas
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-alura-surface2 border border-alura-border flex items-center justify-center text-alura-accent hover:border-alura-accent hover:scale-105 transition-all cursor-help" title="Beta Tester"><Code className="w-6 h-6" /></div>
                    <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] hover:border-[#F5A623] hover:scale-105 transition-all cursor-help" title="Membro Fundador"><Crown className="w-6 h-6" /></div>
                    <div className="w-12 h-12 rounded-xl bg-alura-accent/10 border border-alura-accent/30 flex items-center justify-center text-alura-accent hover:border-alura-accent hover:scale-105 transition-all cursor-help" title="Comunidade Ativa"><Star className="w-6 h-6" /></div>
                    <div 
                      onClick={() => setActiveTab("Conquistas")}
                      className="w-12 h-12 rounded-xl bg-alura-surface1 border border-alura-border flex items-center justify-center text-alura-textSecondary hover:text-white transition-all cursor-pointer font-bold text-sm"
                    >
                      +{ACHIEVEMENTS.length - 3}
                    </div>
                  </div>
                </div>

              </div>

            </div>
        </div>
      </main>
    </div>
  )
}
