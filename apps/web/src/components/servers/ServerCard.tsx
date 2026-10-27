import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, MoreHorizontal, Users, Pin, ArrowRight } from 'lucide-react'
import type { ServerItem } from '../../lib/hooks/useServers'
import { ServerContextDropdown } from './ServerContextDropdown'

interface ServerCardProps {
  server: ServerItem
  isSelected: boolean
  isPinned: boolean
  onSelect: () => void
  onJoin: () => void
  onLeave: () => void
  onTogglePin: () => void
  onTagClick?: (tag: string) => void
}

function formatCount(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

export function ServerCard({
  server,
  isSelected,
  isPinned,
  onSelect,
  onJoin,
  onLeave,
  onTogglePin,
  onTagClick,
}: ServerCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleAccess = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (server.is_member) {
      navigate(`/servers/${server.id}`)
    } else {
      onJoin()
      navigate(`/servers/${server.id}`)
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border select-none ${
        isSelected
          ? 'bg-alura-surface1 border-alura-borderStrong shadow-[0_8px_30px_rgba(0,0,0,0.6)] ring-1 ring-alura-accent/30'
          : 'bg-alura-surface1/80 hover:bg-alura-surface1 border-alura-border hover:border-alura-borderStrong shadow-md hover:shadow-xl'
      }`}
    >
      {/* Botão de Opções (...) flutuando acima do banner com z-40 para nunca ser cortado */}
      <div className="absolute top-3 right-3 z-40">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDropdownOpen((prev) => !prev)
          }}
          className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
          title="Opções do servidor"
        >
          <MoreHorizontal size={15} />
        </button>
        <ServerContextDropdown
          server={server}
          isPinned={isPinned}
          onTogglePin={onTogglePin}
          onLeave={onLeave}
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
        />
      </div>

      {/* Indicador de Pin (se fixado na sidebar) */}
      {isPinned && (
        <div className="absolute top-3 right-12 z-30 px-2 py-0.5 rounded-full text-[10px] font-bold bg-alura-accent/20 text-alura-accent border border-alura-accent/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
          <Pin size={10} className="rotate-45" />
          <span>Fixado</span>
        </div>
      )}

      {/* Banner Superior com cantos arredondados no topo */}
      <div className="relative h-28 w-full rounded-t-2xl overflow-hidden bg-alura-surface2 shrink-0">
        {server.banner_url ? (
          <img
            src={server.banner_url}
            alt={server.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full transition-transform duration-500 group-hover:scale-105 opacity-80"
            style={{ background: 'var(--theme-hero-bg, linear-gradient(135deg, rgba(0, 42, 18, 0.8), rgba(0, 20, 7, 0.9)))' }}
          />
        )}

        {/* Gradiente escuro para transição suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-alura-surface1 via-transparent to-black/40" />

        {/* Categoria Badge no topo esquerdo */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-sm">
          {server.category || 'Geral'}
        </div>
      </div>

      {/* Conteúdo do Card com Espaçamento Harmonioso */}
      <div className="px-4 pb-4 flex flex-col flex-1 justify-between gap-3">
        
        {/* Linha Superior: Avatar Squircle + Título */}
        <div className="flex items-end gap-3 -mt-7 relative z-10">
          {/* Avatar Squircle Garantido */}
          <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl overflow-hidden border-2 border-alura-surface1 shadow-xl bg-alura-surface2 flex items-center justify-center shrink-0">
            {server.icon_url ? (
              <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold text-alura-accent">
                {server.name[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Nome e Selo Verificado */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-alura-textPrimary truncate group-hover:text-alura-accent transition-colors">
                {server.name}
              </span>
              {server.is_verified && (
                <CheckCircle2 size={16} className="text-alura-accent shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-xs text-alura-textSecondary line-clamp-2 leading-relaxed min-h-[36px]">
          {server.description || 'Comunidade da Alura. Participe e conecte-se com membros.'}
        </p>

        {/* Tags */}
        {server.tags && server.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {server.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation()
                  onTagClick?.(tag)
                }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-alura-surface2/80 text-alura-textSecondary hover:text-alura-textPrimary border border-alura-border/60 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {server.tags.length > 3 && (
              <span className="text-[10px] font-bold text-alura-textMuted px-1">
                +{server.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rodapé: Estatísticas de Membros & Botão de Ação */}
        <div className="flex items-center justify-between pt-2 border-t border-alura-border/40">
          <div className="flex items-center gap-3 text-xs font-semibold text-alura-textSecondary">
            <span className="flex items-center gap-1">
              <Users size={13} className="text-alura-textMuted" />
              <span>{formatCount(server.member_count || 1)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-alura-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alura-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-alura-accent" />
              </span>
              <span>{formatCount(server.online_count || 1)} on</span>
            </span>
          </div>

          {/* Botão Entrar / Acessar */}
          <button
            onClick={handleAccess}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 ${
              server.is_member
                ? 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-accent border border-alura-borderStrong'
                : 'bg-alura-accent hover:bg-alura-accentHover text-alura-surface0'
            }`}
          >
            <span>{server.is_member ? 'Acessar' : 'Entrar'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
