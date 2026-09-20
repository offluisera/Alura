import { useEffect, useState } from "react"
import { ChevronRight, Plus, Loader2, Search, UserPlus, Gift, TrendingUp, HelpCircle, Activity, Sparkles, Zap, MessageSquare } from "lucide-react"
import logoUrl from '../../../public/logo-sombra.png'
import { Avatar, AvatarFallback, AvatarImage } from "@alura/ui"
import { supabase } from "../../lib/supabase"

interface Server {
  id: string
  name: string
  description?: string
  icon_url?: string
}

export function RightSidebar() {
  const [servers, setServers] = useState<Server[]>([])
  const [suggestions, setSuggestions] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServers() {
      try {
        const { data, error } = await supabase
          .from('servers')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          // Temporário: dividindo pra simular servidores que o usuário tá e sugestões
          const userServers = data.slice(0, Math.ceil(data.length / 2))
          const suggested = data.slice(Math.ceil(data.length / 2))
          
          setServers(userServers)
          setSuggestions(suggested)
        }
      } catch (err) {
        console.error("Erro ao carregar servidores", err)
      } finally {
        setLoading(false)
      }
    }

    loadServers()
  }, [])

  return (
    <aside className="w-[300px] h-full flex flex-col bg-alura-surface1 z-20 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar border-l border-alura-border shadow-[-10px_0_20px_rgba(0,0,0,0.3)]">
      
      {/* Servidores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-[15px] text-alura-textPrimary tracking-wide">Servidores</h3>
          <div className="flex items-center space-x-1.5 text-alura-greenSoft text-[13px] font-medium hover:text-alura-accent cursor-pointer transition-colors hover:drop-shadow-[0_0_8px_rgba(0,223,160,0.5)]">
            <span>Ver todos</span>
            <div className="p-0.5">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-alura-accent animate-spin" />
            </div>
          ) : servers.length > 0 ? (
            servers.map((server, index) => (
              <ServerItem 
                key={server.id}
                initials={server.name.substring(0, 2).toUpperCase()} 
                name={server.name} 
                members={`${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9)}k`} // Placeholder de membros
                isPrimary={index === 0} 
                iconUrl={server.icon_url}
              />
            ))
          ) : (
            <div className="text-alura-textMuted text-xs px-2 italic">Nenhum servidor encontrado.</div>
          )}
        </div>
      </div>

      {/* Sugestões */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-[15px] text-alura-textPrimary tracking-wide">Sugestões para você</h3>
          <button className="text-alura-greenSoft text-[13px] font-medium hover:text-alura-accent transition-colors hover:drop-shadow-[0_0_8px_rgba(0,223,160,0.5)]">Ver todos</button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-alura-accent animate-spin" />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map(suggestion => (
              <SuggestionItem 
                key={suggestion.id}
                initials={suggestion.name.substring(0, 2).toUpperCase()} 
                name={suggestion.name} 
                members={`${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}k`}
                iconUrl={suggestion.icon_url}
              />
            ))
          ) : (
            <div className="text-alura-textMuted text-xs px-2 italic">Sem sugestões no momento.</div>
          )}
        </div>
      </div>

      {/* Banner Promocional */}
      <div className="relative overflow-hidden rounded-[14px] border border-alura-borderStrong mt-auto shrink-0 bg-alura-surface2 shadow-[0_0_15px_rgba(0,0,0,0.4)] group cursor-pointer transition-all hover:border-alura-accent">
        <div 
          className="absolute inset-0 opacity-40 transition-all duration-500" 
          style={{ background: 'var(--theme-hero-bg)' }} 
        />
        <div className="relative p-5 z-10 flex flex-col h-full space-y-3">
          <img 
            src={logoUrl} 
            alt="Alura" 
            className="w-7 h-7 object-contain mb-1 transition-all duration-300" 
            style={{ filter: 'var(--theme-logo-filter)' }} 
          />
          <h4 className="text-[14px] font-bold text-alura-textPrimary leading-tight group-hover:text-alura-accentBright transition-colors">Conecte-se. Compartilhe. Evolua.</h4>
          <p className="text-[11px] text-alura-textSecondary leading-relaxed max-w-[85%]">Faça parte de uma comunidade que constrói o futuro juntos.</p>
          <div className="mt-2 self-end p-1.5 rounded-full cursor-pointer transition-colors bg-alura-surface3 group-hover:bg-alura-accent group-hover:shadow-[0_0_10px_var(--alura-accent)]">
            <ChevronRight className="w-3.5 h-3.5 text-alura-textPrimary group-hover:text-alura-background" />
          </div>
        </div>
      </div>

    </aside>
  )
}

function ServerItem({ initials, name, members, isPrimary = false, iconUrl }: { initials: string, name: string, members: string, isPrimary?: boolean, iconUrl?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-alura-hover hover:shadow-[0_0_15px_rgba(0,223,160,0.05)] cursor-pointer group transition-all">
      <div className="flex items-center space-x-3">
        <Avatar className={`w-10 h-10 border ${isPrimary ? 'border-alura-borderStrong shadow-[0_0_10px_rgba(0,223,160,0.2)]' : 'border-none'} bg-alura-surface2`}>
          {iconUrl && <AvatarImage src={iconUrl} alt={name} className="object-cover" />}
          <AvatarFallback className={`${isPrimary ? 'text-alura-accentBright' : 'text-alura-textSecondary'} text-[13px] font-semibold bg-transparent`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-alura-textPrimary leading-tight group-hover:text-alura-accentBright transition-colors truncate max-w-[130px]">{name}</span>
          <span className="text-[11px] text-alura-textMuted flex items-center gap-1.5 mt-0.5">
            {members} membros
            <div className={`w-1 h-1 rounded-full ${isPrimary ? 'bg-alura-accent shadow-[0_0_5px_rgba(0,223,160,0.8)]' : 'bg-alura-greenSoft'}`} />
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-alura-surface3 group-hover:text-alura-accent transition-colors" />
    </div>
  )
}

function SuggestionItem({ initials, name, members, iconUrl }: { initials: string, name: string, members: string, iconUrl?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-[12px] bg-alura-surface2 hover:bg-alura-hover transition-all cursor-pointer border border-alura-border hover:border-alura-borderStrong hover:shadow-[0_0_15px_rgba(0,223,160,0.1)] group">
      <div className="flex items-center space-x-3">
        <Avatar className="w-9 h-9 border-none bg-alura-surface1 group-hover:shadow-[0_0_8px_rgba(0,223,160,0.2)] transition-all">
          {iconUrl && <AvatarImage src={iconUrl} alt={name} className="object-cover" />}
          <AvatarFallback className="text-alura-accent text-[11px] font-semibold bg-transparent">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-alura-textPrimary leading-tight group-hover:text-alura-accentBright transition-colors truncate max-w-[110px]">{name}</span>
          <span className="text-[11px] text-alura-textMuted mt-0.5">{members} membros</span>
        </div>
      </div>
      <button className="h-7 px-3 bg-alura-surface1 border border-alura-border text-alura-accent hover:bg-alura-hover hover:border-alura-borderStrong hover:shadow-[0_0_10px_rgba(0,223,160,0.2)] hover:text-alura-accentBright rounded-[8px] text-[11px] font-medium transition-all">
        Entrar
      </button>
    </div>
  )
}
