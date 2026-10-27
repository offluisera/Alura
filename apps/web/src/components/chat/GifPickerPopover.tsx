import React, { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, Star, X, ArrowLeft, Image as ImageIcon, Smile, Sticker } from 'lucide-react'
import { GifService, GIF_CATEGORIES, type GifItem } from '../../lib/services/GifService'

export interface GifPickerPopoverProps {
  isOpen: boolean
  onClose: () => void
  onSelectGif: (gifUrl: string) => void
  onSelectEmoji?: () => void
}

export function GifPickerPopover({
  isOpen,
  onClose,
  onSelectGif,
  onSelectEmoji,
}: GifPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState<'gifs' | 'stickers' | 'emojis'>('gifs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [gifResults, setGifResults] = useState<GifItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Busca ou carrega categoria
  useEffect(() => {
    if (!isOpen) return

    if (searchQuery.trim()) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        GifService.searchGifs(searchQuery).then((res) => {
          setGifResults(res)
          setIsLoading(false)
        })
      }, 250)
      return () => clearTimeout(timer)
    } else if (selectedCategory) {
      setIsLoading(true)
      if (selectedCategory === 'favorites') {
        setGifResults(GifService.getFavorites())
        setIsLoading(false)
      } else {
        GifService.getCategoryGifs(selectedCategory).then((res) => {
          setGifResults(res)
          setIsLoading(false)
        })
      }
    } else {
      setGifResults([])
    }
  }, [searchQuery, selectedCategory, isOpen])

  if (!isOpen) return null

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    setGifResults([])
  }

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-2 right-0 z-50 w-[320px] sm:w-[380px] max-w-[calc(100vw-32px)] max-h-[min(490px,75vh)] rounded-3xl bg-alura-surface1 border border-alura-borderStrong shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none origin-bottom-right"
    >
      {/* ── 1. Top Tabs (GIFs, Figurinha, Emoji - Igual ao Anexo 3) ── */}
      <div className="flex items-center justify-between p-2.5 border-b border-alura-border/60 bg-alura-surface2/40">
        <div className="flex items-center gap-1 bg-alura-surface2 p-1 rounded-xl border border-alura-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('gifs')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gifs'
                ? 'bg-alura-selected text-alura-accent shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            GIFs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stickers')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-alura-selected text-alura-accent shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            Figurinha
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onSelectEmoji?.()
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold text-alura-textMuted hover:text-alura-textPrimary transition-all cursor-pointer"
          >
            Emoji
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-alura-surface2 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── 2. Search Bar ── */}
      <div className="p-3 border-b border-alura-border/40">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-alura-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar Klipy / Tenor"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-xs font-semibold text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Content Area: Categories Grid vs Results ── */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-[300px]">
        {searchQuery.trim() || selectedCategory ? (
          /* Visualização de Resultados */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="flex items-center gap-1.5 text-xs font-bold text-alura-accent hover:underline cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Voltar às categorias</span>
              </button>
              <span className="text-[11px] text-alura-textMuted capitalize">
                {searchQuery ? `"${searchQuery}"` : selectedCategory}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-alura-textMuted space-y-2">
                <div className="w-6 h-6 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Carregando GIFs...</span>
              </div>
            ) : gifResults.length === 0 ? (
              <div className="text-center py-12 text-xs text-alura-textMuted">
                Nenhum GIF encontrado para esta pesquisa.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gifResults.map((gif) => (
                  <div
                    key={gif.id}
                    onClick={() => {
                      onSelectGif(gif.url)
                      onClose()
                    }}
                    className="relative group h-28 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-border cursor-pointer hover:border-alura-accent hover:scale-[1.02] transition-all"
                  >
                    <img
                      src={gif.previewUrl}
                      alt={gif.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate drop-shadow">
                        {gif.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grade de Categorias (Exato Anexo 3) */
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              {GIF_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{ background: cat.bg }}
                  className="h-20 rounded-2xl relative overflow-hidden flex items-center justify-center text-white font-black text-xs tracking-tight shadow-md hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="relative z-10 flex items-center gap-1.5 drop-shadow">
                    {cat.id === 'favorites' && <Star size={13} className="text-amber-300" />}
                    {cat.id === 'trending' && <TrendingUp size={13} className="text-white" />}
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GifPickerPopover
