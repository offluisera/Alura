/**
 * CleanvoiceService.js
 * Integração com a API Cleanvoice v2 (https://docs.cleanvoice.ai/docs/v2)
 * e DSP em tempo real para chamadas WebRTC.
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
   * DSP em Tempo Real para WebRTC com Noise Gate e Corte Espectral.
   * Silencia ruídos de fundo (ventilador, digitação, respiração, eco residual)
   * quando o usuário não estiver falando, e abre a voz instantaneamente com fidelidade total.
   * 
   * @param {MediaStream} inputStream - Stream do microfone
   * @param {'cleanvoice'|'krisp'|'standard'|'off'} level - Nível de supressão
   * @returns {{ filteredStream: MediaStream, cleanup: () => void }}
   */
  static createLiveFilter(inputStream, level = 'cleanvoice') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioCtx({
      latencyHint: 'interactive',
      sampleRate: 48000,
    })

    // Garante que o contexto de áudio esteja ativo imediatamente
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }

    const source = audioContext.createMediaStreamSource(inputStream)

    // 1. Filtro High-Pass a 85Hz: elimina vibrações de mesa, vento e ruído de 60Hz da rede
    const highPass = audioContext.createBiquadFilter()
    highPass.type = 'highpass'
    highPass.frequency.setValueAtTime(85, audioContext.currentTime)
    highPass.Q.setValueAtTime(0.7, audioContext.currentTime)

    // 2. Analisador de volume RMS para o Noise Gate
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.2

    // 3. Nó de ganho para o Gate
    const gainNode = audioContext.createGain()
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime)

    source.connect(highPass)
    highPass.connect(analyser)
    highPass.connect(gainNode)

    const destination = audioContext.createMediaStreamDestination()
    gainNode.connect(destination)

    // Limiar de silenciamento em dB (qualquer som mais baixo que este limite é cortado)
    const thresholds = {
      cleanvoice: -44, // Forte: corta ventilador, teclado, cliques, chiado
      krisp: -48,      // Moderado
      standard: -54,   // Leve
      off: -100,       // Desativado
    }

    const thresholdDb = thresholds[level] ?? -44
    const isOff = level === 'off'

    const pcmData = new Float32Array(analyser.fftSize)
    let gateOpen = true
    let lastAboveThreshold = Date.now()
    let userIsMuted = false
    const HOLD_TIME_MS = 220 // Mantém a voz aberta por 220ms após parar de falar

    const setMuted = (muted) => {
      userIsMuted = !!muted
      if (userIsMuted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(1.0, audioContext.currentTime)
      }
    }

    const intervalId = setInterval(() => {
      if (userIsMuted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        return
      }

      if (isOff) {
        gainNode.gain.setTargetAtTime(1.0, audioContext.currentTime, 0.01)
        return
      }

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {})
      }

      analyser.getFloatTimeDomainData(pcmData)
      let sum = 0
      for (let i = 0; i < pcmData.length; i++) {
        sum += pcmData[i] * pcmData[i]
      }
      const rms = Math.sqrt(sum / pcmData.length)
      const db = 20 * Math.log10(Math.max(rms, 1e-5))

      const now = Date.now()
      if (db > thresholdDb) {
        lastAboveThreshold = now
        if (!gateOpen) {
          gateOpen = true
          // Abre a voz instantaneamente (8ms)
          gainNode.gain.setTargetAtTime(1.0, audioContext.currentTime, 0.008)
        }
      } else if (now - lastAboveThreshold > HOLD_TIME_MS) {
        if (gateOpen) {
          gateOpen = false
          // Corta ruídos de fundo (30ms) para silêncio limpo
          gainNode.gain.setTargetAtTime(0.001, audioContext.currentTime, 0.03)
        }
      }
    }, 16)

    return {
      filteredStream: destination.stream,
      setMuted,
      cleanup: () => {
        clearInterval(intervalId)
        try {
          source.disconnect()
          highPass.disconnect()
          analyser.disconnect()
          gainNode.disconnect()
          destination.disconnect()
          audioContext.close().catch(() => {})
        } catch {}
      },
    }
  }
}

export default CleanvoiceService
