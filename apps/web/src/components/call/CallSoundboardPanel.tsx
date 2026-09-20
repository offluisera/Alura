import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Play, Square, Heart, Volume2, Sparkles } from 'lucide-react'
import { CURATED_MYINSTANTS_SOUNDS, type MyInstantSound } from '../../lib/services/MyInstantsService'

interface CallSoundboardPanelProps {
  localStream: MediaStream | null
  onClose: () => void
}

export function CallSoundboardPanel({ localStream, onClose }: CallSoundboardPanelProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | 'tv' | 'memes' | 'games' | 'sfx' | 'favorites'>('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alura_call_soundboard_favorites') || '[]')
    } catch {
      return []
    }
  })

  // Áudio ativo e AudioContext para roteamento WebRTC
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Injeta o áudio do soundboard no stream local do WebRTC para o outro participante ouvir
  useEffect(() => {
    if (!localStream) return

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtxClass) return

      const ctx = new AudioCtxClass()
      const dest = ctx.createMediaStreamDestination()
      audioCtxRef.current = ctx
      destRef.current = dest

      // Injeta áudio sintetizado no stream local
      dest.stream.getAudioTracks().forEach((t) => localStream.addTrack(t))

      return () => {
        dest.stream.getAudioTracks().forEach((t) => {
          t.stop()
          localStream.removeTrack(t)
        })
        ctx.close().catch(() => {})
      }
    } catch (err) {
      console.warn('[Soundboard] Não foi possível vincular AudioContext ao stream local:', err)
    }
  }, [localStream])

  const playSound = (sound: MyInstantSound) => {
    // Interrompe qualquer som tocando
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setPlayingId(sound.id)

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src = sound.mp3
    audio.volume = 0.85
    audioRef.current = audio

    // Conecta ao AudioContext para enviar ao WebRTC
    if (audioCtxRef.current && destRef.current) {
      try {
        if (sourceRef.current) {
          sourceRef.current.disconnect()
        }
        const source = audioCtxRef.current.createMediaElementSource(audio)
        sourceRef.current = source
        source.connect(destRef.current)
        source.connect(audioCtxRef.current.destination)
      } catch {
        // Fallback: toca sem roteamento de nós
      }
    }

    audio.play().catch(() => {
      // Fallback simples caso CORS ou autoplay restrinja
      const fallback = new Audio(sound.mp3)
      fallback.volume = 0.85
      fallback.play().catch(() => {})
      fallback.onended = () => setPlayingId(null)
      fallback.onerror = () => setPlayingId(null)
      audioRef.current = fallback
    })

    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingId(null)
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem('alura_call_soundboard_favorites', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const filteredSounds = useMemo(() => {
    return CURATED_MYINSTANTS_SOUNDS.filter((sound) => {
      const matchesSearch = sound.title.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false

      if (category === 'all') return true
      if (category === 'favorites') return favorites.includes(sound.id)
      return sound.category === category
    })
  }, [search, category, favorites])

  return (
    <div className="call-sb-panel">
      {/* Header do Soundboard */}
      <div className="call-sb-panel__header">
        <div className="flex items-center gap-2 min-w-0">
          <Volume2 size={15} className="text-alura-accent shrink-0" />
          <span className="font-bold text-white tracking-wide text-xs">Efeitos & Emojis</span>
        </div>
        <button className="call-sb-panel__close" onClick={onClose} title="Fechar painel">
          <X size={15} />
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="call-sb-panel__search">
        <Search size={13} className="text-alura-textDisabled shrink-0" />
        <input
          type="text"
          placeholder="Buscar som com emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-alura-textDisabled hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Categorias Rápidas */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-alura-accent/10 overflow-x-auto no-scrollbar bg-black/20">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'tv', label: 'TV' },
          { id: 'memes', label: 'Memes' },
          { id: 'games', label: 'Jogos' },
          { id: 'sfx', label: 'SFX' },
          { id: 'favorites', label: 'Favoritos' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              category === cat.id
                ? 'bg-alura-accent text-[#001B0B] font-bold shadow-xs'
                : 'text-alura-textSecondary hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Sons com Emojis */}
      <div className="call-sb-panel__grid custom-scrollbar">
        {filteredSounds.length === 0 ? (
          <div className="py-8 text-center text-xs text-alura-textMuted flex flex-col items-center gap-1.5">
            <Sparkles size={18} className="text-alura-textDisabled" />
            <span>Nenhum som encontrado</span>
          </div>
        ) : (
          filteredSounds.map((sound) => {
            const isPlaying = playingId === sound.id
            const isFav = favorites.includes(sound.id)

            return (
              <div
                key={sound.id}
                className={`call-sb-item group ${isPlaying ? 'call-sb-item--playing' : ''}`}
                onClick={() => isPlaying ? stopSound() : playSound(sound)}
              >
                {/* Emoji do Som */}
                <div className="w-8 h-8 rounded-lg bg-black/30 border border-alura-border/60 flex items-center justify-center text-lg shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {sound.emoji || '🔊'}
                </div>

                {/* Título */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-white truncate group-hover:text-alura-accent transition-colors">
                    {sound.title}
                  </span>
                  <span className="text-[10px] text-alura-textDisabled uppercase tracking-wider">
                    {sound.category || 'Efeito'}
                  </span>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(sound.id)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isFav ? 'text-alura-danger' : 'text-alura-textDisabled hover:text-white'
                    }`}
                    title={isFav ? 'Remover favorito' : 'Favoritar'}
                  >
                    <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => isPlaying ? stopSound() : playSound(sound)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-alura-danger text-white'
                        : 'bg-alura-accent/15 text-alura-accent hover:bg-alura-accent hover:text-[#001B0B]'
                    }`}
                    title={isPlaying ? 'Parar' : 'Tocar'}
                  >
                    {isPlaying ? <Square size={10} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
