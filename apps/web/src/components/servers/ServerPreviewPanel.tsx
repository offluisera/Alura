import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Hash, Volume2, Users, Pin, PinOff, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import type { ServerItem } from '../../lib/hooks/useServers'

interface ServerPreviewPanelProps {
  server: ServerItem | null
  isPinned: boolean
  onTogglePin: () => void
  onJoin: () => void
  onClose?: () => void
}

function formatCount(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

export function ServerPreviewPanel({
  server,
  isPinned,
  onTogglePin,
  onJoin,
  onClose,
}: ServerPreviewPanelProps) {
  const navigate = useNavigate()

  if (!server) {
    return (
      <div className="h-full w-full min-h-[420px] flex flex-col items-center justify-center p-8 text-center text-alura-textMuted border border-alura-border rounded-3xl bg-alura-surface1/60 select-none">
        <Sparkles size={32} className="text-alura-accent/50 mb-3" />
        <p className="text-sm font-bold text-alura-textPrimary">Nenhum servidor selecionado</p>
        <p className="text-xs text-alura-textSecondary mt-1 max-w-[240px] leading-relaxed">
          Selecione um servidor na lista ao lado para inspecionar canais e membros antes de entrar.
        </p>
      </div>
    )
  }

  const handleAction = async () => {
    if (server.is_member) {
      navigate(`/servers/${server.id}`)
    } else {
      await onJoin()
      navigate(`/servers/${server.id}`)
    }
  }

  return (
    <div className="h-full w-full flex flex-col rounded-3xl overflow-hidden border border-alura-border bg-alura-surface1 shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-alura-textPrimary select-none">
      
      {/* Banner de Topo com Categoria e Fechar */}
      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-alura-surface2 shrink-0">
        {server.banner_url ? (
          <img src={server.banner_url} alt={server.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full opacity-90"
            style={{ background: 'var(--theme-hero-bg, linear-gradient(135deg, rgba(0, 34, 14, 0.95), rgba(0, 20, 7, 0.98)))' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-alura-surface1 via-transparent to-black/40" />

        {/* Categoria Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-sm">
          {server.category || 'Geral'}
        </div>

        {/* Botão Fechar (em mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            title="Fechar painel"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Conteúdo do Painel com Espaçamentos Cuidadosamente Ajustados */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar flex flex-col gap-5">
        
        {/* Linha do Avatar e Botão Fixar (perfeitamente alinhados) */}
        <div className="flex items-end justify-between gap-3 -mt-8 relative z-10">
          {/* Squircle Avatar */}
          <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl overflow-hidden border-2 border-alura-surface1 shadow-2xl bg-alura-surface2 flex items-center justify-center shrink-0">
            {server.icon_url ? (
              <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-alura-accent">
                {server.name[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Botão Fixar / Desafixar */}
          <button
            onClick={onTogglePin}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
              isPinned
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textSecondary hover:text-alura-textPrimary border-alura-border'
            }`}
            title={isPinned ? 'Desafixar da barra lateral' : 'Fixar na barra lateral'}
          >
            {isPinned ? <PinOff size={13} /> : <Pin size={13} className="text-alura-accent rotate-45" />}
            <span>{isPinned ? 'Fixado' : 'Fixar'}</span>
          </button>
        </div>

        {/* Título e Estatísticas */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-alura-textPrimary tracking-tight">
              {server.name}
            </h2>
            {server.is_verified && (
              <CheckCircle2 size={18} className="text-alura-accent shrink-0" title="Comunidade Oficial Verificada" />
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-alura-textSecondary mt-0.5">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-alura-textMuted" />
              <span>{formatCount(server.member_count || 1)} membros</span>
            </span>
            <span className="flex items-center gap-1.5 text-alura-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alura-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-alura-accent" />
              </span>
              <span>{formatCount(server.online_count || 1)} online</span>
            </span>
          </div>
        </div>

        {/* Botão de Ação Primária: Entrar / Acessar Comunidade */}
        <button
          onClick={handleAction}
          className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
            server.is_member
              ? 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-accent border border-alura-borderStrong shadow-sm'
              : 'bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 shadow-alura-accent/25'
          }`}
        >
          <span>{server.is_member ? 'Acessar Comunidade' : 'Entrar no Servidor'}</span>
          <ArrowRight size={16} />
        </button>

        {/* Divisor */}
        <div className="border-t border-alura-border/60" />

        {/* Sobre o Servidor */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-alura-textMuted uppercase tracking-wider">
            Sobre o Servidor
          </span>
          <p className="text-xs text-alura-textSecondary leading-relaxed">
            {server.description || 'Comunidade oficial da Alura. Participe das discussões e compartilhe conteúdo.'}
          </p>

          {/* Tags */}
          {server.tags && server.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {server.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-alura-surface2 text-alura-textSecondary border border-alura-border/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Canais Principais */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-alura-textMuted uppercase tracking-wider flex items-center justify-between">
            <span>Canais da Comunidade</span>
            <span className="text-[10px] text-alura-textMuted">Disponíveis</span>
          </span>

          <div className="space-y-1 rounded-2xl bg-alura-surface2/40 p-2 border border-alura-border/40">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-alura-textSecondary bg-alura-surface1/60">
              <Hash size={14} className="text-alura-textMuted" />
              <span className="font-semibold">geral</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-alura-textSecondary hover:bg-alura-surface1/40">
              <Hash size={14} className="text-alura-textMuted" />
              <span className="font-semibold">anúncios</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-alura-textSecondary hover:bg-alura-surface1/40">
              <Volume2 size={14} className="text-alura-accent" />
              <span className="font-semibold">Voz Principal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
