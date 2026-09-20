import { supabase } from '../supabase'

export interface TwoFactorStatus {
  enabled: boolean
  factorId?: string
  enrolledAt?: string
  backupCodes: string[]
}

export interface EnrollmentData {
  factorId: string
  secret: string
  qrCode: string
  uri: string
  backupCodes: string[]
}

// Gerador de códigos de recuperação de emergência (formato XXXX-XXXX)
function generateBackupCodes(count = 8): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    let part1 = ''
    let part2 = ''
    for (let j = 0; j < 4; j++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length))
      part2 += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    codes.push(`${part1}-${part2}`)
  }
  return codes
}

// Gerador de segredo Base32 (RFC 3548 / RFC 4648)
function generateBase32Secret(length = 20): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  const randomBytes = new Uint8Array(length)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes)
  } else {
    for (let i = 0; i < length; i++) randomBytes[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) {
    secret += alphabet[randomBytes[i] % 32]
  }
  return secret
}

// Algoritmo TOTP local RFC 6238 para fallback de validação
async function computeTotp(secretBase32: string, counter: number): Promise<string> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = secretBase32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i])
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2)
  }

  const counterBytes = new Uint8Array(8)
  let temp = counter
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff
    temp = Math.floor(temp / 256)
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBytes)
  const hmac = new Uint8Array(signature)
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000

  return code.toString().padStart(6, '0')
}

export const TwoFactorService = {
  /**
   * Verifica se a conta possui 2FA ativo
   */
  async getStatus(userId: string, currentProfile?: any): Promise<TwoFactorStatus> {
    if (!userId) {
      return { enabled: false, backupCodes: [] }
    }

    // 1. Tenta listar fatores reais do Supabase Auth
    try {
      const { data: factors, error } = await supabase.auth.mfa.listFactors()
      if (!error && factors) {
        const verifiedFactor = factors.totp?.find((f: any) => f.status === 'verified')
        if (verifiedFactor) {
          const backupCodes = currentProfile?.backup_codes || []
          return {
            enabled: true,
            factorId: verifiedFactor.id,
            enrolledAt: currentProfile?.mfa_enrolled_at || undefined,
            backupCodes
          }
        }
      }
    } catch (e) {
      console.warn("TwoFactorService: erro ao listar fatores do Supabase", e)
    }

    // 2. Perfil do banco
    if (currentProfile?.two_factor_enabled) {
      return {
        enabled: true,
        enrolledAt: currentProfile.mfa_enrolled_at,
        backupCodes: currentProfile.backup_codes || []
      }
    }

    // 3. User metadata
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.two_factor_enabled) {
        return {
          enabled: true,
          enrolledAt: user.user_metadata.mfa_enrolled_at,
          backupCodes: user.user_metadata.backup_codes || []
        }
      }
    } catch (e) {}

    // 4. Cache local
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`alura_2fa_${userId}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.enabled) {
            return {
              enabled: true,
              enrolledAt: parsed.enrolledAt,
              backupCodes: parsed.backupCodes || []
            }
          }
        }
      } catch (e) {}
    }

    return { enabled: false, backupCodes: [] }
  },

  /**
   * Inicia o processo de configuração do 2FA gerando QR code e segredo
   */
  async startEnrollment(userId: string, email: string, username: string): Promise<EnrollmentData> {
    const backupCodes = generateBackupCodes(8)
    const displayName = username || email?.split('@')[0] || 'usuario'

    // 1. Tenta usar o Supabase MFA oficial
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Alura',
        friendlyName: `Alura (${displayName})`
      })

      if (!error && data && data.totp) {
        return {
          factorId: data.id,
          secret: data.totp.secret,
          qrCode: data.totp.qr_code,
          uri: data.totp.uri,
          backupCodes
        }
      }
    } catch (e) {
      console.warn("TwoFactorService: enroll nativo indisponível, usando motor TOTP seguro", e)
    }

    // 2. Fallback TOTP seguro RFC 6238
    const secret = generateBase32Secret(20)
    const uri = `otpauth://totp/Alura:${encodeURIComponent(displayName)}?secret=${secret}&issuer=Alura&algorithm=SHA1&digits=6&period=30`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}&bgcolor=ffffff&color=000000&margin=4`

    return {
      factorId: `local_${Date.now()}`,
      secret,
      qrCode,
      uri,
      backupCodes
    }
  },

  /**
   * Valida o código digitado e conclui a ativação do 2FA
   */
  async verifyAndEnable(
    userId: string,
    factorId: string,
    secret: string,
    code: string,
    backupCodes: string[]
  ): Promise<{ success: boolean; error?: string }> {
    const trimmedCode = code.trim().replace(/\s+/g, '')

    // 1. Se for fator Supabase real
    if (factorId && !factorId.startsWith('local_')) {
      try {
        const challenge = await supabase.auth.mfa.challenge({ factorId })
        if (challenge.error) throw challenge.error

        const verify = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.data.id,
          code: trimmedCode
        })
        if (verify.error) throw verify.error
      } catch (err: any) {
        console.warn("TwoFactorService: falha ao validar no Supabase MFA, testando motor local", err)
        const isValid = await this.verifyLocalTotp(secret, trimmedCode)
        if (!isValid) {
          return { success: false, error: "Código incorreto ou expirado. Verifique o horário do seu celular." }
        }
      }
    } else {
      // 2. Validação TOTP local (com janela de tolerância de ±30s)
      const isValid = await this.verifyLocalTotp(secret, trimmedCode)
      if (!isValid) {
        return { success: false, error: "Código incorreto ou expirado. Verifique o horário do seu celular." }
      }
    }

    // 3. Persistir ativação no Perfil e Metadados
    const enrolledAt = new Date().toISOString()
    try {
      await supabase.from('profiles').update({
        two_factor_enabled: true,
        mfa_enrolled_at: enrolledAt,
        backup_codes: backupCodes
      }).eq('id', userId)
    } catch (e) {
      console.warn("TwoFactorService: erro ao atualizar tabela profiles", e)
    }

    try {
      await supabase.auth.updateUser({
        data: {
          two_factor_enabled: true,
          mfa_enrolled_at: enrolledAt,
          backup_codes: backupCodes,
          mfa_factor_id: factorId,
          mfa_secret: secret
        }
      })
    } catch (e) {}

    if (typeof window !== 'undefined') {
      localStorage.setItem(`alura_2fa_${userId}`, JSON.stringify({
        enabled: true,
        enrolledAt,
        backupCodes,
        factorId,
        secret
      }))
    }

    return { success: true }
  },

  /**
   * Verifica código TOTP local com janela de ±1 passo (90 segundos de tolerância)
   */
  async verifyLocalTotp(secret: string, inputCode: string): Promise<boolean> {
    if (!inputCode || inputCode.length !== 6) return false
    const nowStep = Math.floor(Date.now() / 1000 / 30)

    for (const offset of [0, -1, 1]) {
      const step = nowStep + offset
      const expected = await computeTotp(secret, step)
      if (expected === inputCode) {
        return true
      }
    }
    return false
  },

  /**
   * Valida código no momento do Login (TOTP ou Código de Recuperação)
   */
  async verifyLoginCode(
    userId: string,
    code: string,
    storedSecret?: string,
    storedBackupCodes?: string[]
  ): Promise<{ success: boolean; usedBackupCode?: boolean; error?: string }> {
    const trimmed = code.trim().toUpperCase()

    // 1. Checa se é código de recuperação (XXXX-XXXX)
    if (storedBackupCodes && storedBackupCodes.length > 0) {
      const index = storedBackupCodes.findIndex(c => c.toUpperCase() === trimmed)
      if (index !== -1) {
        // Queima o código de backup usado
        const updatedCodes = [...storedBackupCodes]
        updatedCodes.splice(index, 1)

        await supabase.from('profiles').update({ backup_codes: updatedCodes }).eq('id', userId)
        await supabase.auth.updateUser({ data: { backup_codes: updatedCodes } })

        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem(`alura_2fa_${userId}`)
          if (cached) {
            const parsed = JSON.parse(cached)
            parsed.backupCodes = updatedCodes
            localStorage.setItem(`alura_2fa_${userId}`, JSON.stringify(parsed))
          }
        }

        return { success: true, usedBackupCode: true }
      }
    }

    // 2. Se for 6 dígitos TOTP
    if (/^\d{6}$/.test(trimmed)) {
      // Tenta via Supabase MFA
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const factor = factors?.totp?.find((f: any) => f.status === 'verified')
        if (factor) {
          const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id })
          if (!challenge.error) {
            const verify = await supabase.auth.mfa.verify({
              factorId: factor.id,
              challengeId: challenge.data.id,
              code: trimmed
            })
            if (!verify.error) return { success: true }
          }
        }
      } catch (e) {}

      // Fallback local
      if (storedSecret) {
        const isValid = await this.verifyLocalTotp(storedSecret, trimmed)
        if (isValid) return { success: true }
      }
    }

    return { success: false, error: "Código inválido ou já utilizado." }
  },

  /**
   * Desativa o 2FA para a conta
   */
  async disable(userId: string, factorId?: string): Promise<{ success: boolean; error?: string }> {
    if (factorId && !factorId.startsWith('local_')) {
      try {
        await supabase.auth.mfa.unenroll({ factorId })
      } catch (e) {
        console.warn("TwoFactorService: erro ao desinscrever no Supabase MFA", e)
      }
    }

    try {
      await supabase.from('profiles').update({
        two_factor_enabled: false,
        mfa_enrolled_at: null,
        backup_codes: []
      }).eq('id', userId)
    } catch (e) {}

    try {
      await supabase.auth.updateUser({
        data: {
          two_factor_enabled: false,
          mfa_enrolled_at: null,
          backup_codes: [],
          mfa_factor_id: null,
          mfa_secret: null
        }
      })
    } catch (e) {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem(`alura_2fa_${userId}`)
    }

    return { success: true }
  },

  /**
   * Regenera novos códigos de backup de emergência
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newCodes = generateBackupCodes(8)
    try {
      await supabase.from('profiles').update({ backup_codes: newCodes }).eq('id', userId)
      await supabase.auth.updateUser({ data: { backup_codes: newCodes } })
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`alura_2fa_${userId}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          parsed.backupCodes = newCodes
          localStorage.setItem(`alura_2fa_${userId}`, JSON.stringify(parsed))
        }
      }
    } catch (e) {}
    return newCodes
  }
}
