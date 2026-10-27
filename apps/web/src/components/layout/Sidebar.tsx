import { Home, MessageSquare, Server, Settings, UserPlus, Users, User, Pin, Plus, ShieldAlert, ChevronLeft } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useNotification } from '../../contexts/NotificationContext'
import { usePinnedServers } from '../../lib/hooks/usePinnedServers'
import { UserPanel } from './UserPanel'
import { VoiceConnectionCard } from './VoiceConnectionCard'

interface SidebarProps {
  user?: any
  profile?: any
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ user, profile, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { unreadDMCount, pendingRequestsCount } = useNotification()
  const { pinnedServers, loading: loadingPinned } = usePinnedServers(user?.id)
  const isStaff = profile?.is_staff === true || 
                  profile?.role === "admin" || 
                  profile?.role === "moderator" ||
                  profile?.username === "luisera" ||
                  profile?.username === "adminalura" ||
                  user?.email?.toLowerCase().includes("admin") ||
                  user?.user_metadata?.role === "admin" ||
                  user?.app_metadata?.role === "admin"

  return (
    <aside
      className={`h-full flex flex-col bg-alura-surface1 z-20 border-r border-alura-border select-none transition-all duration-200 ease-in-out shrink-0 relative ${
        isCollapsed ? 'w-[72px]' : 'w-[268px]'
      }`}
      aria-label="Navegação principal"
    >
      
      {/* Header com Logo e Botão de Recolher */}
      <div className={`flex items-center shrink-0 transition-all ${
        isCollapsed 
          ? "h-[84px] flex-col justify-center gap-1.5 p-0" 
          : "h-16 justify-between px-5"
      }`}>
        <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0" title="Alura">
          <svg viewBox="0 0 100 100" fill="none" className="w-[34px] h-[34px]" aria-label="Alura">
            <defs>
              <linearGradient id="g1" x1="15%" y1="85%" x2="65%" y2="15%">
                <stop offset="0" stopColor="#00DFA0"/>
                <stop offset=".4" stopColor="#39FF88"/>
                <stop offset="1" stopColor="#7EFFBD"/>
              </linearGradient>
              <linearGradient id="g2" x1="35%" y1="15%" x2="85%" y2="85%">
                <stop offset="0" stopColor="#00DFA0"/>
                <stop offset=".45" stopColor="#00B377"/>
                <stop offset="1" stopColor="#004B1F"/>
              </linearGradient>
              <linearGradient id="g3" x1="50%" y1="45%" x2="50%" y2="90%">
                <stop offset="0" stopColor="#007A40"/>
                <stop offset=".5" stopColor="#003516"/>
                <stop offset="1" stopColor="#001609"/>
              </linearGradient>
            </defs>
            <path d="M26 73C34 60 41 53 50 53C59 53 66 60 74 73C66 64 58 59 50 59C42 59 34 64 26 73Z" fill="url(#g3)"/>
            <path d="M50 14C55 14 59 18 61 22L83 67C87 75 80 83 73 81C69 80 66 77 64 72L51 44C50 42 49 32 50 14Z" fill="url(#g2)"/>
            <path d="M50 14C44 14 40 18 38 22L17 67C13 75 20 83 27 81C31 80 34 77 36 72L49 44C51 40 52 30 55 22C54 16 52 14 50 14Z" fill="url(#g1)"/>
          </svg>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-all cursor-pointer"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft size={18} className={`transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Navegação Principal */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar transition-all ${
        isCollapsed ? "p-2 space-y-1" : "px-3 py-2 space-y-0.5"
      }`}>
        <NavItem icon={<Home />} label="Início" to="/" isCollapsed={isCollapsed} />
        <NavItem icon={<Users />} label="Amigos" to="/friends" isCollapsed={isCollapsed} />
        <NavItem icon={<User />} label="Perfil" to="/profile" isCollapsed={isCollapsed} />
        <NavItem 
          icon={<UserPlus />} 
          label="Solicitações" 
          to="/requests" 
          badge={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
          isCollapsed={isCollapsed} 
        />
        <NavItem 
          icon={<MessageSquare />} 
          label="Mensagens" 
          to="/messages" 
          badge={unreadDMCount > 0 ? unreadDMCount : undefined} 
          quiet={true}
          isCollapsed={isCollapsed} 
        />
        
        {/* Espaçamento entre grupos */}
        <div className="h-3 my-1" />
        
        <NavItem icon={<Server />} label="Servidores" to="/servers" isCollapsed={isCollapsed} />
        {isStaff && (
          <NavItem
            icon={<ShieldAlert className="text-[#39ff88]" />}
            label="Administração"
            to="/admin"
            badge="STAFF"
            isCollapsed={isCollapsed}
          />
        )}
        <NavItem icon={<Settings />} label="Configurações" to="/settings" isCollapsed={isCollapsed} />

        {/* Seção Servidores Fixados (.group e .servers) */}
        <div className="mt-4 pt-3 border-t border-alura-border/60">
          <div className={`mb-2 flex items-center ${
            isCollapsed 
              ? "justify-center" 
              : "justify-between px-3 text-xs font-semibold text-alura-textMuted"
          }`}>
            {!isCollapsed && <span>Seus servidores</span>}
            <NavLink
              to="/servers"
              className="w-6 h-6 rounded-md flex items-center justify-center text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-colors"
              title="Explorar servidores"
              aria-label="Explorar servidores"
            >
              <Plus size={15} />
            </NavLink>
          </div>

          <div className="space-y-0.5">
            {loadingPinned ? (
              <div className="space-y-1.5 p-1">
                <div className={`rounded-xl bg-alura-surface2/60 animate-pulse ${isCollapsed ? "w-9 h-9 mx-auto" : "h-9 w-full"}`} />
                <div className={`rounded-xl bg-alura-surface2/60 animate-pulse ${isCollapsed ? "w-9 h-9 mx-auto" : "h-9 w-full"}`} />
              </div>
            ) : pinnedServers.length === 0 ? (
              !isCollapsed && (
                <p className="px-3 py-2 text-xs text-alura-textMuted leading-relaxed">
                  Você ainda não está em nenhum servidor.
                </p>
              )
            ) : (
              pinnedServers.map((srv) => (
                <NavLink
                  key={srv.server_id}
                  to={`/servers/${srv.server_id}`}
                  title={srv.name}
                  className={({ isActive }) =>
                    `relative flex items-center rounded-lg transition-colors group ${
                      isCollapsed ? "justify-center p-1.5" : "gap-2.5 px-3 py-1.5"
                    } ${
                      isActive
                        ? 'bg-alura-accent/12 text-alura-textPrimary font-semibold'
                        : 'text-alura-textSecondary hover:bg-alura-surface2 hover:text-alura-textPrimary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-3 top-[9px] bottom-[9px] w-[3px] rounded-r bg-alura-accent" />
                      )}
                      
                      {/* Ícone Squircle 36x36 (.ic) */}
                      <div className="relative w-9 h-9 shrink-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#243029] text-alura-accent font-bold text-[13px] flex items-center justify-center group-hover:rounded-[10px] transition-all">
                          {srv.icon_url ? (
                            <img src={srv.icon_url} alt={srv.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{srv.name.replace(/[^\p{L}\p{N}]/gu, '')[0]?.toUpperCase() || srv.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        
                        {/* Pin Badge (.pin) */}
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-alura-surface1 border border-alura-border flex items-center justify-center text-alura-accent shadow-md z-10" title="Servidor Fixado">
                          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-none stroke-current stroke-[2.4] stroke-linecap-round stroke-linejoin-round">
                            <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3zM12 14v7"/>
                          </svg>
                        </span>
                      </div>

                      {/* Nome e membros (somente se não recolhido) */}
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 leading-tight">
                          <b className="text-sm font-semibold truncate block group-hover:text-alura-textPrimary">
                            {srv.name}
                          </b>
                          <small className="text-xs text-alura-textMuted flex items-center gap-1.5 mt-0.5">
                            <i className={`w-1.5 h-1.5 rounded-full ${(srv.online_count ?? 0) > 0 ? 'bg-alura-online' : 'bg-[#555d59]'}`} />
                            <span>{(srv.online_count ?? 0) > 0 ? `${srv.online_count} online` : 'Ninguém online'}</span>
                          </small>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))
            )}
          </div>
        </div>
      </nav>

      <VoiceConnectionCard isCollapsed={isCollapsed} />
      {user && profile && <UserPanel user={user} profile={profile} isCollapsed={isCollapsed} />}
    </aside>
  )
}

function NavItem({ 
  icon, 
  label, 
  badge, 
  to, 
  isCollapsed,
  quiet = false 
}: { 
  icon: React.ReactNode
  label: string
  badge?: string | number
  to: string
  isCollapsed?: boolean
  quiet?: boolean
}) {
  return (
    <NavLink 
      to={to} 
      title={isCollapsed ? `${label}${badge ? ` (${badge})` : ''}` : undefined}
      className={({ isActive }) => `relative flex items-center h-10 rounded-lg transition-all group ${
        isCollapsed ? "justify-center px-0 w-full" : "justify-between px-3 w-full"
      } ${
        isActive && to !== '#'
          ? "bg-alura-accent/12 text-alura-textPrimary font-semibold" 
          : "text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary"
      }`}
    >
      {({ isActive }) => {
        const isCurrent = isActive && to !== '#'
        return (
          <>
            {/* Indicador de barra ativa no canto esquerdo (.nv[aria-current]::before) */}
            {isCurrent && (
              <span className="absolute -left-3 top-[9px] bottom-[9px] w-[3px] rounded-r bg-alura-accent shadow-[0_0_8px_rgba(0,230,160,0.6)]" />
            )}

            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <div className={`[&>svg]:w-5 [&>svg]:h-5 transition-colors ${
                isCurrent ? "text-alura-accent" : "text-alura-textMuted group-hover:text-alura-textPrimary"
              }`}>
                {icon}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
            </div>

            {/* Badges */}
            {badge && !isCollapsed && (
              <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                quiet 
                  ? "bg-alura-surface2 text-alura-textMuted" 
                  : "bg-alura-accent text-alura-background"
              }`}>
                {badge}
              </span>
            )}

            {/* Dot indicador quando recolhido (.dot do alura-sidebar.html) */}
            {badge && isCollapsed && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-alura-accent border-2 border-alura-surface1 box-content" />
            )}
          </>
        )
      }}
    </NavLink>
  )
}
