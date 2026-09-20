import { supabase } from '../supabase'

export type DmSpamFilterMode = 'safe' | 'friends' | 'off'

export interface AutoModConfig {
  mode: DmSpamFilterMode
  filterProfanity: boolean
  filterPhishing: boolean
  filterExplicitMedia: boolean
  blockedWords: string[]
}

export const DEFAULT_AUTOMOD_CONFIG: AutoModConfig = {
  mode: 'safe',
  filterProfanity: true,
  filterPhishing: true,
  filterExplicitMedia: true,
  blockedWords: [],
}

// Padrões conhecidos de links maliciosos, scams e phishing
const PHISHING_PATTERNS = [
  /discord-?(app|nitro|gift|steam|drop)[a-z0-9\-]*\.(club|xyz|ru|top|link|site|info|buzz|tk|ml)/i,
  /steamcommunit[a-z0-9\-]*\.(com|ru|gift|trade)/i,
  /free-?(nitro|steam|robux|crypto|airdrop)/i,
  /gift-?(nitro|discord)/i,
  /(grabify|iplogger|2no\.co|blasze)/i,
  /token-?(grabber|stealer)/i,
  /discorcl\.gift/i,
  /dlscord\.(gift|gg)/i,
]

// Lista essencial de termos ofensivos, assédio e discurso de ódio (PT-BR / EN)
const PROFANITY_LIST = [
  'arrombado', 'arrombada', 'filho da puta', 'fdp', 'filha da puta', 
  'vai se foder', 'vsf', 'vtnc', 'vai tomar no cu', 'otario', 'otaria', 
  'retardado', 'retardada', 'macaco', 'macaca', 'estupro', 'estuprar',
  'morra', 'se mata', 'suicidio', 'nazista', 'hitler', 'preto lixo',
  'nigger', 'nigga', 'faggot', 'kys', 'kill yourself', 'whore', 'slut'
]

// Extensões de arquivos perigosos e executáveis proibidos
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.vbs', '.ps1', '.sh', '.jar', '.apk', '.com', '.pif', '.msi'
]

export const AutoModService = {
  /**
   * Garante objeto AutoModConfig consistente com defaults e arrays seguros
   */
  sanitizeConfig(raw: any): AutoModConfig {
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_AUTOMOD_CONFIG }
    return {
      mode: (raw.mode === 'safe' || raw.mode === 'friends' || raw.mode === 'off') ? raw.mode : DEFAULT_AUTOMOD_CONFIG.mode,
      filterProfanity: raw.filterProfanity !== undefined ? Boolean(raw.filterProfanity) : DEFAULT_AUTOMOD_CONFIG.filterProfanity,
      filterPhishing: raw.filterPhishing !== undefined ? Boolean(raw.filterPhishing) : DEFAULT_AUTOMOD_CONFIG.filterPhishing,
      filterExplicitMedia: raw.filterExplicitMedia !== undefined ? Boolean(raw.filterExplicitMedia) : DEFAULT_AUTOMOD_CONFIG.filterExplicitMedia,
      blockedWords: Array.isArray(raw.blockedWords) ? raw.blockedWords.filter((w: any) => typeof w === 'string') : [],
    }
  },

  /**
   * Obtém a configuração do Auto-MOD.
   * Prioridade: Profiles DB -> Auth user_metadata -> localStorage -> DEFAULT
   */
  async getConfig(userId: string, currentProfile?: any): Promise<AutoModConfig> {
    if (!userId) return { ...DEFAULT_AUTOMOD_CONFIG }

    // 1. Perfil do banco
    if (currentProfile?.dm_spam_filter || currentProfile?.automod_config) {
      const mode = (currentProfile.dm_spam_filter as DmSpamFilterMode) || DEFAULT_AUTOMOD_CONFIG.mode
      const extra = currentProfile.automod_config || {}
      return this.sanitizeConfig({
        mode,
        ...extra,
      })
    }

    // 2. Auth user_metadata
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.automod_config) {
        return this.sanitizeConfig(user.user_metadata.automod_config)
      }
    } catch (e) {
      console.warn("AutoModService: erro ao obter user_metadata", e)
    }

    // 3. Cache local
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`alura_automod_${userId}`)
        if (cached) {
          return this.sanitizeConfig(JSON.parse(cached))
        }
      } catch (e) {}
    }

    return { ...DEFAULT_AUTOMOD_CONFIG }
  },

  /**
   * Salva as preferências do Auto-MOD em todos os níveis
   */
  async saveConfig(userId: string, config: AutoModConfig): Promise<void> {
    if (!userId) return

    // 1. LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`alura_automod_${userId}`, JSON.stringify(config))
      } catch (e) {}
    }

    // 2. Auth user_metadata
    try {
      await supabase.auth.updateUser({
        data: {
          automod_config: config,
        }
      })
    } catch (e) {
      console.warn("AutoModService: erro ao salvar no auth", e)
    }

    // 3. Profiles table
    try {
      await supabase.from('profiles').update({
        dm_spam_filter: config.mode,
        automod_config: {
          filterProfanity: config.filterProfanity,
          filterPhishing: config.filterPhishing,
          filterExplicitMedia: config.filterExplicitMedia,
          blockedWords: config.blockedWords,
        },
        updated_at: new Date().toISOString()
      }).eq('id', userId)
    } catch (e) {
      console.warn("AutoModService: aviso ao atualizar colunas em profiles", e)
    }
  },

  /**
   * Determina se a mensagem deve ser moderada com base na política do destinatário e status de amizade
   */
  shouldModerate(mode: DmSpamFilterMode, isFriend: boolean): boolean {
    if (mode === 'off') return false
    if (mode === 'safe') return true // Proteja-me: modera todos, inclusive amigos
    if (mode === 'friends') return !isFriend // Apenas desconhecidos: não modera amigos aceitos
    return true
  },

  /**
   * Normaliza texto para evitar evasão por caracteres especiais ou leetspeak
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[0o]/g, 'o')
      .replace(/[1il|!]/g, 'i')
      .replace(/[3e]/g, 'e')
      .replace(/[4a@]/g, 'a')
      .replace(/[5s$]/g, 's')
      .replace(/[\s\.\-_]+/g, ' ') // Converte pontuação repetida em espaço único
      .trim()
  },

  /**
   * Analisa texto de mensagem em busca de phishing, termos ofensivos ou palavras personalizadas
   */
  checkTextMessage(
    content: string, 
    config: AutoModConfig
  ): { 
    blocked: boolean; 
    flagged: boolean; 
    reason?: string; 
    category?: 'phishing' | 'profanity' | 'custom_word' 
  } {
    if (config.mode === 'off' || !content.trim()) {
      return { blocked: false, flagged: false }
    }

    const normalized = this.normalizeText(content)

    // 1. Checagem de Phishing & Links Suspeitos (Bloqueio crítico)
    if (config.filterPhishing) {
      for (const pattern of PHISHING_PATTERNS) {
        if (pattern.test(content) || pattern.test(normalized)) {
          return {
            blocked: true,
            flagged: true,
            category: 'phishing',
            reason: 'Auto-MOD: Esta mensagem contém um link malicioso ou suspeito de golpe/phishing.',
          }
        }
      }
    }

    // 2. Checagem de Palavras Bloqueadas Personalizadas do Usuário
    if (config.blockedWords && config.blockedWords.length > 0) {
      for (const customWord of config.blockedWords) {
        const normCustom = this.normalizeText(customWord)
        if (normCustom && (normalized.includes(normCustom) || content.toLowerCase().includes(customWord.toLowerCase()))) {
          return {
            blocked: false,
            flagged: true,
            category: 'custom_word',
            reason: `Auto-MOD: Mensagem marcada por conter termo da sua lista personalizada ("${customWord}").`,
          }
        }
      }
    }

    // 3. Checagem de Linguagem Ofensiva / Discurso de Ódio
    if (config.filterProfanity) {
      for (const badWord of PROFANITY_LIST) {
        const regex = new RegExp(`\\b${badWord}\\b`, 'i')
        if (regex.test(normalized) || normalized.includes(badWord)) {
          return {
            blocked: false,
            flagged: true,
            category: 'profanity',
            reason: 'Auto-MOD: Conteúdo sinalizado por conter linguagem potencialmente ofensiva ou imprópria.',
          }
        }
      }
    }

    return { blocked: false, flagged: false }
  },

  /**
   * Analisa arquivos e imagens em busca de executáveis proibidos e conteúdo sensível
   */
  async checkAttachment(
    file: File, 
    config: AutoModConfig
  ): Promise<{ 
    blocked: boolean; 
    flagged: boolean; 
    reason?: string;
    isExplicit?: boolean;
  }> {
    if (config.mode === 'off') {
      return { blocked: false, flagged: false }
    }

    const fileNameLower = file.name.toLowerCase()

    // 1. Bloqueio imediato de executáveis e scripts perigosos
    const isDangerous = DANGEROUS_EXTENSIONS.some(ext => fileNameLower.endsWith(ext))
    if (isDangerous) {
      return {
        blocked: true,
        flagged: true,
        reason: `Auto-MOD: O envio de arquivos com extensão executável (${fileNameLower.split('.').pop()}) foi bloqueado por segurança.`,
      }
    }

    // 2. Análise heurística de imagem sensível/explícita via Offscreen Canvas
    if (config.filterExplicitMedia && file.type.startsWith('image/')) {
      try {
        const isExplicit = await this.analyzeImageSkinTone(file)
        if (isExplicit) {
          return {
            blocked: false,
            flagged: true,
            isExplicit: true,
            reason: 'Auto-MOD: A imagem foi identificada com alto teor de pele/nudez e ocultada preventivamente.',
          }
        }
      } catch (err) {
        console.warn("AutoModService: erro ao processar imagem no canvas:", err)
      }
    }

    return { blocked: false, flagged: false }
  },

  /**
   * Heurística rápida de detecção de tons de pele / nudez em imagens usando Canvas HTML5
   * Amostra até 2.500 pixels (50x50) em < 10ms sem travar a thread.
   */
  analyzeImageSkinTone(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        try {
          const canvas = document.createElement('canvas')
          const size = 50
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(false)

          ctx.drawImage(img, 0, 0, size, size)
          const imgData = ctx.getImageData(0, 0, size, size)
          const data = imgData.data
          let skinPixelCount = 0
          const totalPixels = size * size

          // Classificação de cor de pele em RGB/YCbCr normalizado
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Regra heurística de detecção de pele comum em moderação visual rápida:
            // R > 95, G > 40, B > 20, max(R,G,B) - min(R,G,B) > 15, |R - G| > 15, R > G, R > B
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const isSkin = r > 95 && g > 40 && b > 20 &&
                           (max - min) > 15 &&
                           Math.abs(r - g) > 15 &&
                           r > g && r > b

            if (isSkin) {
              skinPixelCount++
            }
          }

          const skinRatio = skinPixelCount / totalPixels
          // Se mais de 58% da imagem for composto por tons de pele descobertos, sinaliza como sensível
          resolve(skinRatio > 0.58)
        } catch (e) {
          resolve(false)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(false)
      }

      img.src = objectUrl
    })
  }
}
