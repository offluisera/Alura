import { AluraCrispProcessor } from '../audio/AluraCrispProcessor'

/**
 * CleanvoiceService.js
 * Integração com o motor nativo AluraCrispProcessor e API Cleanvoice v2.
 */

export const CLEANVOICE_API_KEY = 'cvk_i36dBD13eqg.P3K6R78lYIYPkfyz2-MbT06OMcIFiC6FNFfFGgRvj_A'
export const CLEANVOICE_BASE_URL = 'https://api.cleanvoice.ai/v2'

/**
 * Serviço de supressão de ruído e pós-processamento Cleanvoice
 */
export class CleanvoiceService {
  /**
   * Envia uma requisição autenticada para a API v2
   */
  static async request(endpoint, options = {}) {
    const url = `${CLEANVOICE_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const headers = {
      'X-API-Key': CLEANVOICE_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`[Cleanvoice] Erro ${res.status}: ${errBody || res.statusText}`)
    }

    return res.json()
  }

  /**
   * Obtém URL assinada para upload de áudio
   * @param {string} filename - Nome do arquivo (ex: 'audio.wav')
   */
  static async getUploadUrl(filename = 'recording.wav') {
    return this.request('/upload', {
      method: 'POST',
      body: JSON.stringify({ filename }),
    })
  }

  /**
   * Faz upload de arquivo ou Blob para o Cleanvoice
   * @param {Blob|File} file - Blob ou File de áudio
   */
  static async uploadAudio(file) {
    const filename = file.name || `audio-${Date.now()}.wav`
    const { signed_url, download_url } = await this.getUploadUrl(filename)

    // Envia o arquivo diretamente para o signed_url do S3/GCS
    const uploadRes = await fetch(signed_url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'audio/wav',
      },
      body: file,
    })

    if (!uploadRes.ok) {
      throw new Error(`[Cleanvoice] Falha no upload para signed_url: ${uploadRes.statusText}`)
    }

    return download_url
  }

  /**
   * Cria uma tarefa de edição/remoção de ruído na Cleanvoice v2
   * @param {string} fileUrl - URL do arquivo de áudio para limpar
   * @param {object} customConfig - Opções adicionais de limpeza
   */
  static async createEdit(fileUrl, customConfig = {}) {
    const payload = {
      input: {
        files: [fileUrl],
      },
      config: {
        remove_noise: true,
        remove_mouth_sounds: true,
        auto_eq: true,
        muted: false,
        remove_silences: false,
        remove_fillers: false,
        remove_stutters: false,
        ...customConfig,
      },
    }

    return this.request('/edits', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Consulta o status de uma edição
   * @param {string} editId - ID retornado por createEdit
   */
  static async getEditStatus(editId) {
    return this.request(`/edits/${editId}`)
  }

  /**
   * Aguarda a conclusão da edição (polling)
   * @param {string} editId - ID da edição
   * @param {function} onProgress - Callback de progresso
   * @param {number} maxAttempts - Limite de tentativas
   */
  static async pollEditResult(editId, onProgress = null, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getEditStatus(editId)
      if (onProgress) onProgress(status)

      if (status.status === 'SUCCESS') {
        return status
      }
      if (status.status === 'FAILURE' || status.status === 'ERROR') {
        throw new Error(`[Cleanvoice] Falha no processamento: ${status.error || 'Erro desconhecido'}`)
      }

      await new Promise((r) => setTimeout(r, 2000))
    }
    throw new Error('[Cleanvoice] Tempo limite excedido ao aguardar processamento.')
  }

  /**
   * Retorna restrições WebRTC adequadas para o modo escolhido via AluraCrispProcessor.
   */
  static getAudioConstraints(level = 'alura_crisp_smart', deviceId = null) {
    return AluraCrispProcessor.getAudioConstraints(level, deviceId)
  }

  /**
   * DSP em Tempo Real para WebRTC alimentado pelo motor Alura Crisp.
   * Filtros Biquad, decomposição espectral multi-banda, piso dinâmico,
   * VAD com micro-ataque e Soft-Knee Peak Limiter.
   * 
   * @param {MediaStream} inputStream - Stream de áudio do microfone
   * @param {string} level - Perfil de supressão de ruído
   * @param {Function} [onMetrics] - Callback opcional para receber métricas de ruído em tempo real
   * @returns {{ filteredStream: MediaStream, cleanup: () => void, setMuted: (m: boolean) => void, setProfile: (p: string) => void, getMetrics: () => any }}
   */
  static createLiveFilter(inputStream, level = 'alura_crisp_smart', onMetrics = null) {
    return AluraCrispProcessor.createStreamFilter(inputStream, level, onMetrics)
  }

  /**
   * Alias estático para compatibilidade com chamadas WebRTC
   */
  static applyFilterChain(inputStream, level = 'alura_crisp_smart', onMetrics = null) {
    return this.createLiveFilter(inputStream, level, onMetrics)
  }
}

export { AluraCrispProcessor }
export default CleanvoiceService


