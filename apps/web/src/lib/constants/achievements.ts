import { 
  Crown, Code, MessageSquare, Users, Sparkles, Radio, Zap, Flame, 
  Award, Shield, Terminal, Gamepad2, Heart, Trophy, ShieldAlert, 
  CheckCircle2, Rocket, Calendar 
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface AchievementDef {
  id: string
  title: string
  desc: string
  category: "community" | "engagement" | "role" | "gaming" | "honor"
  icon: LucideIcon
  color: string
  badgeColor: string
}

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    id: "founder",
    title: "Membro Fundador",
    desc: "Um dos pioneiros que ajudaram a fundar e construir a comunidade Alura.",
    category: "honor",
    icon: Crown,
    color: "text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/30",
    badgeColor: "bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40"
  },
  {
    id: "beta",
    title: "Beta Tester",
    desc: "Participou ativamente dos testes e da evolução inicial do aplicativo.",
    category: "honor",
    icon: Code,
    color: "text-alura-accent bg-alura-accent/10 border-alura-accent/30",
    badgeColor: "bg-alura-accent/20 text-alura-accent border-alura-accent/40"
  },
  {
    id: "voice",
    title: "Voz da Comunidade",
    desc: "Compartilhou pensamentos e publicações no feed social da Alura.",
    category: "engagement",
    icon: MessageSquare,
    color: "text-[#4facfe] bg-[#4facfe]/10 border-[#4facfe]/30",
    badgeColor: "bg-[#4facfe]/20 text-[#4facfe] border-[#4facfe]/40"
  },
  {
    id: "social",
    title: "Socializador",
    desc: "Adicionou amigos e criou laços de amizade na comunidade.",
    category: "community",
    icon: Users,
    color: "text-[#43e97b] bg-[#43e97b]/10 border-[#43e97b]/30",
    badgeColor: "bg-[#43e97b]/20 text-[#43e97b] border-[#43e97b]/40"
  },
  {
    id: "legendary",
    title: "Perfil Lendário",
    desc: "Personalizou biografia, foto de perfil, banner e biblioteca de jogos favoritos.",
    category: "engagement",
    icon: Sparkles,
    color: "text-[#ff0844] bg-[#ff0844]/10 border-[#ff0844]/30",
    badgeColor: "bg-[#ff0844]/20 text-[#ff0844] border-[#ff0844]/40"
  },
  {
    id: "streamer",
    title: "Transmissor Ao Vivo",
    desc: "Transmitiu tela ou câmera com áudio de alta qualidade para a galera.",
    category: "engagement",
    icon: Radio,
    color: "text-[#fa709a] bg-[#fa709a]/10 border-[#fa709a]/30",
    badgeColor: "bg-[#fa709a]/20 text-[#fa709a] border-[#fa709a]/40"
  },
  {
    id: "audiophile",
    title: "Mestre do Som",
    desc: "Entusiasta de salas de voz WebRTC, microfone e efeitos sonoros com a galera.",
    category: "engagement",
    icon: Zap,
    color: "text-[#f6d365] bg-[#f6d365]/10 border-[#f6d365]/30",
    badgeColor: "bg-[#f6d365]/20 text-[#f6d365] border-[#f6d365]/40"
  },
  {
    id: "night_owl",
    title: "Coruja da Madrugada",
    desc: "Presença garantida nas conversas e jogatinas altas horas da noite.",
    category: "community",
    icon: Flame,
    color: "text-[#a18cd1] bg-[#a18cd1]/10 border-[#a18cd1]/30",
    badgeColor: "bg-[#a18cd1]/20 text-[#a18cd1] border-[#a18cd1]/40"
  },
  {
    id: "vip",
    title: "Membro VIP",
    desc: "Destaque honorário e prestígio especial concedido pela moderação Alura.",
    category: "honor",
    icon: Award,
    color: "text-[#fbc2eb] bg-[#fbc2eb]/10 border-[#fbc2eb]/30",
    badgeColor: "bg-[#fbc2eb]/20 text-[#fbc2eb] border-[#fbc2eb]/40"
  },
  {
    id: "moderator",
    title: "Guardião da Paz",
    desc: "Integrante da equipe de segurança, moderação e boas práticas da comunidade.",
    category: "role",
    icon: Shield,
    color: "text-[#38ef7d] bg-[#38ef7d]/10 border-[#38ef7d]/30",
    badgeColor: "bg-[#38ef7d]/20 text-[#38ef7d] border-[#38ef7d]/40"
  },
  {
    id: "developer",
    title: "Arquiteto de Software",
    desc: "Contribuidor técnico e engenheiro ativo no ecossistema e ferramentas da Alura.",
    category: "role",
    icon: Terminal,
    color: "text-[#667eea] bg-[#667eea]/10 border-[#667eea]/30",
    badgeColor: "bg-[#667eea]/20 text-[#667eea] border-[#667eea]/40"
  },
  {
    id: "gamer_pro",
    title: "Hardcore Gamer",
    desc: "Coleção de peso: marcou presença nos principais títulos do SteamDB.",
    category: "gaming",
    icon: Gamepad2,
    color: "text-[#ff758c] bg-[#ff758c]/10 border-[#ff758c]/30",
    badgeColor: "bg-[#ff758c]/20 text-[#ff758c] border-[#ff758c]/40"
  },
  {
    id: "music_lover",
    title: "Melômano Nato",
    desc: "Conectou sua conta do Spotify e sincroniza suas faixas favoritas ao vivo.",
    category: "engagement",
    icon: Heart,
    color: "text-[#1db954] bg-[#1db954]/10 border-[#1db954]/30",
    badgeColor: "bg-[#1db954]/20 text-[#1db954] border-[#1db954]/40"
  },
  {
    id: "community_leader",
    title: "Líder Comunitário",
    desc: "Fundador e mantenedor de servidores e comunidades ativas na Alura.",
    category: "community",
    icon: Trophy,
    color: "text-[#ffe259] bg-[#ffe259]/10 border-[#ffe259]/30",
    badgeColor: "bg-[#ffe259]/20 text-[#ffe259] border-[#ffe259]/40"
  },
  {
    id: "veteran",
    title: "Veterano Alura",
    desc: "Compromisso duradouro, lealdade e assiduidade na plataforma.",
    category: "honor",
    icon: ShieldAlert,
    color: "text-[#b91d47] bg-[#b91d47]/10 border-[#b91d47]/30",
    badgeColor: "bg-[#b91d47]/20 text-[#b91d47] border-[#b91d47]/40"
  },
  {
    id: "bug_hunter",
    title: "Caçador de Bugs",
    desc: "Reportou e ajudou a solucionar problemas técnicos e bugs na plataforma.",
    category: "honor",
    icon: CheckCircle2,
    color: "text-[#00c6ff] bg-[#00c6ff]/10 border-[#00c6ff]/30",
    badgeColor: "bg-[#00c6ff]/20 text-[#00c6ff] border-[#00c6ff]/40"
  },
  {
    id: "booster",
    title: "Impulsionador Alura",
    desc: "Apoiador entusiasta do crescimento da infraestrutura e tecnologia Alura.",
    category: "honor",
    icon: Rocket,
    color: "text-[#00f2fe] bg-[#00f2fe]/10 border-[#00f2fe]/30",
    badgeColor: "bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/40"
  },
  {
    id: "event_host",
    title: "Anfitrião de Eventos",
    desc: "Organizou encontros comunitários, torneios ou transmissões temáticas.",
    category: "community",
    icon: Calendar,
    color: "text-[#8e2de2] bg-[#8e2de2]/10 border-[#8e2de2]/30",
    badgeColor: "bg-[#8e2de2]/20 text-[#8e2de2] border-[#8e2de2]/40"
  }
]

/**
 * Determina se uma conquista está desbloqueada para o perfil
 */
export function isAchievementUnlocked(
  achId: string, 
  profile: any, 
  stats?: { friendsCount?: number; postsCount?: number; serversCount?: number }
): boolean {
  if (!profile) return false

  // Se o admin concedeu explicitamente no banco
  const explicitList: string[] = Array.isArray(profile.achievements) ? profile.achievements : []
  if (explicitList.includes(achId)) return true

  // Fallbacks de cálculo automático
  switch (achId) {
    case "founder":
      return Boolean(profile.is_staff || profile.role === "admin" || profile.username === "luisera" || profile.username === "adminalura")
    case "beta":
      return true // Todos os usuários nesta fase beta recebem por padrão
    case "voice":
      return (stats?.postsCount ?? 0) > 0
    case "social":
      return (stats?.friendsCount ?? 0) > 0
    case "community_leader":
      return (stats?.serversCount ?? 0) > 1
    case "legendary":
      return Boolean(
        profile.bio && 
        profile.avatar_url && 
        Array.isArray(profile.favorite_games) && 
        profile.favorite_games.length > 0
      )
    case "music_lover":
      return Boolean(profile.social_links?.spotify || profile.spotify_activity)
    case "moderator":
      return Boolean(profile.is_staff || profile.role === "moderator" || profile.role === "admin")
    case "developer":
      return Boolean(profile.role === "admin" || profile.username === "luisera")
    case "gamer_pro":
      return Array.isArray(profile.favorite_games) && profile.favorite_games.length >= 3
    default:
      return false
  }
}
