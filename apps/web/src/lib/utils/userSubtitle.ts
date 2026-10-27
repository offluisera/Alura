// Mapeamento amigável de tags para títulos exibíveis
const TAG_LABELS: Record<string, string> = {
  programmer: "Programador",
  gamer: "Gamer",
  learning: "Aprendendo",
  designer: "Designer",
  streamer: "Streamer",
  music: "Música",
  musico: "Músico",
  dev: "Desenvolvedor",
  developer: "Desenvolvedor",
  tecnologia: "Tecnologia",
  tech: "Tecnologia",
  anime: "Anime & Mangá",
  games: "Gamer",
  jogos: "Gamer",
  boardgames: "Jogos de Tabuleiro",
  movies: "Cinéfilo",
  filmes: "Cinéfilo",
  reading: "Leitor",
  leitura: "Leitor",
  estudante: "Estudante",
  student: "Estudante",
  creator: "Criador de Conteúdo",
  ilustrador: "Ilustrador",
  artista: "Artista",
}

export function getUserSubtitle(profile?: any, fallback = "Membro Alura"): string {
  if (!profile) return fallback

  // 1. Cargos administrativos da plataforma
  const role = (profile.role || "").toLowerCase()
  const isStaff = profile.is_staff === true || role === "admin" || role === "moderator"
  if (role === "admin" || (isStaff && role !== "moderator")) {
    return "Administrador"
  }
  if (role === "moderator") {
    return "Moderador"
  }
  if (role === "support") {
    return "Suporte Alura"
  }

  // 2. Cargo customizado definido pelo perfil
  if (profile.title && typeof profile.title === "string" && profile.title.trim().length > 0) {
    const trimmed = profile.title.trim()
    if (!trimmed.toLowerCase().includes("não informado") && !trimmed.toLowerCase().includes("nao informado")) {
      return trimmed
    }
  }

  // 3. Primeira tag de interesse com label formatada
  if (Array.isArray(profile.tags) && profile.tags.length > 0) {
    const firstTag = String(profile.tags[0]).toLowerCase()
    if (TAG_LABELS[firstTag]) {
      return TAG_LABELS[firstTag]
    }
    // Formatar texto simples se não estiver no mapa (ex: "python" -> "Python")
    return firstTag.charAt(0).toUpperCase() + firstTag.slice(1)
  }

  // 4. Se tiver bio curta, exibe como status/subtítulo
  if (profile.bio && typeof profile.bio === "string" && profile.bio.trim().length > 0) {
    const cleanBio = profile.bio.trim()
    if (cleanBio.length <= 40) {
      return cleanBio
    }
    return `${cleanBio.slice(0, 37)}...`
  }

  // 5. Fallback refinado
  return fallback
}
