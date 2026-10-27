import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { usePresence } from "../../contexts/PresenceContext"

interface Server {
  id: string
  name: string
  description?: string
  icon_url?: string
}

interface ServerWithMembers extends Server {
  memberCount: number
}

interface OnlineFriend {
  id: string
  name: string
  username: string
  avatar_url?: string
  status?: string
}

export function RightSidebar() {
  const navigate = useNavigate()
  const { isUserOnline } = usePresence()
  const [servers, setServers] = useState<ServerWithMembers[]>([])
  const [suggestions, setSuggestions] = useState<ServerWithMembers[]>([])
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUserId = session?.user?.id

        // 1. Busca todos os servidores
        const { data: allServers, error: srvErr } = await supabase
          .from('servers')
          .select('*')
          .order('created_at', { ascending: false })

        if (srvErr) throw srvErr

        // 2. Busca contagem de membros por servidor
        const { data: memberRows } = await supabase
          .from('server_members')
          .select('server_id, user_id')

        const countMap: Record<string, number> = {}
        const userJoinedServerIds = new Set<string>()

        memberRows?.forEach((row: any) => {
          countMap[row.server_id] = (countMap[row.server_id] || 0) + 1
          if (currentUserId && row.user_id === currentUserId) {
            userJoinedServerIds.add(row.server_id)
          }
        })

        if (allServers) {
          const userServersList: ServerWithMembers[] = []
          const suggestedList: ServerWithMembers[] = []

          allServers.forEach((srv) => {
            const item: ServerWithMembers = {
              ...srv,
              memberCount: countMap[srv.id] || 1,
            }
            if (userJoinedServerIds.has(srv.id)) {
              userServersList.push(item)
            } else {
              suggestedList.push(item)
            }
          })

          setServers(userServersList)
          setSuggestions(suggestedList.slice(0, 5))
        }

        // 3. Busca amigos aceitos para listar amigos online (alura-home.html)
        if (currentUserId) {
          const { data: friendships } = await supabase
            .from('friendships')
            .select(`
              id, user_id_1, user_id_2,
              p1:profiles!user_id_1(id, username, display_name, avatar_url, status),
              p2:profiles!user_id_2(id, username, display_name, avatar_url, status)
            `)
            .eq('status', 'accepted')
            .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`)

          if (friendships) {
            const friendsList = friendships.map((f: any) => {
              const friend = f.user_id_1 === currentUserId ? f.p2 : f.p1
              return {
                id: friend?.id,
                name: friend?.display_name || friend?.username || "Amigo",
                username: friend?.username || "usuario",
                avatar_url: friend?.avatar_url,
                status: friend?.status || "offline"
              }
            }).filter((f: any) => Boolean(f.id))

            setOnlineFriends(friendsList)
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do painel direito:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleJoinServer = async (serverId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('server_members').insert({
          server_id: serverId,
          user_id: session.user.id,
          role: 'member'
        })
      }
    } catch {
      // Ignora erro caso já seja membro
    } finally {
      navigate(`/servers/${serverId}`)
    }
  }

  // Filtra amigos online (presença ativa ou status online/idle/dnd)
  const activeOnlineFriends = onlineFriends.filter(
    (f) => isUserOnline(f.id) || f.status === 'online' || f.status === 'idle' || f.status === 'dnd'
  )

  return (
    <aside className="w-[300px] h-full hidden xl:flex flex-col bg-alura-navigation border-l border-alura-border/60 p-5 space-y-6 overflow-y-auto custom-scrollbar shrink-0 select-none">
      
      {/* 1. Servidores - alura-home.html */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-white flex justify-between items-center px-1">
          <span>Servidores</span>
          <Link
            to="/servers"
            className="text-[13px] font-medium text-alura-accent hover:underline"
          >
            Ver todos
          </Link>
        </h2>
        
        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-alura-accent animate-spin" />
            </div>
          ) : servers.length > 0 ? (
            servers.slice(0, 4).map((server) => (
              <div
                key={server.id}
                onClick={() => navigate(`/servers/${server.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-alura-surface2 transition-colors cursor-pointer group"
                title={server.name}
              >
                {/* Ícone Squircle (.av.sq) */}
                <div className="w-9 h-9 rounded-xl bg-alura-surface2 border border-alura-border/60 group-hover:border-alura-accent/50 shrink-0 flex items-center justify-center font-bold text-xs text-alura-accent overflow-hidden transition-colors">
                  {server.icon_url ? (
                    <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{server.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="font-semibold text-sm text-white group-hover:text-alura-accent transition-colors truncate block">
                    {server.name}
                  </b>
                  <small className="text-alura-textMuted text-xs mt-0.5 truncate block">
                    {server.memberCount} {server.memberCount === 1 ? 'membro' : 'membros'}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="text-alura-textMuted text-xs px-2 py-1 italic">Nenhum servidor encontrado.</div>
          )}
        </div>
      </section>

      {/* 2. Sugestões para você - alura-home.html */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-white flex justify-between items-center px-1">
          <span>Sugestões para você</span>
          <Link
            to="/servers"
            className="text-[13px] font-medium text-alura-accent hover:underline"
          >
            Ver todos
          </Link>
        </h2>

        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-alura-accent animate-spin" />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.slice(0, 4).map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => navigate(`/servers/${suggestion.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-alura-surface2 transition-colors cursor-pointer group"
                title={suggestion.name}
              >
                {/* Ícone Squircle (.av.sq) */}
                <div className="w-9 h-9 rounded-xl bg-alura-surface2 border border-alura-border/60 shrink-0 flex items-center justify-center font-bold text-xs text-alura-accent overflow-hidden">
                  {suggestion.icon_url ? (
                    <img src={suggestion.icon_url} alt={suggestion.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{suggestion.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="font-semibold text-sm text-white truncate block">
                    {suggestion.name}
                  </b>
                  <small className="text-alura-textMuted text-xs mt-0.5 truncate block">
                    {suggestion.memberCount} {suggestion.memberCount === 1 ? 'membro' : 'membros'}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleJoinServer(suggestion.id, e)}
                  className="h-7 px-3 rounded-md bg-alura-accent/12 text-alura-accent hover:bg-alura-accent hover:text-alura-background font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            ))
          ) : (
            <div className="text-alura-textMuted text-xs px-2 py-1 italic">Sem sugestões no momento.</div>
          )}
        </div>
      </section>

      {/* 3. Amigos online - alura-home.html */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-white px-1">Amigos online</h2>
        <div className="space-y-1">
          {activeOnlineFriends.length > 0 ? (
            activeOnlineFriends.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/messages/${f.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-alura-surface2 transition-colors cursor-pointer group"
                title={`Conversar com ${f.name}`}
              >
                {/* Avatar circular com indicador .st */}
                <div className="relative w-9 h-9 min-w-9 min-h-9 aspect-square rounded-full bg-alura-surface2 shrink-0 flex items-center justify-center font-bold text-xs text-alura-accent">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.name} className="w-full h-full aspect-square object-cover rounded-full shrink-0" />
                    ) : (
                      <span>{(f.name || "U").substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full border-2 border-alura-navigation bg-alura-online z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="font-semibold text-sm text-white group-hover:text-alura-accent transition-colors truncate block">
                    {f.name}
                  </b>
                  <small className="text-alura-textMuted text-xs truncate block">
                    @{f.username}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="text-alura-textMuted text-xs px-2 py-1 italic">
              Nenhum amigo online agora.
            </div>
          )}
        </div>
      </section>

    </aside>
  )
}
