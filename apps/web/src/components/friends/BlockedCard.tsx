import { User, Unlock } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"

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
  
  const initials = name.substring(0, 2).toUpperCase()

  return (
    <div className="group flex items-center justify-between p-4 h-[76px] rounded-[14px] bg-alura-surface1 border border-alura-border hover:bg-alura-surface2 transition-all cursor-default">
      
      <div className="flex items-center space-x-4 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
        <div className="relative shrink-0 grayscale group-hover:grayscale-0 transition-all">
          <Avatar className="w-[56px] h-[56px] rounded-full border border-alura-border">
            {avatar_url ? (
               <img src={avatar_url} className="w-full h-full rounded-full object-cover" />
            ) : (
               <AvatarFallback className="bg-alura-surface2 text-alura-textSecondary font-semibold">{initials}</AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div className="flex flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[15px] text-alura-textPrimary truncate line-through decoration-alura-danger/50">@{username}</span>
            <span className="text-[12px] font-medium text-alura-danger bg-alura-danger/10 px-2 py-0.5 rounded-full border border-alura-danger/20">
              Bloqueado
            </span>
          </div>
          <span className="text-[13px] text-alura-textMuted mt-0.5 truncate">
            {name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onUnblock?.(); }}
          className="h-10 px-4 flex items-center justify-center gap-2 rounded-[10px] bg-transparent hover:bg-alura-surface2 border border-alura-border hover:border-alura-accent text-alura-textMuted hover:text-alura-accent transition-colors"
          title="Desbloquear Usuário"
        >
          <Unlock className="w-4 h-4" />
          <span className="text-[13px] font-bold">Desbloquear</span>
        </button>
      </div>

    </div>
  )
}
