import React, { useState, useEffect, useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, UserPlus, MoreHorizontal, ExternalLink, 
  Send, Sparkles, Gamepad2, Heart, Music, Terminal, Code2, 
  PenTool, MonitorPlay, Activity, Link as LinkIcon, ShieldCheck, X
} from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { GAMES_DB } from "../../pages/onboarding/steps/StepGames"
import { HOBBIES_DB } from "../../pages/onboarding/steps/StepHobbies"
import { SpotifyIcon } from "./SpotifyActivityCard"
import { getActiveConnections, ConnectionIcon } from "./ConnectionIcons"

// Mapeamento de tags para exibição estilizada com ícones
const TAG_MAP: Record<string, { label: string; icon: any }> = {
  programmer: { label: "Programador", icon: Terminal },
  gamer: { label: "Gamer", icon: Gamepad2 },
  learning: { label: "Aprendendo", icon: Code2 },
  designer: { label: "Designer", icon: PenTool },
  streamer: { label: "Streamer", icon: MonitorPlay },
  music: { label: "Música", icon: Music },
  musico: { label: "Músico", icon: Music },
  dev: { label: "Desenvolvedor", icon: Terminal },
  developer: { label: "Desenvolvedor", icon: Terminal },
  tecnologia: { label: "Tecnologia", icon: Terminal },
  tech: { label: "Tecnologia", icon: Terminal },
  anime: { label: "Anime", icon: Activity },
  games: { label: "Gamer", icon: Gamepad2 },
  jogos: { label: "Jogos", icon: Gamepad2 },
  boardgames: { label: "Jogos Tabuleiro", icon: Gamepad2 },
  movies: { label: "Filmes", icon: MonitorPlay },
  filmes: { label: "Filmes", icon: MonitorPlay },
  reading: { label: "Leitura", icon: Code2 },
  leitura: { label: "Leitura", icon: Code2 },
  estudante: { label: "Estudante", icon: Code2 },
  student: { label: "Estudante", icon: Code2 },
}

// Cache em memória para perfis buscados
const profileCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 segundos

export interface UserProfileHoverCardProps {
  userId?: string
  profile?: any
  side?: "left" | "right" | "top" | "bottom" | "auto"
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function UserProfileHoverCard({
  userId,
  profile: initialProfile,
  side = "auto",
  children,
  className = "",
  disabled = false
}: UserProfileHoverCardProps) {
  const navigate = useNavigate()
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [profileData, setProfileData] = useState<any>(initialProfile || null)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [isPlacedOnLeft, setIsPlacedOnLeft] = useState(true)
  const [quickMsg, setQuickMsg] = useState("")
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false)

  const openTimerRef = useRef<any>(null)
  const closeTimerRef = useRef<any>(null)

  // Atualiza detecção de mobile no redimensionamento da janela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (isOpen && !mobile) updatePosition()
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  // Sincroniza se o profile inicial mudar
  useEffect(() => {
    if (initialProfile) {
      setProfileData((prev: any) => ({ ...prev, ...initialProfile }))
    }
  }, [initialProfile])

  // Busca dados completos do perfil se necessário
  const loadProfile = async (targetId: string) => {
    const cached = profileCache.get(targetId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setProfileData((prev: any) => ({ ...prev, ...cached.data }))
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single()

      if (!error && data) {
        profileCache.set(targetId, { data, timestamp: Date.now() })
        setProfileData((prev: any) => ({ ...prev, ...data }))
      }
    } catch (e) {
      console.warn("Erro ao buscar prévia de perfil:", e)
    } finally {
      setLoading(false)
    }
  }

  // Calcula coordenadas responsivas para o popover no desktop
  // Calcula coordenadas responsivas para o popover no desktop
  const updatePosition = () => {
    if (!triggerRef.current || isMobile) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = 320
    const padding = 12
    const bottomMargin = 20 // Respiro acima da barra de tarefas do Windows
    const topMargin = 16

    let left = 0
    let top = 0
    let onLeft = true

    if (side === "left") {
      left = rect.left - popoverWidth - padding
      onLeft = true
    } else if (side === "right") {
      left = rect.right + padding
      onLeft = false
    } else {
      // Auto: se couber à direita, vai à direita; senão, vai à esquerda
      if (rect.right + popoverWidth + padding <= window.innerWidth) {
        left = rect.right + padding
        onLeft = false
      } else {
        left = rect.left - popoverWidth - padding
        onLeft = true
      }
    }

    // Garante que o card nunca extravase as bordas horizontais da tela
    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding
    }
    if (left < padding) {
      left = padding
    }

    // Ajuste vertical inteligente baseado na altura real do popover
    const cardHeight = popoverRef.current?.offsetHeight || 520
    top = rect.top - 16

    // Evita bater ou ultrapassar a borda inferior da tela
    if (top + cardHeight > window.innerHeight - bottomMargin) {
      top = window.innerHeight - cardHeight - bottomMargin
    }
    // Evita corte superior
    if (top < topMargin) {
      top = topMargin
    }

    setIsPlacedOnLeft(onLeft)
    setCoords({ top, left })
  }

  // Recalcula a posição exata após a renderização do card
  useLayoutEffect(() => {
    if (isOpen && !isMobile) {
      updatePosition()
    }
  }, [isOpen, profileData, isMobile])

  const handleMouseEnter = () => {
    if (disabled || isMobile) return
    clearTimeout(closeTimerRef.current)

    openTimerRef.current = setTimeout(() => {
      updatePosition()
      const targetId = userId || initialProfile?.id || initialProfile?.otherUserId
      if (targetId) {
        loadProfile(targetId)
      }
      setIsOpen(true)
    }, 180)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    clearTimeout(openTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  const handlePopoverMouseEnter = () => {
    if (!isMobile) clearTimeout(closeTimerRef.current)
  }

  const handlePopoverMouseLeave = () => {
    if (!isMobile) {
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 150)
    }
  }

  // Fecha ao rolar a página em desktop para não desalinhar (mas NÃO fecha ao rolar o próprio card!)
  useEffect(() => {
    if (!isOpen || isMobile) return
    const handleScroll = (e: Event) => {
      // Se a rolagem ocorreu dentro do próprio card, NÃO fecha
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return
      }
      setIsOpen(false)
    }
    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [isOpen, isMobile])

  // Ação de envio rápido de mensagem
  const handleSendQuickMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const targetId = userId || profileData?.id || profileData?.otherUserId
    if (!targetId) return

    setIsOpen(false)
    navigate(`/messages/${targetId}`, {
      state: { initialMessage: quickMsg.trim() }
    })
    setQuickMsg("")
  }

  // Dados consolidados do perfil
  const targetUser = profileData || initialProfile || {}
  const targetId = userId || targetUser.id || targetUser.otherUserId
  const displayName = targetUser.display_name || targetUser.full_name || targetUser.name || targetUser.username || "Usuário"
  const username = targetUser.username || "usuario"
  const avatarUrl = targetUser.avatar_url
  const bannerUrl = targetUser.banner_url
  const bio = targetUser.bio || "Nenhuma biografia informada ainda."
  const status = targetUser.profileStatus || targetUser.status || "offline"
  const tags: string[] = targetUser.tags || []
  const favoriteGames: string[] = targetUser.favorite_games || targetUser.favoriteGames || targetUser.games || []
  const hobbies: string[] = targetUser.hobbies || []
  const spotify = targetUser.spotify_activity
  const showSpotify = targetUser.show_spotify_activity !== false && spotify?.isPlaying

  // Encontra jogos correspondentes
  const userGames = favoriteGames
    .map(gId => GAMES_DB.find(g => g.id.toLowerCase() === gId.toLowerCase() || g.name.toLowerCase() === gId.toLowerCase()))
    .filter(Boolean)

  // Encontra hobbies correspondentes
  const userHobbies = hobbies
    .map(hId => HOBBIES_DB.find(h => h.id.toLowerCase() === hId.toLowerCase() || h.name.toLowerCase() === hId.toLowerCase()))
    .filter(Boolean)

  const initials = displayName.substring(0, 2).toUpperCase()

  // Conteúdo unificado do Card com animação lateral suave (Kinetics / Motion)
  const cardElement = (
    <motion.div
      ref={popoverRef}
      onMouseEnter={handlePopoverMouseEnter}
      onMouseLeave={handlePopoverMouseLeave}
      onClick={(e) => e.stopPropagation()}
      initial={{
        opacity: 0,
        x: isMobile ? 0 : (isPlacedOnLeft ? 24 : -24),
        y: isMobile ? 24 : 0,
        scale: 0.96
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        x: isMobile ? 0 : (isPlacedOnLeft ? 16 : -16),
        y: isMobile ? 16 : 0,
        scale: 0.97
      }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1] // Curva suave e elegante de desaceleração expo/cubic (Kinetics)
      }}
      style={!isMobile ? {
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        maxHeight: `${Math.max(280, window.innerHeight - coords.top - 20)}px`,
        zIndex: 99999
      } : {}}
      className={`bg-alura-surface1 border border-alura-border shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden text-alura-textPrimary flex flex-col pointer-events-auto ${
        isMobile 
          ? "w-full max-w-[340px] max-h-[85vh] rounded-[20px]" 
          : "w-[320px] rounded-[16px] select-none"
      }`}
    >
      {/* 1. Top Section (Banner + Avatar sobreposto) - Sem overflow na área do avatar para nunca cortar */}
      <div className="relative shrink-0">
        {/* Banner com cantos arredondados no topo */}
        <div className="h-[88px] w-full relative bg-alura-background overflow-hidden rounded-t-[16px]">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-alura-surface1 via-alura-surface2 to-alura-surface3 flex items-center justify-end pr-4">
              <Sparkles className="w-12 h-12 text-alura-accent/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-alura-surface1/90 pointer-events-none" />

          {/* Ações rápidas no banner */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (targetId) navigate(`/messages/${targetId}`)
              }}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-alura-accent text-white hover:text-alura-background flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-md cursor-pointer"
              title="Conversar"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                const handle = profileData?.username ? `@${profileData.username}` : targetId
                if (handle) navigate(`/profile/${handle}`)
              }}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-md cursor-pointer"
              title="Ver Perfil Completo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {isMobile && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-md cursor-pointer ml-1"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Avatar sobreposto & Badge (Fora do overflow-y-auto para NUNCA ser cortado!) */}
        <div className="px-4 flex items-end justify-between -mt-10 relative z-20 pointer-events-none">
          <div className="relative pointer-events-auto">
            <Avatar className="w-[72px] h-[72px] rounded-full border-4 border-alura-surface1 bg-alura-surface2 shadow-2xl overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-alura-surface2 text-alura-accent text-base font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Status Indicator */}
            <div 
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-alura-surface1 flex items-center justify-center shadow-md ${
                status === 'online' 
                  ? 'bg-alura-accent' 
                  : status === 'idle' 
                  ? 'bg-[#F5A623]' 
                  : status === 'dnd' 
                  ? 'bg-[#FF4B4B]' 
                  : 'bg-zinc-600'
              }`}
              title={status === 'online' ? 'Online' : status === 'idle' ? 'Ausente' : status === 'dnd' ? 'Não perturbe' : 'Offline'}
            >
              {status === 'dnd' && <div className="w-2 h-0.5 bg-white rounded-full" />}
            </div>
          </div>

          {/* Tag / Cargo ou Badge Alura */}
          <div className="flex items-center gap-1.5 pb-1 pointer-events-auto">
            <span className="px-2 py-0.5 rounded-full bg-alura-surface2 border border-alura-border text-[10px] font-semibold text-alura-accent flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Membro
            </span>
          </div>
        </div>
      </div>

      {/* 2. Área de Conteúdo rolável */}
      <div className="px-4 pb-4 pt-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        {/* Nomes */}
        <div className="mb-3">
          <h4 className="text-[16px] font-bold text-white tracking-tight leading-snug truncate">
            {displayName}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] font-medium text-alura-textMuted">
              @{username}
            </span>
            <span className="text-[10px] text-alura-textDisabled">•</span>
            <span className="text-[11px] font-medium text-alura-textMuted/80 capitalize">
              {status === 'online' ? 'Disponível' : status === 'idle' ? 'Ausente' : status === 'dnd' ? 'Ocupado' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Todas as Tags do usuário */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, idx) => {
              const tagInfo = TAG_MAP[tag.toLowerCase()] || { label: tag, icon: Sparkles }
              const Icon = tagInfo.icon
              return (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded-[6px] bg-alura-surface2 border border-alura-border text-alura-textSecondary text-[11px] font-medium flex items-center gap-1 shadow-sm"
                >
                  <Icon className="w-3 h-3 text-alura-accent" />
                  <span>{tagInfo.label}</span>
                </span>
              )
            })}
          </div>
        )}

        {/* Biografia / Sobre mim */}
        <div className="p-2.5 rounded-[10px] bg-alura-surface2/80 border border-alura-border mb-3">
          <div className="text-[10px] font-bold text-alura-textMuted uppercase tracking-wider mb-1">
            Sobre Mim
          </div>
          <p className="text-[12px] text-alura-textPrimary leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {bio}
          </p>
        </div>

        {/* Spotify Activity (se estiver tocando) */}
        {showSpotify && spotify && (
          <div className="p-2.5 rounded-[10px] bg-alura-surface2 border border-[#1DB954]/30 mb-3 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-[6px] overflow-hidden shrink-0 border border-[#1DB954]/20 shadow-sm">
              {spotify.albumArt ? (
                <img src={spotify.albumArt} alt={spotify.albumName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1DB954]/20 flex items-center justify-center">
                  <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
                </div>
              )}
              <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#1DB954] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-alura-surface1 rounded-full animate-ping" />
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1DB954] uppercase tracking-wider">
                <SpotifyIcon className="w-3 h-3 shrink-0" />
                <span>Ouvindo Spotify</span>
              </div>
              <span className="text-[12px] font-bold text-white truncate leading-tight mt-0.5">
                {spotify.trackName}
              </span>
              <span className="text-[11px] text-alura-textMuted truncate leading-tight">
                por {spotify.artistName}
              </span>
            </div>
          </div>
        )}

        {/* Coleção de Jogos */}
        {userGames.length > 0 && (
          <div className="p-2.5 rounded-[10px] bg-alura-surface2/80 border border-alura-border mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-alura-textMuted uppercase tracking-wider flex items-center gap-1">
                <Gamepad2 className="w-3 h-3 text-alura-accent" /> Coleção de Jogos
              </span>
              <span className="text-[10px] text-alura-textMuted font-semibold">
                {favoriteGames.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-hidden">
              {userGames.slice(0, 4).map((game: any, idx: number) => (
                <div
                  key={idx}
                  title={game.name}
                  className="w-10 h-10 rounded-[6px] overflow-hidden border border-alura-border shrink-0 bg-alura-surface3 group relative shadow-sm"
                >
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                </div>
              ))}
              {favoriteGames.length > 4 && (
                <div className="w-10 h-10 rounded-[6px] bg-alura-surface3 border border-alura-border flex items-center justify-center text-[11px] font-bold text-alura-accent shrink-0">
                  +{favoriteGames.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hobbies & Interesses */}
        {userHobbies.length > 0 && (
          <div className="p-2.5 rounded-[10px] bg-alura-surface2/80 border border-alura-border mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-alura-textMuted uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 text-alura-accent" /> Hobbies & Interesses
              </span>
              <span className="text-[10px] text-alura-textMuted font-semibold">
                {hobbies.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-hidden">
              {userHobbies.slice(0, 4).map((hobby: any, idx: number) => (
                <div
                  key={idx}
                  title={hobby.name}
                  className="w-10 h-10 rounded-[6px] overflow-hidden border border-alura-border shrink-0 bg-alura-surface3 group relative shadow-sm"
                >
                  <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
              {hobbies.length > 4 && (
                <div className="w-10 h-10 rounded-[6px] bg-alura-surface3 border border-alura-border flex items-center justify-center text-[11px] font-bold text-alura-accent shrink-0">
                  +{hobbies.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conexões & Redes Sociais */}
        {(() => {
          const activeConns = getActiveConnections(profileData?.social_links)
          if (activeConns.length === 0) return null

          return (
            <div className="p-2.5 rounded-[10px] bg-alura-surface2/80 border border-alura-border mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-alura-textMuted uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-alura-accent" /> Conexões & Redes
                </span>
                <span className="text-[10px] text-alura-accent font-semibold">
                  {activeConns.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {activeConns.map((conn) => {
                  const display = conn.getDisplay ? conn.getDisplay(conn.value) : conn.value
                  const url = conn.getUrl ? conn.getUrl(conn.value) : null

                  if (conn.isCopyOnly || !url) {
                    return (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(display)
                        }}
                        title={`Clique para copiar ${conn.label}: ${display}`}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg bg-alura-surface3/80 hover:bg-alura-surface3 border border-alura-border/60 hover:border-alura-border transition-colors text-left group cursor-pointer"
                      >
                        <div className="shrink-0" style={{ color: conn.color }}>
                          <ConnectionIcon id={conn.id} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-white block truncate leading-tight">
                            {conn.shortLabel}
                          </span>
                          <span className="text-[9px] text-alura-textMuted block truncate leading-tight">
                            {display}
                          </span>
                        </div>
                      </button>
                    )
                  }

                  return (
                    <a
                      key={conn.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Abrir ${conn.label}: ${display}`}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-alura-surface3/80 hover:bg-alura-surface3 border border-alura-border/60 hover:border-alura-border transition-colors text-left group cursor-pointer"
                    >
                      <div className="shrink-0" style={{ color: conn.color }}>
                        <ConnectionIcon id={conn.id} className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-white block truncate leading-tight">
                          {conn.shortLabel}
                        </span>
                        <span className="text-[9px] text-alura-textMuted block truncate leading-tight">
                          {display}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Input Rápido: "Conversar com @username" */}
        <form onSubmit={handleSendQuickMessage} className="relative mt-2">
          <input
            type="text"
            value={quickMsg}
            onChange={(e) => setQuickMsg(e.target.value)}
            placeholder={`Conversar com @${username}`}
            className="w-full h-9 pl-3 pr-9 rounded-[8px] bg-alura-surface2 border border-alura-border text-[12px] text-alura-textPrimary placeholder-alura-textMuted outline-none focus:border-alura-accent/60 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-[6px] bg-transparent hover:bg-alura-hover text-alura-accent flex items-center justify-center transition-colors cursor-pointer"
            title="Enviar mensagem"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </motion.div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (isMobile) {
            e.stopPropagation()
            const targetId = userId || initialProfile?.id || initialProfile?.otherUserId
            if (targetId) loadProfile(targetId)
            setIsOpen(true)
          }
        }}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isOpen && createPortal(
        <AnimatePresence>
          {isMobile ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              {cardElement}
            </motion.div>
          ) : (
            cardElement
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
