import { supabase } from '../supabase'

export interface SpotifyTrack {
  isPlaying: boolean
  trackName: string
  artistName: string
  albumName: string
  albumArt: string
  progressMs: number
  durationMs: number
  trackUrl: string
  updatedAt: string
}

export const SPOTIFY_CLIENT_ID = "454201e9bd3f45f1a93d3d5b87be4fe9"

const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played"
].join(" ")

// Amostras de faixas para teste / demonstração instantânea
export const SAMPLE_SPOTIFY_TRACKS: SpotifyTrack[] = [
  {
    isPlaying: true,
    trackName: "Starboy",
    artistName: "The Weeknd, Daft Punk",
    albumName: "Starboy",
    albumArt: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc252",
    progressMs: 74000,
    durationMs: 230453,
    trackUrl: "https://open.spotify.com/track/7MXVkk9YM5IZxh0WSlVIH0",
    updatedAt: new Date().toISOString()
  },
  {
    isPlaying: true,
    trackName: "Blinding Lights",
    artistName: "The Weeknd",
    albumName: "After Hours",
    albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    progressMs: 95000,
    durationMs: 200040,
    trackUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
    updatedAt: new Date().toISOString()
  },
  {
    isPlaying: true,
    trackName: "Midnight City",
    artistName: "M83",
    albumName: "Hurry Up, We're Dreaming",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273b567d165f1262d1655b3bc85",
    progressMs: 140000,
    durationMs: 243266,
    trackUrl: "https://open.spotify.com/track/6GyFP1nfCDB87D2YQI5Crj",
    updatedAt: new Date().toISOString()
  }
]

/**
 * Utilitários criptográficos para PKCE (Proof Key for Code Exchange)
 * Exigido pelo Spotify moderno (response_type=code com S256)
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = window.crypto.getRandomValues(new Uint8Array(length))
    return Array.from(values).map(x => possible[x % possible.length]).join('')
  }
  let text = ''
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

function base64encode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export const SpotifyService = {
  /**
   * Obtém a URI de redirecionamento padronizada para o ambiente atual
   */
  getRedirectUri(): string {
    if (typeof window !== 'undefined') {
      const isElectron = window.navigator?.userAgent?.includes('Electron') || Boolean((window as any).process?.versions?.electron)
      if (isElectron || window.location.origin.startsWith('file:') || window.location.origin === 'null' || !window.location.origin) {
        return 'http://127.0.0.1:5173/'
      }
      const origin = window.location.origin.replace(/\/$/, '')
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return 'http://127.0.0.1:5173/'
      }
      return `${origin}/`
    }
    return 'http://127.0.0.1:5173/'
  },

  /**
   * Constrói a URL oficial de autenticação OAuth com PKCE (response_type=code)
   */
  async getAuthUrl(redirectUri?: string): Promise<string> {
    const finalUri = redirectUri || this.getRedirectUri()

    // 1. Gera o code_verifier e o code_challenge (S256)
    const codeVerifier = generateRandomString(64)
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed)

    if (typeof window !== 'undefined') {
      localStorage.setItem('alura_spotify_code_verifier', codeVerifier)
      localStorage.setItem('alura_spotify_redirect_uri', finalUri)
    }

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: finalUri,
      scope: SPOTIFY_SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: 'true'
    })

    return `https://accounts.spotify.com/authorize?${params.toString()}`
  },

  /**
   * Troca o Authorization Code pelo Access Token via PKCE
   */
  async exchangeCodeForToken(code: string): Promise<{ token: string; expiresIn: number; refreshToken?: string } | null> {
    const codeVerifier = typeof window !== 'undefined' ? localStorage.getItem('alura_spotify_code_verifier') : null
    const redirectUri = typeof window !== 'undefined'
      ? (localStorage.getItem('alura_spotify_redirect_uri') || this.getRedirectUri())
      : this.getRedirectUri()

    if (!codeVerifier) {
      console.warn("SpotifyService: code_verifier ausente para troca de token PKCE.")
      return null
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        })
      })

      const data = await response.json()
      if (data.access_token) {
        const expiresIn = Number(data.expires_in) || 3600
        const expiresAt = Date.now() + expiresIn * 1000

        if (typeof window !== 'undefined') {
          localStorage.setItem("alura_spotify_token", data.access_token)
          localStorage.setItem("alura_spotify_token_expires", expiresAt.toString())
          localStorage.setItem("alura_spotify_connected", "true")
          if (data.refresh_token) {
            localStorage.setItem("alura_spotify_refresh_token", data.refresh_token)
          }
          localStorage.removeItem('alura_spotify_code_verifier')
        }

        return {
          token: data.access_token,
          expiresIn,
          refreshToken: data.refresh_token
        }
      } else {
        console.error("SpotifyService: erro ao trocar código PKCE por token", data)
        return null
      }
    } catch (err) {
      console.error("SpotifyService: falha de rede ao trocar token", err)
      return null
    }
  },

  /**
   * Renova o token usando o refresh_token se disponível
   */
  async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    const refreshToken = localStorage.getItem("alura_spotify_refresh_token")
    if (!refreshToken) return null

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        })
      })

      const data = await response.json()
      if (data.access_token) {
        const expiresIn = Number(data.expires_in) || 3600
        const expiresAt = Date.now() + expiresIn * 1000

        localStorage.setItem("alura_spotify_token", data.access_token)
        localStorage.setItem("alura_spotify_token_expires", expiresAt.toString())
        if (data.refresh_token) {
          localStorage.setItem("alura_spotify_refresh_token", data.refresh_token)
        }
        return data.access_token
      }
    } catch (err) {
      console.warn("SpotifyService: erro ao renovar access token", err)
    }
    return null
  },

  /**
   * Processa o callback de autenticação (suporta tanto ?code=... quanto #access_token=...)
   */
  async handleAuthCallback(searchOrHash: string): Promise<{ token: string; expiresIn: number } | null> {
    if (!searchOrHash) return null

    // Caso 1: Código PKCE via query string (?code=...)
    if (searchOrHash.includes("code=")) {
      const cleanSearch = searchOrHash.startsWith("?") ? searchOrHash.substring(1) : searchOrHash
      const params = new URLSearchParams(cleanSearch)
      const code = params.get("code")
      if (code) {
        return await this.exchangeCodeForToken(code)
      }
    }

    // Caso 2: Token direto via hash (#access_token=...)
    if (searchOrHash.includes("access_token")) {
      const cleanHash = searchOrHash.startsWith("#") ? searchOrHash.substring(1) : searchOrHash
      const params = new URLSearchParams(cleanHash)
      const token = params.get("access_token")
      const expiresIn = Number(params.get("expires_in")) || 3600

      if (token && typeof window !== 'undefined') {
        const expiresAt = Date.now() + expiresIn * 1000
        localStorage.setItem("alura_spotify_token", token)
        localStorage.setItem("alura_spotify_token_expires", expiresAt.toString())
        localStorage.setItem("alura_spotify_connected", "true")
        return { token, expiresIn }
      }
    }

    return null
  },

  /**
   * Obtém o token armazenado se ainda estiver válido
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem("alura_spotify_token")
    const expiresAt = Number(localStorage.getItem("alura_spotify_token_expires") || 0)

    if (token && Date.now() < expiresAt) {
      return token
    }
    return null
  },

  /**
   * Verifica se a conta está conectada (por token real ou status salvo)
   */
  isConnected(profile?: any): boolean {
    if (profile?.spotify_connected) return true
    if (typeof window !== 'undefined') {
      return localStorage.getItem("alura_spotify_connected") === "true"
    }
    return false
  },

  /**
   * Busca a música atualmente em reprodução na API do Spotify
   */
  async fetchCurrentlyPlaying(token: string): Promise<SpotifyTrack | null> {
    try {
      let activeToken = token

      // Se o token estiver expirado, tenta renovar antes da requisição
      if (typeof window !== 'undefined') {
        const expiresAt = Number(localStorage.getItem("alura_spotify_token_expires") || 0)
        if (Date.now() >= expiresAt) {
          const renewed = await this.refreshAccessToken()
          if (renewed) activeToken = renewed
        }
      }

      const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (response.status === 204 || response.status > 400) {
        return null
      }

      const data = await response.json()
      if (!data || !data.item) return null

      const item = data.item
      const artists = (item.artists || []).map((a: any) => a.name).join(", ")
      const albumArt = item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || ""

      return {
        isPlaying: Boolean(data.is_playing),
        trackName: item.name || "Música desconhecida",
        artistName: artists || "Artista desconhecido",
        albumName: item.album?.name || "",
        albumArt,
        progressMs: Number(data.progress_ms) || 0,
        durationMs: Number(item.duration_ms) || 0,
        trackUrl: item.external_urls?.spotify || "",
        updatedAt: new Date().toISOString()
      }
    } catch (err) {
      console.warn("SpotifyService: erro ao buscar reprodução", err)
      return null
    }
  },

  /**
   * Salva a atividade de música no perfil do Supabase
   */
  async saveActivity(
    userId: string,
    activity: SpotifyTrack | null,
    showOnProfile = true
  ): Promise<boolean> {
    if (!userId) return false

    try {
      await supabase.from('profiles').update({
        spotify_connected: true,
        spotify_activity: activity,
        show_spotify_activity: showOnProfile
      }).eq('id', userId)

      if (typeof window !== 'undefined') {
        if (activity) {
          localStorage.setItem(`alura_spotify_act_${userId}`, JSON.stringify(activity))
        } else {
          localStorage.removeItem(`alura_spotify_act_${userId}`)
        }
      }
      return true
    } catch (err) {
      console.error("SpotifyService: erro ao salvar atividade no Supabase", err)
      return false
    }
  },

  /**
   * Desconecta a conta do Spotify
   */
  async disconnect(userId: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("alura_spotify_token")
      localStorage.removeItem("alura_spotify_token_expires")
      localStorage.removeItem("alura_spotify_refresh_token")
      localStorage.removeItem("alura_spotify_connected")
      localStorage.removeItem("alura_spotify_code_verifier")
      localStorage.removeItem("alura_spotify_redirect_uri")
      if (userId) {
        localStorage.removeItem(`alura_spotify_act_${userId}`)
      }
    }

    if (userId) {
      try {
        await supabase.from('profiles').update({
          spotify_connected: false,
          spotify_activity: null
        }).eq('id', userId)
      } catch (err) {
        console.warn("SpotifyService: erro ao limpar perfil no Supabase", err)
      }
    }

    return true
  }
}
