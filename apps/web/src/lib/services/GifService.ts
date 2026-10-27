/**
 * GifService.ts
 * Provedor de GIFs para Alura (compatível com Tenor, Klipy e acervo curado com URLs reais).
 */

export interface GifItem {
  id: string
  title: string
  url: string
  previewUrl: string
  width?: number
  height?: number
}

// Acervo curado de categorias e GIFs de alta qualidade para funcionamento instantâneo
const CURATED_GIFS: Record<string, GifItem[]> = {
  trending: [
    {
      id: 'tr-1',
      title: 'Excited Celebration',
      url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    },
    {
      id: 'tr-2',
      title: 'Cool Dance',
      url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
    },
    {
      id: 'tr-3',
      title: 'Popcorn Chill',
      url: 'https://media.giphy.com/media/GLbiGvv9RiNpPdzyIN/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/GLbiGvv9RiNpPdzyIN/giphy.gif',
    },
    {
      id: 'tr-4',
      title: 'Mind Blown',
      url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    },
    {
      id: 'tr-5',
      title: 'Cat Vibing',
      url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
    },
    {
      id: 'tr-6',
      title: 'Hype GG',
      url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    },
  ],
  hello: [
    {
      id: 'hl-1',
      title: 'Wave Hello',
      url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
    },
    {
      id: 'hl-2',
      title: 'Hi Cat',
      url: 'https://media.giphy.com/media/VbnUQIRNNGLzfNVcvH/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/VbnUQIRNNGLzfNVcvH/giphy.gif',
    },
    {
      id: 'hl-3',
      title: 'Hello Wave',
      url: 'https://media.giphy.com/media/dzaUX7CAG0Ihi/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/dzaUX7CAG0Ihi/giphy.gif',
    },
  ],
  lol: [
    {
      id: 'lol-1',
      title: 'Laughing Out Loud',
      url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
    },
    {
      id: 'lol-2',
      title: 'Giggle Meme',
      url: 'https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif',
    },
    {
      id: 'lol-3',
      title: 'Rolling Laugh',
      url: 'https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif',
    },
  ],
  love: [
    {
      id: 'lv-1',
      title: 'Heart Love',
      url: 'https://media.giphy.com/media/26FLdm964upIslUZ2/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/26FLdm964upIslUZ2/giphy.gif',
    },
    {
      id: 'lv-2',
      title: 'Cute Hug',
      url: 'https://media.giphy.com/media/l8ooT58lfuNQzjc8KB/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/l8ooT58lfuNQzjc8KB/giphy.gif',
    },
    {
      id: 'lv-3',
      title: 'Bears Love',
      url: 'https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif',
    },
  ],
  'happy birthday': [
    {
      id: 'hb-1',
      title: 'Parabéns Bolo',
      url: 'https://media.giphy.com/media/hkE6wynetELGa7xOjq/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/hkE6wynetELGa7xOjq/giphy.gif',
    },
    {
      id: 'hb-2',
      title: 'Birthday Party',
      url: 'https://media.giphy.com/media/yoJC2GnSClbPOkV0eA/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/yoJC2GnSClbPOkV0eA/giphy.gif',
    },
  ],
}

export const GIF_CATEGORIES = [
  { id: 'favorites', label: 'Favoritos', bg: 'linear-gradient(135deg, #4A56E2 0%, #3B82F6 100%)' },
  { id: 'trending', label: 'GIFs em alta', bg: 'linear-gradient(135deg, #8B5CF6 0%, #D97706 100%)' },
  { id: 'hello', label: 'hello', bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { id: 'lol', label: 'lol', bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { id: 'love', label: 'love', bg: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' },
  { id: 'happy birthday', label: 'happy birthday', bg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' },
]

export class GifService {
  /**
   * Busca GIFs por termo de pesquisa com fallback para acervo curado
   */
  static async searchGifs(query: string, limit = 20): Promise<GifItem[]> {
    const cleanQ = query.trim().toLowerCase()
    if (!cleanQ) return this.getTrendingGifs()

    // 1. Tenta API do Klipy ou Tenor se chave configurada
    const apiKey = (import.meta as any).env?.VITE_TENOR_API_KEY || (import.meta as any).env?.VITE_KLIPY_API_KEY
    if (apiKey) {
      try {
        const res = await fetch(`https://api.klipy.com/v1/gifs/search?q=${encodeURIComponent(cleanQ)}&limit=${limit}`, {
          headers: { 'X-API-Key': apiKey },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.results && data.results.length > 0) {
            return data.results.map((g: any) => ({
              id: g.id,
              title: g.title || cleanQ,
              url: g.media_formats?.gif?.url || g.url,
              previewUrl: g.media_formats?.tinygif?.url || g.preview_url || g.url,
            }))
          }
        }
      } catch {
        // Fallback para acervo interno
      }
    }

    // 2. Busca interna no acervo curado
    const results: GifItem[] = []
    Object.keys(CURATED_GIFS).forEach((cat) => {
      if (cat.includes(cleanQ) || cleanQ.includes(cat)) {
        results.push(...CURATED_GIFS[cat])
      } else {
        const matching = CURATED_GIFS[cat].filter((g) => g.title.toLowerCase().includes(cleanQ))
        results.push(...matching)
      }
    })

    if (results.length > 0) {
      return results.slice(0, limit)
    }

    // Retorna trending se nada bater
    return this.getTrendingGifs()
  }

  /**
   * Retorna os GIFs em alta
   */
  static async getTrendingGifs(): Promise<GifItem[]> {
    return CURATED_GIFS.trending || []
  }

  /**
   * Retorna GIFs por categoria
   */
  static async getCategoryGifs(category: string): Promise<GifItem[]> {
    const key = category.toLowerCase()
    if (CURATED_GIFS[key]) return CURATED_GIFS[key]
    return this.searchGifs(category)
  }

  /**
   * Favoritos locais
   */
  static getFavorites(): GifItem[] {
    try {
      const saved = localStorage.getItem('alura_favorite_gifs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  static toggleFavorite(gif: GifItem): boolean {
    const favs = this.getFavorites()
    const index = favs.findIndex((f) => f.id === gif.id)
    if (index >= 0) {
      favs.splice(index, 1)
      localStorage.setItem('alura_favorite_gifs', JSON.stringify(favs))
      return false
    } else {
      favs.unshift(gif)
      localStorage.setItem('alura_favorite_gifs', JSON.stringify(favs))
      return true
    }
  }
}

export default GifService
