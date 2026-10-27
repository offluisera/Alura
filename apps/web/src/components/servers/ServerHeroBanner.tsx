import React, { useEffect, useRef } from 'react'
import { Search, Plus, Sparkles, X } from 'lucide-react'

interface ServerHeroBannerProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateClick: () => void
  totalCount: number
}

export function ServerHeroBanner({
  searchQuery,
  onSearchChange,
  onCreateClick,
  totalCount,
}: ServerHeroBannerProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Atalho global "/" para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className="relative rounded-2xl p-5 sm:p-6 overflow-hidden border border-alura-border shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all shrink-0"
      style={{ background: 'var(--theme-hero-bg, linear-gradient(135deg, rgba(0, 34, 14, 0.95), rgba(0, 20, 7, 0.98)))' }}
    >
      {/* Efeito de iluminação suave de fundo */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-alura-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-alura-accent/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Linha Superior: Título, Métricas e Botão Criar Servidor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-alura-accent/20 text-alura-accent border border-alura-accent/30 flex items-center gap-1">
                <Sparkles size={11} /> Hub de Comunidades
              </span>
              <span className="text-[11px] text-alura-textSecondary font-medium">
                {totalCount} {totalCount === 1 ? 'comunidade' : 'comunidades'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-alura-textPrimary tracking-tight">
              Servidores da Alura
            </h1>
            <p className="text-xs text-alura-textSecondary max-w-xl leading-relaxed">
              Descubra comunidades, converse com outros membros e compartilhe suas paixões.
            </p>
          </div>

          <button
            onClick={onCreateClick}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-alura-accent/20 active:scale-95 shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Criar Servidor</span>
          </button>
        </div>

        {/* Linha Inferior: Barra de Busca com Atalho "/" */}
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-alura-textMuted">
            <Search size={15} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar servidores por nome, assunto ou tags..."
            className="w-full h-10 pl-9 pr-16 rounded-xl bg-alura-surface1/80 hover:bg-alura-surface1 focus:bg-alura-surface1 border border-alura-border focus:border-alura-accent text-xs sm:text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all shadow-inner backdrop-blur-md"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 rounded-md text-alura-textMuted hover:text-alura-textPrimary transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-alura-textMuted bg-alura-surface2 border border-alura-border rounded shadow-sm">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
