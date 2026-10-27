import { Unlock, Ban } from "lucide-react"

interface BlockedCardProps {
  id: string
  name: string
  username: string
  avatar_url?: string
  onUnblock?: () => void
}

export function BlockedCard({ 
  id,
  name, 
  username, 
  avatar_url,
  onUnblock
}: BlockedCardProps) {
  const initials = name ? name.substring(0, 2).toUpperCase() : (username ? username.substring(0, 2).toUpperCase() : "AL")

  return (
    <div className="amigos-friend group cursor-default">
      <div className="flex items-center gap-3.5 flex-1 min-w-0 opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="amigos-av grayscale group-hover:grayscale-0 transition-all">
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shrink-0">
            {avatar_url ? (
              <img 
                src={avatar_url} 
                alt={name || username} 
                className="w-full h-full aspect-square rounded-full object-cover shrink-0" 
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <i className="st dnd" />
        </div>

        <div className="t">
          <div className="n">
            <b className="line-through decoration-[var(--amigos-dnd)]/50">@{username}</b>
            <span className="amigos-stt dnd">
              Bloqueado
            </span>
          </div>
          <p>{name || `@${username}`}</p>
        </div>
      </div>

      <div className="amigos-acts opacity-100">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onUnblock?.(); }}
          className="h-8 px-3 rounded-[8px] bg-[var(--amigos-card-2)] hover:bg-[#272c2a] border border-[var(--amigos-line)] hover:border-[var(--amigos-accent)] text-[var(--amigos-muted)] hover:text-[var(--amigos-text)] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Desbloquear Usuário"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Desbloquear</span>
        </button>
      </div>
    </div>
  )
}
