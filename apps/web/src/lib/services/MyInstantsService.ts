/**
 * Serviço de Integração com MyInstants (www.myinstants.com)
 * Permite buscar memes, vinhetas e efeitos sonoros online,
 * tocar com controle de volume em tempo real e salvar favoritos.
 */

export interface MyInstantSound {
  id: string
  title: string
  url: string
  mp3: string
  emoji?: string
  category?: 'memes' | 'tv' | 'games' | 'sfx' | 'custom'
  isCustom?: boolean
}

// Catálogo curado offline para resposta a 0ms e fallback sem rede
export const CURATED_MYINSTANTS_SOUNDS: MyInstantSound[] = [
  {
    id: "xaropinho-rapaz",
    title: "Rapaz (Xaropinho)",
    url: "https://www.myinstants.com/en/instant/vinhetaxaropinho-rapaz/",
    mp3: "https://www.myinstants.com/media/sounds/vinhetaxaropinho-rapaz.mp3",
    emoji: "🐭",
    category: "tv"
  },
  {
    id: "faustao-errou",
    title: "Errou! (Faustão)",
    url: "https://www.myinstants.com/en/instant/errou-faustao-fausto-silva/",
    mp3: "https://www.myinstants.com/media/sounds/vinheta-faustao-errou-rede-globo.mp3",
    emoji: "🎤",
    category: "tv"
  },
  {
    id: "que-isso-meu-filho-calma",
    title: "Que Isso Meu Filho Calma",
    url: "https://www.myinstants.com/en/instant/que-isso-meu-filho-calma/",
    mp3: "https://www.myinstants.com/media/sounds/que-isso-meu-filho-calma.mp3",
    emoji: "👴",
    category: "tv"
  },
  {
    id: "danca-gatinho",
    title: "Dança Gatinho",
    url: "https://www.myinstants.com/en/instant/danca-gatinho-danca/",
    mp3: "https://www.myinstants.com/media/sounds/danca-gatinho-danca.mp3",
    emoji: "🐱",
    category: "tv"
  },
  {
    id: "cavalo",
    title: "Cavalo (Rodrigo Faro)",
    url: "https://www.myinstants.com/en/instant/cavalo/",
    mp3: "https://www.myinstants.com/media/sounds/cavalo_2.mp3",
    emoji: "🐴",
    category: "tv"
  },
  {
    id: "uepa",
    title: "Uêpa! (Ratinho)",
    url: "https://www.myinstants.com/en/instant/uepa/",
    mp3: "https://www.myinstants.com/media/sounds/uepa.mp3",
    emoji: "📢",
    category: "tv"
  },
  {
    id: "ele-gosta",
    title: "Ele Gosta",
    url: "https://www.myinstants.com/en/instant/ele-gosta/",
    mp3: "https://www.myinstants.com/media/sounds/ele-gosta-rodrigo-faro.mp3",
    emoji: "😏",
    category: "tv"
  },
  {
    id: "tome",
    title: "Tome!",
    url: "https://www.myinstants.com/en/instant/tome/",
    mp3: "https://www.myinstants.com/media/sounds/tome_3.mp3",
    emoji: "💥",
    category: "tv"
  },
  {
    id: "vine-boom",
    title: "Vine Boom",
    url: "https://www.myinstants.com/en/instant/vine-boom-sound-70972/",
    mp3: "https://www.myinstants.com/media/sounds/vine-boom.mp3",
    emoji: "💣",
    category: "memes"
  },
  {
    id: "airhorn",
    title: "Airhorn MLG",
    url: "https://www.myinstants.com/en/instant/air-horn-club-sample/",
    mp3: "https://www.myinstants.com/media/sounds/air-horn-club-sample_1.mp3",
    emoji: "🎺",
    category: "memes"
  },
  {
    id: "bruh",
    title: "Bruh Sound Effect",
    url: "https://www.myinstants.com/en/instant/bruh/",
    mp3: "https://www.myinstants.com/media/sounds/movie_1.mp3",
    emoji: "🗿",
    category: "memes"
  },
  {
    id: "gta-san-andreas-here-we-go-again",
    title: "GTA: Ah Shit Here We Go",
    url: "https://www.myinstants.com/en/instant/gta-san-andreas-ah-shit-here-we-go-again/",
    mp3: "https://www.myinstants.com/media/sounds/gta-san-andreas-ah-shit-here-we-go-again_BWv0Gvc.mp3",
    emoji: "🚗",
    category: "games"
  },
  {
    id: "omaewa-mou-shindeiru",
    title: "Omaewa Mou Shindeiru",
    url: "https://www.myinstants.com/en/instant/omae-wa-mou-shindeiru/",
    mp3: "https://www.myinstants.com/media/sounds/omae-wa-mou-shindeiru.mp3",
    emoji: "⚡",
    category: "memes"
  },
  {
    id: "sad-violin",
    title: "Sad Violin",
    url: "https://www.myinstants.com/en/instant/sad-violin/",
    mp3: "https://www.myinstants.com/media/sounds/sad-violin.mp3",
    emoji: "🎻",
    category: "memes"
  },
  {
    id: "discord-call",
    title: "Discord Incoming Call",
    url: "https://www.myinstants.com/en/instant/discord-call-sound/",
    mp3: "https://www.myinstants.com/media/sounds/discord-call-sound.mp3",
    emoji: "📞",
    category: "sfx"
  },
  {
    id: "sheesh",
    title: "Sheeeesh!",
    url: "https://www.myinstants.com/en/instant/sheesh-sound-effect/",
    mp3: "https://www.myinstants.com/media/sounds/sheesh-sound-effect.mp3",
    emoji: "🥶",
    category: "memes"
  },
  {
    id: "among-us-sabotage",
    title: "Among Us Sabotage",
    url: "https://www.myinstants.com/en/instant/among-us-sabotage-sound/",
    mp3: "https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3",
    emoji: "🚀",
    category: "games"
  },
  {
    id: "windows-xp-error",
    title: "Windows XP Error",
    url: "https://www.myinstants.com/en/instant/windows-xp-error/",
    mp3: "https://www.myinstants.com/media/sounds/windows-xp-error.mp3",
    emoji: "💻",
    category: "sfx"
  },
  {
    id: "tada-fanfare",
    title: "Tada Fanfarra",
    url: "https://www.myinstants.com/en/instant/tada-fanfare/",
    mp3: "https://www.myinstants.com/media/sounds/tada-fanfare.mp3",
    emoji: "🎉",
    category: "sfx"
  },
  {
    id: "ba-dum-tss-live",
    title: "Ba-Dum-Tss Live",
    url: "https://www.myinstants.com/en/instant/ba-dum-tss/",
    mp3: "https://www.myinstants.com/media/sounds/ba-dum-tss.mp3",
    emoji: "🥁",
    category: "sfx"
  }
]

class MyInstantsManager {
  private currentAudio: HTMLAudioElement | null = null
  private favorites: Set<string> = new Set()
  private customSounds: MyInstantSound[] = []

  constructor() {
    this.loadStorage()
  }

  private loadStorage() {
    if (typeof window === 'undefined') return
    try {
      const favs = localStorage.getItem('alura_myinstants_favorites')
      if (favs) {
        this.favorites = new Set(JSON.parse(favs))
      }
      const customs = localStorage.getItem('alura_myinstants_custom')
      if (customs) {
        this.customSounds = JSON.parse(customs)
      }
    } catch (e) {
      console.warn("MyInstantsService: Erro ao carregar localStorage:", e)
    }
  }

  public getFavorites(): string[] {
    return Array.from(this.favorites)
  }

  public isFavorite(soundId: string): boolean {
    return this.favorites.has(soundId)
  }

  public toggleFavorite(soundId: string): boolean {
    if (this.favorites.has(soundId)) {
      this.favorites.delete(soundId)
    } else {
      this.favorites.add(soundId)
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('alura_myinstants_favorites', JSON.stringify(Array.from(this.favorites)))
    }
    return this.favorites.has(soundId)
  }

  public getCustomSounds(): MyInstantSound[] {
    return this.customSounds
  }

  public addCustomSound(title: string, mp3Url: string, emoji: string = "🔊", category: 'memes' | 'tv' | 'games' | 'sfx' | 'custom' = 'custom'): MyInstantSound {
    const newSound: MyInstantSound = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      url: mp3Url,
      mp3: mp3Url.trim(),
      emoji,
      category,
      isCustom: true
    }
    this.customSounds = [newSound, ...this.customSounds]
    if (typeof window !== 'undefined') {
      localStorage.setItem('alura_myinstants_custom', JSON.stringify(this.customSounds))
    }
    return newSound
  }

  public removeCustomSound(soundId: string) {
    this.customSounds = this.customSounds.filter(s => s.id !== soundId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('alura_myinstants_custom', JSON.stringify(this.customSounds))
    }
  }

  /**
   * Analisa qualquer link do MyInstants ou da Web e extrai dados automaticamente
   */
  public async parseMyInstantsUrl(inputUrl: string): Promise<{
    title: string
    mp3: string
    emoji: string
    category: 'memes' | 'tv' | 'games' | 'sfx' | 'custom'
  }> {
    const raw = inputUrl.trim()
    if (!raw) {
      return { title: "", mp3: "", emoji: "🔊", category: "custom" }
    }

    // Caso 1: Link direto de áudio (.mp3, .wav, .ogg, etc.)
    if (/\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(raw)) {
      const fileName = raw.split('/').pop()?.split('?')[0]?.replace(/\.(mp3|wav|ogg|m4a)$/i, '') || "Novo Som"
      const cleanTitle = decodeURIComponent(fileName).replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return {
        title: cleanTitle,
        mp3: raw,
        emoji: this.detectEmoji(cleanTitle),
        category: "custom"
      }
    }

    // Caso 2: URL de página do MyInstants (ex: https://www.myinstants.com/en/instant/errou-faustao/)
    const match = raw.match(/myinstants\.com\/(?:[a-z]{2}\/)?instant\/([^\/\?#]+)/i)
    if (match && match[1]) {
      const slug = match[1]
      const cleanSlugTitle = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

      try {
        const results = await this.search(slug.replace(/[-_]+/g, ' '))
        if (results && results.length > 0) {
          const exact = results.find(r => r.id.includes(slug) || r.url.includes(slug)) || results[0]
          return {
            title: exact.title,
            mp3: exact.mp3,
            emoji: exact.emoji || this.detectEmoji(exact.title),
            category: exact.category || "memes"
          }
        }
      } catch (e) {
        console.warn("Falha ao resolver URL do MyInstants via API:", e)
      }

      // Se falhar a busca na API, infere a URL do CDN do MyInstants
      const inferredMp3 = `https://www.myinstants.com/media/sounds/${slug}.mp3`
      return {
        title: cleanSlugTitle,
        mp3: inferredMp3,
        emoji: this.detectEmoji(cleanSlugTitle),
        category: "memes"
      }
    }

    // Caso genérico: retorna a própria URL
    return {
      title: "Novo Efeito Sonoro",
      mp3: raw,
      emoji: "🔊",
      category: "custom"
    }
  }

  /**
   * Busca sons no MyInstants via API pública rápida ou fallback local
   */
  public async search(query: string): Promise<MyInstantSound[]> {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [...this.customSounds, ...CURATED_MYINSTANTS_SOUNDS]
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const response = await fetch(`https://myinstants-api.vercel.app/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const json = await response.json()
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          const apiResults: MyInstantSound[] = json.data.map((item: any) => ({
            id: item.id || `mi-${Math.random().toString(36).substring(2, 9)}`,
            title: item.title ? item.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'") : "Sem título",
            url: item.url || "https://www.myinstants.com",
            mp3: item.mp3,
            emoji: this.detectEmoji(item.title || ""),
            category: 'memes'
          }))

          // Mesclar com sons customizados que batam com a busca
          const matchingCustom = this.customSounds.filter(s => s.title.toLowerCase().includes(q))
          return [...matchingCustom, ...apiResults]
        }
      }
    } catch (err) {
      console.warn("MyInstantsService: busca online indisponível, usando catálogo curado:", err)
    }

    // Fallback local: filtra catálogo + customizados
    const all = [...this.customSounds, ...CURATED_MYINSTANTS_SOUNDS]
    return all.filter(s => s.title.toLowerCase().includes(q))
  }

  private detectEmoji(title: string): string {
    const lower = title.toLowerCase()
    if (lower.includes('faustao') || lower.includes('fausto')) return '🎤'
    if (lower.includes('ratinho') || lower.includes('xaropinho')) return '🐭'
    if (lower.includes('gato') || lower.includes('gatinho')) return '🐱'
    if (lower.includes('cavalo')) return '🐴'
    if (lower.includes('boom') || lower.includes('explosao')) return '💣'
    if (lower.includes('horn') || lower.includes('trompete')) return '🎺'
    if (lower.includes('gta') || lower.includes('carro')) return '🚗'
    if (lower.includes('error') || lower.includes('windows')) return '💻'
    if (lower.includes('risada') || lower.includes('meme')) return '😂'
    if (lower.includes('discord') || lower.includes('call')) return '📞'
    if (lower.includes('among') || lower.includes('sus')) return '🚀'
    return '🔊'
  }

  /**
   * Reproduz um som do MyInstants em tempo real com volume controlado
   */
  public play(mp3Url: string, volume0to100: number = 80, onEnd?: () => void): HTMLAudioElement | null {
    if (!mp3Url) return null

    // Parar áudio anterior se houver
    this.stop()

    try {
      const audio = new Audio(mp3Url)
      audio.volume = Math.min(1, Math.max(0, volume0to100 / 100))
      
      this.currentAudio = audio

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null
        }
        if (onEnd) onEnd()
      }

      audio.onerror = (e) => {
        console.warn("MyInstantsService: Erro ao reproduzir áudio:", mp3Url, e)
        if (this.currentAudio === audio) {
          this.currentAudio = null
        }
        if (onEnd) onEnd()
      }

      audio.play().catch(err => {
        console.warn("MyInstantsService: Reprodução bloqueada pelo navegador:", err)
        if (onEnd) onEnd()
      })

      return audio
    } catch (err) {
      console.warn("MyInstantsService: Erro ao instanciar Audio:", err)
      if (onEnd) onEnd()
      return null
    }
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      } catch (e) {}
      this.currentAudio = null
    }
  }
}

export const MyInstantsService = new MyInstantsManager()
