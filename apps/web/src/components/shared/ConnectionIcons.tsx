import React from "react"

export interface ConnectionMeta {
  id: string
  label: string
  shortLabel: string
  category: "games" | "social" | "dev" | "media"
  categoryLabel: string
  placeholder: string
  helperText: string
  color: string
  badgeColor: string
  isCopyOnly?: boolean
  getUrl?: (val: string) => string
  getDisplay?: (val: string) => string
}

export const SUPPORTED_CONNECTIONS: ConnectionMeta[] = [
  {
    id: "epic",
    label: "Epic Games",
    shortLabel: "Epic",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "Nome de exibição na Epic Games",
    helperText: "Seu nome público para amigos no Fortnite, Rocket League, etc.",
    color: "#FFFFFF",
    badgeColor: "bg-zinc-800 text-white border-zinc-700",
    isCopyOnly: true,
    getDisplay: (val) => val
  },
  {
    id: "playstation",
    label: "PlayStation Network (PSN)",
    shortLabel: "PlayStation",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "ID Online da PSN (ex: PlayerOne)",
    helperText: "Seu ID da PSN para amigos do PS4 e PS5.",
    color: "#003791",
    badgeColor: "bg-[#003791]/20 text-[#2E6DB4] border-[#003791]/40",
    isCopyOnly: true,
    getDisplay: (val) => val
  },
  {
    id: "xbox",
    label: "Xbox Network",
    shortLabel: "Xbox",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "Gamertag do Xbox (ex: MasterChief)",
    helperText: "Sua Gamertag para jogos do Xbox e PC Game Pass.",
    color: "#107C10",
    badgeColor: "bg-[#107C10]/20 text-[#107C10] border-[#107C10]/40",
    isCopyOnly: true,
    getDisplay: (val) => val
  },
  {
    id: "steam",
    label: "Steam",
    shortLabel: "Steam",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "steamcommunity.com/id/usuario ou ID",
    helperText: "Link do seu perfil público na comunidade Steam.",
    color: "#66C0F4",
    badgeColor: "bg-[#171a21] text-[#66C0F4] border-[#66C0F4]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://steamcommunity.com/id/${val.replace(/^steamcommunity\.com\/id\//, "")}`,
    getDisplay: (val) => val.replace(/^https?:\/\//, "")
  },
  {
    id: "riot",
    label: "Riot Games",
    shortLabel: "Riot",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "Riot ID (ex: Faker#KR1)",
    helperText: "Seu Riot ID para Valorant, League of Legends e TFT.",
    color: "#EB0029",
    badgeColor: "bg-[#EB0029]/15 text-[#EB0029] border-[#EB0029]/40",
    isCopyOnly: true,
    getDisplay: (val) => val
  },
  {
    id: "battlenet",
    label: "Battle.net",
    shortLabel: "Battle.net",
    category: "games",
    categoryLabel: "Jogos",
    placeholder: "BattleTag (ex: Player#1234)",
    helperText: "Sua BattleTag para Overwatch, Diablo, Call of Duty, etc.",
    color: "#00AEFF",
    badgeColor: "bg-[#00AEFF]/15 text-[#00AEFF] border-[#00AEFF]/40",
    isCopyOnly: true,
    getDisplay: (val) => val
  },
  {
    id: "github",
    label: "GitHub",
    shortLabel: "GitHub",
    category: "dev",
    categoryLabel: "Desenvolvimento",
    placeholder: "github.com/usuario ou @usuario",
    helperText: "Seu perfil de repositórios e código open-source.",
    color: "#FFFFFF",
    badgeColor: "bg-zinc-800 text-white border-zinc-700",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://github.com/${val.replace(/^github\.com\//, "").replace(/^@/, "")}`,
    getDisplay: (val) => `github.com/${val.replace(/^https?:\/\//, "").replace(/^github\.com\//, "").replace(/^@/, "")}`
  },
  {
    id: "discord",
    label: "Discord",
    shortLabel: "Discord",
    category: "social",
    categoryLabel: "Social",
    placeholder: "@usuario",
    helperText: "Seu nome de usuário ou tag do Discord.",
    color: "#5865F2",
    badgeColor: "bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/40",
    isCopyOnly: true,
    getDisplay: (val) => val.startsWith("@") ? val : `@${val}`
  },
  {
    id: "twitch",
    label: "Twitch",
    shortLabel: "Twitch",
    category: "media",
    categoryLabel: "Streaming",
    placeholder: "twitch.tv/canal ou @canal",
    helperText: "Seu canal de lives na Twitch.",
    color: "#9146FF",
    badgeColor: "bg-[#9146FF]/20 text-[#9146FF] border-[#9146FF]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://twitch.tv/${val.replace(/^twitch\.tv\//, "").replace(/^@/, "")}`,
    getDisplay: (val) => `twitch.tv/${val.replace(/^https?:\/\//, "").replace(/^twitch\.tv\//, "").replace(/^@/, "")}`
  },
  {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YouTube",
    category: "media",
    categoryLabel: "Vídeo",
    placeholder: "youtube.com/@canal ou @canal",
    helperText: "Seu canal ou perfil público do YouTube.",
    color: "#FF0000",
    badgeColor: "bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://youtube.com/${val.replace(/^youtube\.com\//, "")}`,
    getDisplay: (val) => val.replace(/^https?:\/\//, "")
  },
  {
    id: "spotify",
    label: "Spotify",
    shortLabel: "Spotify",
    category: "media",
    categoryLabel: "Música",
    placeholder: "open.spotify.com/user/usuario ou @usuario",
    helperText: "Seu perfil musical no Spotify.",
    color: "#1DB954",
    badgeColor: "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://open.spotify.com/user/${val.replace(/^open\.spotify\.com\/user\//, "").replace(/^@/, "")}`,
    getDisplay: (val) => val.replace(/^https?:\/\//, "")
  },
  {
    id: "twitter",
    label: "Twitter / X",
    shortLabel: "X",
    category: "social",
    categoryLabel: "Social",
    placeholder: "x.com/usuario ou @usuario",
    helperText: "Seu perfil oficial na rede social X.",
    color: "#FFFFFF",
    badgeColor: "bg-zinc-800 text-white border-zinc-700",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://x.com/${val.replace(/^x\.com\//, "").replace(/^twitter\.com\//, "").replace(/^@/, "")}`,
    getDisplay: (val) => `@${val.replace(/^https?:\/\//, "").replace(/^x\.com\//, "").replace(/^twitter\.com\//, "").replace(/^@/, "")}`
  },
  {
    id: "instagram",
    label: "Instagram",
    shortLabel: "Instagram",
    category: "social",
    categoryLabel: "Social",
    placeholder: "instagram.com/usuario ou @usuario",
    helperText: "Seu perfil de fotos e stories no Instagram.",
    color: "#E1306C",
    badgeColor: "bg-[#E1306C]/20 text-[#E1306C] border-[#E1306C]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://instagram.com/${val.replace(/^instagram\.com\//, "").replace(/^@/, "")}`,
    getDisplay: (val) => `@${val.replace(/^https?:\/\//, "").replace(/^instagram\.com\//, "").replace(/^@/, "")}`
  },
  {
    id: "tiktok",
    label: "TikTok",
    shortLabel: "TikTok",
    category: "media",
    categoryLabel: "Vídeo",
    placeholder: "tiktok.com/@usuario ou @usuario",
    helperText: "Seu perfil de vídeos curtos no TikTok.",
    color: "#00F2FE",
    badgeColor: "bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://tiktok.com/@${val.replace(/^tiktok\.com\/@?/, "").replace(/^@/, "")}`,
    getDisplay: (val) => `@${val.replace(/^https?:\/\//, "").replace(/^tiktok\.com\/@?/, "").replace(/^@/, "")}`
  },
  {
    id: "reddit",
    label: "Reddit",
    shortLabel: "Reddit",
    category: "social",
    categoryLabel: "Social",
    placeholder: "reddit.com/user/usuario ou u/usuario",
    helperText: "Seu perfil na comunidade Reddit.",
    color: "#FF4500",
    badgeColor: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/40",
    isCopyOnly: false,
    getUrl: (val) => val.startsWith("http") ? val : `https://reddit.com/user/${val.replace(/^reddit\.com\/user\//, "").replace(/^u\//, "")}`,
    getDisplay: (val) => `u/${val.replace(/^https?:\/\//, "").replace(/^reddit\.com\/user\//, "").replace(/^u\//, "")}`
  }
]

// Ícones SVG Vetoriais Oficiais de Alta Fidelidade
export function ConnectionIcon({ id, className = "w-5 h-5" }: { id: string; className?: string }) {
  switch (id) {
    case "epic":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 2C3.67 2 3 2.67 3 3.5v17c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5V14l-5-2.5 5-2.5V3.5C21 2.67 20.33 2 19.5 2h-15zm8.5 4.5l4 2.5-4 2.5V6.5zm-5 0h3v11h-3V6.5z" />
        </svg>
      )
    case "playstation":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 3C5.5 3 4 5 4 8v8c0 3 1.5 5 4.5 5s4.5-2 4.5-5V8c0-3-1.5-5-4.5-5zm0 15c-1.5 0-2.5-1-2.5-3V9c0-2 1-3 2.5-3s2.5 1 2.5 3v6c0 2-1 3-2.5 3zm11-10.5c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V9c0-.83-.67-1.5-1.5-1.5zm-4.5 3c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5z" />
        </svg>
      )
    case "xbox":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4.2 4.4c1.1 1.4 2.7 3.3 4.2 5.2 1.5-1.9 3.1-3.8 4.2-5.2 1.7 1.2 2.9 3 3.4 5.1-1.3 1.4-3.5 3.3-5.2 4.5 2 2 3.8 3.5 4.8 4.3-1.7 1.5-4 2.4-6.4 2.4s-4.7-.9-6.4-2.4c1-.8 2.8-2.3 4.8-4.3-1.7-1.2-3.9-3.1-5.2-4.5.5-2.1 1.7-3.9 3.4-5.1z" />
        </svg>
      )
    case "steam":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.98 2C6.47 2 2 6.48 2 12c0 4.6 3.11 8.47 7.37 9.61l2.5-3.64c-.35-.55-.56-1.21-.56-1.92 0-.25.03-.5.08-.74L8.14 13.3c-.63.26-1.33.4-2.06.4-2.82 0-5.1-2.29-5.1-5.11S3.26 3.48 6.08 3.48s5.1 2.29 5.1 5.11c0 .24-.02.48-.06.71l3.32 2.37c.56-.22 1.17-.34 1.81-.34 2.82 0 5.1 2.29 5.1 5.11 0 2.83-2.28 5.12-5.1 5.12-2.34 0-4.32-1.57-4.9-3.72l-2.46 3.58C10.01 21.87 10.98 22 12 22c5.52 0 10-4.48 10-10S17.52 2 11.98 2zM6.08 5.48c-1.72 0-3.11 1.4-3.11 3.11 0 1.72 1.39 3.11 3.11 3.11 1.72 0 3.11-1.39 3.11-3.11 0-1.71-1.39-3.11-3.11-3.11zm10.17 8.1c-1.72 0-3.11 1.39-3.11 3.11 0 1.72 1.39 3.11 3.11 3.11 1.72 0 3.11-1.39 3.11-3.11 0-1.72-1.39-3.11-3.11-3.11z" />
        </svg>
      )
    case "riot":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.4 2L2 6.8v8.6l3.3 2.1V9.7l7.1-3.1v15.4l9.6-4.4V6.8L12.4 2zm-4.3 10.7l-2.1-1.3v3.7l2.1 1.3v-3.7z" />
        </svg>
      )
    case "battlenet":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 3.3l6.5 3.6-2.5 1.4L12 8.2l-4 2.1-2.5-1.4L12 5.3zm-7 4.7l2.5 1.4V14L5 12.6V10zm3.5 4.5l3.5-1.9 3.5 1.9-3.5 1.9-3.5-1.9zm7 4.2L12 18.7l-3.5-1.9 2.5-1.4 1 0.5 1-0.5 2.5 1.4-1.5.9zM19 12.6L16.5 14v-2.6l2.5-1.4v2.6z" />
        </svg>
      )
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    case "discord":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      )
    case "twitch":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      )
    case "youtube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case "spotify":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306a.754.754 0 0 1-1.037.25c-2.837-1.733-6.409-2.125-10.617-1.164a.75.75 0 0 1-.336-1.462c4.604-1.054 8.57-.611 11.74 1.339.371.226.488.71.25 1.037zm1.467-3.26a.938.938 0 0 1-1.292.31c-3.248-1.996-8.2-2.574-12.04-1.408a.938.938 0 0 1-.555-1.792c4.394-1.334 9.877-.69 13.577 1.584.444.273.585.86.31 1.306zm.126-3.397c-3.896-2.314-10.32-2.528-14.04-1.398a1.125 1.125 0 0 1-.65-2.154c4.28-1.299 11.37-1.049 15.86 1.616a1.125 1.125 0 0 1-1.17 1.936z" />
        </svg>
      )
    case "twitter":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.93-4.42V8.92a8.28 8.28 0 0 0 4.84 1.54V7.02c-.35 0-.7-.11-1.04-.33z" />
        </svg>
      )
    case "reddit":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.56 8 13.25c0 .688.56 1.25 1.25 1.25.688 0 1.249-.562 1.249-1.25 0-.69-.56-1.25-1.249-1.25zm5.5 0c-.687 0-1.248.56-1.248 1.25 0 .688.561 1.25 1.249 1.25.688 0 1.249-.562 1.249-1.25 0-.69-.56-1.25-1.249-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
  }
}

// Helpers para extração e visibilidade
export function getConnectionData(socialLinks: any, id: string): { value: string; enabled: boolean } {
  if (!socialLinks || typeof socialLinks !== "object") {
    return { value: "", enabled: false }
  }

  const raw = socialLinks[id]
  if (typeof raw === "object" && raw !== null) {
    return {
      value: raw.value || "",
      enabled: raw.enabled !== false
    }
  }

  const value = typeof raw === "string" ? raw : ""
  const enabledKey = `${id}_enabled`
  // Se explicitamente definido, respeita a escolha do usuário; senão, fica ativo se houver valor
  const enabled = socialLinks[enabledKey] !== undefined ? Boolean(socialLinks[enabledKey]) : Boolean(value.trim())

  return { value, enabled }
}

export function getActiveConnections(socialLinks: any) {
  return SUPPORTED_CONNECTIONS.map((conn) => {
    const data = getConnectionData(socialLinks, conn.id)
    return {
      ...conn,
      value: data.value,
      enabled: data.enabled
    }
  }).filter((conn) => conn.enabled && conn.value.trim().length > 0)
}
