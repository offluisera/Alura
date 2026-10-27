import React, { useState, useMemo } from 'react'
import { Music2, Lock, Sparkles, X, Volume2, Search, Heart } from 'lucide-react'
import { MyInstantsService, CURATED_MYINSTANTS_SOUNDS, type MyInstantSound } from '../../lib/services/MyInstantsService'

export interface ServerSoundboardPanelProps {
  isOpen: boolean
  onClose: () => void
  onPlaySound: (soundId: string, label: string, mp3Url: string, emoji?: string) => void
  canUseSoundboard: boolean
}

export function ServerSoundboardPanel({
  isOpen,
  onClose,
  onPlaySound,
  canUseSoundboard,
}: ServerSoundboardPanelProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'favorites' | 'custom' | 'memes' | 'tv'>('favorites')

  // Obtém sons favoritos e customizados configurados pelo usuário em Configurações
  const favorites = useMemo(() => {
    try {
      return MyInstantsService.getFavorites()
    } catch {
      return []
    }
  }, [isOpen])

  const customSounds = useMemo(() => {
    try {
      return MyInstantsService.getCustomSounds()
    } catch {
      return []
    }
  }, [isOpen])

  // Volume configurado pelo usuário nas Configurações
  const soundVolume = useMemo(() => {
    try {
      const v = localStorage.getItem('alura_soundboard_volume')
      return v !== null ? Number(v) : 80
    } catch {
      return 80
    }
  }, [isOpen])

  // Todos os sons disponíveis
  const allSounds: MyInstantSound[] = useMemo(() => {
    return [...customSounds, ...CURATED_MYINSTANTS_SOUNDS]
  }, [customSounds])

  // Filtra sons conforme categoria e busca
  const filteredSounds = useMemo(() => {
    let list = allSounds

    if (activeCategory === 'favorites') {
      const favSet = new Set(favorites)
      list = allSounds.filter((s) => favSet.has(s.id))
      // Se favoritos estiver vazio, cai para todos
      if (list.length === 0) list = allSounds
    } else if (activeCategory === 'custom') {
      list = allSounds.filter((s) => s.isCustom || s.category === 'custom')
    } else if (activeCategory === 'memes') {
      list = allSounds.filter((s) => s.category === 'memes')
    } else if (activeCategory === 'tv') {
      list = allSounds.filter((s) => s.category === 'tv')
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.title.toLowerCase().includes(q))
    }

    return list
  }, [allSounds, activeCategory, search, favorites])

  if (!isOpen) return null

  const handleTrigger = (sound: MyInstantSound) => {
    if (!canUseSoundboard) return

    // Toca som localmente
    MyInstantsService.play(sound.mp3, soundVolume)

    // Envia aos outros participantes
    onPlaySound(sound.id, sound.title, sound.mp3, sound.emoji || '🔊')
  }

  return (
    <div className="absolute bottom-20 right-6 sm:right-12 z-50 w-84 sm:w-96 rounded-3xl bg-alura-surface1 border border-alura-borderStrong shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-alura-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-alura-accent/20 border border-alura-accent/40 flex items-center justify-center text-alura-accent shadow-sm">
            <Music2 size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-alura-textPrimary uppercase tracking-wider">
              Painel de Efeitos Sonoros
            </h4>
            <p className="text-[10px] text-alura-textMuted">
              Efeitos configurados em Configurações & MyInstants
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {!canUseSoundboard && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <Lock size={14} className="shrink-0 text-amber-400" />
          <span className="text-[11px] leading-tight">
            Você não possui a permissão <strong>Usar Soundboard</strong> neste servidor.
          </span>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-alura-textMuted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar efeito sonoro..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary placeholder:text-alura-textMuted focus:outline-none focus:border-alura-accent transition-all"
        />
      </div>

      {/* Categorias / Filtros */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveCategory('favorites')}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
            activeCategory === 'favorites'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-alura-surface2 text-alura-textMuted border-alura-border hover:text-alura-textPrimary'
          }`}
        >
          <Heart size={11} className={activeCategory === 'favorites' ? 'text-amber-400 fill-amber-400' : ''} />
          <span>Favoritos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
            activeCategory === 'all'
              ? 'bg-alura-selected text-alura-accent border-alura-accent shadow-sm'
              : 'bg-alura-surface2 text-alura-textMuted border-alura-border hover:text-alura-textPrimary'
          }`}
        >
          Todos
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('memes')}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
            activeCategory === 'memes'
              ? 'bg-alura-selected text-alura-accent border-alura-accent shadow-sm'
              : 'bg-alura-surface2 text-alura-textMuted border-alura-border hover:text-alura-textPrimary'
          }`}
        >
          Memes
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('tv')}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
            activeCategory === 'tv'
              ? 'bg-alura-selected text-alura-accent border-alura-accent shadow-sm'
              : 'bg-alura-surface2 text-alura-textMuted border-alura-border hover:text-alura-textPrimary'
          }`}
        >
          TV & Rádio
        </button>

        {customSounds.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveCategory('custom')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
              activeCategory === 'custom'
                ? 'bg-alura-selected text-alura-accent border-alura-accent shadow-sm'
                : 'bg-alura-surface2 text-alura-textMuted border-alura-border hover:text-alura-textPrimary'
            }`}
          >
            Personalizados ({customSounds.length})
          </button>
        )}
      </div>

      {/* Grid de Efeitos Sonoros com Scroll */}
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-0.5">
        {filteredSounds.length === 0 ? (
          <div className="col-span-2 py-6 text-center text-xs text-alura-textMuted font-medium">
            Nenhum efeito sonoro encontrado.
          </div>
        ) : (
          filteredSounds.map((snd) => (
            <button
              key={snd.id}
              type="button"
              disabled={!canUseSoundboard}
              onClick={() => handleTrigger(snd)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer relative group ${
                canUseSoundboard
                  ? 'bg-alura-surface2/60 hover:bg-alura-surface2 border-alura-border hover:border-alura-borderStrong hover:scale-[1.02] active:scale-95 shadow-sm'
                  : 'bg-alura-surface2/30 border-alura-border/40 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-xl group-hover:scale-125 transition-transform shrink-0">
                {snd.emoji || '🔊'}
              </span>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-alura-textPrimary block truncate">
                  {snd.title}
                </span>
                <span className="text-[9px] text-alura-textMuted block uppercase font-mono tracking-wider">
                  {snd.category || 'som'}
                </span>
              </div>

              <Volume2
                size={13}
                className="text-alura-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
