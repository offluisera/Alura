import React, { useState, useEffect, useCallback } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import {
  ShieldAlert, Users, Server, HardDriveDownload, TrendingUp,
  UserX, ShieldCheck, Search, Filter, Edit3, Ban, CheckCircle,
  AlertTriangle, RefreshCw, Plus, ExternalLink, Sparkles, X,
  Radio, Zap, MessageSquare, Calendar, ChevronRight, Lock, Trophy,
  Check, Trash2, Wrench
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { ACHIEVEMENTS_CATALOG } from "../../lib/constants/achievements"

interface DashboardStats {
  total_users: number
  banned_users: number
  staff_users: number
  total_servers: number
  banned_servers: number
  total_messages: number
  peak_concurrent_users: number
  online_users: number
  new_users_today: number
  new_servers_today: number
}

interface ProfileRow {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  email?: string
  bio?: string
  role: string
  is_staff: boolean
  is_banned: boolean
  ban_reason?: string
  banned_at?: string
  created_at: string
  achievements?: string[]
}

interface ServerRow {
  id: string
  name: string
  description?: string
  icon_url?: string
  owner_id: string
  is_banned?: boolean
  ban_reason?: string
  banned_at?: string
  created_at: string
  member_count?: number
}

interface AppVersionRow {
  id: string
  version: string
  title: string
  tagline?: string
  changes?: { type: "novidade" | "melhoria" | "correcao"; title: string; description: string }[]
  release_notes: string
  download_url: string
  is_mandatory: boolean
  is_active: boolean
  created_at: string
}

export function AdminDashboard() {
  const { user, profile } = useOutletContext<{ user: any; profile: any }>()
  const navigate = useNavigate()
  const { showToast } = useNotification()

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "servers" | "updater">("overview")
  const [loading, setLoading] = useState<boolean>(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Usuários
  const [usersList, setUsersList] = useState<ProfileRow[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [userFilter, setUserFilter] = useState<"all" | "active" | "banned" | "staff">("all")
  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null)
  const [banningUser, setBanningUser] = useState<ProfileRow | null>(null)
  const [banReasonInput, setBanReasonInput] = useState("")

  // Servidores
  const [serversList, setServersList] = useState<ServerRow[]>([])
  const [serverSearch, setServerSearch] = useState("")
  const [serverFilter, setServerFilter] = useState<"all" | "active" | "banned">("all")
  const [editingServer, setEditingServer] = useState<ServerRow | null>(null)
  const [banningServer, setBanningServer] = useState<ServerRow | null>(null)
  const [serverBanReasonInput, setServerBanReasonInput] = useState("")

  // Auto-Updater
  const [versionsList, setVersionsList] = useState<AppVersionRow[]>([])
  const [newVersionForm, setNewVersionForm] = useState<{
    version: string
    title: string
    tagline: string
    download_url: string
    release_notes: string
    is_mandatory: boolean
    changes: { type: "novidade" | "melhoria" | "correcao"; title: string; description: string }[]
  }>({
    version: "",
    title: "",
    tagline: "",
    download_url: "https://alura.net.br/downloads/setup_alura.exe",
    release_notes: "",
    is_mandatory: false,
    changes: [
      { type: "novidade", title: "", description: "" }
    ],
  })
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false)

  // Edição de Versão
  const [editingVersion, setEditingVersion] = useState<AppVersionRow | null>(null)
  const [editingVersionChanges, setEditingVersionChanges] = useState<{ type: "novidade" | "melhoria" | "correcao"; title: string; description: string }[]>([])
  const [isSavingVersionEdit, setIsSavingVersionEdit] = useState(false)

  // Checagem de permissão ampla (web e desktop)
  const isAuthorized = profile?.is_staff === true || 
                       profile?.role === "admin" || 
                       profile?.role === "moderator" ||
                       profile?.username === "luisera" ||
                       profile?.username === "adminalura" ||
                       user?.email?.toLowerCase().includes("admin") ||
                       user?.user_metadata?.role === "admin" ||
                       user?.app_metadata?.role === "admin"

  // 1. Carregar estatísticas globais
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats")
      if (error) throw error
      if (data) setStats(data as DashboardStats)
    } catch (err: any) {
      console.error("Erro ao carregar stats do admin:", err)
    }
  }, [])

  // 2. Carregar lista de usuários com conquistas
  const fetchUsers = useCallback(async () => {
    try {
      let query = supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, email, bio, role, is_staff, is_banned, ban_reason, banned_at, created_at, achievements")
        .order("created_at", { ascending: false })
        .limit(100)

      if (userFilter === "banned") query = query.eq("is_banned", true)
      if (userFilter === "staff") query = query.or("is_staff.eq.true,role.eq.admin,role.eq.moderator")
      if (userFilter === "active") query = query.eq("is_banned", false)

      let { data, error } = await query

      // Se houver erro de coluna ou PostgREST, tenta sem achievements como fallback defensivo
      if (error) {
        console.warn("Falha ao buscar usuários com achievements, tentando fallback:", error)
        let fallbackQuery = supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, email, bio, role, is_staff, is_banned, ban_reason, banned_at, created_at")
          .order("created_at", { ascending: false })
          .limit(100)

        if (userFilter === "banned") fallbackQuery = fallbackQuery.eq("is_banned", true)
        if (userFilter === "staff") fallbackQuery = fallbackQuery.or("is_staff.eq.true,role.eq.admin,role.eq.moderator")
        if (userFilter === "active") fallbackQuery = fallbackQuery.eq("is_banned", false)

        const fallbackRes = await fallbackQuery
        if (fallbackRes.error) throw fallbackRes.error
        data = (fallbackRes.data || []).map((u: any) => ({ ...u, achievements: [] }))
      }

      setUsersList((data as ProfileRow[]) || [])
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err)
    }
  }, [userFilter])

  // 3. Carregar lista de servidores
  const fetchServers = useCallback(async () => {
    try {
      let query = supabase
        .from("servers")
        .select("id, name, description, icon_url, owner_id, is_banned, ban_reason, banned_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100)

      if (serverFilter === "banned") query = query.eq("is_banned", true)
      if (serverFilter === "active") query = query.eq("is_banned", false)

      const { data, error } = await query
      if (error) throw error
      setServersList((data as ServerRow[]) || [])
    } catch (err: any) {
      console.error("Erro ao buscar servidores:", err)
    }
  }, [serverFilter])

  // 4. Carregar versões do .exe
  const fetchVersions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("app_versions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setVersionsList((data as AppVersionRow[]) || [])
    } catch (err: any) {
      console.error("Erro ao buscar versões:", err)
    }
  }, [])

  const reloadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchStats(), fetchUsers(), fetchServers(), fetchVersions()])
    setLoading(false)
  }, [fetchStats, fetchUsers, fetchServers, fetchVersions])

  useEffect(() => {
    if (isAuthorized) {
      reloadAll()
    }
  }, [isAuthorized, reloadAll])

  // ── AÇÕES DE USUÁRIO ──────────────────────────────────────────────
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      // Tenta atualizar diretamente o perfil com conquistas
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editingUser.display_name,
          username: editingUser.username,
          bio: editingUser.bio,
          role: editingUser.role,
          is_staff: editingUser.is_staff,
          achievements: editingUser.achievements || [],
        })
        .eq("id", editingUser.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Usuário Atualizado",
        message: `Os dados e conquistas de @${editingUser.username} foram salvos com sucesso.`
      })

      setEditingUser(null)
      fetchUsers()
      fetchStats()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao atualizar",
        message: err.message
      })
    }
  }

  const handleConfirmBanUser = async () => {
    if (!banningUser) return

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: banReasonInput || "Violação das diretrizes comunitárias Alura",
          banned_at: new Date().toISOString(),
          banned_by: user.id
        })
        .eq("id", banningUser.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Usuário Banido",
        message: `@${banningUser.username} foi banido da plataforma.`
      })

      setBanningUser(null)
      setBanReasonInput("")
      fetchUsers()
      fetchStats()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao banir",
        message: err.message
      })
    }
  }

  const handleUnbanUser = async (u: ProfileRow) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null,
          banned_by: null
        })
        .eq("id", u.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Usuário Reabilitado",
        message: `@${u.username} foi desbanido com sucesso.`
      })

      fetchUsers()
      fetchStats()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao desbanir",
        message: err.message
      })
    }
  }

  // ── AÇÕES DE SERVIDOR ─────────────────────────────────────────────
  const handleSaveServerEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingServer) return

    try {
      const { error } = await supabase
        .from("servers")
        .update({
          name: editingServer.name,
          description: editingServer.description,
        })
        .eq("id", editingServer.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Servidor Atualizado",
        message: `Servidor "${editingServer.name}" atualizado.`
      })

      setEditingServer(null)
      fetchServers()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao salvar servidor",
        message: err.message
      })
    }
  }

  const handleConfirmBanServer = async () => {
    if (!banningServer) return

    try {
      const { error } = await supabase
        .from("servers")
        .update({
          is_banned: true,
          ban_reason: serverBanReasonInput || "Suspenso por moderação da plataforma",
          banned_at: new Date().toISOString()
        })
        .eq("id", banningServer.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Servidor Suspenso",
        message: `"${banningServer.name}" foi suspenso preventivamente.`
      })

      setBanningServer(null)
      setServerBanReasonInput("")
      fetchServers()
      fetchStats()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao suspender servidor",
        message: err.message
      })
    }
  }

  const handleUnbanServer = async (srv: ServerRow) => {
    try {
      const { error } = await supabase
        .from("servers")
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null
        })
        .eq("id", srv.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Servidor Reativado",
        message: `O servidor "${srv.name}" foi restabelecido.`
      })

      fetchServers()
      fetchStats()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao reativar servidor",
        message: err.message
      })
    }
  }

  // ── AÇÕES DE AUTO-UPDATE ──────────────────────────────────────────
  const handleAddChange = (type: "novidade" | "melhoria" | "correcao") => {
    setNewVersionForm((prev) => ({
      ...prev,
      changes: [...prev.changes, { type, title: "", description: "" }],
    }))
  }

  const handleRemoveChange = (index: number) => {
    setNewVersionForm((prev) => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateChange = (index: number, field: "type" | "title" | "description", value: string) => {
    setNewVersionForm((prev) => {
      const updated = [...prev.changes]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return { ...prev, changes: updated }
    })
  }

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVersionForm.version || !newVersionForm.download_url) {
      showToast({
        type: "error",
        title: "Campos obrigatórios",
        message: "Versão e URL de download são obrigatórios."
      })
      return
    }

    const validChanges = newVersionForm.changes.filter(c => c.title.trim())
    const generatedMarkdown = validChanges.length > 0
      ? validChanges.map(c => `- **[${c.type.toUpperCase()}] ${c.title.trim()}**: ${c.description.trim()}`).join('\n')
      : newVersionForm.release_notes.trim()

    setIsSubmittingVersion(true)
    try {
      const { error } = await supabase.from("app_versions").insert({
        version: newVersionForm.version.trim(),
        title: newVersionForm.title.trim() || `Alura v${newVersionForm.version.trim()}`,
        tagline: newVersionForm.tagline.trim() || null,
        changes: validChanges,
        download_url: newVersionForm.download_url.trim(),
        release_notes: generatedMarkdown,
        is_mandatory: newVersionForm.is_mandatory,
        is_active: true,
        created_by: user.id
      })

      if (error) throw error

      showToast({
        type: "success",
        title: "Versão Publicada!",
        message: `A versão v${newVersionForm.version} foi publicada no site e disparada para o ecossistema Alura.`
      })

      setNewVersionForm({
        version: "",
        title: "",
        tagline: "",
        download_url: "https://alura.net.br/downloads/setup_alura.exe",
        release_notes: "",
        is_mandatory: false,
        changes: [
          { type: "novidade", title: "", description: "" }
        ],
      })

      fetchVersions()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao registrar versão",
        message: err.message
      })
    } finally {
      setIsSubmittingVersion(false)
    }
  }

  const handleToggleVersionActive = async (ver: AppVersionRow) => {
    try {
      const { error } = await supabase
        .from("app_versions")
        .update({ is_active: !ver.is_active })
        .eq("id", ver.id)

      if (error) throw error
      fetchVersions()
    } catch (err: any) {
      showToast({ type: "error", title: "Erro", message: err.message })
    }
  }

  const handleOpenEditVersion = (ver: AppVersionRow) => {
    setEditingVersion({ ...ver })
    if (Array.isArray(ver.changes) && ver.changes.length > 0) {
      setEditingVersionChanges([...ver.changes])
    } else {
      setEditingVersionChanges([{ type: "novidade", title: "", description: "" }])
    }
  }

  const handleAddEditChange = (type: "novidade" | "melhoria" | "correcao") => {
    setEditingVersionChanges((prev) => [
      ...prev,
      { type, title: "", description: "" },
    ])
  }

  const handleRemoveEditChange = (index: number) => {
    setEditingVersionChanges((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateEditChange = (index: number, field: "type" | "title" | "description", value: string) => {
    setEditingVersionChanges((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const handleSaveVersionEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVersion) return
    if (!editingVersion.version || !editingVersion.download_url) {
      showToast({
        type: "error",
        title: "Campos obrigatórios",
        message: "Versão e URL de download são obrigatórios."
      })
      return
    }

    const validChanges = editingVersionChanges.filter(c => c.title.trim())
    let generatedMarkdown = editingVersion.release_notes
    if (validChanges.length > 0) {
      generatedMarkdown = validChanges.map(c => `- **[${c.type.toUpperCase()}] ${c.title.trim()}**: ${c.description.trim()}`).join('\n')
    }

    setIsSavingVersionEdit(true)
    try {
      const { error } = await supabase
        .from("app_versions")
        .update({
          version: editingVersion.version.trim(),
          title: editingVersion.title.trim() || `Alura v${editingVersion.version.trim()}`,
          tagline: editingVersion.tagline?.trim() || null,
          changes: validChanges,
          download_url: editingVersion.download_url.trim(),
          release_notes: generatedMarkdown.trim(),
          is_mandatory: editingVersion.is_mandatory,
          is_active: editingVersion.is_active,
        })
        .eq("id", editingVersion.id)

      if (error) throw error

      showToast({
        type: "success",
        title: "Versão Atualizada!",
        message: `Versão v${editingVersion.version} atualizada com sucesso.`
      })

      setEditingVersion(null)
      fetchVersions()
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao atualizar versão",
        message: err.message
      })
    } finally {
      setIsSavingVersionEdit(false)
    }
  }

  // Filtros em memória
  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase()
    return (
      u.username?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.id.includes(q)
    )
  })

  const filteredServers = serversList.filter((s) => {
    const q = serverSearch.toLowerCase()
    return s.name?.toLowerCase().includes(q) || s.id.includes(q)
  })

  // Bloqueio de acesso para não-staff
  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-alura-background text-alura-textSecondary">
        <div className="h-16 w-16 rounded-2xl bg-alura-danger/15 border border-alura-danger/30 flex items-center justify-center text-alura-danger mb-4 shadow-lg">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-alura-textPrimary mb-2">Acesso Restrito à Equipe Alura</h2>
        <p className="text-sm text-alura-textMuted max-w-md text-center mb-6">
          Esta área é reservada para membros da administração, moderação e equipe técnica da Alura.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl bg-alura-surface1 hover:bg-alura-surface2 text-alura-accent border border-alura-border text-sm font-semibold transition-all"
        >
          Voltar ao Início
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-alura-background text-alura-textPrimary">
      {/* ── Top Header do Painel ── */}
      <header className="h-16 border-b border-alura-border px-8 flex items-center justify-between shrink-0 bg-alura-surface1/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-alura-surface2 border border-alura-borderStrong flex items-center justify-center text-alura-accent shadow-inner">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-alura-textPrimary tracking-tight">Painel de Administração</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-alura-accent/15 text-alura-accent border border-alura-accent/30">
                Staff Hub
              </span>
            </div>
            <p className="text-xs text-alura-textMuted">
              Controle de usuários, servidores, métricas de pico e auto-updater do ecossistema Alura.
            </p>
          </div>
        </div>

        <button
          onClick={reloadAll}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-alura-border bg-alura-surface2 text-xs font-semibold text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover transition-colors"
          title="Recarregar dados"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-alura-accent" : ""}`} />
          <span>Sincronizar</span>
        </button>
      </header>

      {/* ── Menu de Navegação das Abas ── */}
      <div className="border-b border-alura-border px-8 bg-alura-navigation/70 flex items-center gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-alura-accent text-alura-accent bg-alura-selected/40"
              : "border-transparent text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-hover/40"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Visão Geral & Métricas
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "users"
              ? "border-alura-accent text-alura-accent bg-alura-selected/40"
              : "border-transparent text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-hover/40"
          }`}
        >
          <Users className="h-4 w-4" />
          Usuários ({stats?.total_users ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("servers")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "servers"
              ? "border-alura-accent text-alura-accent bg-alura-selected/40"
              : "border-transparent text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-hover/40"
          }`}
        >
          <Server className="h-4 w-4" />
          Servidores ({stats?.total_servers ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("updater")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "updater"
              ? "border-alura-accent text-alura-accent bg-alura-selected/40"
              : "border-transparent text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-hover/40"
          }`}
        >
          <HardDriveDownload className="h-4 w-4" />
          Auto-Updater (.exe)
        </button>
      </div>

      {/* ── Conteúdo Principal Rolável ── */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* ======================================================== */}
        {/* ABA 1: VISÃO GERAL & MÉTRICAS                            */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Grid de Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total de Usuários */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1 p-5 shadow-lg relative overflow-hidden group hover:border-alura-borderStrong transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-alura-textMuted uppercase tracking-wider">
                    Total de Usuários
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-alura-surface2 text-alura-accent flex items-center justify-center border border-alura-border">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-alura-textPrimary">
                    {stats?.total_users ?? 0}
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    +{stats?.new_users_today ?? 0} hoje
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-alura-textMuted">
                  <span className="flex items-center gap-1 text-alura-accent">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {stats?.online_users ?? 0} online agora
                  </span>
                </div>
              </div>

              {/* Card 2: Pico Histórico de Usuários */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1 p-5 shadow-lg relative overflow-hidden group hover:border-alura-borderStrong transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-alura-textMuted uppercase tracking-wider">
                    Pico de Usuários
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-alura-surface2 text-alura-accent flex items-center justify-center border border-alura-border">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-alura-accent">
                    {stats?.peak_concurrent_users ?? 0}
                  </span>
                  <span className="text-xs text-alura-textMuted">simultâneos</span>
                </div>
                <p className="mt-3 text-xs text-alura-textMuted">
                  Recorde histórico de conexões simultâneas na rede Alura.
                </p>
              </div>

              {/* Card 3: Servidores e Comunidades */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1 p-5 shadow-lg relative overflow-hidden group hover:border-alura-borderStrong transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-alura-textMuted uppercase tracking-wider">
                    Servidores Criados
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-alura-surface2 text-alura-accent flex items-center justify-center border border-alura-border">
                    <Server className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-alura-textPrimary">
                    {stats?.total_servers ?? 0}
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    +{stats?.new_servers_today ?? 0} hoje
                  </span>
                </div>
                <div className="mt-3 text-xs text-alura-textMuted flex items-center justify-between">
                  <span>{stats?.banned_servers ?? 0} suspensos</span>
                  <span className="text-alura-accent">100% ativos</span>
                </div>
              </div>

              {/* Card 4: Moderação & Bans */}
              <div className="rounded-2xl border border-alura-border bg-alura-surface1 p-5 shadow-lg relative overflow-hidden group hover:border-alura-borderStrong transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-alura-textMuted uppercase tracking-wider">
                    Controle & Bans
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 flex items-center justify-center">
                    <UserX className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-red-400">
                    {stats?.banned_users ?? 0}
                  </span>
                  <span className="text-xs text-alura-textMuted">usuários banidos</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-alura-textMuted">
                  <span>{stats?.staff_users ?? 0} membros staff</span>
                  <span className="text-alura-textSecondary font-medium">{stats?.total_messages ?? 0} msgs globais</span>
                </div>
              </div>
            </div>

            {/* Banner de Status do Ecossistema com gradiente do tema */}
            <div 
              style={{ background: "var(--theme-hero-bg, linear-gradient(135deg, rgba(0, 42, 18, 0.9), rgba(0, 22, 9, 0.95)))" }}
              className="rounded-2xl border border-alura-borderStrong p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-alura-surface2 flex items-center justify-center text-alura-accent shrink-0 shadow-lg border border-alura-border">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Rede Alura Operando em Alta Disponibilidade
                  </h3>
                  <p className="text-xs text-alura-textSecondary max-w-2xl leading-relaxed">
                    Sistemas de WebRTC Mesh, canais Phoenix WebSockets e pooler PostgreSQL funcionando normalmente com baixa latência e métricas de pico ativas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 rounded-xl bg-alura-surface1 hover:bg-alura-surface2 text-alura-textPrimary text-xs font-semibold transition-all border border-alura-border"
                >
                  Moderar Usuários
                </button>
                <button
                  onClick={() => setActiveTab("updater")}
                  className="px-4 py-2 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110 transition-all shadow-md"
                >
                  Lançar Update .exe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: USUÁRIOS & MODERAÇÃO                              */}
        {/* ======================================================== */}
        {activeTab === "users" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-alura-textMuted" />
                <input
                  type="text"
                  placeholder="Buscar por usuário ou nome..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-alura-surface1 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
                {(["all", "active", "staff", "banned"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setUserFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                      userFilter === filterKey
                        ? "bg-alura-selected text-alura-accent border border-alura-borderStrong"
                        : "bg-alura-surface1 text-alura-textMuted hover:text-alura-textPrimary border border-alura-border/40"
                    }`}
                  >
                    {filterKey === "all" && "Todos"}
                    {filterKey === "active" && "Ativos"}
                    {filterKey === "staff" && "Staff / Admin"}
                    {filterKey === "banned" && "Banidos"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="rounded-2xl border border-alura-border bg-alura-surface1 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-alura-textSecondary">
                  <thead className="bg-alura-surface2/80 text-xs uppercase tracking-wider text-alura-textMuted border-b border-alura-border">
                    <tr>
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Cargo / Nível</th>
                      <th className="px-6 py-4">Conquistas</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Cadastro</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-alura-border/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-alura-textMuted">
                          Nenhum usuário encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-alura-hover/40 transition-colors group">
                          {/* Coluna 1: Usuário */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.username} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-bold text-xs text-alura-accent">
                                    {(u.display_name || u.username || "U").slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-alura-textPrimary truncate">
                                    {u.display_name || u.username}
                                  </span>
                                  {u.is_staff && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-alura-accent/20 text-alura-accent border border-alura-accent/40">
                                      STAFF
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-alura-textMuted block truncate">
                                  @{u.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Coluna 2: Cargo */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-alura-border bg-alura-surface2 text-alura-textPrimary capitalize">
                              {u.role || "user"}
                            </span>
                          </td>

                          {/* Coluna 3: Conquistas */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-alura-surface2 hover:bg-alura-hover text-alura-accent border border-alura-border transition-colors cursor-pointer"
                              title="Clique para gerenciar conquistas"
                            >
                              <Trophy className="h-3.5 w-3.5" />
                              <span>{u.achievements?.length || 0}</span>
                              <span className="text-[10px] text-alura-textMuted font-normal">badge(s)</span>
                            </button>
                          </td>

                          {/* Coluna 4: Status */}
                          <td className="px-6 py-4">
                            {u.is_banned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/50 text-red-400 border border-red-800/40" title={u.ban_reason || "Banido"}>
                                <Ban className="h-3 w-3" />
                                Banido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-alura-selected text-alura-accent border border-alura-borderStrong">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Ativo
                              </span>
                            )}
                          </td>

                          {/* Coluna 5: Data de Cadastro */}
                          <td className="px-6 py-4 text-xs text-alura-textMuted">
                            {new Date(u.created_at).toLocaleDateString("pt-BR")}
                          </td>

                          {/* Coluna 6: Ações */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 rounded-lg border border-alura-border bg-alura-surface2 text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover transition-colors"
                                title="Editar usuário e conquistas"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              {u.is_banned ? (
                                <button
                                  onClick={() => handleUnbanUser(u)}
                                  className="px-2.5 py-1 rounded-lg border border-alura-border bg-alura-surface2 text-xs font-semibold text-alura-accent hover:bg-alura-hover transition-colors"
                                  title="Desbanir usuário"
                                >
                                  Desbanir
                                </button>
                              ) : (
                                <button
                                  onClick={() => setBanningUser(u)}
                                  className="p-1.5 rounded-lg border border-red-900/40 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors"
                                  title="Banir usuário"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 3: SERVIDORES & COMUNIDADES                          */}
        {/* ======================================================== */}
        {activeTab === "servers" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-alura-textMuted" />
                <input
                  type="text"
                  placeholder="Buscar servidores por nome..."
                  value={serverSearch}
                  onChange={(e) => setServerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-alura-surface1 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                {(["all", "active", "banned"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setServerFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                      serverFilter === filterKey
                        ? "bg-alura-selected text-alura-accent border border-alura-borderStrong"
                        : "bg-alura-surface1 text-alura-textMuted hover:text-alura-textPrimary border border-alura-border/40"
                    }`}
                  >
                    {filterKey === "all" && "Todos"}
                    {filterKey === "active" && "Ativos"}
                    {filterKey === "banned" && "Suspensos / Banidos"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-alura-border bg-alura-surface1 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-alura-textSecondary">
                  <thead className="bg-alura-surface2/80 text-xs uppercase tracking-wider text-alura-textMuted border-b border-alura-border">
                    <tr>
                      <th className="px-6 py-4">Servidor</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Criado em</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-alura-border/60">
                    {filteredServers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-alura-textMuted">
                          Nenhum servidor encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredServers.map((s) => (
                        <tr key={s.id} className="hover:bg-alura-hover/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                                {s.icon_url ? (
                                  <img src={s.icon_url} alt={s.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-bold text-xs text-alura-accent">
                                    {s.name.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="font-semibold text-alura-textPrimary truncate max-w-xs">
                                {s.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-alura-textMuted max-w-sm truncate">
                            {s.description || "Sem descrição"}
                          </td>

                          <td className="px-6 py-4">
                            {s.is_banned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/50 text-red-400 border border-red-800/40" title={s.ban_reason || "Suspenso"}>
                                Suspenso
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-alura-selected text-alura-accent border border-alura-borderStrong">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Ativo
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-alura-textMuted">
                            {new Date(s.created_at).toLocaleDateString("pt-BR")}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingServer(s)}
                                className="p-1.5 rounded-lg border border-alura-border bg-alura-surface2 text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover transition-colors"
                                title="Editar servidor"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              {s.is_banned ? (
                                <button
                                  onClick={() => handleUnbanServer(s)}
                                  className="px-2.5 py-1 rounded-lg border border-alura-border bg-alura-surface2 text-xs font-semibold text-alura-accent hover:bg-alura-hover transition-colors"
                                >
                                  Reativar
                                </button>
                              ) : (
                                <button
                                  onClick={() => setBanningServer(s)}
                                  className="p-1.5 rounded-lg border border-red-900/40 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors"
                                  title="Suspender servidor"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: GERENCIAMENTO DE AUTO-UPDATER (.EXE)             */}
        {/* ======================================================== */}
        {activeTab === "updater" && (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Bloco de Novo Release */}
            <div className="rounded-2xl border border-alura-border bg-alura-surface1 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-alura-border">
                <div>
                  <h3 className="text-base font-bold text-alura-textPrimary flex items-center gap-2">
                    <HardDriveDownload className="h-5 w-5 text-alura-accent" />
                    Lançar Nova Versão do Executável (.exe)
                  </h3>
                  <p className="text-xs text-alura-textMuted mt-1">
                    Ao registrar uma versão ativa com numeração superior à versão atual dos clientes, o Alura Desktop exibirá a notificação de update ou atualizará silenciosamente.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateVersion} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-alura-textSecondary mb-1">
                      Versão Semver (ex: 1.0.3, 1.1.0) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1.0.3"
                      value={newVersionForm.version}
                      onChange={(e) => setNewVersionForm({ ...newVersionForm, version: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-alura-textSecondary mb-1">
                      Título do Lançamento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Transmissão 60 FPS & Auto-Update"
                      value={newVersionForm.title}
                      onChange={(e) => setNewVersionForm({ ...newVersionForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-alura-textSecondary mb-1">
                      Destaque / Subtítulo (Tagline)
                    </label>
                    <input
                      type="text"
                      placeholder="Atualização invisível no launcher e novas conquistas"
                      value={newVersionForm.tagline}
                      onChange={(e) => setNewVersionForm({ ...newVersionForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-alura-textSecondary mb-1">
                    URL Direta do Instalador .exe *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://alura.net.br/downloads/setup_alura.exe"
                    value={newVersionForm.download_url}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, download_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-colors"
                  />
                </div>

                {/* Construtor de Itens do Changelog (Estrutura idêntica ao Site) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-alura-border pb-2.5">
                    <div>
                      <span className="text-xs font-bold text-alura-textPrimary block">
                        Novidades, Melhorias e Correções (Changelog Oficial)
                      </span>
                      <span className="text-[11px] text-alura-textMuted">
                        Itens serão sincronizados diretamente com a página /changelog no site e exibidos no app.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAddChange("novidade")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-alura-accent/15 text-alura-accent border border-alura-accent/30 hover:bg-alura-accent/25 transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>+ Novidade</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddChange("melhoria")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>+ Melhoria</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddChange("correcao")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span>+ Correção</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista Dinâmica de Itens */}
                  <div className="space-y-3">
                    {newVersionForm.changes.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-alura-border bg-alura-surface2/50 flex flex-col md:flex-row items-start md:items-center gap-3 relative group"
                      >
                        {/* Seletor do Tipo */}
                        <div className="w-full md:w-36 shrink-0">
                          <select
                            value={item.type}
                            onChange={(e) => handleUpdateChange(idx, "type", e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-alura-surface1 border border-alura-border text-xs font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-accent capitalize"
                          >
                            <option value="novidade">✦ Novidade</option>
                            <option value="melhoria">⚡ Melhoria</option>
                            <option value="correcao">🔧 Correção</option>
                          </select>
                        </div>

                        {/* Título do Item */}
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="Título do recurso ou correção..."
                            value={item.title}
                            onChange={(e) => handleUpdateChange(idx, "title", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-alura-surface1 border border-alura-border text-xs text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent font-medium"
                          />
                        </div>

                        {/* Descrição do Item */}
                        <div className="flex-[2] w-full">
                          <input
                            type="text"
                            placeholder="Descrição detalhada sobre a mudança..."
                            value={item.description}
                            onChange={(e) => handleUpdateChange(idx, "description", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-alura-surface1 border border-alura-border text-xs text-alura-textSecondary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent"
                          />
                        </div>

                        {/* Botão de Excluir Item */}
                        {newVersionForm.changes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChange(idx)}
                            className="p-1.5 rounded-lg text-alura-textMuted hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer self-end md:self-auto"
                            title="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-alura-border">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newVersionForm.is_mandatory}
                      onChange={(e) => setNewVersionForm({ ...newVersionForm, is_mandatory: e.target.checked })}
                      className="h-4 w-4 rounded border-alura-border bg-alura-surface2 text-alura-accent focus:ring-0"
                    />
                    <span className="text-xs font-medium text-alura-textSecondary">
                      Atualização Obrigatória (bloqueia o uso até o usuário atualizar)
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingVersion}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-alura-accent/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {isSubmittingVersion ? "Publicando..." : "Publicar no Site e App"}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Versões Já Registradas */}
            <div className="rounded-2xl border border-alura-border bg-alura-surface1 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-alura-border flex items-center justify-between">
                <h4 className="text-sm font-bold text-alura-textPrimary">Histórico de Versões do Executável</h4>
                <span className="text-xs text-alura-textMuted">{versionsList.length} versões registradas</span>
              </div>

              <div className="divide-y divide-alura-border/60">
                {versionsList.length === 0 ? (
                  <div className="px-6 py-8 text-center text-alura-textMuted text-sm">
                    Nenhuma versão registrada no banco ainda.
                  </div>
                ) : (
                  versionsList.map((ver) => (
                    <div key={ver.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-alura-hover/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-alura-textPrimary">v{ver.version}</span>
                          <span className="text-xs font-medium text-alura-textMuted">— {ver.title}</span>
                          {ver.is_mandatory && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                              Obrigatória
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ver.is_active
                              ? "bg-alura-selected text-alura-accent border border-alura-borderStrong"
                              : "bg-alura-surface2 text-alura-textMuted"
                          }`}>
                            {ver.is_active ? "ATIVA" : "INATIVA"}
                          </span>
                        </div>
                        {ver.tagline && (
                          <p className="text-xs text-alura-textSecondary font-medium">{ver.tagline}</p>
                        )}
                        <p className="text-xs text-alura-textMuted line-clamp-1">{ver.release_notes || "Sem notas de release"}</p>
                        <p className="text-[11px] text-alura-textMuted/70 truncate max-w-xl">{ver.download_url}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVersion(ver)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-alura-border bg-alura-surface2/70 text-alura-textPrimary hover:bg-alura-surface3 hover:border-alura-accent/50 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Editar versão"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-alura-accent" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVersionActive(ver)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                            ver.is_active
                              ? "border-red-900/40 text-red-400 hover:bg-red-950/30"
                              : "border-alura-border text-alura-accent hover:bg-alura-surface2"
                          }`}
                        >
                          {ver.is_active ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: EDITAR USUÁRIO & CONQUISTAS ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-alura-border bg-alura-surface1 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-alura-textMuted hover:text-alura-textPrimary"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-alura-textPrimary mb-4">
              Gerenciar Usuário @{editingUser.username}
            </h3>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={editingUser.display_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">Biografia</label>
                <textarea
                  rows={2}
                  value={editingUser.bio || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-alura-textMuted mb-1">Cargo (Role)</label>
                  <select
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                  >
                    <option value="user">Usuário Comum</option>
                    <option value="support">Suporte</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={editingUser.is_staff || false}
                      onChange={(e) => setEditingUser({ ...editingUser, is_staff: e.target.checked })}
                      className="h-4 w-4 rounded border-alura-border bg-alura-surface2 text-alura-accent"
                    />
                    <span className="text-xs font-semibold text-alura-textSecondary">Membro Staff</span>
                  </label>
                </div>
              </div>

              {/* ── SEÇÃO EXCLUSIVA: CONQUISTAS DO USUÁRIO ── */}
              <div className="pt-3 border-t border-alura-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-alura-accent" />
                    <span className="text-xs font-bold text-alura-textPrimary">Conquistas & Badges</span>
                    <span className="text-[11px] font-semibold text-alura-textMuted">
                      ({editingUser.achievements?.length || 0} de {ACHIEVEMENTS_CATALOG.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, achievements: ACHIEVEMENTS_CATALOG.map(a => a.id) })}
                      className="text-[11px] font-semibold text-alura-accent hover:underline cursor-pointer"
                    >
                      Conceder Todas
                    </button>
                    <span className="text-alura-border">•</span>
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, achievements: [] })}
                      className="text-[11px] font-semibold text-alura-textMuted hover:text-alura-danger hover:underline cursor-pointer"
                    >
                      Remover Todas
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5 rounded-xl bg-alura-surface2 border border-alura-border grid grid-cols-2 gap-2">
                  {ACHIEVEMENTS_CATALOG.map((ach) => {
                    const Icon = ach.icon
                    const hasAch = (editingUser.achievements || []).includes(ach.id)
                    return (
                      <button
                        type="button"
                        key={ach.id}
                        onClick={() => {
                          const current = editingUser.achievements || []
                          const updated = hasAch
                            ? current.filter(id => id !== ach.id)
                            : [...current, ach.id]
                          setEditingUser({ ...editingUser, achievements: updated })
                        }}
                        className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 group cursor-pointer ${
                          hasAch
                            ? "bg-alura-selected border-alura-accent text-alura-textPrimary shadow-[0_0_8px_rgba(57,255,136,0.2)]"
                            : "bg-alura-surface1/60 border-alura-border/60 text-alura-textMuted hover:border-alura-borderStrong hover:text-alura-textSecondary"
                        }`}
                        title={ach.desc}
                      >
                        <div className={`h-7 w-7 rounded-md border flex items-center justify-center shrink-0 ${hasAch ? ach.color : "bg-alura-surface2 border-alura-border text-alura-textMuted"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[11px] font-bold truncate ${hasAch ? "text-alura-textPrimary" : "text-alura-textMuted"}`}>
                            {ach.title}
                          </p>
                          <span className="text-[9px] block text-alura-textMuted truncate">
                            {hasAch ? "Desbloqueada" : "Bloqueada"}
                          </span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${hasAch ? "border-alura-accent bg-alura-accent text-alura-background" : "border-alura-border"}`}>
                          {hasAch && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-alura-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110 cursor-pointer shadow-md shadow-alura-accent/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BANIR USUÁRIO ── */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-alura-surface1 p-6 shadow-2xl relative">
            <button
              onClick={() => setBanningUser(null)}
              className="absolute top-4 right-4 text-alura-textMuted hover:text-alura-textPrimary"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <Ban className="h-6 w-6" />
              <h3 className="text-base font-bold text-alura-textPrimary">Banir @{banningUser.username}</h3>
            </div>
            <p className="text-xs text-alura-textMuted mb-4 leading-relaxed">
              O usuário perderá acesso imediato às comunidades, mensagens diretas e recursos da Alura.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-alura-textSecondary mb-1">Motivo do Banimento</label>
                <input
                  type="text"
                  placeholder="Ex: Spam, violação das diretrizes de convivência..."
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-red-900/40 text-sm text-alura-textPrimary focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBanUser}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                >
                  Confirmar Banimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR SERVIDOR ── */}
      {editingServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-alura-border bg-alura-surface1 p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingServer(null)}
              className="absolute top-4 right-4 text-alura-textMuted hover:text-alura-textPrimary"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-alura-textPrimary mb-4">Editar Servidor</h3>

            <form onSubmit={handleSaveServerEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">Nome do Servidor</label>
                <input
                  type="text"
                  required
                  value={editingServer.name || ""}
                  onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editingServer.description || ""}
                  onChange={(e) => setEditingServer({ ...editingServer, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-alura-border">
                <button
                  type="button"
                  onClick={() => setEditingServer(null)}
                  className="px-4 py-2 text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SUSPENDER SERVIDOR ── */}
      {banningServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-alura-surface1 p-6 shadow-2xl relative">
            <button
              onClick={() => setBanningServer(null)}
              className="absolute top-4 right-4 text-alura-textMuted hover:text-alura-textPrimary"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <Ban className="h-6 w-6" />
              <h3 className="text-base font-bold text-alura-textPrimary">Suspender "{banningServer.name}"</h3>
            </div>
            <p className="text-xs text-alura-textMuted mb-4 leading-relaxed">
              O servidor ficará inacessível para todos os membros até ser reativado pela administração.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-alura-textSecondary mb-1">Motivo da Suspensão</label>
                <input
                  type="text"
                  placeholder="Ex: Conteúdo impróprio, violação dos termos..."
                  value={serverBanReasonInput}
                  onChange={(e) => setServerBanReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-red-900/40 text-sm text-alura-textPrimary focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanningServer(null)}
                  className="px-4 py-2 text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBanServer}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                >
                  Suspender Servidor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR VERSÃO DO EXECUTÁVEL ── */}
      {editingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-alura-border bg-alura-surface1 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setEditingVersion(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-alura-border">
              <div className="w-8 h-8 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
                <HardDriveDownload className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-alura-textPrimary">
                  Editar Versão v{editingVersion.version}
                </h3>
                <p className="text-xs text-alura-textMuted">
                  Atualize notas de release, changelog estruturado ou links de download
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVersionEdit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-alura-textMuted mb-1">
                    Número da Versão (ex: 1.0.36) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVersion.version}
                    onChange={(e) => setEditingVersion({ ...editingVersion, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-alura-textMuted mb-1">
                    Título do Release
                  </label>
                  <input
                    type="text"
                    value={editingVersion.title}
                    onChange={(e) => setEditingVersion({ ...editingVersion, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">
                  Tagline / Resumo Curto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Melhorias em chamadas de voz e compartilhamento de tela"
                  value={editingVersion.tagline || ""}
                  onChange={(e) => setEditingVersion({ ...editingVersion, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">
                  URL Direta do Executável (.exe) *
                </label>
                <input
                  type="url"
                  required
                  value={editingVersion.download_url}
                  onChange={(e) => setEditingVersion({ ...editingVersion, download_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-sm text-alura-textPrimary focus:outline-none focus:border-alura-accent"
                />
              </div>

              {/* Construtor de Mudanças Estruturadas */}
              <div className="space-y-2 pt-2 border-t border-alura-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-alura-textPrimary">
                    Itens do Changelog
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddEditChange("novidade")}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-alura-accent/15 text-alura-accent border border-alura-accent/30 hover:bg-alura-accent/25 transition-colors cursor-pointer"
                    >
                      + Novidade
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddEditChange("melhoria")}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer"
                    >
                      + Melhoria
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddEditChange("correcao")}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      + Correção
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {editingVersionChanges.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-alura-border bg-alura-surface2/60 flex flex-col md:flex-row items-start md:items-center gap-2.5"
                    >
                      <div className="w-full md:w-32 shrink-0">
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateEditChange(idx, "type", e.target.value as any)}
                          className="w-full px-2 py-1 rounded-lg bg-alura-surface1 border border-alura-border text-xs font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-accent capitalize"
                        >
                          <option value="novidade">✦ Novidade</option>
                          <option value="melhoria">⚡ Melhoria</option>
                          <option value="correcao">🔧 Correção</option>
                        </select>
                      </div>

                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Título do recurso..."
                          value={item.title}
                          onChange={(e) => handleUpdateEditChange(idx, "title", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-alura-surface1 border border-alura-border text-xs text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent font-medium"
                        />
                      </div>

                      <div className="flex-[2] w-full">
                        <input
                          type="text"
                          placeholder="Descrição detalhada..."
                          value={item.description}
                          onChange={(e) => handleUpdateEditChange(idx, "description", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-alura-surface1 border border-alura-border text-xs text-alura-textSecondary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent"
                        />
                      </div>

                      {editingVersionChanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditChange(idx)}
                          className="p-1.5 rounded-lg text-alura-textMuted hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer self-end md:self-auto"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-alura-textMuted mb-1">
                  Notas de Release (Markdown gerado ou customizado)
                </label>
                <textarea
                  rows={4}
                  value={editingVersion.release_notes || ""}
                  onChange={(e) => setEditingVersion({ ...editingVersion, release_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary font-mono focus:outline-none focus:border-alura-accent custom-scrollbar leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-alura-border">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingVersion.is_mandatory}
                    onChange={(e) => setEditingVersion({ ...editingVersion, is_mandatory: e.target.checked })}
                    className="h-4 w-4 rounded border-alura-border bg-alura-surface2 text-alura-accent focus:ring-0"
                  />
                  <span className="text-xs font-medium text-alura-textSecondary">
                    Atualização Obrigatória
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingVersion.is_active}
                    onChange={(e) => setEditingVersion({ ...editingVersion, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-alura-border bg-alura-surface2 text-alura-accent focus:ring-0"
                  />
                  <span className="text-xs font-medium text-alura-textSecondary">
                    Versão Ativa
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-alura-border">
                <button
                  type="button"
                  onClick={() => setEditingVersion(null)}
                  className="px-4 py-2 text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingVersionEdit}
                  className="px-5 py-2.5 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-alura-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVersionEdit ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
