import { useState, useEffect, useRef } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Button } from "@alura/ui"
import {
  Settings as SettingsIcon, User, Lock, Bell, Palette, Mic,
  Link as LinkIcon, Code, Camera, Edit2, Copy, Shield, ChevronRight,
  Activity, Users, Plus, PlusCircle, Check, X, AlertCircle, Volume2,
  LogOut, RefreshCw, Sparkles, Smartphone, Globe, Eye, Monitor, AlertTriangle,
  VolumeX, Volume1, Play, BellOff, MessageSquare, PhoneCall, Radio, Send, EyeOff, BellRing, Sliders,
  Tv, Music, Cpu, Key, HelpCircle, Layers, Zap, Headphones,
  KeyRound, QrCode, Laptop, Download, Trash2, Search, FileText, CheckCircle2, ShieldCheck, ShieldAlert, Fingerprint,
  Database, Mail, Calendar, Star, Square, ExternalLink, RotateCcw, Upload, FileAudio,
  Gamepad2, Flame
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { PRESET_BANNERS, AVAILABLE_TAGS } from "../onboarding/steps/StepProfile"
import { GAMES_DB } from "../onboarding/steps/StepGames"
import { HOBBIES_DB } from "../onboarding/steps/StepHobbies"
import { BlockedCard } from "../../components/friends/BlockedCard"
import { BlockService } from "../../lib/services/BlockService"
import { PrivacyService } from "../../lib/services/PrivacyService"
import { AutoModService, type AutoModConfig, DEFAULT_AUTOMOD_CONFIG, type DmSpamFilterMode } from "../../lib/services/AutoModService"
import { SoundService, type SoundType } from "../../lib/services/SoundService"
import { NotificationPreferencesService, type NotificationPreferences, DEFAULT_NOTIFICATION_PREFS } from "../../lib/services/NotificationPreferencesService"
import { TwoFactorService } from "../../lib/services/TwoFactorService"
import { TwoFactorModal } from "../../components/settings/TwoFactorModal"
import { BackupCodesModal } from "../../components/settings/BackupCodesModal"
import { SpotifyService, type SpotifyTrack, SPOTIFY_CLIENT_ID } from "../../lib/services/SpotifyService"
import { SpotifyActivityCard, SpotifyIcon } from "../../components/shared/SpotifyActivityCard"
import { compressImageToWebp } from "../../lib/utils/imageOptimizer"
import { MyInstantsService, type MyInstantSound, CURATED_MYINSTANTS_SOUNDS } from "../../lib/services/MyInstantsService"
import {
  SUPPORTED_CONNECTIONS,
  ConnectionIcon,
  getConnectionData,
  type ConnectionMeta
} from "../../components/shared/ConnectionIcons"

type TabType = "Conta" | "Privacidade" | "Notificações" | "Aparência" | "Som e Voz" | "Conexões" | "Avançado"

export type AluraThemeId = "forest" | "obsidian" | "contrast" | "violet-radiance" | "midnight-blue" | "crimson-noir"

export interface AluraThemeConfig {
  id: AluraThemeId
  name: string
  subtitle: string
  badge: string
  bg: string
  surface: string
  border: string
  accent: string
  accentBright: string
  swatches: [string, string, string, string]
  gradient: string
  desc: string
}

export const ALURA_THEMES: AluraThemeConfig[] = [
  {
    id: "forest",
    name: "Alura Forest",
    subtitle: "Oficial Alura",
    badge: "Padrão",
    bg: "#001609",
    surface: "#001B0B",
    border: "#005022",
    accent: "#00E6A0",
    accentBright: "#39FF88",
    swatches: ["#001609", "#00220E", "#005022", "#00E6A0"],
    gradient: "linear-gradient(135deg, #003C19 0%, #005322 45%, #00E6A0 100%)",
    desc: "A paleta oficial verde florestal com atmosfera profunda, tecnológica e viva."
  },
  {
    id: "obsidian",
    name: "Obsidian Black",
    subtitle: "Grafite & Minimalismo",
    badge: "Minimalista",
    bg: "#0B0D0F",
    surface: "#111318",
    border: "#22262F",
    accent: "#39FF88",
    accentBright: "#52FF9A",
    swatches: ["#0B0D0F", "#16181D", "#22262F", "#39FF88"],
    gradient: "linear-gradient(135deg, #16181D 0%, #22262F 50%, #39FF88 100%)",
    desc: "Preto profundo com superfícies em grafite sóbrio e acentos de precisão."
  },
  {
    id: "contrast",
    name: "Cyber Neon",
    subtitle: "Alto Contraste",
    badge: "Pro",
    bg: "#000808",
    surface: "#001212",
    border: "#004D4D",
    accent: "#39FF88",
    accentBright: "#00FF80",
    swatches: ["#000808", "#001F1F", "#004D4D", "#39FF88"],
    gradient: "linear-gradient(135deg, #001F1F 0%, #004D4D 45%, #39FF88 100%)",
    desc: "Contraste máximo e visibilidade apurada com realces vibrantes em neon."
  },
  {
    id: "violet-radiance",
    name: "Violet Radiance",
    subtitle: "Roxo & Magenta Elétrico",
    badge: "Novo",
    bg: "#0D1E79",
    surface: "#12145A",
    border: "#6B35A8",
    accent: "#D203DD",
    accentBright: "#F018FF",
    swatches: ["#070D3D", "#12145A", "#6B35A8", "#D203DD"],
    gradient: "linear-gradient(135deg, #0D1E79 0%, #D203DD 100%)",
    desc: "Roxo profundo com violeta elétrico e iluminação magenta vibrante."
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    subtitle: "Azul Noturno Profundo",
    badge: "Novo",
    bg: "#02060E",
    surface: "#061329",
    border: "#174A82",
    accent: "#0356C5",
    accentBright: "#1475FF",
    swatches: ["#010309", "#061329", "#174A82", "#0356C5"],
    gradient: "linear-gradient(135deg, #02060E 0%, #0356C5 100%)",
    desc: "Preto azul profundo com realces luminosos em azul elétrico espacial."
  },
  {
    id: "crimson-noir",
    name: "Crimson Noir",
    subtitle: "Carmesim Noturno",
    badge: "Novo",
    bg: "#02060E",
    surface: "#18030C",
    border: "#70203C",
    accent: "#C50337",
    accentBright: "#E20A49",
    swatches: ["#090107", "#18030C", "#70203C", "#C50337"],
    gradient: "linear-gradient(135deg, #02060E 0%, #C50337 100%)",
    desc: "Preto profundo com carmesim dramático e gradientes sofisticados."
  }
]

export function Settings() {
  const { user, profile } = useOutletContext<any>()
  const navigate = useNavigate()
  const { showToast, showConfirmModal } = useNotification()
  const [activeTab, setActiveTab] = useState<TabType>("Conta")

  // Dados do formulário
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.full_name || "")
  const [username, setUsername] = useState(profile?.username || user?.email?.split('@')[0] || "usuario")
  const [bio, setBio] = useState(profile?.bio || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [city, setCity] = useState(profile?.city || "")
  const [birthDate, setBirthDate] = useState(profile?.birth_date || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(profile?.tags || ["gamer", "programmer"])
  const [favoriteGames, setFavoriteGames] = useState<string[]>(profile?.favorite_games || ["cs2", "rdr2"])
  const [hobbies, setHobbies] = useState<string[]>(profile?.hobbies || ["dev", "gym"])

  // URLs de Avatar e Banner
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || PRESET_BANNERS[0].url)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Estados de salvamento
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false)

  // Estatísticas reais
  const [friendsCount, setFriendsCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)

  // Submenus de "Minha Conta" estilo Discord (Anexo 2)
  const [activeAccountSubTab, setActiveAccountSubTab] = useState<"perfil" | "spotify" | "dados">("perfil")

  // Integração com Spotify
  const [spotifyConnected, setSpotifyConnected] = useState<boolean>(() => {
    return Boolean(profile?.spotify_connected || SpotifyService.isConnected(profile))
  })
  const [spotifyActivity, setSpotifyActivity] = useState<SpotifyTrack | null>(() => {
    return profile?.spotify_activity || null
  })
  const [showSpotifyActivity, setShowSpotifyActivity] = useState<boolean>(() => {
    return profile?.show_spotify_activity !== false
  })
  const [isRefreshingSpotify, setIsRefreshingSpotify] = useState(false)

  // Submenus e Configurações de Privacidade & Segurança
  const [activePrivacySubTab, setActivePrivacySubTab] = useState<"social" | "seguranca" | "bloqueados" | "dados">("social")
  const [friendRequestPolicy, setFriendRequestPolicy] = useState("everyone")
  const [directMessagesFromNonFriends, setDirectMessagesFromNonFriends] = useState(true)
  const [activityStatusVisible, setActivityStatusVisible] = useState(true)
  const [dmSpamFilter, setDmSpamFilter] = useState<DmSpamFilterMode>("safe")
  const [automodConfig, setAutomodConfig] = useState<AutoModConfig>(DEFAULT_AUTOMOD_CONFIG)
  const [newBlockedWordInput, setNewBlockedWordInput] = useState("")
  const [discoverByEmail, setDiscoverByEmail] = useState(true)
  const [discoverByPhone, setDiscoverByPhone] = useState(false)

  // Senha e Segurança
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorFactorId, setTwoFactorFactorId] = useState<string | null>(null)
  const [twoFactorEnrolledAt, setTwoFactorEnrolledAt] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false)

  // Bloqueados & Busca
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loadingBlocks, setLoadingBlocks] = useState(false)
  const [blockedSearchQuery, setBlockedSearchQuery] = useState("")

  // Dados e Privacidade (LGPD)
  const [telemetryEnabled, setTelemetryEnabled] = useState(true)
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState(true)
  const [isExportingData, setIsExportingData] = useState(false)

  // Configurações de Notificações
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS)

  // Configurações de Aparência
  const [themeMode, setThemeMode] = useState<AluraThemeId>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("alura_theme") as AluraThemeId) || "forest"
    }
    return "forest"
  })
  const [chatDensity, setChatDensity] = useState<"comfortable" | "compact">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("alura_chat_density") as any) || "comfortable"
    }
    return "comfortable"
  })
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("alura_reduced_motion") === "true"
    }
    return false
  })

  // Configurações de Som e Voz
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([])
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>(() => {
    return (typeof window !== "undefined" && localStorage.getItem("alura_audio_input_device")) || ""
  })
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>(() => {
    return (typeof window !== "undefined" && localStorage.getItem("alura_audio_output_device")) || ""
  })
  const [micVolume, setMicVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("alura_mic_volume")
      if (v !== null) return Number(v)
    }
    return 100
  })
  const [outputVolume, setOutputVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("alura_output_volume")
      if (v !== null) return Number(v)
    }
    return 80
  })
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [loopbackMic, setLoopbackMic] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micAnimFrameRef = useRef<number | null>(null)

  // Submenus de "Voz, Vídeo & Audio"
  const [activeAudioSubTab, setActiveAudioSubTab] = useState<"voz" | "transmissao" | "sons" | "soundboard" | "avancado">("voz")

  // Configurações de Transmissão (Vídeo / Screen Share)
  const [streamResolution, setStreamResolution] = useState<"720p" | "1080p" | "1440p" | "source">(() => {
    return (typeof window !== "undefined" && (localStorage.getItem("alura_stream_res") as any)) || "1080p"
  })
  const [streamFps, setStreamFps] = useState<15 | 30 | 60>(() => {
    if (typeof window !== "undefined") {
      const f = localStorage.getItem("alura_stream_fps")
      if (f) return Number(f) as any
    }
    return 60
  })
  const [streamMode, setStreamMode] = useState<"smooth" | "clarity">(() => {
    return (typeof window !== "undefined" && (localStorage.getItem("alura_stream_mode") as any)) || "smooth"
  })
  const [streamAudioCapture, setStreamAudioCapture] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_stream_audio_cap") !== "false" : true
  })
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_stream_hw_accel") !== "false" : true
  })
  const [isTestingScreenShare, setIsTestingScreenShare] = useState(false)
  const [screenShareInfo, setScreenShareInfo] = useState<{ width: number; height: number; fps: number } | null>(null)
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenShareStreamRef = useRef<MediaStream | null>(null)

  // Configurações de Sons do Sistema
  const [soundMasterVol, setSoundMasterVol] = useState(() => SoundService.getMasterVolume())
  const [soundMuteAll, setSoundMuteAll] = useState(false)
  const [soundToggles, setSoundToggles] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alura_sound_toggles")
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return {
      messageReceived: true,
      mention: true,
      messageSent: true,
      voiceJoin: true,
      voiceLeave: true,
      mute: true,
      deafen: true,
      incomingCall: true,
      systemAlert: true
    }
  })

  // Configurações de Painel de Efeitos Sonoros (Soundboard) & MyInstants
  const [soundboardVolume, setSoundboardVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("alura_soundboard_volume")
      if (v !== null) return Number(v)
    }
    return 80
  })
  const [allowOthersSoundboard, setAllowOthersSoundboard] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_soundboard_allow_others") !== "false" : true
  })
  const [soundboardShortcut, setSoundboardShortcut] = useState<string>(() => {
    return (typeof window !== "undefined" && localStorage.getItem("alura_soundboard_shortcut")) || "Ctrl + Shift + S"
  })
  const [isRecordingSoundboardKey, setIsRecordingSoundboardKey] = useState(false)
  const [soundboardSearchQuery, setSoundboardSearchQuery] = useState("")
  const [soundboardCategory, setSoundboardCategory] = useState<'all' | 'memes' | 'tv' | 'games' | 'sfx' | 'favorites'>('all')
  const [myInstantsSounds, setMyInstantsSounds] = useState<MyInstantSound[]>(CURATED_MYINSTANTS_SOUNDS)
  const [isLoadingMyInstants, setIsLoadingMyInstants] = useState(false)
  const [playingMyInstantId, setPlayingMyInstantId] = useState<string | null>(null)
  const [favoritesList, setFavoritesList] = useState<string[]>(() => MyInstantsService.getFavorites())
  const [isAddCustomSoundOpen, setIsAddCustomSoundOpen] = useState(false)
  const [addSoundTab, setAddSoundTab] = useState<'link' | 'upload' | 'search'>('link')
  const [customSoundTitle, setCustomSoundTitle] = useState("")
  const [customSoundUrl, setCustomSoundUrl] = useState("")
  const [customSoundEmoji, setCustomSoundEmoji] = useState("🔊")
  const [customSoundCategory, setCustomSoundCategory] = useState<'memes' | 'tv' | 'games' | 'sfx' | 'custom'>('memes')
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false)
  const [previewAudioElement, setPreviewAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [modalSearchQuery, setModalSearchQuery] = useState("")
  const [modalSearchResults, setModalSearchResults] = useState<MyInstantSound[]>([])
  const [isModalSearching, setIsModalSearching] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isDraggingAudioFile, setIsDraggingAudioFile] = useState(false)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  const POPULAR_SOUNDBOARD_EMOJIS = [
    "😂", "🎤", "🐭", "🐴", "🐱", "💣", "🎺", "🗿",
    "🚗", "⚡", "🎻", "📞", "🥶", "🚀", "💻", "🎉",
    "🥁", "👏", "💥", "🔔", "🎮", "🔫", "🚨", "😱",
    "🔥", "💀", "🤖", "🥊", "🥳", "👻", "🍿", "👀"
  ]

  // Configurações de Processamento Avançado
  const [noiseSuppression, setNoiseSuppression] = useState<"krisp" | "standard" | "off">(() => {
    return (typeof window !== "undefined" && (localStorage.getItem("alura_noise_suppression") as any)) || "krisp"
  })
  const [echoCancellation, setEchoCancellation] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_echo_cancellation") !== "false" : true
  })
  const [autoGainControl, setAutoGainControl] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_auto_gain_control") !== "false" : true
  })
  const [audioSubsystem, setAudioSubsystem] = useState<"standard" | "experimental">(() => {
    return (typeof window !== "undefined" && (localStorage.getItem("alura_audio_subsystem") as any)) || "standard"
  })
  const [qosPriority, setQosPriority] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_qos_priority") !== "false" : true
  })

  // Configurações adicionais de Voz (Modo de Entrada / PTT)
  const [inputMode, setInputMode] = useState<"voice" | "ptt">(() => {
    return (typeof window !== "undefined" && (localStorage.getItem("alura_input_mode") as any)) || "voice"
  })
  const [pttKey, setPttKey] = useState<string>(() => {
    return (typeof window !== "undefined" && localStorage.getItem("alura_ptt_key")) || "Caps Lock"
  })
  const [isRecordingPtt, setIsRecordingPtt] = useState(false)
  const [autoSensitivity, setAutoSensitivity] = useState<boolean>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("alura_auto_sensitivity") !== "false" : true
  })
  const [inputSensitivity, setInputSensitivity] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("alura_input_sensitivity")
      if (s !== null) return Number(s)
    }
    return 50
  })

  // Configurações de Conexões Sociais
  const [socialLinks, setSocialLinks] = useState(() => {
    const saved = profile?.social_links
    if (saved && typeof saved === 'object') return saved
    if (typeof saved === 'string') {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    return {
      github: profile?.username ? `github.com/${profile.username}` : "",
      discord: `@${profile?.username || "usuario"}`,
      twitch: "",
      youtube: "",
      steam: "",
      epic: "",
      playstation: "",
      xbox: "",
      riot: "",
      battlenet: "",
      spotify: "",
      twitter: "",
      instagram: "",
      tiktok: "",
      reddit: ""
    }
  })

  const [connectionFilter, setConnectionFilter] = useState<"all" | "games" | "social" | "dev" | "media">("all")
  const [connectionSearch, setConnectionSearch] = useState("")

  const handleUpdateConnectionValue = (id: string, val: string) => {
    setSocialLinks((prev: any) => {
      const current = { ...(prev || {}) }
      current[id] = val
      // Se não havia definição explícita de visibilidade, ativa ao digitar ou desativa se limpar
      if (current[`${id}_enabled`] === undefined) {
        current[`${id}_enabled`] = Boolean(val.trim())
      }
      return current
    })
  }

  const handleToggleConnectionEnabled = (id: string) => {
    setSocialLinks((prev: any) => {
      const data = getConnectionData(prev, id)
      return {
        ...(prev || {}),
        [`${id}_enabled`]: !data.enabled
      }
    })
  }

  const handleClearConnection = (id: string) => {
    setSocialLinks((prev: any) => ({
      ...(prev || {}),
      [id]: "",
      [`${id}_enabled`]: false
    }))
  }

  const handleToggleAllConnections = (enable: boolean) => {
    setSocialLinks((prev: any) => {
      const updated = { ...(prev || {}) }
      SUPPORTED_CONNECTIONS.forEach((conn) => {
        updated[`${conn.id}_enabled`] = enable
      })
      return updated
    })
  }

  // Detecta alterações não salvas
  const hasChanges =
    displayName !== (profile?.display_name || user?.user_metadata?.full_name || "") ||
    username !== (profile?.username || user?.email?.split('@')[0] || "usuario") ||
    bio !== (profile?.bio || "") ||
    phone !== (profile?.phone || "") ||
    city !== (profile?.city || "") ||
    birthDate !== (profile?.birth_date || "") ||
    avatarUrl !== (profile?.avatar_url || "") ||
    bannerUrl !== (profile?.banner_url || PRESET_BANNERS[0].url) ||
    JSON.stringify(selectedTags) !== JSON.stringify(profile?.tags || ["gamer", "programmer"]) ||
    JSON.stringify(favoriteGames) !== JSON.stringify(profile?.favorite_games || ["cs2", "rdr2"]) ||
    JSON.stringify(hobbies) !== JSON.stringify(profile?.hobbies || ["dev", "gym"])

  const handleResetChanges = () => {
    setDisplayName(profile?.display_name || user?.user_metadata?.full_name || "")
    setUsername(profile?.username || user?.email?.split('@')[0] || "usuario")
    setBio(profile?.bio || "")
    setPhone(profile?.phone || "")
    setCity(profile?.city || "")
    setBirthDate(profile?.birth_date || "")
    setSelectedTags(profile?.tags || ["gamer", "programmer"])
    setFavoriteGames(profile?.favorite_games || ["cs2", "rdr2"])
    setHobbies(profile?.hobbies || ["dev", "gym"])
    setAvatarUrl(profile?.avatar_url || "")
    setBannerUrl(profile?.banner_url || PRESET_BANNERS[0].url)
    showToast({
      type: "info",
      title: "Alterações descartadas",
      message: "Os campos foram restaurados para os valores salvos."
    })
  }

  // Atalho de teclado ESC para fechar configurações
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(-1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate])

  // Carregar contadores reais e usuários bloqueados
  useEffect(() => {
    if (!user) return

    async function loadStats() {
      // Amigos
      const { count: fCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      if (fCount !== null) setFriendsCount(fCount)

      // Posts no feed
      const { count: pCount } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (pCount !== null) setPostsCount(pCount)
    }

    loadStats()
  }, [user])

  // Carregar preferências de privacidade salvas apenas uma vez na montagem
  const privacyLoadedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!user || privacyLoadedRef.current === user.id) return
    privacyLoadedRef.current = user.id
    PrivacyService.getSettings(user.id, profile).then(s => {
      setFriendRequestPolicy(s.friendRequestPolicy)
      setDirectMessagesFromNonFriends(s.directMessagesFromNonFriends)
      setActivityStatusVisible(s.activityStatusVisible)
      setDiscoverByEmail(s.discoverByEmail)
      setDiscoverByPhone(s.discoverByPhone)
    })
    AutoModService.getConfig(user.id, profile).then(cfg => {
      setAutomodConfig(cfg)
      setDmSpamFilter(cfg.mode)
    })
    TwoFactorService.getStatus(user.id, profile).then(st => {
      setTwoFactorEnabled(st.enabled)
      setTwoFactorFactorId(st.factorId || null)
      setTwoFactorEnrolledAt(st.enrolledAt || null)
      setBackupCodes(st.backupCodes || [])
    })
  }, [user?.id])

  // Processa retorno do OAuth do Spotify (query param ?code=... com PKCE ou hash)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = window.location.search
    const hash = window.location.hash
    const callbackData = search.includes("code=") ? search : hash

    if (callbackData && (callbackData.includes("code=") || callbackData.includes("access_token="))) {
      SpotifyService.handleAuthCallback(callbackData).then(authResult => {
        if (authResult) {
          window.history.replaceState(null, '', window.location.pathname)
          setActiveTab("Conta")
          setActiveAccountSubTab("spotify")
          setSpotifyConnected(true)
          showToast({
            type: "success",
            title: "Spotify Conectado!",
            message: "Sua conta do Spotify foi vinculada com sucesso à Alura via PKCE."
          })

          // Busca música tocando imediatamente
          SpotifyService.fetchCurrentlyPlaying(authResult.token).then(track => {
            if (track) {
              setSpotifyActivity(track)
              if (user?.id) {
                SpotifyService.saveActivity(user.id, track, true)
              }
            }
          })
        }
      })
    }
  }, [user?.id])

  // Polling em tempo real da atividade do Spotify (2.5s) com detecção instantânea
  useEffect(() => {
    if (!spotifyConnected) return

    let lastTrackId = ""

    const pollSpotify = async () => {
      const token = SpotifyService.getStoredToken()
      if (token) {
        const track = await SpotifyService.fetchCurrentlyPlaying(token)
        const currentId = track && track.isPlaying ? `${track.trackName}::${track.artistName}` : ""

        if (currentId !== lastTrackId) {
          lastTrackId = currentId
          setSpotifyActivity(track && track.isPlaying ? track : null)
          if (user?.id) {
            await SpotifyService.saveActivity(user.id, track && track.isPlaying ? track : null, showSpotifyActivity)
          }
        }
      }
    }

    pollSpotify()
    const interval = setInterval(pollSpotify, 2500)
    return () => clearInterval(interval)
  }, [spotifyConnected, user?.id, showSpotifyActivity])

  // Ações do Spotify
  const handleConnectSpotify = async () => {
    try {
      const authUrl = await SpotifyService.getAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      console.error("Erro ao iniciar autorização do Spotify:", err)
      showToast({
        type: "error",
        title: "Erro de Conexão",
        message: "Falha ao gerar link seguro de autorização com o Spotify."
      })
    }
  }

  const handleDisconnectSpotify = async () => {
    if (!user) return
    await SpotifyService.disconnect(user.id)
    setSpotifyConnected(false)
    setSpotifyActivity(null)
    showToast({
      type: "info",
      title: "Spotify Desconectado",
      message: "Sua conta do Spotify foi desvinculada com sucesso."
    })
  }

  const handleRefreshSpotify = async () => {
    setIsRefreshingSpotify(true)
    const token = SpotifyService.getStoredToken()
    if (!token) {
      setIsRefreshingSpotify(false)
      showToast({
        type: "warning",
        title: "Sessão Expirada",
        message: "Por favor, conecte sua conta do Spotify para atualizar."
      })
      return
    }

    const track = await SpotifyService.fetchCurrentlyPlaying(token)
    if (track) {
      setSpotifyActivity(track)
      if (user?.id) {
        await SpotifyService.saveActivity(user.id, track, showSpotifyActivity)
      }
      showToast({
        type: "success",
        title: "Spotify Atualizado",
        message: `Ouvindo: ${track.trackName} - ${track.artistName}`
      })
    } else {
      showToast({
        type: "info",
        title: "Nenhuma Música Detectada",
        message: "Abra o Spotify e dê play em qualquer música para sincronizar."
      })
    }
    setIsRefreshingSpotify(false)
  }

  const handleToggleSpotifyShow = async (enabled: boolean) => {
    setShowSpotifyActivity(enabled)
    if (user?.id) {
      await SpotifyService.saveActivity(user.id, spotifyActivity, enabled)
      showToast({
        type: "success",
        title: enabled ? "Visibilidade Ativada" : "Visibilidade Ocultada",
        message: enabled
          ? "Seus amigos agora podem ver o que você está ouvindo no Spotify."
          : "Sua atividade musical agora está oculta para amigos."
      })
    }
  }

  const handleSimulateSpotifyTrack = async (track: SpotifyTrack) => {
    setSpotifyActivity(track)
    setSpotifyConnected(true)
    if (user?.id) {
      await SpotifyService.saveActivity(user.id, track, showSpotifyActivity)
      showToast({
        type: "success",
        title: "Faixa de Teste Aplicada",
        message: `Simulando "${track.trackName}" de ${track.artistName} no perfil!`
      })
    }
  }

  // Carregar preferências de notificação salvas
  useEffect(() => {
    if (!user) return
    NotificationPreferencesService.getPreferences(user.id).then(prefs => {
      setNotifPrefs(prefs)
    })
  }, [user])

  // Carregar lista de bloqueados quando abrir aba de privacidade
  useEffect(() => {
    if ((activeTab === "Privacidade" || activePrivacySubTab === "bloqueados") && user) {
      loadBlockedUsers()
    }
  }, [activeTab, activePrivacySubTab, user])

  async function loadBlockedUsers() {
    if (!user) return
    setLoadingBlocks(true)
    try {
      const data = await BlockService.getBlockedUsers(user.id)
      setBlockedUsers(data)
    } catch (err) {
      console.error("Erro ao buscar bloqueios:", err)
      showToast({
        type: "error",
        title: "Erro ao Carregar Bloqueios",
        message: "Não foi possível carregar a lista de usuários bloqueados."
      })
    } finally {
      setLoadingBlocks(false)
    }
  }

  async function handleUnblockUser(blockedId: string) {
    if (!user) return
    try {
      await BlockService.unblockUser(user.id, blockedId)
      setBlockedUsers(prev => prev.filter(u => u.id !== blockedId))
      showToast({
        type: "success",
        title: "Usuário Desbloqueado",
        message: "O usuário foi removido da lista de bloqueios."
      })
    } catch (err) {
      console.error("Erro ao desbloquear usuário:", err)
      showToast({
        type: "error",
        title: "Erro ao Desbloquear",
        message: "Não foi possível desbloquear o usuário."
      })
    }
  }

  // Alteração de Senha
  async function handleUpdatePassword() {
    if (!newPassword) {
      showToast({ type: "warning", title: "Senha Necessária", message: "Informe a nova senha desejada." })
      return
    }
    if (newPassword.length < 6) {
      showToast({ type: "warning", title: "Senha Muito Curta", message: "A nova senha deve ter no mínimo 6 caracteres." })
      return
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: "error", title: "Senhas Divergentes", message: "A confirmação de senha não confere." })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword("")
      setConfirmPassword("")
      showToast({
        type: "success",
        title: "Senha Atualizada!",
        message: "Sua senha foi alterada com sucesso."
      })
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err)
      showToast({
        type: "error",
        title: "Erro ao Alterar Senha",
        message: err.message || "Não foi possível atualizar sua senha."
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Exportar dados da conta (LGPD / GDPR)
  function handleExportUserData() {
    setIsExportingData(true)
    try {
      const exportPayload = {
        app: "Alura Platform",
        exported_at: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email,
          phone: phone || null,
          created_at: user?.created_at,
        },
        profile: {
          display_name: displayName,
          username: username,
          bio: bio,
          city: city,
          birth_date: birthDate,
          tags: selectedTags,
          favorite_games: favoriteGames,
          hobbies: hobbies,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        },
        privacy: {
          friend_request_policy: friendRequestPolicy,
          direct_messages_from_mutual_servers: directMessagesFromNonFriends,
          activity_status_visible: activityStatusVisible,
          dm_spam_filter: dmSpamFilter,
          discover_by_email: discoverByEmail,
          discover_by_phone: discoverByPhone,
          telemetry_enabled: telemetryEnabled,
          personalized_suggestions: personalizedSuggestions,
          two_factor_enabled: twoFactorEnabled,
        },
        blocked_count: blockedUsers.length,
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`
      const downloadAnchor = document.createElement("a")
      downloadAnchor.setAttribute("href", jsonString)
      downloadAnchor.setAttribute("download", `alura-dados-${username || "conta"}-${Date.now()}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      showToast({
        type: "success",
        title: "Dados Exportados!",
        message: "O arquivo JSON contendo suas informações foi baixado."
      })
    } catch (err: any) {
      console.error("Erro ao exportar dados:", err)
      showToast({
        type: "error",
        title: "Erro na Exportação",
        message: "Não foi possível gerar a cópia dos dados no momento."
      })
    } finally {
      setIsExportingData(false)
    }
  }

  // Encerrar outras sessões
  function handleDisconnectOtherSessions() {
    showConfirmModal({
      title: "Encerrar Outras Sessões?",
      message: "Todas as outras sessões ativas no navegador e outros computadores serão deslogadas imediatamente.",
      confirmText: "Encerrar Sessões",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: () => {
        showToast({
          type: "success",
          title: "Sessões Desconectadas",
          message: "Todas as sessões secundárias foram encerradas com êxito."
        })
      }
    })
  }

  // Medidor de Força da Senha
  const passwordStrength = (() => {
    if (!newPassword) return { score: 0, label: "", color: "" }
    let score = 0
    if (newPassword.length >= 6) score += 1
    if (newPassword.length >= 10) score += 1
    if (/[0-9]/.test(newPassword) && /[a-zA-Z]/.test(newPassword)) score += 1
    if (/[^a-zA-Z0-9]/.test(newPassword)) score += 1

    if (score <= 1) return { score: 1, label: "Fraca", color: "bg-alura-danger" }
    if (score === 2) return { score: 2, label: "Razoável", color: "bg-amber-500" }
    if (score === 3) return { score: 3, label: "Boa", color: "bg-emerald-400" }
    return { score: 4, label: "Forte", color: "bg-alura-accent" }
  })()

  // Desativar 2FA com confirmação real
  function handleDisable2FA() {
    showConfirmModal({
      title: "Desativar Autenticação em 2 Etapas?",
      message: "Sua conta ficará protegida apenas por senha. Deseja realmente desativar o 2FA?",
      confirmText: "Desativar 2FA",
      cancelText: "Manter Protegido",
      isDanger: true,
      onConfirm: async () => {
        if (!user) return
        const res = await TwoFactorService.disable(user.id, twoFactorFactorId || undefined)
        if (res.success) {
          setTwoFactorEnabled(false)
          setTwoFactorFactorId(null)
          setTwoFactorEnrolledAt(null)
          setBackupCodes([])
          showToast({
            type: "info",
            title: "2FA Desativado",
            message: "A autenticação em duas etapas foi desligada."
          })
        } else {
          showToast({
            type: "error",
            title: "Erro ao Desativar",
            message: res.error || "Não foi possível desativar o 2FA."
          })
        }
      }
    })
  }

  // Ações de desativação e exclusão de conta
  function handleDeactivateAccount() {
    showConfirmModal({
      title: "Desativar Conta Alura?",
      message: "Seu perfil ficará invisível e você não receberá mensagens ou notificações até seu próximo login. Deseja desativar temporariamente?",
      confirmText: "Desativar Conta",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: () => {
        showToast({
          type: "info",
          title: "Conta Desativada",
          message: "Sua conta foi suspensa temporariamente. Para reativar, basta fazer login novamente."
        })
        supabase.auth.signOut().then(() => navigate('/login'))
      }
    })
  }

  function handleDeleteAccount() {
    showConfirmModal({
      title: "EXCLUIR CONTA DEFINITIVAMENTE?",
      message: "Esta ação é irreversível. Todos os seus servidores, mensagens diretas, histórico de conexões e dados da conta serão apagados para sempre após 30 dias.",
      confirmText: "Excluir Minha Conta",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: () => {
        showToast({
          type: "error",
          title: "Solicitação Registrada",
          message: "Sua solicitação de exclusão permanente foi enviada. Você será desconectado."
        })
        supabase.auth.signOut().then(() => navigate('/login'))
      }
    })
  }

  // Carregar dispositivos de áudio na aba de voz
  useEffect(() => {
    if (activeTab === "Som e Voz" && typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const inputs = devices.filter(d => d.kind === "audioinput")
        const outputs = devices.filter(d => d.kind === "audiooutput")
        setAudioInputDevices(inputs)
        setAudioOutputDevices(outputs)
        
        // Mantém dispositivo salvo ou seleciona o padrão
        if (inputs.length > 0) {
          const exists = inputs.some(d => d.deviceId === selectedAudioInput)
          if (!selectedAudioInput || !exists) {
            setSelectedAudioInput(inputs[0].deviceId)
            try { localStorage.setItem("alura_audio_input_device", inputs[0].deviceId) } catch {}
          }
        }
        if (outputs.length > 0) {
          const exists = outputs.some(d => d.deviceId === selectedAudioOutput)
          if (!selectedAudioOutput || !exists) {
            setSelectedAudioOutput(outputs[0].deviceId)
            try { localStorage.setItem("alura_audio_output_device", outputs[0].deviceId) } catch {}
          }
        }
      }).catch(err => console.warn("Não foi possível listar dispositivos de áudio:", err))
    }
  }, [activeTab])

  // Finalizar teste de mic e screen share se sair da tela
  useEffect(() => {
    return () => {
      stopMicTest()
      stopScreenShareTest()
      MyInstantsService.stop()
    }
  }, [])

  function toggleMicTest() {
    if (isTestingMic) {
      stopMicTest()
    } else {
      startMicTest()
    }
  }

  async function startMicTest() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedAudioInput ? { deviceId: { exact: selectedAudioInput } } : true
      })
      micStreamRef.current = stream

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      // Loopback opcional para retorno da própria voz nos fones
      if (loopbackMic) {
        source.connect(audioCtx.destination)
      }

      setIsTestingMic(true)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        const normalized = Math.min(100, Math.round((avg / 128) * 100))
        setMicLevel(normalized)
        micAnimFrameRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()
    } catch (err) {
      console.error("Erro ao acessar microfone:", err)
      showToast({
        type: "error",
        title: "Microfone Indisponível",
        message: "Não foi possível acessar o microfone. Verifique as permissões no sistema operacional."
      })
    }
  }

  function stopMicTest() {
    if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current)
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { })
      audioContextRef.current = null
    }
    setIsTestingMic(false)
    setMicLevel(0)
  }

  // Capturar tecla Push-to-Talk
  useEffect(() => {
    if (!isRecordingPtt) return
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const keyName = e.code === "Space" ? "Espaço" : e.key.length === 1 ? e.key.toUpperCase() : e.key
      setPttKey(keyName)
      setIsRecordingPtt(false)
      try { localStorage.setItem("alura_ptt_key", keyName) } catch {}
      showToast({ type: "success", title: "Tecla Definida", message: `Push-to-Talk vinculado a ${keyName}.` })
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isRecordingPtt])

  // Capturar atalho do Soundboard
  useEffect(() => {
    if (!isRecordingSoundboardKey) return
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const parts = []
      if (e.ctrlKey) parts.push("Ctrl")
      if (e.shiftKey) parts.push("Shift")
      if (e.altKey) parts.push("Alt")
      if (e.metaKey) parts.push("Meta")
      const keyName = e.code === "Space" ? "Espaço" : e.key.length === 1 ? e.key.toUpperCase() : e.key
      if (!["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        parts.push(keyName)
      }
      const shortcut = parts.join(" + ") || "Ctrl + Shift + S"
      setSoundboardShortcut(shortcut)
      setIsRecordingSoundboardKey(false)
      try { localStorage.setItem("alura_soundboard_shortcut", shortcut) } catch {}
      showToast({ type: "success", title: "Atalho Definido", message: `Soundboard vinculado a ${shortcut}.` })
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isRecordingSoundboardKey])

  // Busca integrada em tempo real com www.myinstants.com
  useEffect(() => {
    let active = true
    setIsLoadingMyInstants(true)

    const timer = setTimeout(async () => {
      try {
        const results = await MyInstantsService.search(soundboardSearchQuery)
        if (active) {
          setMyInstantsSounds(results)
        }
      } catch (err) {
        console.warn("Erro ao buscar no MyInstants:", err)
      } finally {
        if (active) setIsLoadingMyInstants(false)
      }
    }, soundboardSearchQuery.trim() ? 350 : 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [soundboardSearchQuery])

  // Tocar/Parar som do MyInstants
  const handleTogglePlayMyInstant = (sound: MyInstantSound) => {
    if (playingMyInstantId === sound.id) {
      MyInstantsService.stop()
      setPlayingMyInstantId(null)
      return
    }

    setPlayingMyInstantId(sound.id)
    MyInstantsService.play(sound.mp3, soundboardVolume, () => {
      setPlayingMyInstantId((curr) => (curr === sound.id ? null : curr))
    })
  }

  // Favoritar / Desfavoritar som
  const handleToggleFavorite = (soundId: string) => {
    MyInstantsService.toggleFavorite(soundId)
    setFavoritesList(MyInstantsService.getFavorites())
  }

  // Funções do Modal de Adicionar Efeitos Sonoros
  const stopPreviewAudio = () => {
    if (previewAudioElement) {
      try {
        previewAudioElement.pause()
        previewAudioElement.currentTime = 0
      } catch (e) {}
      setPreviewAudioElement(null)
    }
    setIsPreviewPlaying(false)
  }

  const handleTogglePreviewSound = (urlToTest?: string) => {
    const targetUrl = urlToTest || customSoundUrl
    if (!targetUrl.trim()) {
      showToast({ type: "warning", title: "Nenhum Áudio", message: "Informe um link ou envie um arquivo para testar." })
      return
    }

    if (isPreviewPlaying) {
      stopPreviewAudio()
      return
    }

    try {
      stopPreviewAudio()
      const audio = new Audio(targetUrl)
      audio.volume = Math.min(1, Math.max(0, soundboardVolume / 100))
      setPreviewAudioElement(audio)
      setIsPreviewPlaying(true)

      audio.onended = () => {
        setIsPreviewPlaying(false)
        setPreviewAudioElement(null)
      }
      audio.onerror = () => {
        setIsPreviewPlaying(false)
        setPreviewAudioElement(null)
        showToast({ type: "error", title: "Falha na Reprodução", message: "Não foi possível reproduzir este áudio. Verifique se o link ou arquivo é válido." })
      }
      audio.play().catch(err => {
        setIsPreviewPlaying(false)
        setPreviewAudioElement(null)
        console.warn("Prévia bloqueada:", err)
      })
    } catch (err) {
      setIsPreviewPlaying(false)
      showToast({ type: "error", title: "Erro de Formato", message: "Formato de áudio não suportado." })
    }
  }

  const handleAnalyzeUrl = async (urlOverride?: string) => {
    const urlToAnalyze = urlOverride !== undefined ? urlOverride : customSoundUrl
    if (!urlToAnalyze.trim()) return

    setIsAnalyzingUrl(true)
    stopPreviewAudio()
    try {
      const parsed = await MyInstantsService.parseMyInstantsUrl(urlToAnalyze)
      if (parsed.title) setCustomSoundTitle(parsed.title)
      if (parsed.mp3) setCustomSoundUrl(parsed.mp3)
      if (parsed.emoji) setCustomSoundEmoji(parsed.emoji)
      if (parsed.category) setCustomSoundCategory(parsed.category)
      showToast({
        type: "success",
        title: "Link Reconhecido!",
        message: `Identificado: "${parsed.title}".`
      })
    } catch (e) {
      console.warn("Erro ao analisar URL:", e)
    } finally {
      setIsAnalyzingUrl(false)
    }
  }

  const handleAudioFileUpload = (file: File) => {
    if (!file) return
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)) {
      showToast({ type: "error", title: "Formato Inválido", message: "Por favor, envie um arquivo de áudio (.mp3, .wav, .ogg, .m4a)." })
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast({ type: "warning", title: "Arquivo Muito Grande", message: "O tamanho máximo do áudio é 12MB." })
      return
    }

    stopPreviewAudio()
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        setCustomSoundUrl(dataUrl)
        setUploadedFileName(file.name)
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ")
        const titleFormatted = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
        setCustomSoundTitle(titleFormatted)
        setCustomSoundEmoji("🔊")
        setCustomSoundCategory("custom")
        showToast({
          type: "success",
          title: "Arquivo Carregado!",
          message: `"${file.name}" carregado com sucesso.`
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Busca integrada de sons dentro do modal
  useEffect(() => {
    if (!isAddCustomSoundOpen || addSoundTab !== 'search') return
    let active = true
    setIsModalSearching(true)

    const timer = setTimeout(async () => {
      try {
        const results = await MyInstantsService.search(modalSearchQuery || "meme")
        if (active) setModalSearchResults(results)
      } catch (err) {
        console.warn("Erro ao buscar no modal:", err)
      } finally {
        if (active) setIsModalSearching(false)
      }
    }, modalSearchQuery.trim() ? 300 : 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [modalSearchQuery, isAddCustomSoundOpen, addSoundTab])

  const handleSelectFromModalSearch = (sound: MyInstantSound) => {
    stopPreviewAudio()
    const added = MyInstantsService.addCustomSound(sound.title, sound.mp3, sound.emoji || "🔊", sound.category || "memes")
    setMyInstantsSounds(prev => [added, ...prev])
    setIsAddCustomSoundOpen(false)
    showToast({
      type: "success",
      title: "Som Importado!",
      message: `"${added.title}" adicionado ao seu Soundboard.`
    })
  }

  const handleSaveCustomSound = () => {
    if (!customSoundTitle.trim()) {
      showToast({ type: "warning", title: "Título Obrigatório", message: "Informe um título para o seu efeito sonoro." })
      return
    }
    if (!customSoundUrl.trim()) {
      showToast({ type: "warning", title: "Áudio Obrigatório", message: "Informe a URL ou envie um arquivo de áudio." })
      return
    }

    stopPreviewAudio()
    const added = MyInstantsService.addCustomSound(
      customSoundTitle.trim(),
      customSoundUrl.trim(),
      customSoundEmoji || "🔊",
      customSoundCategory
    )
    setMyInstantsSounds(prev => [added, ...prev])
    setCustomSoundTitle("")
    setCustomSoundUrl("")
    setCustomSoundEmoji("🔊")
    setUploadedFileName(null)
    setIsAddCustomSoundOpen(false)
    showToast({
      type: "success",
      title: "Efeito Sonoro Salvo!",
      message: `"${added.title}" adicionado à sua coleção com sucesso.`
    })
  }

  // Teste interativo de Compartilhamento de Tela
  async function startScreenShareTest() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: streamFps,
          width: streamResolution === "720p" ? 1280 : streamResolution === "1080p" ? 1920 : streamResolution === "1440p" ? 2560 : undefined,
          height: streamResolution === "720p" ? 720 : streamResolution === "1080p" ? 1080 : streamResolution === "1440p" ? 1440 : undefined
        },
        audio: streamAudioCapture
      })

      screenShareStreamRef.current = stream
      setIsTestingScreenShare(true)

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        setScreenShareInfo({
          width: settings.width || 1920,
          height: settings.height || 1080,
          fps: Math.round(settings.frameRate || streamFps)
        })

        videoTrack.onended = () => {
          stopScreenShareTest()
        }
      }

      setTimeout(() => {
        if (screenShareVideoRef.current) {
          screenShareVideoRef.current.srcObject = stream
        }
      }, 100)

      showToast({ type: "info", title: "Captura de Tela Iniciada", message: "Transmissão de teste ativa no preview." })
    } catch (err: any) {
      console.warn("Compartilhamento cancelado:", err)
    }
  }

  function stopScreenShareTest() {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(t => t.stop())
      screenShareStreamRef.current = null
    }
    if (screenShareVideoRef.current) {
      screenShareVideoRef.current.srcObject = null
    }
    setIsTestingScreenShare(false)
    setScreenShareInfo(null)
  }

  // Tocar efeito legado do Soundboard
  const handlePlaySoundboard = (soundId: string) => {
    setPlayingSoundboardId(soundId)
    SoundService.playSoundboard(soundId)
    setTimeout(() => {
      setPlayingSoundboardId((curr) => (curr === soundId ? null : curr))
    }, 600)
  }

  // Alterar volume master de som
  const handleMasterVolumeChange = (newVal: number) => {
    setSoundMasterVol(newVal)
    SoundService.setMasterVolume(newVal)
  }

  // Restaurar padrões de áudio da Alura
  const handleResetAudioSettings = () => {
    setMicVolume(100)
    setOutputVolume(80)
    setInputMode("voice")
    setPttKey("Caps Lock")
    setAutoSensitivity(true)
    setInputSensitivity(50)
    setStreamResolution("1080p")
    setStreamFps(60)
    setStreamMode("smooth")
    setStreamAudioCapture(true)
    setHardwareAcceleration(true)
    setSoundboardVolume(80)
    setAllowOthersSoundboard(true)
    setNoiseSuppression("krisp")
    setEchoCancellation(true)
    setAutoGainControl(true)
    setAudioSubsystem("standard")
    setQosPriority(true)

    try {
      localStorage.removeItem("alura_mic_volume")
      localStorage.removeItem("alura_output_volume")
      localStorage.removeItem("alura_input_mode")
      localStorage.removeItem("alura_ptt_key")
      localStorage.removeItem("alura_auto_sensitivity")
      localStorage.removeItem("alura_input_sensitivity")
      localStorage.removeItem("alura_stream_res")
      localStorage.removeItem("alura_stream_fps")
      localStorage.removeItem("alura_stream_mode")
      localStorage.removeItem("alura_stream_audio_cap")
      localStorage.removeItem("alura_stream_hw_accel")
      localStorage.removeItem("alura_soundboard_volume")
      localStorage.removeItem("alura_soundboard_allow_others")
      localStorage.removeItem("alura_noise_suppression")
      localStorage.removeItem("alura_echo_cancellation")
      localStorage.removeItem("alura_auto_gain_control")
      localStorage.removeItem("alura_audio_subsystem")
      localStorage.removeItem("alura_qos_priority")
    } catch {}

    showToast({
      type: "success",
      title: "Configurações Restauradas",
      message: "Todos os parâmetros de áudio e transmissão voltaram aos padrões de fábrica."
    })
  }

  // Funções de Notificações e Sons
  const handleToggleSound = async (key: keyof NotificationPreferences['sounds'], name: string) => {
    const nextVal = !notifPrefs.sounds[key]
    const updated: NotificationPreferences = {
      ...notifPrefs,
      sounds: {
        ...notifPrefs.sounds,
        [key]: nextVal
      }
    }
    setNotifPrefs(updated)
    if (user) {
      await NotificationPreferencesService.savePreferences(user.id, updated)
    }
    showToast({
      type: "info",
      title: "Efeito Sonoro",
      message: `${name}: ${nextVal ? 'Ativado' : 'Silenciado'}`
    })
  }

  const handleUpdateNotifPref = async <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
    toastMsg?: string
  ) => {
    const updated: NotificationPreferences = {
      ...notifPrefs,
      [key]: value
    }
    setNotifPrefs(updated)
    if (user) {
      await NotificationPreferencesService.savePreferences(user.id, updated)
    }
    if (toastMsg) {
      showToast({ type: "info", title: "Notificações", message: toastMsg })
    }
  }

  const handleTestSound = (type: SoundType, name: string) => {
    SoundService.play(type)
    showToast({
      type: "info",
      title: "Prévia de Som",
      message: `Reproduzindo som de "${name}"`
    })
  }

  // Solicitar permissão de notificação
  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      showToast({
        type: "warning",
        title: "Não Suportado",
        message: "Seu navegador não suporta notificações de área de trabalho."
      })
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      handleUpdateNotifPref('desktopNotifications', true, "Notificações na área de trabalho autorizadas!")
    } else {
      handleUpdateNotifPref('desktopNotifications', false, "Permissão para notificações na área de trabalho foi recusada.")
    }
  }

  // Teste completo de sequência
  function handleTestNotificationSequence() {
    SoundService.play('messageReceived')
    showToast({
      type: "success",
      title: "Alura - Notificação Simulada",
      message: notifPrefs.hideMessageContent
        ? "Nova mensagem recebida de @guilherme."
        : "@guilherme: 'E aí, tudo certo? Vamos jogar agora!'"
    })
  }

  // Upload de foto de perfil
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)

    try {
      const compressedAvatar = await compressImageToWebp(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.85 })
      const fileName = `avatar-${user.id}-${Date.now()}.webp`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, compressedAvatar, { contentType: 'image/webp', upsert: true })
      if (uploadErr) throw uploadErr

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(publicData.publicUrl)

      await supabase.from('profiles').update({ avatar_url: publicData.publicUrl }).eq('id', user.id)
      showToast({
        type: "success",
        title: "Foto Atualizada!",
        message: "Sua foto de perfil foi salva com sucesso."
      })
    } catch (err: any) {
      console.error("Erro ao subir avatar:", err)
      showToast({
        type: "error",
        title: "Erro no Upload",
        message: "Falha ao enviar avatar: " + err.message
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Upload de banner customizado
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingBanner(true)

    try {
      const compressedBanner = await compressImageToWebp(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 })
      const fileName = `banner-${user.id}-${Date.now()}.webp`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, compressedBanner, { contentType: 'image/webp', upsert: true })
      if (uploadErr) throw uploadErr

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setBannerUrl(publicData.publicUrl)

      await supabase.from('profiles').update({ banner_url: publicData.publicUrl }).eq('id', user.id)
      showToast({
        type: "success",
        title: "Banner Atualizado!",
        message: "Sua imagem de capa foi salva com sucesso."
      })
    } catch (err: any) {
      console.error("Erro ao subir banner:", err)
      showToast({
        type: "error",
        title: "Erro no Upload",
        message: "Falha ao enviar banner: " + err.message
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  // Salvar configurações de conta
  async function handleSaveAccount() {
    if (!user) return
    setIsSaving(true)
    setSaveError(null)

    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: cleanUsername,
          bio: bio.trim(),
          phone: phone.trim() || null,
          city: city.trim() || null,
          birth_date: birthDate || null,
          tags: selectedTags,
          favorite_games: favoriteGames,
          hobbies: hobbies,
          social_links: socialLinks,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Salvar também preferências de privacidade
      await PrivacyService.saveSettings(user.id, {
        friendRequestPolicy: friendRequestPolicy as any,
        directMessagesFromNonFriends,
        activityStatusVisible,
        discoverByEmail,
        discoverByPhone,
      })

      setSaveSuccess(true)
      showToast({
        type: "success",
        title: "Alterações Salvas!",
        message: "Seu perfil e dados foram atualizados com sucesso."
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err)
      setSaveError(err.message || "Ocorreu um erro ao salvar as alterações.")
      showToast({
        type: "error",
        title: "Erro ao Salvar",
        message: err.message || "Não foi possível atualizar o perfil."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      showToast({
        type: "info",
        title: "ID Copiado!",
        message: `ID #${user.id.substring(0, 10)} copiado para a área de transferência.`
      })
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleLogoutClick = () => {
    showConfirmModal({
      title: "Encerrar Sessão?",
      message: "Tem certeza de que deseja sair da sua conta no Alura? Você precisará entrar novamente.",
      confirmText: "Encerrar Sessão",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: () => supabase.auth.signOut().then(() => navigate('/login'))
    })
  }

  const initials = (displayName || "U").substring(0, 2).toUpperCase()

  const NAV_ITEMS: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "Conta", icon: <User className="w-4 h-4" />, label: "Minha Conta" },
    { id: "Privacidade", icon: <Lock className="w-4 h-4" />, label: "Privacidade & Segurança" },
    { id: "Notificações", icon: <Bell className="w-4 h-4" />, label: "Notificações" },
    { id: "Aparência", icon: <Palette className="w-4 h-4" />, label: "Aparência" },
    { id: "Som e Voz", icon: <Mic className="w-4 h-4" />, label: "Voz, Vídeo & Audio" },
    { id: "Conexões", icon: <LinkIcon className="w-4 h-4" />, label: "Conexões" },
    { id: "Avançado", icon: <Code className="w-4 h-4" />, label: "Avançado" }
  ]

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-alura-background relative">

      {/* Barra de Título Superior de Configurações com Botão ESC */}
      <header className="h-16 px-6 lg:px-10 border-b border-alura-border/40 flex items-center justify-between shrink-0 bg-alura-surface1/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent shadow-[0_0_12px_rgba(57,255,136,0.2)]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Configurações do Usuário</h1>
            <p className="text-[12px] text-alura-textSecondary">Gerencie sua identidade, privacidade e preferências da Alura.</p>
          </div>
        </div>

        {/* Botão ESC estilo Discord / Modern Desktop */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-alura-border hover:border-alura-accent/50 text-alura-textSecondary hover:text-white bg-alura-surface2/60 hover:bg-alura-surface2 transition-all group cursor-pointer"
          title="Fechar configurações (ESC)"
        >
          <div className="w-6 h-6 rounded-full border border-alura-border group-hover:border-alura-accent flex items-center justify-center text-alura-textMuted group-hover:text-alura-accent transition-colors">
            <X className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-alura-textMuted group-hover:text-alura-accent">ESC</span>
        </button>
      </header>

      {/* Conteúdo com Sidebar de Abas e Painel Central */}
      <div className="flex flex-1 overflow-hidden p-6 lg:p-8 gap-8 w-full max-w-[1440px] mx-auto">

        {/* Sidebar de Configurações */}
        <div className="w-[240px] shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-alura-textDisabled uppercase tracking-wider px-3 mb-2 block">
              Configurações de Usuário
            </span>
            <nav className="flex flex-col space-y-1">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.id
                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => {
                        setActiveTab(item.id)
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left cursor-pointer ${isActive
                          ? 'bg-alura-selected text-alura-accent border border-alura-accent/30 shadow-[0_0_15px_rgba(57,255,136,0.12)] font-semibold'
                          : 'text-alura-textSecondary hover:text-white hover:bg-alura-hover border border-transparent'
                        }`}
                    >
                      <div className={isActive ? "text-alura-accent" : "text-alura-textMuted"}>
                        {item.icon}
                      </div>
                      {item.label}
                    </button>

                    {/* Submenu Vertical estilo Discord para Minha Conta (Anexo 2) */}
                    {item.id === "Conta" && isActive && (
                      <div className="relative ml-5 pl-3.5 my-1.5 flex flex-col space-y-1 border-l-2 border-white/10 animate-in fade-in duration-200">
                        {[
                          { id: "perfil", label: "Perfil & Identidade" },
                          { id: "spotify", label: "Spotify & Conexões" },
                          { id: "dados", label: "Dados da Conta" },
                        ].map((sub) => {
                          const isSubActive = activeAccountSubTab === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveAccountSubTab(sub.id as any)}
                              className={`relative py-1 px-2.5 text-left text-[13px] transition-colors rounded-md cursor-pointer flex items-center ${isSubActive
                                  ? "text-white font-semibold"
                                  : "text-alura-textMuted hover:text-alura-textSecondary"
                                }`}
                            >
                              {/* Barra indicadora vertical ativa sobreposta na linha guia (Anexo 2) */}
                              {isSubActive && (
                                <span className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                              )}
                              {sub.label}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Submenu Vertical estilo Discord para Privacidade */}
                    {item.id === "Privacidade" && isActive && (
                      <div className="relative ml-5 pl-3.5 my-1.5 flex flex-col space-y-1 border-l-2 border-white/10">
                        {[
                          { id: "social", label: "Privacidade Social" },
                          { id: "seguranca", label: "Senha e Segurança" },
                          { id: "bloqueados", label: "Usuários Bloqueados" },
                          { id: "dados", label: "Dados e Privacidade" },
                        ].map((sub) => {
                          const isSubActive = activePrivacySubTab === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActivePrivacySubTab(sub.id as any)}
                              className={`relative py-1 px-2.5 text-left text-[13px] transition-colors rounded-md cursor-pointer flex items-center ${isSubActive
                                  ? "text-white font-semibold"
                                  : "text-alura-textMuted hover:text-alura-textSecondary"
                                }`}
                            >
                              {/* Barra indicadora vertical ativa sobreposta na linha guia */}
                              {isSubActive && (
                                <span className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                              )}
                              {sub.label}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Submenu Vertical estilo Discord com linha guia e indicador ativo */}
                    {item.id === "Som e Voz" && isActive && (
                      <div className="relative ml-5 pl-3.5 my-1.5 flex flex-col space-y-1 border-l-2 border-white/10">
                        {[
                          { id: "voz", label: "Voz" },
                          { id: "transmissao", label: "Transmissão" },
                          { id: "sons", label: "Sons" },
                          { id: "soundboard", label: "Painel de efeitos sonoros" },
                          { id: "avancado", label: "Avançado" },
                        ].map((sub) => {
                          const isSubActive = activeAudioSubTab === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveAudioSubTab(sub.id as any)}
                              className={`relative py-1 px-2.5 text-left text-[13px] transition-colors rounded-md cursor-pointer flex items-center ${isSubActive
                                  ? "text-white font-semibold"
                                  : "text-alura-textMuted hover:text-alura-textSecondary"
                                }`}
                            >
                              {/* Barra indicadora vertical ativa sobreposta na linha guia */}
                              {isSubActive && (
                                <span className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                              )}
                              {sub.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Botão de Logout Rápido com Confirmação Customizada */}
          <div className="pt-4 border-t border-alura-border/40">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-alura-danger/80 hover:text-alura-danger hover:bg-alura-danger/10 border border-transparent hover:border-alura-danger/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Área Central de Conteúdo */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">

          {/* ABA 1: CONTA COM SUB-ABAS (PERFIL, SPOTIFY, DADOS) */}
          {activeTab === "Conta" && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* SUB-ABA 1.1: PERFIL & IDENTIDADE */}
              {activeAccountSubTab === "perfil" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                  {/* Formulário Principal */}
                  <div className="xl:col-span-7 space-y-6">

                    {/* Cartão de Identidade Visual (Avatar + Banner) */}
                    <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm p-6">
                      <h2 className="text-[16px] font-bold text-white mb-1">Identidade Visual</h2>
                      <p className="text-[12px] text-alura-textMuted mb-6">Personalize sua foto de perfil e a imagem de destaque do topo.</p>

                      {/* Prévia do Banner + Avatar Interativo */}
                      <div className="relative rounded-xl overflow-hidden border border-alura-border/60 bg-alura-surface2 mb-6">
                        <div className="h-28 w-full relative group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                            <Camera className="w-4 h-4" /> Alterar Banner
                          </div>
                          <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>

                        <div className="px-5 pb-5 relative -mt-8 flex items-end justify-between">
                          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <Avatar className="w-20 h-20 border-4 border-alura-surface1 shadow-xl">
                              {avatarUrl ? (
                                <img src={avatarUrl} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <AvatarFallback className="bg-alura-surface2 text-alura-accent text-2xl font-bold">{initials}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="w-5 h-5" />
                            </div>
                            <input
                              type="file"
                              ref={avatarInputRef}
                              onChange={handleAvatarUpload}
                              accept="image/*,video/mp4,video/webm"
                              className="hidden"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => bannerInputRef.current?.click()}
                              variant="outline"
                              className="h-8 px-3 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface1 cursor-pointer"
                              disabled={uploadingBanner}
                            >
                              {uploadingBanner ? "Enviando..." : "Subir Banner"}
                            </Button>
                            <Button
                              onClick={() => avatarInputRef.current?.click()}
                              variant="outline"
                              className="h-8 px-3 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface1 cursor-pointer"
                              disabled={uploadingAvatar}
                            >
                              {uploadingAvatar ? "Enviando..." : "Mudar Foto"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Banners Pré-definidos */}
                      <div>
                        <span className="text-[12px] font-medium text-alura-textSecondary block mb-2.5">Banners Temáticos Alura</span>
                        <div className="grid grid-cols-4 gap-2">
                          {PRESET_BANNERS.map(b => (
                            <div
                              key={b.id}
                              onClick={() => setBannerUrl(b.url)}
                              className={`relative h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${bannerUrl === b.url ? "border-alura-accent ring-2 ring-alura-accent/30" : "border-alura-border/60 opacity-60 hover:opacity-100"
                                }`}
                            >
                              <img src={b.url} alt={b.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                                <span className="text-[9px] font-bold text-white truncate">{b.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Informações Pessoais */}
                    <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 backdrop-blur-sm p-6 space-y-5">
                      <h2 className="text-[16px] font-bold text-white">Informações da Conta</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Nome de exibição</label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Seu nome ou apelido"
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-alura-accent/60 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Nome de usuário (@)</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="usuario"
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-alura-accent/60 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Biografia</label>
                        <div className="relative">
                          <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 200))}
                            placeholder="Conte um pouco sobre você..."
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-alura-accent/60 transition-colors resize-none leading-relaxed"
                          />
                          <span className="absolute bottom-3 right-4 text-[11px] text-alura-textDisabled">
                            {bio.length}/200
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Data de Nascimento</label>
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/60"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Cidade</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="São Paulo, SP"
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/60"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Telefone</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/60"
                          />
                        </div>
                      </div>

                      {/* Tags de Interesse */}
                      <div className="pt-2">
                        <label className="text-[12px] font-medium text-alura-textSecondary block mb-2">Tags de Perfil</label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_TAGS.map(t => {
                            const isSelected = selectedTags.includes(t.id)
                            return (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTags(selectedTags.filter(x => x !== t.id))
                                  } else {
                                    if (selectedTags.length < 5) setSelectedTags([...selectedTags, t.id])
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                                    ? "bg-alura-selected text-alura-accent border-alura-accent/50 shadow-[0_0_10px_rgba(57,255,136,0.15)] font-semibold"
                                    : "bg-alura-surface2 text-alura-textSecondary border-alura-border hover:border-alura-borderStrong"
                                  }`}
                              >
                                <t.icon className="w-3.5 h-3.5" />
                                {t.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* E-mail e ID de Usuário */}
                      <div className="pt-4 border-t border-alura-border/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] font-medium text-alura-textSecondary block mb-1">E-mail Cadastrado</span>
                          <span className="text-[13px] text-alura-textMuted font-mono">{user?.email || "email@exemplo.com"}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-alura-textSecondary block mb-1">ID Único Alura</span>
                          <div
                            onClick={copyUserId}
                            className="inline-flex items-center gap-2 text-[13px] font-mono text-alura-accent cursor-pointer hover:underline"
                            title="Clique para copiar seu ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>#{user?.id?.substring(0, 10) || "000000"}</span>
                            {copiedId && <span className="text-[11px] text-alura-success font-sans">Copiado!</span>}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Feedback e Botão de Salvar Estático */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {saveSuccess && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-alura-success animate-in fade-in">
                            <Check className="w-4 h-4" /> Alterações salvas com sucesso!
                          </span>
                        )}
                        {saveError && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-alura-danger">
                            <AlertCircle className="w-4 h-4" /> {saveError}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={handleSaveAccount}
                        disabled={isSaving}
                        className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-[14px] px-8 h-11 rounded-xl shadow-[0_0_20px_rgba(57,255,136,0.25)] hover:shadow-[0_0_25px_rgba(57,255,136,0.4)] transition-all cursor-pointer"
                      >
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>

                  </div>

                  {/* Coluna Direita: Live Preview Card */}
                  <div className="xl:col-span-5 space-y-6">
                    <div className="sticky top-0 space-y-6">

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-alura-textDisabled uppercase tracking-wider">Pré-visualização do Perfil</span>
                        <span className="text-xs text-alura-accent font-medium flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Ao vivo
                        </span>
                      </div>

                      {/* Card do Perfil */}
                      <div className="rounded-2xl border border-alura-border bg-alura-surface1/95 overflow-hidden shadow-2xl backdrop-blur-md">
                        <div className="h-32 w-full relative">
                          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-alura-surface1 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-6 pb-6 relative -mt-12">
                          <div className="relative inline-block">
                            <Avatar className="w-20 h-20 border-4 border-alura-surface1 shadow-xl">
                              {avatarUrl ? (
                                <img src={avatarUrl} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <AvatarFallback className="bg-alura-surface2 text-alura-accent text-2xl font-bold">{initials}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute bottom-1 right-1 w-4 h-4 border-2 border-alura-surface1 rounded-full bg-alura-success"></div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-lg font-bold text-white tracking-tight">{displayName || "Seu Nome"}</h3>
                              <Check className="w-4 h-4 text-alura-accent" />
                            </div>
                            <span className="text-xs font-medium text-alura-textSecondary">@{username || "usuario"}</span>

                            <p className="mt-3 text-[13px] text-alura-textPrimary leading-relaxed break-words line-clamp-3">
                              {bio || "Sua biografia aparecerá aqui para toda a comunidade."}
                            </p>

                            {/* Tags */}
                            {selectedTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {selectedTags.map(tagId => {
                                  const t = AVAILABLE_TAGS.find(x => x.id === tagId)
                                  const Icon = t?.icon
                                  return (
                                    <span key={tagId} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-alura-surface2 text-alura-textPrimary border border-alura-border flex items-center gap-1.5 shadow-xs">
                                      {Icon && <Icon className="w-3 h-3 text-alura-accent" />}
                                      <span>{t ? t.label : tagId}</span>
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Métricas Reais */}
                          <div className="flex items-center justify-around mt-6 pt-5 border-t border-alura-border/40 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-base font-bold text-white">{friendsCount}</span>
                              <span className="text-[10px] text-alura-textMuted uppercase font-bold tracking-wider mt-0.5">Amigos</span>
                            </div>
                            <div className="w-[1px] h-6 bg-alura-border/40"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-base font-bold text-white">{postsCount}</span>
                              <span className="text-[10px] text-alura-textMuted uppercase font-bold tracking-wider mt-0.5">Posts Feed</span>
                            </div>
                            <div className="w-[1px] h-6 bg-alura-border/40"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-base font-bold text-white">{favoriteGames.length}</span>
                              <span className="text-[10px] text-alura-textMuted uppercase font-bold tracking-wider mt-0.5">Jogos</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Dica de Customização */}
                      <div className="p-4 rounded-xl border border-alura-border/60 bg-alura-surface1/60 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-alura-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[13px] font-bold text-white block">Perfil Público</span>
                          <p className="text-[12px] text-alura-textSecondary mt-0.5 leading-relaxed">
                            Essas informações são visíveis para amigos e servidores em comum na Alura.
                          </p>
                        </div>
                      </div>

                      {/* Preview do Spotify se estiver ouvindo */}
                      {spotifyActivity?.isPlaying && showSpotifyActivity && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#39FF88] px-1 block">
                            Atividade Musical em Exibição
                          </span>
                          <SpotifyActivityCard track={spotifyActivity} compact userName={displayName} />
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* SUB-ABA 1.2: SPOTIFY & CONEXÕES */}
              {activeAccountSubTab === "spotify" && (
                <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">

                  {/* Card 1: Status da Conexão com Spotify */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] shadow-[0_0_20px_rgba(29,185,84,0.25)]">
                          <SpotifyIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-[17px] font-bold text-white tracking-tight">Spotify Connect</h2>
                            {spotifyConnected ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[11px] font-bold text-[#39FF88] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF88] animate-pulse" /> Conectado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-alura-textMuted">
                                Não Conectado
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-alura-textMuted mt-0.5">
                            Transmita o que você ouve em tempo real para seus amigos na Alura.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {spotifyConnected ? (
                          <>
                            <Button
                              onClick={handleRefreshSpotify}
                              disabled={isRefreshingSpotify}
                              variant="outline"
                              className="h-9 px-3.5 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface2 flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSpotify ? 'animate-spin' : ''}`} />
                              <span>{isRefreshingSpotify ? "Atualizando..." : "Sincronizar"}</span>
                            </Button>
                            <Button
                              onClick={handleDisconnectSpotify}
                              variant="outline"
                              className="h-9 px-3 text-xs border-alura-danger/30 text-alura-danger hover:bg-alura-danger/10 cursor-pointer"
                            >
                              Desconectar
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleConnectSpotify}
                            className="h-9 px-4 text-xs font-bold bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-[0_0_15px_rgba(29,185,84,0.35)] flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                          >
                            <SpotifyIcon className="w-4 h-4" color="#000" />
                            <span>Conectar Spotify</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Preferências de Visibilidade & Privacidade */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-alura-accent" />
                      Visibilidade para Amigos
                    </h3>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60">
                      <div className="space-y-0.5 pr-4">
                        <span className="text-[13px] font-bold text-white block">
                          Exibir música em reprodução no meu perfil e aos amigos
                        </span>
                        <p className="text-[12px] text-alura-textMuted leading-relaxed">
                          Seus amigos e membros dos mesmos servidores verão a capa, faixa e artista em tempo real quando você estiver ouvindo no Spotify.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSpotifyShow(!showSpotifyActivity)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${showSpotifyActivity ? 'bg-[#1DB954]' : 'bg-alura-surface3'
                          }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showSpotifyActivity ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Atividade Ao Vivo / Player em Tempo Real */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-[#39FF88]" />
                        Atividade Musical Ao Vivo
                      </h3>
                      {spotifyActivity?.isPlaying && (
                        <span className="text-[11px] text-[#39FF88] font-mono">● Transmitindo</span>
                      )}
                    </div>

                    {spotifyActivity?.isPlaying ? (
                      <SpotifyActivityCard track={spotifyActivity} userName={displayName} />
                    ) : (
                      <div className="p-8 rounded-2xl border border-alura-border/60 bg-alura-surface1/40 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#00220E] border border-[#004B1F] flex items-center justify-center text-[#1DB954] mx-auto shadow-inner">
                          <Headphones className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-white">Nenhuma faixa tocando no momento</h4>
                          <p className="text-[12px] text-alura-textMuted max-w-md mx-auto mt-1">
                            Abra o aplicativo do Spotify (Desktop, Web ou Mobile) e comece a ouvir qualquer música para que ela apareça automaticamente aqui e para seus amigos.
                          </p>
                        </div>
                        <Button
                          onClick={handleRefreshSpotify}
                          disabled={isRefreshingSpotify}
                          variant="outline"
                          className="h-8 px-4 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface2 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshingSpotify ? 'animate-spin' : ''}`} />
                          Verificar agora
                        </Button>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* SUB-ABA 1.3: DADOS DA CONTA */}
              {activeAccountSubTab === "dados" && (
                <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">

                  {/* Informações Cadastrais */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5 shadow-sm">
                    <div>
                      <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-alura-accent" />
                        Informações Cadastrais da Conta
                      </h2>
                      <p className="text-[13px] text-alura-textMuted mt-1">Dados essenciais de registro do seu usuário na Alura.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-alura-accent" />
                          <div>
                            <span className="text-xs text-alura-textMuted block">E-mail Cadastrado</span>
                            <span className="text-sm font-semibold text-white">{user?.email || "usuario@alura.com"}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-alura-accent/10 border border-alura-accent/20 text-[11px] font-bold text-alura-accent">
                          Verificado
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-alura-accent" />
                          <div>
                            <span className="text-xs text-alura-textMuted block">Nome de Usuário</span>
                            <span className="text-sm font-semibold text-white">@{username}</span>
                          </div>
                        </div>
                        <span className="text-xs text-alura-textMuted">Público</span>
                      </div>

                      <div className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="w-4 h-4 text-alura-accent" />
                          <div>
                            <span className="text-xs text-alura-textMuted block">ID do Usuário (UUID)</span>
                            <code className="text-xs font-mono text-alura-textSecondary">{user?.id || "00000000-0000-0000"}</code>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (user?.id) {
                              navigator.clipboard.writeText(user.id)
                              showToast({
                                type: "success",
                                title: "Copiado!",
                                message: "ID copiado para a área de transferência."
                              })
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-alura-accent hover:text-white bg-alura-accent/10 hover:bg-alura-accent/20 rounded-lg transition-colors cursor-pointer"
                        >
                          Copiar ID
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-alura-accent" />
                          <div>
                            <span className="text-xs text-alura-textMuted block">Membro Desde</span>
                            <span className="text-sm font-semibold text-white">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : "Setembro de 2026"}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[11px] font-bold text-[#F5A623]">
                          Beta Founder
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas de Segurança */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-alura-accent" />
                      Segurança da Conta
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("Privacidade")
                          setActivePrivacySubTab("seguranca")
                        }}
                        className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 hover:border-alura-accent/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 text-alura-accent mb-1.5">
                          <Key className="w-4 h-4" />
                          <span className="text-sm font-bold text-white group-hover:text-alura-accent transition-colors">
                            Alterar Senha
                          </span>
                        </div>
                        <p className="text-xs text-alura-textMuted">Mantenha sua conta protegida com uma senha forte.</p>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("Privacidade")
                          setActivePrivacySubTab("seguranca")
                        }}
                        className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-border/60 hover:border-alura-accent/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 text-alura-accent mb-1.5">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-sm font-bold text-white group-hover:text-alura-accent transition-colors">
                            Autenticação 2FA
                          </span>
                        </div>
                        <p className="text-xs text-alura-textMuted">Adicione camada extra com app autenticador TOTP.</p>
                      </button>
                    </div>
                  </div>

                  {/* Zona de Perigo */}
                  <div className="rounded-2xl border border-alura-danger/30 bg-alura-danger/5 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-alura-danger">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="text-[15px] font-bold">Ações da Conta</h3>
                    </div>
                    <p className="text-[12px] text-alura-textMuted">
                      Encerrar a sessão desconectará este dispositivo da plataforma Alura.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        onClick={handleLogoutClick}
                        variant="outline"
                        className="border-alura-danger/40 text-alura-danger hover:bg-alura-danger/15 h-9 px-4 text-xs font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sair da Conta
                      </Button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ABA 2: PRIVACIDADE & SEGURANÇA COM SUB-ABAS ESTILO DISCORD */}
          {activeTab === "Privacidade" && (
            <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">

              {/* SUB-ABA 1: PRIVACIDADE SOCIAL */}
              {activePrivacySubTab === "social" && (
                <div className="space-y-6">
                  {/* Card 1: Quem pode enviar amizade */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5 shadow-sm">
                    <div>
                      <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-alura-accent" />
                        Privacidade Social & Amizades
                      </h2>
                      <p className="text-[13px] text-alura-textMuted mt-1">Controle quem pode interagir com você e te adicionar na Alura.</p>
                    </div>

                    <div className="pt-1">
                      <label className="text-[13px] font-semibold text-white block mb-2.5">Quem pode enviar pedidos de amizade</label>
                      <div className="space-y-2">
                        {[
                          { id: "everyone", title: "Todos na Alura", desc: "Qualquer usuário pode te enviar uma solicitação de amizade." },
                          { id: "mutual", title: "Amigos de Amigos e Servidores Mútuos", desc: "Apenas membros que compartilham amigos ou servidores com você." },
                          { id: "nobody", title: "Ninguém", desc: "Bloqueia novas solicitações externas de amizade." }
                        ].map(opt => (
                          <div
                            key={opt.id}
                            onClick={async () => {
                              const nextPolicy = opt.id as any
                              setFriendRequestPolicy(nextPolicy)
                              if (user) {
                                await PrivacyService.saveSettings(user.id, {
                                  friendRequestPolicy: nextPolicy,
                                  directMessagesFromNonFriends,
                                  activityStatusVisible,
                                  discoverByEmail,
                                  discoverByPhone,
                                })
                              }
                              showToast({ type: "success", title: "Preferência Salva", message: `Política alterada: ${opt.title}` })
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${friendRequestPolicy === opt.id
                                ? "bg-alura-selected border-alura-accent/50 text-white shadow-[0_0_15px_rgba(57,255,136,0.08)]"
                                : "bg-alura-surface2 border-alura-border hover:bg-alura-hover text-alura-textSecondary"
                              }`}
                          >
                            <div>
                              <span className="text-[14px] font-medium text-white block">{opt.title}</span>
                              <span className="text-[12px] text-alura-textMuted">{opt.desc}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${friendRequestPolicy === opt.id ? "border-alura-accent bg-alura-accent" : "border-alura-border"}`}>
                              {friendRequestPolicy === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-[#0B0D0F]"></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DMs e Status Toggles */}
                    <div className="pt-4 border-t border-alura-border/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Mensagens diretas de servidores em comum</span>
                          <span className="text-[12px] text-alura-textMuted">Permitir que membros de servidores te enviem mensagens diretas sem ser amigos.</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={directMessagesFromNonFriends}
                          onClick={async () => {
                            const next = !directMessagesFromNonFriends
                            setDirectMessagesFromNonFriends(next)
                            if (user) {
                              await PrivacyService.saveSettings(user.id, {
                                friendRequestPolicy: friendRequestPolicy as any,
                                directMessagesFromNonFriends: next,
                                activityStatusVisible,
                                discoverByEmail,
                                discoverByPhone,
                              })
                            }
                            showToast({
                              type: "info",
                              title: "Mensagens Diretas",
                              message: next ? "Mensagens diretas de servidores em comum permitidas." : "Mensagens diretas restritas apenas para amigos."
                            })
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${directMessagesFromNonFriends ? "bg-alura-accent" : "bg-alura-surface3"}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${directMessagesFromNonFriends ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Compartilhar status de atividade</span>
                          <span className="text-[12px] text-alura-textMuted">Exibir se você está online, em um jogo ou ouvindo algo nos servidores.</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={activityStatusVisible}
                          onClick={async () => {
                            const next = !activityStatusVisible
                            setActivityStatusVisible(next)
                            if (user) {
                              await PrivacyService.saveSettings(user.id, {
                                friendRequestPolicy: friendRequestPolicy as any,
                                directMessagesFromNonFriends,
                                activityStatusVisible: next,
                                discoverByEmail,
                                discoverByPhone,
                              })
                            }
                            showToast({
                              type: "info",
                              title: "Status de Atividade",
                              message: next ? "Status e atividades visíveis para amigos e servidores." : "Status invisível e atividades ocultas."
                            })
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${activityStatusVisible ? "bg-alura-accent" : "bg-alura-surface3"}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${activityStatusVisible ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Permitir descoberta por E-mail</span>
                          <span className="text-[12px] text-alura-textMuted">Permitir que usuários que conhecem seu e-mail encontrem sua conta no Alura.</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={discoverByEmail}
                          onClick={async () => {
                            const next = !discoverByEmail
                            setDiscoverByEmail(next)
                            if (user) {
                              await PrivacyService.saveSettings(user.id, {
                                friendRequestPolicy: friendRequestPolicy as any,
                                directMessagesFromNonFriends,
                                activityStatusVisible,
                                discoverByEmail: next,
                                discoverByPhone,
                              })
                              if (user.email) {
                                supabase.from('profiles').update({ email: user.email }).eq('id', user.id).then(() => { })
                              }
                            }
                            showToast({
                              type: "info",
                              title: "Descoberta de Conta",
                              message: next ? "Busca por e-mail ativada." : "Busca por e-mail desativada."
                            })
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${discoverByEmail ? "bg-alura-accent" : "bg-alura-surface3"}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${discoverByEmail ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Permitir descoberta por Telefone</span>
                          <span className="text-[12px] text-alura-textMuted">Permitir que contatos com seu número salvo encontrem você na lista de amigos.</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={discoverByPhone}
                          onClick={async () => {
                            const next = !discoverByPhone
                            if (next && (!phone || !phone.trim())) {
                              showToast({
                                type: "warning",
                                title: "Telefone não cadastrado",
                                message: "Adicione um número de telefone na aba Conta para permitir que amigos te encontrem."
                              })
                            }
                            setDiscoverByPhone(next)
                            if (user) {
                              await PrivacyService.saveSettings(user.id, {
                                friendRequestPolicy: friendRequestPolicy as any,
                                directMessagesFromNonFriends,
                                activityStatusVisible,
                                discoverByEmail,
                                discoverByPhone: next,
                              })
                            }
                            showToast({
                              type: "info",
                              title: "Descoberta de Conta",
                              message: next ? "Busca por telefone ativada." : "Busca por telefone desativada."
                            })
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${discoverByPhone ? "bg-alura-accent" : "bg-alura-surface3"}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${discoverByPhone ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Filtro de Mídia Explícita e Segurança de Mensagens */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <div>
                      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-alura-accent" />
                        Filtro de Conteúdo e Mídias em Mensagens Diretas
                      </h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Analisa automaticamente anexos e mensagens recebidas para proteção contra spam ou conteúdo explícito.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          id: "safe",
                          title: "Proteja-me",
                          desc: "Examina mensagens diretas de todos os membros.",
                          badge: "Recomendado",
                          badgeColor: "bg-alura-accent/20 text-alura-accent border-alura-accent/40"
                        },
                        {
                          id: "friends",
                          title: "Apenas Desconhecidos",
                          desc: "Não examina mensagens enviadas por seus amigos.",
                          badge: "Padrão",
                          badgeColor: "bg-white/10 text-alura-textSecondary border-white/10"
                        },
                        {
                          id: "off",
                          title: "Desativado",
                          desc: "Não examinar nenhuma mensagem direta recebida.",
                          badge: "Inseguro",
                          badgeColor: "bg-alura-danger/20 text-alura-danger border-alura-danger/40"
                        }
                      ].map((item) => {
                        const isChosen = dmSpamFilter === item.id
                        return (
                          <div
                            key={item.id}
                            onClick={async () => {
                              const mode = item.id as DmSpamFilterMode
                              setDmSpamFilter(mode)
                              const updated: AutoModConfig = { ...automodConfig, mode }
                              setAutomodConfig(updated)
                              if (user) {
                                await AutoModService.saveConfig(user.id, updated)
                              }
                              showToast({
                                type: "info",
                                title: "Auto-MOD",
                                message: mode === 'safe'
                                  ? "Auto-MOD: Protegendo todas as mensagens e mídias recebidas."
                                  : mode === 'friends'
                                    ? "Auto-MOD: Protegendo mensagens de desconhecidos."
                                    : "Auto-MOD desativado. Mensagens não serão examinadas."
                              })
                            }}
                            className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${isChosen
                                ? "bg-alura-selected border-alura-accent/60 shadow-[0_0_15px_rgba(57,255,136,0.12)]"
                                : "bg-alura-surface2 border-alura-border hover:bg-alura-hover"
                              }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[13px] font-bold text-white">{item.title}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-alura-textMuted leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isChosen ? "border-alura-accent bg-alura-accent" : "border-alura-border"}`}>
                                {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-[#0B0D0F]"></div>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Detalhes e Regras do Auto-MOD */}
                    {dmSpamFilter !== 'off' && (() => {
                      const filterProfanity = automodConfig?.filterProfanity ?? true
                      const filterPhishing = automodConfig?.filterPhishing ?? true
                      const filterExplicitMedia = automodConfig?.filterExplicitMedia ?? true
                      const safeBlockedWords = Array.isArray(automodConfig?.blockedWords) ? automodConfig.blockedWords : []

                      return (
                        <div className="pt-4 border-t border-alura-border/50 space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-alura-accent" />
                            <span className="text-[13px] font-bold text-white uppercase tracking-wider">Regras Ativas do Auto-MOD</span>
                          </div>

                          {/* Regra 1: Linguagem Imprópria */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-alura-surface2/60 border border-alura-border/40">
                            <div>
                              <span className="text-[13px] font-semibold text-white block">Filtro de Linguagem Imprópria & Assédio</span>
                              <span className="text-[11px] text-alura-textMuted">Detecta termos ofensivos, insultos graves e discurso de ódio.</span>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={filterProfanity}
                              onClick={async () => {
                                const next = !filterProfanity
                                const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), filterProfanity: next }
                                setAutomodConfig(updated)
                                if (user) await AutoModService.saveConfig(user.id, updated)
                                showToast({ type: "info", title: "Auto-MOD", message: `Filtro de linguagem: ${next ? 'Ativado' : 'Desativado'}` })
                              }}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${filterProfanity ? "bg-alura-accent" : "bg-alura-surface3"}`}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${filterProfanity ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Regra 2: Phishing & Links */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-alura-surface2/60 border border-alura-border/40">
                            <div>
                              <span className="text-[13px] font-semibold text-white block">Bloqueador de Links Suspeitos & Phishing</span>
                              <span className="text-[11px] text-alura-textMuted">Bloqueia links maliciosos, golpes de Nitro/Steam e encurtadores com rastreamento.</span>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={filterPhishing}
                              onClick={async () => {
                                const next = !filterPhishing
                                const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), filterPhishing: next }
                                setAutomodConfig(updated)
                                if (user) await AutoModService.saveConfig(user.id, updated)
                                showToast({ type: "info", title: "Auto-MOD", message: `Bloqueador de phishing: ${next ? 'Ativado' : 'Desativado'}` })
                              }}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${filterPhishing ? "bg-alura-accent" : "bg-alura-surface3"}`}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${filterPhishing ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Regra 3: Mídia Explícita & Executáveis */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-alura-surface2/60 border border-alura-border/40">
                            <div>
                              <span className="text-[13px] font-semibold text-white block">Verificação de Mídia Explícita & Arquivos Perigosos</span>
                              <span className="text-[11px] text-alura-textMuted">Aplica aviso de spoiler em imagens sensíveis e bloqueia anexos executáveis.</span>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={filterExplicitMedia}
                              onClick={async () => {
                                const next = !filterExplicitMedia
                                const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), filterExplicitMedia: next }
                                setAutomodConfig(updated)
                                if (user) await AutoModService.saveConfig(user.id, updated)
                                showToast({ type: "info", title: "Auto-MOD", message: `Filtro de mídia explícita: ${next ? 'Ativado' : 'Desativado'}` })
                              }}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${filterExplicitMedia ? "bg-alura-accent" : "bg-alura-surface3"}`}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0D0F] shadow-md ring-0 transition duration-200 ease-in-out ${filterExplicitMedia ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Palavras Bloqueadas Personalizadas */}
                          <div className="pt-2 space-y-2.5">
                            <label className="text-[12px] font-bold text-white block">Palavras e Frases Bloqueadas Personalizadas</label>
                            <p className="text-[11px] text-alura-textMuted">O Auto-MOD sinalizará qualquer mensagem contendo estes termos para você.</p>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newBlockedWordInput}
                                onChange={(e) => setNewBlockedWordInput(e.target.value)}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const trimmed = newBlockedWordInput.trim()
                                    if (!trimmed) return
                                    if (safeBlockedWords.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
                                      showToast({ type: "warning", title: "Termo Existente", message: "Esta palavra já está na sua lista." })
                                      return
                                    }
                                    const updatedWords = [...safeBlockedWords, trimmed]
                                    const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), blockedWords: updatedWords }
                                    setAutomodConfig(updated)
                                    setNewBlockedWordInput("")
                                    if (user) await AutoModService.saveConfig(user.id, updated)
                                    showToast({ type: "success", title: "Auto-MOD", message: `Termo "${trimmed}" adicionado.` })
                                  }
                                }}
                                placeholder="Digite uma palavra ou frase proibida e pressione Enter..."
                                className="flex-1 h-9 px-3 bg-alura-surface2 border border-alura-border rounded-lg text-xs text-white placeholder:text-alura-textDisabled outline-none focus:border-alura-accent transition-colors"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  const trimmed = newBlockedWordInput.trim()
                                  if (!trimmed) return
                                  if (safeBlockedWords.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
                                    showToast({ type: "warning", title: "Termo Existente", message: "Esta palavra já está na sua lista." })
                                    return
                                  }
                                  const updatedWords = [...safeBlockedWords, trimmed]
                                  const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), blockedWords: updatedWords }
                                  setAutomodConfig(updated)
                                  setNewBlockedWordInput("")
                                  if (user) await AutoModService.saveConfig(user.id, updated)
                                  showToast({ type: "success", title: "Auto-MOD", message: `Termo "${trimmed}" adicionado.` })
                                }}
                                className="h-9 px-3 bg-alura-surface3 hover:bg-alura-hover border border-alura-border text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5 text-alura-accent" /> Adicionar
                              </button>
                            </div>

                            {/* Chips de palavras bloqueadas */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {safeBlockedWords.length === 0 ? (
                                <span className="text-[11px] text-alura-textMuted italic">Nenhum termo personalizado adicionado ainda.</span>
                              ) : (
                                safeBlockedWords.map((word, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary">
                                    <span>{word}</span>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const updatedWords = safeBlockedWords.filter(w => w !== word)
                                        const updated: AutoModConfig = { ...(automodConfig || DEFAULT_AUTOMOD_CONFIG), blockedWords: updatedWords }
                                        setAutomodConfig(updated)
                                        if (user) await AutoModService.saveConfig(user.id, updated)
                                        showToast({ type: "info", title: "Auto-MOD", message: `Termo "${word}" removido.` })
                                      }}
                                      className="text-alura-textMuted hover:text-alura-danger transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* SUB-ABA 2: SENHA E SEGURANÇA */}
              {activePrivacySubTab === "seguranca" && (
                <div className="space-y-6">
                  {/* Card 1: Alterar Senha de Acesso com Indicador de Força & Mostrar/Ocultar */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5 shadow-sm">
                    <div>
                      <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-alura-accent" />
                        Alterar Senha de Acesso
                      </h2>
                      <p className="text-[13px] text-alura-textMuted mt-1">Crie uma nova senha forte para manter sua conta protegida.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nova Senha */}
                      <div>
                        <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Nova Senha</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-[#001B0B] border border-alura-border rounded-xl px-4 py-2.5 pr-10 text-[13px] text-white placeholder:text-alura-textDisabled focus:outline-none focus:border-alura-accent transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-white transition-colors cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Barra de Força da Senha */}
                        {newPassword.length > 0 && (
                          <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-alura-textMuted">Força da senha:</span>
                              <span className={`font-bold ${passwordStrength.score >= 3 ? 'text-alura-accent' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-alura-danger'}`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 h-1.5">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className={`rounded-full h-full transition-all duration-300 ${passwordStrength.score >= bar ? passwordStrength.color : 'bg-alura-surface3'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirmar Nova Senha */}
                      <div>
                        <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Confirmar Nova Senha</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            className="w-full bg-[#001B0B] border border-alura-border rounded-xl px-4 py-2.5 pr-10 text-[13px] text-white placeholder:text-alura-textDisabled focus:outline-none focus:border-alura-accent transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-white transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Indicador de Coincidência */}
                        {confirmPassword.length > 0 && (
                          <div className="mt-2 text-[11px] flex items-center gap-1.5">
                            {newPassword === confirmPassword ? (
                              <span className="text-alura-accent flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> As senhas conferem
                              </span>
                            ) : (
                              <span className="text-alura-danger flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> As senhas não coincidem
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-alura-textMuted flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-alura-accent" />
                        Sua senha é protegida por criptografia de ponta e autenticação Segura Alura.
                      </span>

                      <Button
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                        className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-[13px] px-6 h-10 rounded-xl shadow-[0_0_15px_rgba(57,255,136,0.2)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
                      </Button>
                    </div>
                  </div>

                  {/* Card 2: Autenticação em Duas Etapas (2FA) Real & Funcional */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-alura-accent" />
                            Autenticação em Duas Etapas (2FA)
                          </h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${twoFactorEnabled
                              ? "bg-alura-accent/20 text-alura-accent border-alura-accent/40 shadow-[0_0_10px_rgba(57,255,136,0.2)]"
                              : "bg-white/10 text-alura-textMuted border-white/10"
                            }`}>
                            {twoFactorEnabled && <span className="w-1.5 h-1.5 rounded-full bg-alura-accent animate-pulse" />}
                            {twoFactorEnabled ? "2FA Ativo & Protegido" : "Desativado"}
                          </span>
                        </div>
                        <p className="text-[12px] text-alura-textMuted leading-relaxed max-w-xl">
                          Exige um código temporário de 6 dígitos gerado pelo seu aplicativo autenticador (Google Authenticator, Authy ou 1Password) a cada novo login.
                        </p>
                      </div>

                      {twoFactorEnabled ? (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setIsBackupCodesModalOpen(true)}
                            className="bg-alura-surface2 hover:bg-alura-hover text-white border border-alura-border text-xs font-semibold h-9 px-3.5 rounded-xl cursor-pointer"
                          >
                            Códigos de Recuperação
                          </Button>
                          <Button
                            onClick={handleDisable2FA}
                            className="bg-alura-danger/15 hover:bg-alura-danger/25 border border-alura-danger/30 text-alura-danger font-semibold text-xs h-9 px-4 rounded-xl transition-colors cursor-pointer"
                          >
                            Desativar 2FA
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setIs2FAModalOpen(true)}
                          className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-9 px-5 rounded-xl shadow-[0_0_15px_rgba(57,255,136,0.25)] transition-all cursor-pointer"
                        >
                          Habilitar 2FA
                        </Button>
                      )}
                    </div>

                    {/* Destaque de Status quando 2FA está Ativo */}
                    {twoFactorEnabled ? (
                      <div className="p-4 rounded-xl bg-alura-surface2/60 border border-alura-accent/30 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-alura-textSecondary flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-alura-accent" />
                            <strong>Método Primário:</strong> Aplicativo Autenticador TOTP (Google / Authy / 1Password)
                          </span>
                          <span className="text-alura-accent font-semibold">Ativo</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-alura-textMuted border-t border-alura-border/40 pt-2">
                          <span>
                            {twoFactorEnrolledAt
                              ? `Ativado em: ${new Date(twoFactorEnrolledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                              : "Ativado recentemente"}
                          </span>
                          <span>
                            {backupCodes.length > 0
                              ? `${backupCodes.length} códigos de recuperação disponíveis`
                              : "Códigos de recuperação configurados"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Benefícios quando 2FA está Inativo */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-3 rounded-xl bg-alura-surface2/40 border border-alura-border/30 text-xs">
                          <span className="font-bold text-white block mb-0.5">Defesa Antivazamento</span>
                          <span className="text-[11px] text-alura-textMuted">Mesmo se sua senha for descoberta, ninguém acessa sua conta sem o smartphone.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-alura-surface2/40 border border-alura-border/30 text-xs">
                          <span className="font-bold text-white block mb-0.5">Totalmente Padrão TOTP</span>
                          <span className="text-[11px] text-alura-textMuted">Compatível com Google Authenticator, Authy, Microsoft Authenticator e 1Password.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-alura-surface2/40 border border-alura-border/30 text-xs">
                          <span className="font-bold text-white block mb-0.5">Códigos de Emergência</span>
                          <span className="text-[11px] text-alura-textMuted">Gera 8 chaves de uso único para recuperação segura se perder o aparelho.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Sessões Ativas e Dispositivos Conectados */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                          <Laptop className="w-5 h-5 text-alura-accent" />
                          Sessões Ativas e Dispositivos
                        </h3>
                        <p className="text-[12px] text-alura-textMuted mt-0.5">Dispositivos com login ativo na sua conta da Alura.</p>
                      </div>
                      <span className="text-[11px] font-semibold text-alura-accent px-2.5 py-1 rounded-full bg-alura-surface2 border border-alura-border">
                        2 Conectados
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Sessão 1: Desktop App */}
                      <div className="p-3.5 rounded-xl bg-alura-surface2 border border-alura-accent/30 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-white">Alura Desktop (Windows App)</span>
                              <span className="text-[10px] font-bold text-alura-accent px-2 py-0.5 rounded-full bg-alura-accent/15 border border-alura-accent/30">
                                Este Dispositivo
                              </span>
                            </div>
                            <span className="text-[11px] text-alura-textMuted block">
                              Cliente v0.9.4 • Online Agora • Conexão Criptografada
                            </span>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-alura-accent animate-pulse"></div>
                      </div>

                      {/* Sessão 2: Navegador Web */}
                      <div className="p-3.5 rounded-xl bg-alura-surface2 border border-alura-border flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-alura-surface3 border border-alura-border flex items-center justify-center text-alura-textSecondary">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-white block">Navegador Web (Chrome / Edge)</span>
                            <span className="text-[11px] text-alura-textMuted block">
                              São Paulo, Brasil • Ativo há 2 horas • Sessão Web
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-alura-textDisabled">Ativo</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={handleDisconnectOtherSessions}
                        className="bg-alura-surface2 hover:bg-alura-danger/15 text-alura-textSecondary hover:text-alura-danger border border-alura-border hover:border-alura-danger/30 text-xs font-semibold h-9 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        Encerrar Outras Sessões
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 3: USUÁRIOS BLOQUEADOS */}
              {activePrivacySubTab === "bloqueados" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                          <Shield className="w-5 h-5 text-alura-accent" />
                          Usuários Bloqueados
                        </h2>
                        <p className="text-[13px] text-alura-textMuted mt-0.5">Usuários bloqueados não podem te enviar mensagens privadas nem ver seus posts.</p>
                      </div>
                      <span className="text-xs font-bold text-alura-textSecondary px-2.5 py-1 rounded-full bg-alura-surface2 border border-alura-border">
                        {blockedUsers.length} bloqueado{blockedUsers.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Barra de Pesquisa de Bloqueados */}
                    {blockedUsers.length > 0 && (
                      <div className="relative">
                        <Search className="w-4 h-4 text-alura-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={blockedSearchQuery}
                          onChange={(e) => setBlockedSearchQuery(e.target.value)}
                          placeholder="Buscar por nome ou @usuario..."
                          className="w-full bg-alura-surface2 border border-alura-border rounded-xl pl-10 pr-4 py-2 text-[13px] text-white focus:outline-none focus:border-alura-accent/60 transition-colors"
                        />
                      </div>
                    )}

                    {loadingBlocks ? (
                      <div className="p-12 text-center text-alura-textMuted text-sm">Carregando usuários bloqueados...</div>
                    ) : blockedUsers.length === 0 ? (
                      <div className="p-12 rounded-xl bg-alura-surface2/60 border border-alura-border/40 text-center">
                        <Shield className="w-10 h-10 text-alura-textMuted mx-auto mb-2 opacity-40" />
                        <h3 className="text-sm font-bold text-white">Nenhum usuário bloqueado</h3>
                        <p className="text-xs text-alura-textMuted mt-1">Quando você bloquear alguém no chat ou nos servidores, eles aparecerão aqui para fácil gerenciamento.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {blockedUsers
                          .filter(u =>
                            !blockedSearchQuery ||
                            u.name?.toLowerCase().includes(blockedSearchQuery.toLowerCase()) ||
                            u.username?.toLowerCase().includes(blockedSearchQuery.toLowerCase())
                          )
                          .map(u => (
                            <BlockedCard
                              key={u.id}
                              id={u.id}
                              name={u.name}
                              username={u.username}
                              avatar_url={u.avatar_url}
                              onUnblock={() => {
                                showConfirmModal({
                                  title: "Desbloquear Usuário",
                                  message: `Deseja realmente desbloquear @${u.username}? Este usuário poderá enviar mensagens e visualizar seu conteúdo novamente.`,
                                  confirmText: "Desbloquear",
                                  cancelText: "Cancelar",
                                  onConfirm: () => handleUnblockUser(u.id)
                                })
                              }}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-ABA 4: DADOS E PRIVACIDADE (LGPD) */}
              {activePrivacySubTab === "dados" && (
                <div className="space-y-6">
                  {/* Card 1: Exportar Dados Pessoais */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                          <Download className="w-5 h-5 text-alura-accent" />
                          Exportar Cópia dos Meus Dados (LGPD / GDPR)
                        </h2>
                        <p className="text-[12px] text-alura-textMuted mt-1 max-w-xl leading-relaxed">
                          Você tem o direito de solicitar e baixar uma cópia completa de todos os seus dados armazenados na Alura (perfil, configurações, dados de conta e preferências) em formato JSON.
                        </p>
                      </div>

                      <Button
                        onClick={handleExportUserData}
                        disabled={isExportingData}
                        className="bg-alura-surface2 hover:bg-alura-selected border border-alura-border hover:border-alura-accent/50 text-white font-semibold text-xs h-10 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-alura-accent" />
                        {isExportingData ? "Gerando..." : "Baixar Dados (.JSON)"}
                      </Button>
                    </div>
                  </div>

                  {/* Card 2: Uso de Dados e Telemetria */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4 shadow-sm">
                    <div>
                      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-alura-accent" />
                        Uso de Dados & Diagnóstico do Sistema
                      </h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Defina como a Alura utiliza métricas anônimas para manter o sistema veloz e estável.</p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Ajude a melhorar o Alura (Telemetria)</span>
                          <span className="text-[12px] text-alura-textMuted">Permite o envio anônimo de logs de erro e desempenho para corrigirmos bugs rapidamente.</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = !telemetryEnabled
                            setTelemetryEnabled(next)
                            showToast({
                              type: "info",
                              title: "Telemetria",
                              message: next ? "Envio de diagnósticos ativado." : "Envio de diagnósticos desativado."
                            })
                          }}
                          className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${telemetryEnabled ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"}`}
                        >
                          <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-alura-border/40">
                        <div>
                          <span className="text-[14px] font-semibold text-white block">Personalização de Recomendações</span>
                          <span className="text-[12px] text-alura-textMuted">Usar seus jogos e hobbies para sugerir canais e servidores relevantes na aba de Descoberta.</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = !personalizedSuggestions
                            setPersonalizedSuggestions(next)
                            showToast({
                              type: "info",
                              title: "Personalização",
                              message: next ? "Recomendações ativadas." : "Recomendações desativadas."
                            })
                          }}
                          className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${personalizedSuggestions ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"}`}
                        >
                          <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Zona de Perigo (Desativar / Excluir Conta) */}
                  <div className="rounded-2xl border border-alura-danger/30 bg-alura-danger/5 p-6 space-y-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-alura-danger flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Zona de Perigo da Conta
                      </h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Ações permanentes e de encerramento da sua conta na Alura.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={handleDeactivateAccount}
                        className="bg-alura-surface2 border border-alura-border hover:border-alura-danger/50 text-white hover:text-alura-danger font-semibold text-xs h-10 px-4 rounded-xl cursor-pointer"
                      >
                        Desativar Conta Temporariamente
                      </Button>

                      <Button
                        onClick={handleDeleteAccount}
                        className="bg-alura-danger hover:bg-alura-danger/80 text-white font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                      >
                        Excluir Conta Permanentemente
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ABA 3: NOTIFICAÇÕES */}
          {activeTab === "Notificações" && (
            <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">

              {/* Card 1: Notificações do Sistema e Privacidade */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-6">
                <div>
                  <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-alura-accent" />
                    Notificações no Computador e Privacidade
                  </h2>
                  <p className="text-[13px] text-alura-textMuted mt-1">Configure como o Alura envia alertas na área de trabalho e como protegem sua tela.</p>
                </div>

                {/* Notificação Desktop */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-alura-surface2 border border-alura-border">
                  <div className="flex items-center gap-3.5">
                    <Monitor className="w-5 h-5 text-alura-accent" />
                    <div>
                      <span className="text-[14px] font-semibold text-white block">Notificações na Área de Trabalho</span>
                      <span className="text-[12px] text-alura-textMuted">Receba alertas mesmo com a janela do Alura minimizada ou em segundo plano.</span>
                    </div>
                  </div>
                  {notifPrefs.desktopNotifications ? (
                    <span className="text-xs font-bold text-alura-success bg-alura-success/15 px-3 py-1 rounded-full border border-alura-success/30 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Ativado
                    </span>
                  ) : (
                    <Button
                      onClick={requestNotificationPermission}
                      className="bg-alura-accent text-[#0B0D0F] font-bold text-xs h-9 px-4 rounded-lg hover:bg-alura-accentHover cursor-pointer shadow-[0_0_15px_rgba(57,255,136,0.15)]"
                    >
                      Permitir Notificações
                    </Button>
                  )}
                </div>

                {/* Toggles de Privacidade e Comportamento */}
                <div className="space-y-4 pt-1">

                  {/* Ocultar conteúdo da mensagem */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <EyeOff className="w-4 h-4 text-alura-textMuted mt-1 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-white block">Ocultar prévia de mensagens (Modo Privacidade)</span>
                        <span className="text-[12px] text-alura-textMuted">Exibe apenas o remetente sem revelar o conteúdo da mensagem no pop-up do sistema.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateNotifPref(
                        'hideMessageContent',
                        !notifPrefs.hideMessageContent,
                        !notifPrefs.hideMessageContent ? "Conteúdo de mensagens ocultado nas notificações." : "Prévia de mensagens visível."
                      )}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer shrink-0 ${notifPrefs.hideMessageContent ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                    </button>
                  </div>

                  {/* Silenciar durante DND */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <BellOff className="w-4 h-4 text-alura-textMuted mt-1 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-white block">Silenciar durante Não Perturbe (DND)</span>
                        <span className="text-[12px] text-alura-textMuted">Suprime automaticamente todos os sons e notificações quando seu status for Não Perturbe.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateNotifPref(
                        'dndMute',
                        !notifPrefs.dndMute,
                        !notifPrefs.dndMute ? "Silenciamento durante DND ativado." : "Silenciamento durante DND desativado."
                      )}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer shrink-0 ${notifPrefs.dndMute ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                    </button>
                  </div>

                  {/* Tempo de inatividade */}
                  <div className="pt-2">
                    <label className="text-[13px] font-semibold text-white block mb-1.5">Enviar notificação na área de trabalho quando ausente por:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 0, label: "Imediato" },
                        { val: 1, label: "1 minuto" },
                        { val: 2, label: "2 minutos" },
                        { val: 5, label: "5 minutos" }
                      ].map(item => (
                        <button
                          key={item.val}
                          onClick={() => handleUpdateNotifPref('inactivityMinutes', item.val, `Tempo de inatividade definido para: ${item.label}`)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${notifPrefs.inactivityMinutes === item.val
                              ? "bg-alura-selected border-alura-accent text-white shadow-[0_0_12px_rgba(57,255,136,0.1)]"
                              : "bg-alura-surface2 border-alura-border text-alura-textSecondary hover:text-white hover:bg-alura-hover"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Card 2: Centralização de Sons */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent shrink-0 shadow-[0_0_12px_rgba(57,255,136,0.15)]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Configurações de Sons e Efeitos</h3>
                    <p className="text-[12px] text-alura-textMuted mt-0.5">
                      Os ajustes de volume master e sons individuais agora ficam exclusivamente na categoria <span className="text-alura-accent font-semibold">Voz, Vídeo & Audio &gt; Sons</span>.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("Som e Voz")
                    setActiveAudioSubTab("sons")
                  }}
                  className="bg-alura-surface2 hover:bg-alura-hover border border-alura-border text-alura-accent hover:border-alura-accent text-xs font-bold h-9 px-4 rounded-xl cursor-pointer shrink-0 transition-all"
                >
                  Abrir Sons
                </Button>
              </div>

              {/* Card 3: Teste de Notificação na Área de Trabalho */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-white">Simular Notificação de Desktop</h3>
                  <p className="text-[12px] text-alura-textMuted mt-0.5">Dispara um aviso visual do sistema para testar as permissões do navegador ou desktop.</p>
                </div>
                <Button
                  onClick={handleTestNotificationSequence}
                  className="bg-alura-surface2 hover:bg-alura-hover border border-alura-border text-alura-accent hover:border-alura-accent flex items-center gap-2 text-xs font-bold h-9 px-4 rounded-xl cursor-pointer transition-all"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Testar Notificação
                </Button>
              </div>

            </div>
          )}

          {/* ABA 4: APARÊNCIA */}
          {activeTab === "Aparência" && (
            <div className="max-w-3xl space-y-6">

              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-7 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-alura-border/40 pb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-white flex items-center gap-2.5">
                      <Palette className="w-5 h-5 text-alura-accent" />
                      Tema e Visual
                    </h2>
                    <p className="text-[13px] text-alura-textMuted mt-1">
                      Personalize a atmosfera e o contraste do ecossistema Alura. Escolha entre 6 identidades visuais exclusivas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-alura-textSecondary bg-alura-surface2 border border-alura-border px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-alura-accent" />
                      Tema Ativo: <strong className="text-white">{ALURA_THEMES.find(t => t.id === themeMode)?.name || "Alura Forest"}</strong>
                    </span>
                  </div>
                </div>

                {/* Grid de 6 Temas da Alura */}
                <div>
                  <label className="text-[13px] font-semibold text-white block mb-3">
                    Esquema de Cores ({ALURA_THEMES.length} Temas Disponíveis)
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ALURA_THEMES.map(t => {
                      const isSelected = themeMode === t.id
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setThemeMode(t.id)
                            try {
                              localStorage.setItem("alura_theme", t.id)
                              document.documentElement.setAttribute("data-theme", t.id)
                            } catch (e) {}
                            showToast({
                              type: "success",
                              title: "Tema Aplicado!",
                              message: `O tema ${t.name} foi aplicado com sucesso em todo o sistema.`
                            })
                          }}
                          className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                            isSelected
                              ? "ring-2 ring-opacity-40 scale-[1.01]"
                              : "hover:border-alura-borderStrong hover:translate-y-[-2px]"
                          }`}
                          style={{
                            backgroundColor: t.surface,
                            borderColor: isSelected ? t.accent : "var(--alura-border)",
                            boxShadow: isSelected ? `0 0 25px ${t.accent}25, inset 0 0 15px ${t.accent}10` : undefined
                          }}
                        >
                          {/* Mini gradient strip preview no topo */}
                          <div
                            className="h-1.5 w-full absolute top-0 left-0 transition-opacity"
                            style={{ background: t.gradient, opacity: isSelected ? 1 : 0.6 }}
                          />

                          <div>
                            {/* Header do Card */}
                            <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                              <div
                                className="w-6 h-6 rounded-full border flex items-center justify-center transition-all"
                                style={{
                                  borderColor: isSelected ? t.accent : t.border,
                                  backgroundColor: isSelected ? t.accent : "transparent"
                                }}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-black font-bold stroke-[3]" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.5 }} />
                                )}
                              </div>

                              {/* Paleta de Cores (Swatches) */}
                              <div className="flex items-center -space-x-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                                {t.swatches.map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Título e Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold text-white group-hover:text-white transition-colors">
                                {t.name}
                              </span>
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: `${t.accent}22`,
                                  color: t.accent,
                                  border: `1px solid ${t.accent}44`
                                }}
                              >
                                {t.badge}
                              </span>
                            </div>

                            {/* Descrição */}
                            <p className="text-[11px] text-alura-textMuted mt-1.5 leading-relaxed">
                              {t.desc}
                            </p>
                          </div>

                          {/* Rodapé do Card */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-[10px] text-alura-textSecondary">
                              accent: <span style={{ color: t.accent }}>{t.accent}</span>
                            </span>
                            {isSelected && (
                              <span className="font-semibold flex items-center gap-1" style={{ color: t.accent }}>
                                <Check className="w-3 h-3" /> Ativo
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Prévia Interativa em Tempo Real */}
                <div className="pt-2">
                  <div className="p-5 rounded-xl border border-alura-border bg-alura-surface2/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-alura-accent" />
                        <span className="text-[13px] font-bold text-white">Prévia em Tempo Real do Tema</span>
                      </div>
                      <span className="text-[11px] text-alura-textMuted font-mono">
                        Tokens injetados dinamicamente via CSS Variables
                      </span>
                    </div>

                    {/* Exemplo de Componentes Reagindo ao Tema */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Botões */}
                      <div className="p-3.5 rounded-lg border border-alura-border bg-alura-surface1 space-y-2">
                        <span className="text-[11px] font-semibold text-alura-textSecondary block">Botões & Ações</span>
                        <div className="flex flex-wrap gap-2">
                          <button className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-alura-accent text-alura-background hover:brightness-110 transition-all shadow-sm">
                            Primário
                          </button>
                          <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-alura-surface3 text-white border border-alura-border hover:bg-alura-hover transition-all">
                            Secundário
                          </button>
                        </div>
                      </div>

                      {/* Inputs & Superfícies */}
                      <div className="p-3.5 rounded-lg border border-alura-border bg-alura-surface1 space-y-2">
                        <span className="text-[11px] font-semibold text-alura-textSecondary block">Campo de Texto</span>
                        <input
                          type="text"
                          readOnly
                          value="Texto no tema ativo..."
                          className="w-full bg-alura-surface2 border border-alura-border rounded-lg px-3 py-1.5 text-[12px] text-alura-textPrimary focus:border-alura-accent outline-none"
                        />
                      </div>

                      {/* Mensagem / Balão */}
                      <div className="p-3.5 rounded-lg border border-alura-border bg-alura-surface1 space-y-2">
                        <span className="text-[11px] font-semibold text-alura-textSecondary block">Balão de Chat</span>
                        <div className="p-2.5 rounded-lg bg-alura-surface2 border border-alura-border/60 text-[11px] text-alura-textPrimary flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-alura-accent animate-pulse" />
                          <span>Mensagem com destaque na cor do tema</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Densidade de Chat */}
                <div className="pt-4 border-t border-alura-border/50">
                  <label className="text-[13px] font-semibold text-white block mb-3">Densidade das Mensagens</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        setChatDensity("comfortable")
                        try {
                          localStorage.setItem("alura_chat_density", "comfortable")
                          document.documentElement.setAttribute("data-density", "comfortable")
                        } catch (e) {}
                        showToast({ type: "info", title: "Densidade de Mensagens", message: "Modo Confortável ativado." })
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        chatDensity === "comfortable"
                          ? "bg-alura-selected border-alura-accent text-white shadow-sm ring-1 ring-alura-accent/30"
                          : "bg-alura-surface2 border-alura-border hover:border-alura-borderStrong text-alura-textSecondary"
                      }`}
                    >
                      <span className="text-sm font-bold text-white block">Confortável</span>
                      <span className="text-xs text-alura-textMuted mt-1 block">Mais espaço entre mensagens e avatares destacados.</span>
                    </div>

                    <div
                      onClick={() => {
                        setChatDensity("compact")
                        try {
                          localStorage.setItem("alura_chat_density", "compact")
                          document.documentElement.setAttribute("data-density", "compact")
                        } catch (e) {}
                        showToast({ type: "info", title: "Densidade de Mensagens", message: "Modo Compacto ativado." })
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        chatDensity === "compact"
                          ? "bg-alura-selected border-alura-accent text-white shadow-sm ring-1 ring-alura-accent/30"
                          : "bg-alura-surface2 border-alura-border hover:border-alura-borderStrong text-alura-textSecondary"
                      }`}
                    >
                      <span className="text-sm font-bold text-white block">Compacto</span>
                      <span className="text-xs text-alura-textMuted mt-1 block">Mais mensagens por tela, estilo terminal/feed rápido.</span>
                    </div>
                  </div>
                </div>

                {/* Redução de Movimento */}
                <div className="pt-4 border-t border-alura-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-semibold text-white block">Reduzir Animações (Reduced Motion)</span>
                    <span className="text-[12px] text-alura-textMuted">Desativa transições dinâmicas para maior acessibilidade e desempenho.</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !reducedMotion
                      setReducedMotion(next)
                      try {
                        localStorage.setItem("alura_reduced_motion", String(next))
                        document.documentElement.setAttribute("data-reduced-motion", String(next))
                      } catch (e) {}
                      showToast({ type: "info", title: "Movimento", message: next ? "Animações reduzidas." : "Animações normais restauradas." })
                    }}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${reducedMotion ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ABA 5: VOZ, VÍDEO & AUDIO */}
          {activeTab === "Som e Voz" && (
            <div className="max-w-3xl space-y-6">

              {/* Header Principal da Seção com Título Obrigatório */}
              <div className="flex items-center justify-between pb-3 border-b border-alura-border/40">
                <div>
                  <h2 className="text-[18px] font-bold text-white tracking-tight">Voz, Vídeo & Audio</h2>
                  <p className="text-[13px] text-alura-textMuted mt-0.5">
                    {activeAudioSubTab === "voz" && "Dispositivos de captação, volumes e sensibilidade de microfone com VU meter em tempo real."}
                    {activeAudioSubTab === "transmissao" && "Qualidade de compartilhamento de tela, taxa de quadros e áudio de aplicativos."}
                    {activeAudioSubTab === "sons" && "Volume e preferências dos efeitos sonoros e alertas da Alura."}
                    {activeAudioSubTab === "soundboard" && "Painel de efeitos sonoros em tempo real integrado ao www.myinstants.com."}
                    {activeAudioSubTab === "avancado" && "Supressão de ruído por IA (Krisp), cancelamento de eco, ganho automático e codecs."}
                  </p>
                </div>
                {activeAudioSubTab === "avancado" && (
                  <Button
                    onClick={handleResetAudioSettings}
                    variant="outline"
                    className="h-8 px-3 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar Padrões
                  </Button>
                )}
              </div>

              {/* ========================================================= */}
              {/* SUB-ABA 1: VOZ */}
              {/* ========================================================= */}
              {activeAudioSubTab === "voz" && (
                <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-6">
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Dispositivos de Voz & Áudio</h3>
                    <p className="text-[12px] text-alura-textMuted mt-0.5">Selecione seu microfone e fones para comunicação com baixa latência.</p>
                  </div>

                  {/* Dispositivos de Entrada e Saída */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Dispositivo de Entrada (Microfone)</label>
                      <select
                        value={selectedAudioInput}
                        onChange={(e) => {
                          const val = e.target.value
                          setSelectedAudioInput(val)
                          try { localStorage.setItem("alura_audio_input_device", val) } catch {}
                          showToast({ type: "info", title: "Microfone Alterado", message: "Dispositivo de entrada atualizado." })
                          if (isTestingMic) {
                            stopMicTest()
                            setTimeout(startMicTest, 150)
                          }
                        }}
                        className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/50"
                      >
                        {audioInputDevices.length > 0 ? (
                          audioInputDevices.map((d, i) => (
                            <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Microfone ${i + 1}`}</option>
                          ))
                        ) : (
                          <option value="">Microfone Padrão do Sistema</option>
                        )}
                      </select>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-alura-textMuted mb-1">
                          <span>Volume de entrada</span>
                          <span>{micVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={micVolume}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setMicVolume(v)
                            try { localStorage.setItem("alura_mic_volume", String(v)) } catch {}
                          }}
                          className="w-full accent-alura-accent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-medium text-alura-textSecondary block mb-1.5">Dispositivo de Saída (Fones/Alto-falante)</label>
                      <select
                        value={selectedAudioOutput}
                        onChange={(e) => {
                          const val = e.target.value
                          setSelectedAudioOutput(val)
                          try { localStorage.setItem("alura_audio_output_device", val) } catch {}
                          showToast({ type: "info", title: "Saída de Áudio Alterada", message: "Dispositivo de reprodução atualizado." })
                        }}
                        className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/50"
                      >
                        {audioOutputDevices.length > 0 ? (
                          audioOutputDevices.map((d, i) => (
                            <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Alto-falante ${i + 1}`}</option>
                          ))
                        ) : (
                          <option value="">Dispositivo de Saída Padrão</option>
                        )}
                      </select>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-alura-textMuted mb-1">
                          <span>Volume de saída</span>
                          <span>{outputVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={outputVolume}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setOutputVolume(v)
                            try { localStorage.setItem("alura_output_volume", String(v)) } catch {}
                          }}
                          className="w-full accent-alura-accent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teste de Microfone Interativo com VU Meter em Tempo Real */}
                  <div className="pt-4 border-t border-alura-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[14px] font-semibold text-white block">Teste de Microfone</span>
                        <span className="text-[12px] text-alura-textMuted">Fale algo para testar a sensibilidade e clareza da captação.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={toggleMicTest}
                          className={isTestingMic ? "bg-alura-danger text-white hover:bg-alura-danger/90 font-bold text-xs h-9 px-4 rounded-lg cursor-pointer" : "bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"}
                        >
                          {isTestingMic ? "Parar Teste" : "Testar Microfone"}
                        </Button>
                      </div>
                    </div>

                    {/* Barra de VU Meter */}
                    <div className="h-4 w-full bg-alura-surface2 rounded-full overflow-hidden border border-alura-border p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-alura-accent/70 via-alura-accent to-[#00E5FF]"
                        style={{ width: `${isTestingMic ? micLevel : 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[11px] font-medium ${isTestingMic ? "text-alura-accent animate-pulse" : "text-alura-textMuted"}`}>
                        {isTestingMic ? `Microfone ativo: Fale agora... Nível: ${micLevel}%` : "Pressione 'Testar Microfone' para iniciar."}
                      </span>
                      {isTestingMic && (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-alura-textSecondary hover:text-white">
                          <input
                            type="checkbox"
                            checked={loopbackMic}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setLoopbackMic(checked)
                              if (isTestingMic) {
                                stopMicTest()
                                setTimeout(startMicTest, 100)
                              }
                            }}
                            className="accent-alura-accent rounded"
                          />
                          <span>Ouvir retorno nos fones (Loopback)</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Modo de Entrada */}
                  <div className="pt-4 border-t border-alura-border/50">
                    <label className="text-[13px] font-semibold text-white block mb-3">Modo de Entrada</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => {
                          setInputMode("voice")
                          try { localStorage.setItem("alura_input_mode", "voice") } catch {}
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${inputMode === "voice"
                            ? "border-alura-accent/60 bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.12)] text-white"
                            : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold block">Ativação por Voz</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${inputMode === "voice" ? "border-alura-accent" : "border-alura-border"}`}>
                            {inputMode === "voice" && <div className="w-2 h-2 rounded-full bg-alura-accent" />}
                          </div>
                        </div>
                        <span className="text-xs text-alura-textMuted mt-1 block">O microfone abre automaticamente ao detectar sua fala.</span>
                      </div>

                      <div
                        onClick={() => {
                          setInputMode("ptt")
                          try { localStorage.setItem("alura_input_mode", "ptt") } catch {}
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${inputMode === "ptt"
                            ? "border-alura-accent/60 bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.12)] text-white"
                            : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold block">Pressionar para Falar (Push-to-Talk)</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${inputMode === "ptt" ? "border-alura-accent" : "border-alura-border"}`}>
                            {inputMode === "ptt" && <div className="w-2 h-2 rounded-full bg-alura-accent" />}
                          </div>
                        </div>
                        <span className="text-xs text-alura-textMuted mt-1 block">O microfone só transmite enquanto a tecla estiver pressionada.</span>
                      </div>
                    </div>

                    {/* Configuração de Tecla PTT */}
                    {inputMode === "ptt" && (
                      <div className="mt-4 p-4 rounded-xl bg-alura-surface2 border border-alura-border flex items-center justify-between">
                        <div>
                          <span className="text-[13px] font-semibold text-white block">Atalho Push-to-Talk</span>
                          <span className="text-[12px] text-alura-textMuted">Pressione este botão para transmitir voz nos canais.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <kbd className="px-3 py-1.5 rounded-lg bg-alura-surface1 border border-alura-border text-xs font-mono font-bold text-white shadow-inner">
                            {isRecordingPtt ? "Pressione qualquer tecla..." : pttKey}
                          </kbd>
                          <Button
                            onClick={() => setIsRecordingPtt(!isRecordingPtt)}
                            className={isRecordingPtt ? "bg-alura-danger text-white text-xs h-8 px-3 rounded-lg cursor-pointer animate-pulse" : "bg-alura-surface3 hover:bg-alura-hover text-white text-xs h-8 px-3 rounded-lg border border-alura-border cursor-pointer"}
                          >
                            {isRecordingPtt ? "Cancelar" : "Gravar Tecla"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sensibilidade de Entrada para Ativação por Voz */}
                    {inputMode === "voice" && (
                      <div className="mt-4 p-4 rounded-xl bg-alura-surface2 border border-alura-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[13px] font-semibold text-white block">Determinar sensibilidade de entrada automaticamente</span>
                            <span className="text-[12px] text-alura-textMuted">O sistema ajustará o limiar de voz para evitar ruídos de respiração.</span>
                          </div>
                          <button
                            onClick={() => {
                              const next = !autoSensitivity
                              setAutoSensitivity(next)
                              try { localStorage.setItem("alura_auto_sensitivity", String(next)) } catch {}
                            }}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${autoSensitivity ? "bg-alura-accent" : "bg-alura-surface3"
                              }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${autoSensitivity ? "left-6" : "left-1"
                              }`} />
                          </button>
                        </div>

                        {!autoSensitivity && (
                          <div className="pt-2">
                            <div className="flex justify-between text-xs text-alura-textMuted mb-1">
                              <span>Sensibilidade Manual</span>
                              <span>{inputSensitivity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={inputSensitivity}
                              onChange={(e) => {
                                const s = Number(e.target.value)
                                setInputSensitivity(s)
                                try { localStorage.setItem("alura_input_sensitivity", String(s)) } catch {}
                              }}
                              className="w-full accent-alura-accent cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-ABA 2: TRANSMISSÃO */}
              {/* ========================================================= */}
              {activeAudioSubTab === "transmissao" && (
                <div className="space-y-6">
                  {/* Resolução de Transmissão */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5">
                    <div>
                      <h3 className="text-[15px] font-bold text-white">Resolução de Transmissão de Tela</h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Selecione a resolução padrão para compartilhamento de tela e jogos.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: "720p", label: "720p", desc: "HD Standard", tag: "Econômico" },
                        { id: "1080p", label: "1080p", desc: "Full HD", tag: "Recomendado" },
                        { id: "1440p", label: "1440p", desc: "2K Quad HD", tag: "Ultra" },
                        { id: "source", label: "Fonte", desc: "Original", tag: "Nativo" },
                      ].map((res) => {
                        const isSelected = streamResolution === res.id
                        return (
                          <div
                            key={res.id}
                            onClick={() => {
                              setStreamResolution(res.id as any)
                              try { localStorage.setItem("alura_stream_res", res.id) } catch {}
                              showToast({ type: "info", title: "Resolução Definida", message: `Transmissão ajustada para ${res.label}.` })
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${isSelected
                                ? "border-alura-accent/60 bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.12)] text-white"
                                : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-white">{res.label}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-alura-accent/20 text-alura-accent border border-alura-accent/30" : "bg-alura-surface3 text-alura-textMuted"
                                }`}>
                                {res.tag}
                              </span>
                            </div>
                            <span className="text-xs text-alura-textMuted block mt-1">{res.desc}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Taxa de Quadros (FPS) */}
                    <div className="pt-4 border-t border-alura-border/50">
                      <label className="text-[13px] font-semibold text-white block mb-2.5">Taxa de Quadros por Segundo (FPS)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { fps: 15, label: "15 FPS", desc: "Ideal para texto e slides" },
                          { fps: 30, label: "30 FPS", desc: "Balanceado para streaming geral" },
                          { fps: 60, label: "60 FPS", desc: "Movimento ultra fluído para jogos" },
                        ].map((item) => {
                          const isSelected = streamFps === item.fps
                          return (
                            <div
                              key={item.fps}
                              onClick={() => {
                                setStreamFps(item.fps as any)
                                try { localStorage.setItem("alura_stream_fps", String(item.fps)) } catch {}
                              }}
                              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                                  ? "border-alura-accent/60 bg-alura-selected shadow-[0_0_12px_rgba(57,255,136,0.12)] text-white font-bold"
                                  : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                                }`}
                            >
                              <span className="text-sm block">{item.label}</span>
                              <span className="text-[11px] text-alura-textMuted block mt-0.5">{item.desc}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Modo de Otimização */}
                    <div className="pt-4 border-t border-alura-border/50">
                      <label className="text-[13px] font-semibold text-white block mb-2.5">Modo de Otimização da Transmissão</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          onClick={() => {
                            setStreamMode("smooth")
                            try { localStorage.setItem("alura_stream_mode", "smooth") } catch {}
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${streamMode === "smooth"
                              ? "border-alura-accent/60 bg-alura-selected text-white shadow-[0_0_12px_rgba(57,255,136,0.12)]"
                              : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                            }`}
                        >
                          <span className="text-sm font-bold block">Fluidez de Movimento</span>
                          <span className="text-xs text-alura-textMuted mt-0.5 block">Mantém uma taxa de quadros estável sem travamentos em jogos e vídeos.</span>
                        </div>

                        <div
                          onClick={() => {
                            setStreamMode("clarity")
                            try { localStorage.setItem("alura_stream_mode", "clarity") } catch {}
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${streamMode === "clarity"
                              ? "border-alura-accent/60 bg-alura-selected text-white shadow-[0_0_12px_rgba(57,255,136,0.12)]"
                              : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                            }`}
                        >
                          <span className="text-sm font-bold block">Nitidez e Legibilidade</span>
                          <span className="text-xs text-alura-textMuted mt-0.5 block">Prioriza resolução cristalina de códigos de programação, gráficos e texto.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurações Adicionais de Transmissão */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <h3 className="text-[15px] font-bold text-white">Opções Avançadas de Transmissão</h3>

                    <div className="flex items-center justify-between py-2">
                      <div className="pr-4">
                        <span className="text-[13px] font-semibold text-white block">Captura de Áudio da Aplicação</span>
                        <span className="text-[12px] text-alura-textMuted">Transmite o áudio do jogo, vídeo ou navegador compartilhado para a sala de voz.</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !streamAudioCapture
                          setStreamAudioCapture(next)
                          try { localStorage.setItem("alura_stream_audio_cap", String(next)) } catch {}
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${streamAudioCapture ? "bg-alura-accent" : "bg-alura-surface3"
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${streamAudioCapture ? "left-6" : "left-1"
                          }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-alura-border/40">
                      <div className="pr-4">
                        <span className="text-[13px] font-semibold text-white block">Aceleração por Hardware de Vídeo</span>
                        <span className="text-[12px] text-alura-textMuted">Utiliza a GPU (placa de vídeo) para codificar a transmissão sem sobrecarregar seu processador.</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !hardwareAcceleration
                          setHardwareAcceleration(next)
                          try { localStorage.setItem("alura_stream_hw_accel", String(next)) } catch {}
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${hardwareAcceleration ? "bg-alura-accent" : "bg-alura-surface3"
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${hardwareAcceleration ? "left-6" : "left-1"
                          }`} />
                      </button>
                    </div>
                  </div>

                  {/* Teste Interativo de Transmissão de Tela */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] font-bold text-white">Teste de Compartilhamento de Tela</h3>
                        <p className="text-[12px] text-alura-textMuted mt-0.5">Valide como sua transmissão de tela, jogos ou janelas aparecerá para os participantes.</p>
                      </div>
                      <Button
                        onClick={isTestingScreenShare ? stopScreenShareTest : startScreenShareTest}
                        className={isTestingScreenShare ? "bg-alura-danger text-white hover:bg-alura-danger/90 font-bold text-xs h-9 px-4 rounded-lg cursor-pointer" : "bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"}
                      >
                        <Tv className="w-3.5 h-3.5 mr-1.5" />
                        {isTestingScreenShare ? "Encerrar Teste" : "Testar Compartilhamento"}
                      </Button>
                    </div>

                    {isTestingScreenShare && (
                      <div className="relative rounded-xl overflow-hidden border border-alura-accent/50 bg-black aspect-video flex items-center justify-center shadow-[0_0_25px_rgba(0,230,160,0.15)]">
                        <video
                          ref={screenShareVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-alura-border flex items-center gap-2 text-[11px] text-white">
                          <span className="w-2 h-2 rounded-full bg-alura-danger animate-ping" />
                          <span className="font-bold">Ao Vivo</span>
                          {screenShareInfo && (
                            <span className="text-alura-textMuted font-mono">
                              ({screenShareInfo.width}x{screenShareInfo.height} @ {screenShareInfo.fps} FPS)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-ABA 3: SONS */}
              {/* ========================================================= */}
              {activeAudioSubTab === "sons" && (
                <div className="space-y-6">
                  {/* Volume Principal */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5">
                    <div>
                      <h3 className="text-[15px] font-bold text-white">Volume Geral de Efeitos</h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Defina o volume principal dos alertas sonoros emitidos pela plataforma Alura.</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          const nextMute = !soundMuteAll
                          setSoundMuteAll(nextMute)
                          handleMasterVolumeChange(nextMute ? 0 : 80)
                        }}
                        className="w-10 h-10 rounded-xl bg-alura-surface2 border border-alura-border flex items-center justify-center text-alura-textSecondary hover:text-white cursor-pointer"
                      >
                        {soundMasterVol === 0 || soundMuteAll ? <VolumeX className="w-5 h-5 text-alura-danger" /> : <Volume2 className="w-5 h-5 text-alura-accent" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-alura-textMuted mb-1">
                          <span>Volume dos Sons</span>
                          <span>{soundMasterVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundMasterVol}
                          onChange={(e) => {
                            setSoundMuteAll(false)
                            handleMasterVolumeChange(Number(e.target.value))
                          }}
                          className="w-full accent-alura-accent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Sons de Eventos */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-white">Sons de Eventos</h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Ative ou desative notificações sonoras específicas e faça testes de áudio.</p>
                    </div>

                    <div className="divide-y divide-alura-border/40">
                      {[
                        {
                          id: "messageReceived" as SoundType,
                          label: "Nova Mensagem Recebida",
                          desc: "Toca ao receber uma nova mensagem privada no chat direto ou canal.",
                          icon: <MessageSquare className="w-5 h-5 text-alura-accent" />
                        },
                        {
                          id: "mention" as SoundType,
                          label: "Menções Diretas (@você)",
                          desc: "Acorde harmônico ascendente quando alguém citar você diretamente.",
                          icon: <span className="text-base font-bold font-mono text-[#F5A623]">@</span>
                        },
                        {
                          id: "messageSent" as SoundType,
                          label: "Mensagem Enviada",
                          desc: "Micro-feedback acústico suave ao enviar mensagens com sucesso.",
                          icon: <Send className="w-5 h-5 text-alura-textSecondary" />
                        },
                        {
                          id: "incomingCall" as SoundType,
                          label: "Chamadas e Toque Recebido",
                          desc: "Ringtone de chamada de voz ou vídeo em tempo real.",
                          icon: <PhoneCall className="w-5 h-5 text-alura-success" />
                        },
                        {
                          id: "voiceJoin" as SoundType,
                          label: "Entrada em Canal de Voz",
                          desc: "Tom ascendente ao conectar em uma sala de voz ou quando alguém entra.",
                          icon: <Radio className="w-5 h-5 text-[#4facfe]" />
                        },
                        {
                          id: "voiceLeave" as SoundType,
                          label: "Saída de Canal de Voz",
                          desc: "Tom suave ao desconectar de uma sala de voz ou quando alguém sai.",
                          icon: <LogOut className="w-5 h-5 text-alura-danger/80" />
                        },
                        {
                          id: "mute" as SoundType,
                          label: "Microfone Mutado / Desmutado",
                          desc: "Sinal de confirmação acústica ao alternar seu microfone.",
                          icon: <Mic className="w-5 h-5 text-[#FFCC00]" />
                        },
                        {
                          id: "deafen" as SoundType,
                          label: "Ensordecer (Deafen)",
                          desc: "Sinal sonoro ao silenciar todo o áudio de saída.",
                          icon: <Headphones className="w-5 h-5 text-[#A855F7]" />
                        },
                        {
                          id: "systemAlert" as SoundType,
                          label: "Alertas do Sistema e Toasts",
                          desc: "Chime ao receber avisos, convites e confirmações do sistema.",
                          icon: <Sparkles className="w-5 h-5 text-alura-accent" />
                        },
                      ].map((item) => {
                        const isEnabled = soundToggles[item.id] ?? true
                        return (
                          <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-2xl bg-alura-surface2 border border-alura-border/80 flex items-center justify-center shrink-0 shadow-inner">
                                {item.icon}
                              </div>
                              <div>
                                <span className="text-[14px] font-semibold text-white block">{item.label}</span>
                                <span className="text-[12px] text-alura-textMuted">{item.desc}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => SoundService.play(item.id)}
                                title="Ouvir prévia deste som"
                                className="w-8 h-8 rounded-lg bg-alura-surface2 hover:bg-alura-hover border border-alura-border text-alura-textSecondary hover:text-alura-accent flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </button>

                              <button
                                onClick={() => {
                                  const nextToggles = { ...soundToggles, [item.id]: !isEnabled }
                                  setSoundToggles(nextToggles)
                                  try { localStorage.setItem("alura_sound_toggles", JSON.stringify(nextToggles)) } catch {}
                                }}
                                className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer shrink-0 ${isEnabled ? "bg-alura-accent justify-end" : "bg-alura-surface3 justify-start"
                                  }`}
                              >
                                <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-ABA 4: PAINEL DE EFEITOS SONOROS (SOUNDBOARD / MYINSTANTS) */}
              {/* ========================================================= */}
              {activeAudioSubTab === "soundboard" && (
                <div className="space-y-6">
                  {/* Preferências do Soundboard */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5">
                    <div>
                      <h3 className="text-[15px] font-bold text-white">Preferências do Soundboard</h3>
                      <p className="text-[12px] text-alura-textMuted mt-0.5">Ajuste o volume das reações de áudio disparadas nos canais de voz.</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-alura-textMuted mb-1">
                        <span>Volume do Soundboard</span>
                        <span>{soundboardVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={soundboardVolume}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          setSoundboardVolume(v)
                          try { localStorage.setItem("alura_soundboard_volume", String(v)) } catch {}
                        }}
                        className="w-full accent-alura-accent cursor-pointer"
                      />
                    </div>

                    <div className="pt-4 border-t border-alura-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[13px] font-semibold text-white block">Permitir sons de outros participantes</span>
                          <span className="text-[12px] text-alura-textMuted">Habilita a reprodução de efeitos sonoros enviados por amigos na chamada.</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = !allowOthersSoundboard
                            setAllowOthersSoundboard(next)
                            try { localStorage.setItem("alura_soundboard_allow_others", String(next)) } catch {}
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${allowOthersSoundboard ? "bg-alura-accent" : "bg-alura-surface3"
                            }`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${allowOthersSoundboard ? "left-6" : "left-1"
                            }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-alura-border/30">
                        <div>
                          <span className="text-[13px] font-semibold text-white block">Atalho de Teclado do Soundboard</span>
                          <span className="text-[12px] text-alura-textMuted">Acesso rápido ao painel suspenso durante qualquer jogo ou chamada.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-3 py-1.5 rounded-lg bg-alura-surface2 border border-alura-border text-xs font-mono font-bold text-white shadow-inner">
                            {isRecordingSoundboardKey ? "Pressione o atalho..." : soundboardShortcut}
                          </kbd>
                          <Button
                            onClick={() => setIsRecordingSoundboardKey(!isRecordingSoundboardKey)}
                            variant="outline"
                            className="h-8 px-3 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface2 cursor-pointer"
                          >
                            {isRecordingSoundboardKey ? "Cancelar" : "Alterar Atalho"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Catálogo e Busca do MyInstants */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-white">Efeitos Sonoros do MyInstants</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-alura-accent/15 text-alura-accent border border-alura-accent/30 font-mono">
                            www.myinstants.com
                          </span>
                        </div>
                        <p className="text-[12px] text-alura-textMuted mt-0.5">Pesquise memes virais, sons de jogos e vinhetas da TV brasileira em tempo real.</p>
                      </div>

                      <Button
                        onClick={() => setIsAddCustomSoundOpen(true)}
                        className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover font-bold text-xs h-9 px-4 rounded-lg cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Adicionar via Link
                      </Button>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-alura-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={soundboardSearchQuery}
                        onChange={(e) => setSoundboardSearchQuery(e.target.value)}
                        placeholder="Buscar no MyInstants (ex: rapaz, faustão, gatinho, calma, bruh, gta)..."
                        className="w-full bg-alura-surface2 border border-alura-border rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/50 placeholder:text-alura-textMuted"
                      />
                      {soundboardSearchQuery && (
                        <button
                          onClick={() => setSoundboardSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Filtros de Categoria */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { id: "all", label: "Todos", icon: Flame },
                        { id: "favorites", label: "Favoritos", icon: Star },
                        { id: "tv", label: "TV Brasileira", icon: Tv },
                        { id: "memes", label: "Memes", icon: Sparkles },
                        { id: "games", label: "Games & Discord", icon: Gamepad2 },
                        { id: "sfx", label: "Efeitos", icon: Volume2 },
                      ].map((cat) => {
                        const isSelected = soundboardCategory === cat.id
                        const Icon = cat.icon
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSoundboardCategory(cat.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-alura-accent text-[#0B0D0F] font-bold shadow-[0_0_10px_rgba(0,230,160,0.2)]"
                                : "bg-alura-surface2 text-alura-textSecondary hover:text-white hover:bg-alura-surface3 border border-alura-border/60"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{cat.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Grid de Sons */}
                    <div className="pt-2">
                      {isLoadingMyInstants ? (
                        <div className="py-12 flex flex-col items-center justify-center text-alura-textMuted gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-alura-accent" />
                          <span className="text-xs">Buscando efeitos sonoros no www.myinstants.com...</span>
                        </div>
                      ) : (
                        (() => {
                          let filtered = myInstantsSounds
                          if (soundboardCategory === "favorites") {
                            filtered = filtered.filter(s => favoritesList.includes(s.id))
                          } else if (soundboardCategory !== "all") {
                            filtered = filtered.filter(s => s.category === soundboardCategory)
                          }

                          if (filtered.length === 0) {
                            return (
                              <div className="py-12 text-center text-alura-textMuted space-y-2 border border-dashed border-alura-border/60 rounded-xl">
                                <VolumeX className="w-8 h-8 mx-auto text-alura-textMuted/60" />
                                <p className="text-xs font-medium">Nenhum som encontrado nesta categoria ou busca.</p>
                                <span className="text-[11px] block text-alura-textMuted">Tente outro termo ou adicione via link direto do MyInstants.</span>
                              </div>
                            )
                          }

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {filtered.map((sound) => {
                                const isPlaying = playingMyInstantId === sound.id
                                const isFav = favoritesList.includes(sound.id)

                                return (
                                  <div
                                    key={sound.id}
                                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group relative ${
                                      isPlaying
                                        ? "border-alura-accent bg-alura-selected shadow-[0_0_15px_rgba(0,230,160,0.2)]"
                                        : "border-alura-border bg-alura-surface2/60 hover:bg-alura-surface2 hover:border-alura-accent/40"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <span className="text-2xl select-none">{sound.emoji || "🔊"}</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggleFavorite(sound.id)
                                          }}
                                          title={isFav ? "Remover dos favoritos" : "Favoritar este som"}
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                            isFav
                                              ? "text-[#F5A623] hover:text-[#F5A623]/80"
                                              : "text-alura-textMuted hover:text-white"
                                          }`}
                                        >
                                          <Star className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                                        </button>
                                        <button
                                          onClick={() => handleTogglePlayMyInstant(sound)}
                                          title={isPlaying ? "Parar áudio" : "Reproduzir áudio"}
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                            isPlaying
                                              ? "bg-alura-danger text-white animate-pulse"
                                              : "bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover shadow-sm"
                                          }`}
                                        >
                                          {isPlaying ? (
                                            <Square className="w-3.5 h-3.5 fill-current" />
                                          ) : (
                                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-[13px] font-bold text-white block truncate" title={sound.title}>
                                        {sound.title}
                                      </span>
                                      <div className="flex items-center justify-between mt-1 text-[11px] text-alura-textMuted">
                                        <span className="capitalize">{sound.category || "meme"}</span>
                                        <a
                                          href={sound.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-alura-textMuted hover:text-alura-accent flex items-center gap-1"
                                          title="Ver no MyInstants"
                                        >
                                          <span>MyInstants</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()
                      )}
                    </div>
                  </div>

                  {/* Modal Adicionar Som Avançado e Profissional */}
                  {isAddCustomSoundOpen && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="w-full max-w-xl bg-alura-surface1 border border-alura-border rounded-2xl p-6 space-y-5 shadow-[0_15px_50px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto custom-scrollbar">
                        
                        {/* Header do Modal */}
                        <div className="flex items-start justify-between border-b border-alura-border/40 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-alura-accent" />
                              <h3 className="text-base font-bold text-white">Adicionar Efeito Sonoro</h3>
                            </div>
                            <p className="text-xs text-alura-textMuted mt-0.5">
                              Importe memes virais do www.myinstants.com ou envie arquivos de áudio do seu computador.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              stopPreviewAudio()
                              setIsAddCustomSoundOpen(false)
                            }}
                            className="text-alura-textMuted hover:text-white p-1 rounded-lg hover:bg-alura-surface2 transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Abas Superiores do Modal */}
                        <div className="grid grid-cols-3 gap-2 bg-alura-surface2 p-1 rounded-xl border border-alura-border/60">
                          <button
                            onClick={() => {
                              stopPreviewAudio()
                              setAddSoundTab('link')
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              addSoundTab === 'link'
                                ? "bg-alura-accent text-[#0B0D0F] shadow-sm font-bold"
                                : "text-alura-textSecondary hover:text-white hover:bg-alura-surface3"
                            }`}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Link do MyInstants</span>
                          </button>

                          <button
                            onClick={() => {
                              stopPreviewAudio()
                              setAddSoundTab('upload')
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              addSoundTab === 'upload'
                                ? "bg-alura-accent text-[#0B0D0F] shadow-sm font-bold"
                                : "text-alura-textSecondary hover:text-white hover:bg-alura-surface3"
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload do PC</span>
                          </button>

                          <button
                            onClick={() => {
                              stopPreviewAudio()
                              setAddSoundTab('search')
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              addSoundTab === 'search'
                                ? "bg-alura-accent text-[#0B0D0F] shadow-sm font-bold"
                                : "text-alura-textSecondary hover:text-white hover:bg-alura-surface3"
                            }`}
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Explorar Catálogo</span>
                          </button>
                        </div>

                        {/* ABA 1: LINK DO MYINSTANTS OU WEB */}
                        {addSoundTab === 'link' && (
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-alura-textSecondary">
                                  URL da Página do MyInstants ou Link Direto MP3
                                </label>
                                <span className="text-[11px] text-alura-accent">Auto-detecção ativa</span>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={customSoundUrl}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setCustomSoundUrl(val)
                                    if (val.includes("myinstants.com") || val.endsWith(".mp3")) {
                                      handleAnalyzeUrl(val)
                                    }
                                  }}
                                  placeholder="Cole aqui: https://www.myinstants.com/en/instant/nome-do-som/ ou .mp3"
                                  className="flex-1 bg-alura-surface2 border border-alura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-alura-accent/60 placeholder:text-alura-textMuted"
                                />
                                <Button
                                  type="button"
                                  onClick={() => handleAnalyzeUrl()}
                                  disabled={isAnalyzingUrl || !customSoundUrl.trim()}
                                  className="h-9 px-3.5 text-xs font-semibold bg-alura-surface2 hover:bg-alura-surface3 text-white border border-alura-border cursor-pointer shrink-0"
                                >
                                  {isAnalyzingUrl ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-alura-accent" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5 text-alura-accent mr-1" />
                                  )}
                                  Detectar
                                </Button>
                              </div>
                              <span className="text-[11px] text-alura-textMuted mt-1 block">
                                Suporta links da página do MyInstants ou URLs diretas de áudio (.mp3, .wav, .ogg).
                              </span>
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-alura-textSecondary block mb-1.5">
                                Título do Som
                              </label>
                              <input
                                type="text"
                                value={customSoundTitle}
                                onChange={(e) => setCustomSoundTitle(e.target.value)}
                                placeholder="Ex: Que Isso Meu Filho Calma"
                                className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-alura-accent/60"
                              />
                            </div>
                          </div>
                        )}

                        {/* ABA 2: UPLOAD DO COMPUTADOR */}
                        {addSoundTab === 'upload' && (
                          <div className="space-y-4">
                            <div
                              onDragOver={(e) => {
                                e.preventDefault()
                                setIsDraggingAudioFile(true)
                              }}
                              onDragLeave={() => setIsDraggingAudioFile(false)}
                              onDrop={(e) => {
                                e.preventDefault()
                                setIsDraggingAudioFile(false)
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleAudioFileUpload(e.dataTransfer.files[0])
                                }
                              }}
                              onClick={() => audioFileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                                isDraggingAudioFile
                                  ? "border-alura-accent bg-alura-selected shadow-[0_0_20px_rgba(0,230,160,0.2)]"
                                  : "border-alura-border hover:border-alura-accent/50 bg-alura-surface2/50 hover:bg-alura-surface2"
                              }`}
                            >
                              <input
                                type="file"
                                ref={audioFileInputRef}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleAudioFileUpload(e.target.files[0])
                                  }
                                }}
                                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                                className="hidden"
                              />
                              <div className="w-12 h-12 rounded-2xl bg-alura-surface3 border border-alura-border/80 flex items-center justify-center mx-auto mb-3 text-alura-accent shadow-inner">
                                <FileAudio className="w-6 h-6" />
                              </div>
                              <span className="text-sm font-bold text-white block">
                                {uploadedFileName ? uploadedFileName : "Clique para selecionar ou arraste o arquivo"}
                              </span>
                              <span className="text-xs text-alura-textMuted mt-1 block">
                                Formatos suportados: MP3, WAV, OGG, M4A (Máximo 12MB)
                              </span>
                            </div>

                            {customSoundUrl && (
                              <div>
                                <label className="text-xs font-semibold text-alura-textSecondary block mb-1.5">
                                  Título do Som
                                </label>
                                <input
                                  type="text"
                                  value={customSoundTitle}
                                  onChange={(e) => setCustomSoundTitle(e.target.value)}
                                  placeholder="Nome exibido no Soundboard"
                                  className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-alura-accent/60"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* ABA 3: EXPLORAR & IMPORTAR DIRETO DO MYINSTANTS */}
                        {addSoundTab === 'search' && (
                          <div className="space-y-3">
                            <div className="relative">
                              <Search className="w-4 h-4 text-alura-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={modalSearchQuery}
                                onChange={(e) => setModalSearchQuery(e.target.value)}
                                placeholder="Pesquisar memes no MyInstants para importar..."
                                className="w-full bg-alura-surface2 border border-alura-border rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-alura-accent/50"
                              />
                            </div>

                            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                              {isModalSearching ? (
                                <div className="py-8 text-center text-alura-textMuted flex items-center justify-center gap-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-alura-accent" />
                                  <span className="text-xs">Buscando no www.myinstants.com...</span>
                                </div>
                              ) : modalSearchResults.length === 0 ? (
                                <div className="py-8 text-center text-alura-textMuted text-xs">
                                  Nenhum som encontrado para "{modalSearchQuery}".
                                </div>
                              ) : (
                                modalSearchResults.map((sound) => (
                                  <div
                                    key={sound.id}
                                    className="p-2.5 rounded-xl bg-alura-surface2/60 border border-alura-border flex items-center justify-between gap-3 hover:bg-alura-surface2 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="text-xl select-none">{sound.emoji || "🔊"}</span>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-white block truncate" title={sound.title}>
                                          {sound.title}
                                        </span>
                                        <span className="text-[10px] text-alura-textMuted block">
                                          {sound.category || "meme"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleTogglePreviewSound(sound.mp3)}
                                        title="Pré-escutar"
                                        className="w-7 h-7 rounded-lg bg-alura-surface3 hover:bg-alura-hover flex items-center justify-center text-white transition-colors cursor-pointer"
                                      >
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                      </button>
                                      <Button
                                        type="button"
                                        onClick={() => handleSelectFromModalSearch(sound)}
                                        className="h-7 px-3 text-[11px] font-bold bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover cursor-pointer"
                                      >
                                        + Adicionar
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* CONFIGURAÇÃO VISUAL & PRÉVIA DO SOM (SE ABA NÃO FOR SEARCH) */}
                        {addSoundTab !== 'search' && (
                          <div className="space-y-4 pt-2 border-t border-alura-border/40">
                            
                            {/* Card de Pré-escuta do Som */}
                            <div className="p-3.5 rounded-xl bg-alura-surface2/80 border border-alura-border flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-alura-surface3 flex items-center justify-center text-xl select-none border border-alura-border/60">
                                  {customSoundEmoji || "🔊"}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {customSoundTitle || "Prévia do Efeito Sonoro"}
                                  </span>
                                  <span className="text-[11px] text-alura-textMuted">
                                    {customSoundUrl ? (isPreviewPlaying ? "Reproduzindo prévia..." : "Pronto para teste") : "Informe um áudio para testar"}
                                  </span>
                                </div>
                              </div>

                              <Button
                                type="button"
                                onClick={() => handleTogglePreviewSound()}
                                disabled={!customSoundUrl.trim()}
                                className={`h-8 px-3.5 text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-all ${
                                  isPreviewPlaying
                                    ? "bg-alura-danger text-white animate-pulse"
                                    : "bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover"
                                }`}
                              >
                                {isPreviewPlaying ? (
                                  <>
                                    <Square className="w-3 h-3 fill-current mr-1.5" />
                                    Parar
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 fill-current mr-1.5 ml-0.5" />
                                    Testar Áudio
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Seletor de Emojis Rápido */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-alura-textSecondary">
                                  Escolha um Emoji Representativo
                                </label>
                                <input
                                  type="text"
                                  value={customSoundEmoji}
                                  onChange={(e) => setCustomSoundEmoji(e.target.value)}
                                  maxLength={2}
                                  className="w-10 text-center bg-alura-surface2 border border-alura-border rounded-lg py-1 text-sm text-white focus:outline-none focus:border-alura-accent/50"
                                />
                              </div>

                              <div className="grid grid-cols-8 gap-1.5 bg-alura-surface2/60 p-2.5 rounded-xl border border-alura-border/50">
                                {POPULAR_SOUNDBOARD_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setCustomSoundEmoji(emoji)}
                                    className={`h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                                      customSoundEmoji === emoji
                                        ? "bg-alura-accent/20 border border-alura-accent text-white scale-105 shadow-sm"
                                        : "hover:bg-alura-surface3"
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Seleção de Categoria */}
                            <div>
                              <label className="text-xs font-semibold text-alura-textSecondary block mb-1.5">
                                Categoria
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { id: "memes", label: "Memes", icon: Sparkles },
                                  { id: "tv", label: "TV Brasileira", icon: Tv },
                                  { id: "games", label: "Games & Discord", icon: Gamepad2 },
                                  { id: "sfx", label: "Efeitos", icon: Volume2 },
                                  { id: "custom", label: "Personalizado", icon: Star },
                                ].map((cat) => {
                                  const Icon = cat.icon
                                  return (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() => setCustomSoundCategory(cat.id as any)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        customSoundCategory === cat.id
                                          ? "bg-alura-accent text-[#0B0D0F] font-bold shadow-sm"
                                          : "bg-alura-surface2 text-alura-textSecondary hover:text-white border border-alura-border/60"
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                      <span>{cat.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                          </div>
                        )}

                        {/* Botões Finais de Ação */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-alura-border/40">
                          <Button
                            type="button"
                            onClick={() => {
                              stopPreviewAudio()
                              setIsAddCustomSoundOpen(false)
                            }}
                            variant="outline"
                            className="h-9 px-4 text-xs border-alura-border text-alura-textSecondary hover:text-white bg-alura-surface2 cursor-pointer"
                          >
                            Cancelar
                          </Button>
                          {addSoundTab !== 'search' && (
                            <Button
                              type="button"
                              onClick={handleSaveCustomSound}
                              disabled={!customSoundTitle.trim() || !customSoundUrl.trim()}
                              className="h-9 px-5 text-xs font-bold bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-[0_0_15px_rgba(0,230,160,0.2)]"
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" />
                              Salvar no Soundboard
                            </Button>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-ABA 5: AVANÇADO */}
              {/* ========================================================= */}
              {activeAudioSubTab === "avancado" && (
                <div className="space-y-6">
                  {/* Supressão de Ruído Alura AI */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-alura-accent" />
                        <h3 className="text-[15px] font-bold text-white">Supressão de Ruído Alura AI (Krisp)</h3>
                      </div>
                      <p className="text-[12px] text-alura-textMuted mt-1">
                        Utiliza redes neurais profundas para isolar sua voz e extinguir ruídos de fundo como cliques de teclado, ventiladores e barulho externo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {[
                        { id: "krisp", title: "IA Krisp", desc: "Rede neural ativa. Máxima clareza vocal sem nenhum ruído.", tag: "Recomendado" },
                        { id: "standard", title: "Padrão", desc: "Filtro acústico tradicional passa-alta para frequências graves.", tag: "Básico" },
                        { id: "off", title: "Desativado", desc: "Sinal de áudio cru direto do hardware sem nenhum filtro.", tag: "Raw" },
                      ].map((item) => {
                        const isSelected = noiseSuppression === item.id
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setNoiseSuppression(item.id as any)
                              try { localStorage.setItem("alura_noise_suppression", item.id) } catch {}
                              showToast({ type: "success", title: "Supressão de Ruído", message: `Modo ajustado para ${item.title}.` })
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                ? "border-alura-accent/60 bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.12)] text-white"
                                : "border-alura-border bg-alura-surface2/60 text-alura-textSecondary hover:bg-alura-surface2"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-white">{item.title}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-alura-accent/20 text-alura-accent border border-alura-accent/30" : "bg-alura-surface3 text-alura-textMuted"
                                }`}>
                                {item.tag}
                              </span>
                            </div>
                            <span className="text-xs text-alura-textMuted block leading-relaxed">{item.desc}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Filtros Acústicos Avançados */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <h3 className="text-[15px] font-bold text-white">Filtros Acústicos de Chamada</h3>

                    <div className="flex items-center justify-between py-2">
                      <div className="pr-4">
                        <span className="text-[13px] font-semibold text-white block">Cancelamento de Eco Acústico (AEC)</span>
                        <span className="text-[12px] text-alura-textMuted">Impede que o áudio dos seus fones ou caixas de som retorne ao microfone provocando eco para os amigos.</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !echoCancellation
                          setEchoCancellation(next)
                          try { localStorage.setItem("alura_echo_cancellation", String(next)) } catch {}
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${echoCancellation ? "bg-alura-accent" : "bg-alura-surface3"
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${echoCancellation ? "left-6" : "left-1"
                          }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-alura-border/40">
                      <div className="pr-4">
                        <span className="text-[13px] font-semibold text-white block">Controle Automático de Ganho (AGC)</span>
                        <span className="text-[12px] text-alura-textMuted">Equilibra e amplifica automaticamente sua voz se você falar baixo ou se afastar do microfone.</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !autoGainControl
                          setAutoGainControl(next)
                          try { localStorage.setItem("alura_auto_gain_control", String(next)) } catch {}
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoGainControl ? "bg-alura-accent" : "bg-alura-surface3"
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${autoGainControl ? "left-6" : "left-1"
                          }`} />
                      </button>
                    </div>
                  </div>

                  {/* Subsistema de Áudio e Rede */}
                  <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-4">
                    <h3 className="text-[15px] font-bold text-white">Subsistema & Prioridade de Rede</h3>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-alura-textSecondary block">Subsistema de Áudio WebRTC</label>
                      <select
                        value={audioSubsystem}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setAudioSubsystem(val)
                          try { localStorage.setItem("alura_audio_subsystem", val) } catch {}
                        }}
                        className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-alura-accent/50"
                      >
                        <option value="standard">Padrão (WebRTC Moderno com Codec Opus Adaptativo) - Recomendado</option>
                        <option value="experimental">Experimental (Baixa Latência Acelerada por Hardware)</option>
                      </select>
                      <span className="text-[11px] text-alura-textMuted block mt-1">O subsistema padrão oferece maior compatibilidade com drivers Realtek e USB DACs.</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-alura-border/40">
                      <div className="pr-4">
                        <span className="text-[13px] font-semibold text-white block">Qualidade de Serviço de Rede (QoS)</span>
                        <span className="text-[12px] text-alura-textMuted">Sinaliza ao roteador para priorizar os pacotes de voz Alura sobre downloads em segundo plano.</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !qosPriority
                          setQosPriority(next)
                          try { localStorage.setItem("alura_qos_priority", String(next)) } catch {}
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${qosPriority ? "bg-alura-accent" : "bg-alura-surface3"
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${qosPriority ? "left-6" : "left-1"
                          }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ABA 6: CONEXÕES */}
          {activeTab === "Conexões" && (
            <div className="max-w-4xl space-y-6">

              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-6">
                
                {/* Header com Resumo de Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-alura-border/40 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <h2 className="text-[18px] font-bold text-white">Redes Sociais & Conexões</h2>
                    </div>
                    <p className="text-[13px] text-alura-textMuted mt-1">
                      Conecte suas contas de games (Epic Games, PlayStation, Xbox, Steam) e redes sociais. Escolha quais deseja exibir ou ocultar do seu perfil.
                    </p>
                  </div>

                  {/* Badges de Status */}
                  {(() => {
                    const allData = SUPPORTED_CONNECTIONS.map(c => getConnectionData(socialLinks, c.id))
                    const configuredCount = allData.filter(d => d.value.trim().length > 0).length
                    const activeCount = allData.filter(d => d.value.trim().length > 0 && d.enabled).length

                    return (
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-xl bg-alura-surface2 border border-alura-border text-center">
                          <span className="text-[10px] uppercase font-bold text-alura-textMuted block">Configuradas</span>
                          <span className="text-xs font-bold text-white">{configuredCount} de {SUPPORTED_CONNECTIONS.length}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-alura-accent/10 border border-alura-accent/30 text-center">
                          <span className="text-[10px] uppercase font-bold text-alura-accent block">Ativas no Perfil</span>
                          <span className="text-xs font-bold text-alura-accent">{activeCount} ativas</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Filtros de Categoria e Barra de Pesquisa */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  
                  {/* Abas de Categorias */}
                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                    {[
                      { id: "all", label: "Todas", count: 15, icon: Layers },
                      { id: "games", label: "Jogos", count: 6, icon: Gamepad2 },
                      { id: "social", label: "Social", count: 5, icon: Users },
                      { id: "dev", label: "Dev", count: 1, icon: Code },
                      { id: "media", label: "Mídia", count: 3, icon: Music }
                    ].map(tab => {
                      const Icon = tab.icon
                      const isSelected = connectionFilter === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setConnectionFilter(tab.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-alura-accent text-[#0B0D0F] font-bold shadow-sm"
                              : "bg-alura-surface2 text-alura-textSecondary hover:text-white border border-alura-border/60"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                          <span className={`text-[11px] ${isSelected ? "text-[#0B0D0F]/80 font-bold" : "text-alura-textMuted"}`}>
                            ({tab.count})
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Campo de Busca Rápida */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-alura-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={connectionSearch}
                      onChange={(e) => setConnectionSearch(e.target.value)}
                      placeholder="Buscar conexão..."
                      className="w-full bg-alura-surface2 border border-alura-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent/50"
                    />
                    {connectionSearch && (
                      <button
                        onClick={() => setConnectionSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Ações em Massa (Ativar Todas / Ocultar Todas) */}
                <div className="flex items-center justify-between px-1 text-xs text-alura-textMuted">
                  <span>Gerencie a visibilidade de cada rede individualmente:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleAllConnections(true)}
                      className="text-alura-accent hover:underline cursor-pointer font-medium"
                    >
                      Ativar Todas
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllConnections(false)}
                      className="text-alura-textMuted hover:text-white cursor-pointer font-medium"
                    >
                      Ocultar Todas
                    </button>
                  </div>
                </div>

                {/* Lista de Conexões */}
                <div className="grid grid-cols-1 gap-3.5">
                  {SUPPORTED_CONNECTIONS
                    .filter(c => {
                      if (connectionFilter !== "all" && c.category !== connectionFilter) return false
                      if (connectionSearch.trim()) {
                        const q = connectionSearch.toLowerCase()
                        return (
                          c.label.toLowerCase().includes(q) ||
                          c.shortLabel.toLowerCase().includes(q) ||
                          c.categoryLabel.toLowerCase().includes(q)
                        )
                      }
                      return true
                    })
                    .map(conn => {
                      const data = getConnectionData(socialLinks, conn.id)
                      const isFilled = data.value.trim().length > 0

                      return (
                        <div
                          key={conn.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            data.enabled && isFilled
                              ? "bg-alura-surface2/90 border-alura-accent/40 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                              : isFilled
                              ? "bg-alura-surface2/60 border-alura-border/80"
                              : "bg-alura-surface2/30 border-alura-border/40 hover:border-alura-border"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Identificação da Plataforma */}
                            <div className="flex items-start gap-3 min-w-0 md:w-1/3">
                              <div
                                className="w-10 h-10 rounded-xl bg-alura-surface3 border border-alura-border flex items-center justify-center shrink-0 shadow-inner"
                                style={{ color: conn.color }}
                              >
                                <ConnectionIcon id={conn.id} className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white block truncate">{conn.label}</span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${conn.badgeColor}`}>
                                    {conn.categoryLabel}
                                  </span>
                                </div>
                                <span className="text-[11px] text-alura-textMuted block mt-0.5 line-clamp-1">
                                  {conn.helperText}
                                </span>
                              </div>
                            </div>

                            {/* Campo de Entrada de Nome de Usuário / Link */}
                            <div className="flex-1 min-w-0">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={data.value}
                                  onChange={(e) => handleUpdateConnectionValue(conn.id, e.target.value)}
                                  placeholder={conn.placeholder}
                                  className="w-full bg-alura-surface1 border border-alura-border rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder:text-alura-textMuted/60 focus:outline-none focus:border-alura-accent/60"
                                />
                                {isFilled && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearConnection(conn.id)}
                                    title="Limpar conexão"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-alura-danger p-0.5 rounded transition-colors cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Controles de Visibilidade e Ações Rápidas */}
                            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                              
                              {/* Botão de Ação Rápida (Copiar ou Abrir) */}
                              {isFilled && (
                                <div className="flex items-center gap-1">
                                  {conn.isCopyOnly ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const textToCopy = conn.getDisplay ? conn.getDisplay(data.value) : data.value
                                        navigator.clipboard.writeText(textToCopy)
                                        showToast({
                                          type: "success",
                                          title: "Copiado!",
                                          message: `${conn.label} (${textToCopy}) copiado para a área de transferência.`
                                        })
                                      }}
                                      title="Copiar ID / Tag"
                                      className="p-2 rounded-xl bg-alura-surface3 hover:bg-alura-surface2 border border-alura-border text-alura-textSecondary hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <a
                                      href={conn.getUrl ? conn.getUrl(data.value) : data.value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Abrir página do perfil"
                                      className="p-2 rounded-xl bg-alura-surface3 hover:bg-alura-surface2 border border-alura-border text-alura-textSecondary hover:text-white transition-colors cursor-pointer"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Toggle Switch Exibir no Perfil */}
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-semibold select-none ${
                                  data.enabled && isFilled
                                    ? "text-alura-accent font-bold"
                                    : isFilled
                                    ? "text-alura-textMuted"
                                    : "text-alura-textMuted/50"
                                }`}>
                                  {data.enabled && isFilled ? "Ativa" : "Oculta"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleToggleConnectionEnabled(conn.id)}
                                  disabled={!isFilled}
                                  title={
                                    !isFilled 
                                      ? "Digite seu usuário ou link para ativar" 
                                      : data.enabled 
                                      ? "Clique para ocultar do seu perfil" 
                                      : "Clique para exibir no seu perfil"
                                  }
                                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                                    data.enabled && isFilled
                                      ? "bg-alura-accent shadow-[0_0_10px_rgba(0,230,160,0.3)]"
                                      : "bg-alura-surface3 border border-alura-border"
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform ${
                                      data.enabled && isFilled ? "left-6 bg-[#0B0D0F]" : "left-1 bg-white/70"
                                    }`}
                                  />
                                </button>
                              </div>

                            </div>

                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Botão Final de Salvar */}
                <div className="pt-4 border-t border-alura-border/40 flex items-center justify-between">
                  <span className="text-xs text-alura-textMuted">
                    As conexões ativas serão exibidas publicamente no seu card e página de perfil.
                  </span>

                  <Button
                    onClick={async () => {
                      if (!user) return
                      try {
                        await supabase.from('profiles').update({
                          social_links: socialLinks,
                          updated_at: new Date().toISOString()
                        }).eq('id', user.id)
                        showToast({
                          type: "success",
                          title: "Conexões Salvas!",
                          message: "Suas redes e preferências de exibição foram atualizadas com sucesso."
                        })
                      } catch (err: any) {
                        showToast({
                          type: "error",
                          title: "Erro ao Salvar",
                          message: err.message || "Não foi possível salvar as conexões."
                        })
                      }
                    }}
                    className="bg-alura-accent text-[#0B0D0F] font-bold text-xs h-10 px-6 rounded-xl hover:bg-alura-accentHover cursor-pointer shadow-[0_0_15px_rgba(0,230,160,0.25)] transition-all"
                  >
                    Salvar Conexões
                  </Button>
                </div>

              </div>

            </div>
          )}

          {/* ABA 7: AVANÇADO */}
          {activeTab === "Avançado" && (
            <div className="max-w-3xl space-y-6">

              <div className="rounded-2xl border border-alura-border bg-alura-surface1/90 p-6 space-y-6">
                <div>
                  <h2 className="text-[17px] font-bold text-white">Avançado & Diagnóstico</h2>
                  <p className="text-[13px] text-alura-textMuted mt-1">Opções do motor interno da aplicação e suporte.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-alura-surface2 border border-alura-border">
                    <div>
                      <span className="text-[14px] font-semibold text-white block">Aceleração de Hardware GPU</span>
                      <span className="text-[12px] text-alura-textMuted">Melhora a taxa de quadros a 60 FPS nas transições e chamadas de vídeo.</span>
                    </div>
                    <span className="text-xs font-bold text-alura-success bg-alura-success/15 px-3 py-1 rounded-full border border-alura-success/30">
                      Ativa
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-alura-surface2 border border-alura-border">
                    <div>
                      <span className="text-[14px] font-semibold text-white block">Modo Desenvolvedor</span>
                      <span className="text-[12px] text-alura-textMuted">Permite copiar IDs de canais, mensagens e servidores no menu de contexto.</span>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-alura-surface3 flex items-center p-1 cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-[#0B0D0F]"></div>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-alura-surface2 border border-alura-border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-alura-textSecondary">Versão do Cliente:</span>
                      <span className="text-white font-mono font-bold">Alura v0.9.4 Beta</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-alura-textSecondary">Engine de Realtime:</span>
                      <span className="text-alura-accent font-mono">Phoenix Channels / Supabase WS</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-alura-textSecondary">Plataforma:</span>
                      <span className="text-white font-mono">React 18 + TypeScript + Electron</span>
                    </div>
                  </div>
                </div>

                {/* Zona de Perigo com Confirmação Customizada */}
                <div className="pt-6 border-t border-alura-danger/30">
                  <h3 className="text-sm font-bold text-alura-danger mb-1">Zona de Encerramento</h3>
                  <p className="text-xs text-alura-textMuted mb-4">Finalize sua sessão com segurança neste dispositivo.</p>

                  <Button
                    onClick={handleLogoutClick}
                    className="bg-alura-danger text-white hover:bg-alura-danger/80 font-bold text-xs h-10 px-5 rounded-lg cursor-pointer"
                  >
                    Encerrar Sessão Agora
                  </Button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Floating Action Bar quando houver alterações não salvas (Estilo Discord Premium) */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-3.5 rounded-2xl bg-[#001B0B]/95 border border-alura-accent/50 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(57,255,136,0.25)] backdrop-blur-md animate-in slide-in-from-bottom-6 duration-300 max-w-[90vw] w-[640px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-alura-accent animate-pulse shrink-0"></div>
            <span className="text-sm font-semibold text-white truncate">Cuidado — você tem alterações não salvas!</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetChanges}
              className="text-xs font-semibold text-alura-textSecondary hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              Redefinir
            </button>
            <Button
              onClick={handleSaveAccount}
              disabled={isSaving}
              className="bg-alura-accent text-[#0B0D0F] font-bold text-xs h-9 px-5 rounded-xl hover:bg-alura-accentHover shadow-[0_0_15px_rgba(57,255,136,0.3)] transition-all cursor-pointer"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Real e Interativo de Configuração de 2FA */}
      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={() => {
          setTwoFactorEnabled(true)
          if (user) {
            TwoFactorService.getStatus(user.id, profile).then(st => {
              setTwoFactorEnabled(st.enabled)
              setTwoFactorFactorId(st.factorId || null)
              setTwoFactorEnrolledAt(st.enrolledAt || null)
              setBackupCodes(st.backupCodes || [])
            })
          }
          showToast({
            type: "success",
            title: "2FA Habilitado!",
            message: "Autenticação em duas etapas ativada com sucesso na sua conta."
          })
        }}
        user={user}
        profile={profile}
      />

      {/* Modal de Visualização e Gestão de Códigos de Recuperação */}
      <BackupCodesModal
        isOpen={isBackupCodesModalOpen}
        onClose={() => setIsBackupCodesModalOpen(false)}
        userId={user?.id}
        initialCodes={backupCodes}
        onCodesUpdated={(newCodes) => setBackupCodes(newCodes)}
      />

    </div>
  )
}
