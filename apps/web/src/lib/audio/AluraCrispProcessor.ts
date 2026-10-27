/**
 * AluraCrispProcessor.ts
 * Motor próprio de processamento de áudio e cancelamento de ruído em tempo real da Alura.
 * 
 * Inspirado nas técnicas do RNNoise / Crispy (sleep3r/crispy), adaptado para
 * execução 100% no cliente (WebAudio API / WebRTC) com zero latência perceptível,
 * zero dependência de nuvem e zero drivers virtuais externos.
 */

export type AluraCrispProfile =
  | 'alura_crisp_smart'      // Padrão Alura Crisp (Cancelamento inteligente balanceado)
  | 'alura_crisp_studio'     // Modo Estúdio/Podcast (Máxima fidelidade vocal)
  | 'alura_crisp_aggressive' // Agressivo (Para ambientes barulhentos, ventiladores fortes)
  | 'krisp'                  // Alias retrocompatível -> alura_crisp_smart
  | 'cleanvoice'             // Alias retrocompatível -> alura_crisp_aggressive
  | 'standard'               // Passa-alta básico nativo
  | 'passthrough'            // Direto para quem usa RTX Voice, Sonar ou Elgato
  | 'off'                    // Sem processamento (Áudio puro)

export interface AluraCrispMetrics {
  inputDb: number
  outputDb: number
  noiseFloorDb: number
  speechDetected: boolean
  gainReductionDb: number
}

export interface AluraCrispInstance {
  filteredStream: MediaStream
  setMuted: (muted: boolean) => void
  setProfile: (profile: AluraCrispProfile) => void
  getMetrics: () => AluraCrispMetrics
  cleanup: () => void
}

/**
 * Perfis de parâmetros acústicos para cada modo
 */
const PROFILE_CONFIGS: Record<string, {
  highPassFreq: number
  highPassQ: number
  lowPassFreq: number
  thresholdDb: number
  holdTimeMs: number
  attackTimeSec: number
  releaseTimeSec: number
  attenuationFloor: number // Piso de atenuação quando a fala cessa (0.0001 = -80dB)
}> = {
  alura_crisp_smart: {
    highPassFreq: 90,
    highPassQ: 0.707,
    lowPassFreq: 14000,
    thresholdDb: -47,
    holdTimeMs: 220,
    attackTimeSec: 0.005,
    releaseTimeSec: 0.038,
    attenuationFloor: 0.0008, // ~ -62dB
  },
  alura_crisp_studio: {
    highPassFreq: 75,
    highPassQ: 0.65,
    lowPassFreq: 18000,
    thresholdDb: -52,
    holdTimeMs: 260,
    attackTimeSec: 0.004,
    releaseTimeSec: 0.045,
    attenuationFloor: 0.005, // ~ -46dB
  },
  alura_crisp_aggressive: {
    highPassFreq: 110,
    highPassQ: 0.85,
    lowPassFreq: 12500,
    thresholdDb: -41,
    holdTimeMs: 180,
    attackTimeSec: 0.006,
    releaseTimeSec: 0.030,
    attenuationFloor: 0.0001, // ~ -80dB (silêncio absoluto)
  },
  standard: {
    highPassFreq: 80,
    highPassQ: 0.707,
    lowPassFreq: 16000,
    thresholdDb: -54,
    holdTimeMs: 250,
    attackTimeSec: 0.008,
    releaseTimeSec: 0.050,
    attenuationFloor: 0.01,
  },
}

export class AluraCrispProcessor {
  /**
   * Converte identificadores legados para os novos perfis Alura Crisp
   */
  public static normalizeProfile(profile: AluraCrispProfile | string): string {
    if (profile === 'krisp' || profile === 'alura_crisp_smart') return 'alura_crisp_smart'
    if (profile === 'cleanvoice' || profile === 'alura_crisp_aggressive') return 'alura_crisp_aggressive'
    if (profile === 'alura_crisp_studio') return 'alura_crisp_studio'
    if (profile === 'passthrough') return 'passthrough'
    if (profile === 'off') return 'off'
    return 'standard'
  }

  /**
   * Retorna as restrições WebRTC ideais para o perfil selecionado
   */
  public static getAudioConstraints(profile: AluraCrispProfile | string = 'alura_crisp_smart', deviceId?: string): MediaTrackConstraints {
    const isPassthroughOrOff = profile === 'passthrough' || profile === 'off'
    return {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      echoCancellation: !isPassthroughOrOff,
      noiseSuppression: !isPassthroughOrOff,
      autoGainControl: !isPassthroughOrOff,
      sampleRate: 48000,
      channelCount: 1,
    }
  }

  /**
   * Instancia a cadeia de DSP de cancelamento de ruído em tempo real
   */
  public static createStreamFilter(
    inputStream: MediaStream,
    initialProfile: AluraCrispProfile = 'alura_crisp_smart',
    onMetrics?: (metrics: AluraCrispMetrics) => void
  ): AluraCrispInstance {
    let currentProfile = this.normalizeProfile(initialProfile)

    // Se o usuário selecionou modo direto ou desligado, retorna sem processamento duplo
    if (currentProfile === 'passthrough' || currentProfile === 'off') {
      let isMuted = false
      return {
        filteredStream: inputStream,
        setMuted: (muted: boolean) => {
          isMuted = !!muted
          inputStream.getAudioTracks().forEach((t) => {
            t.enabled = !isMuted
          })
        },
        setProfile: (newProfile: AluraCrispProfile) => {
          currentProfile = this.normalizeProfile(newProfile)
        },
        getMetrics: () => ({
          inputDb: -60,
          outputDb: -60,
          noiseFloorDb: -70,
          speechDetected: false,
          gainReductionDb: 0,
        }),
        cleanup: () => {},
      }
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      return {
        filteredStream: inputStream,
        setMuted: () => {},
        setProfile: () => {},
        getMetrics: () => ({
          inputDb: 0,
          outputDb: 0,
          noiseFloorDb: -70,
          speechDetected: false,
          gainReductionDb: 0,
        }),
        cleanup: () => {},
      }
    }

    const audioCtx = new AudioContextClass({ latencyHint: 'interactive' })
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    const source = audioCtx.createMediaStreamSource(inputStream)

    // 1. Filtro Passa-Alta Butterworth: remove batidas de mesa, vento e sub-ruídos
    const highPass = audioCtx.createBiquadFilter()
    highPass.type = 'highpass'

    // 2. Filtro Notch de 60Hz: elimina zumbidos eletromagnéticos de fonte de energia
    const notch60 = audioCtx.createBiquadFilter()
    notch60.type = 'notch'
    notch60.frequency.setValueAtTime(60, audioCtx.currentTime)
    notch60.Q.setValueAtTime(4.5, audioCtx.currentTime)

    // 3. Filtro Notch de 50Hz: para redes elétricas de 50Hz (harmônico europeu e fontes chaveadas)
    const notch50 = audioCtx.createBiquadFilter()
    notch50.type = 'notch'
    notch50.frequency.setValueAtTime(50, audioCtx.currentTime)
    notch50.Q.setValueAtTime(4.5, audioCtx.currentTime)

    // 4. Filtro Passa-Baixa Suave: remove chiado residual de alta frequência
    const lowPass = audioCtx.createBiquadFilter()
    lowPass.type = 'lowpass'

    // 5. Analisador FFT em tempo real para decomposição espectral
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.25

    // 6. Nó de Ganho Adaptativo (Noise Gate & Spectral Envelope Follower)
    const gateGainNode = audioCtx.createGain()
    gateGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime)

    // 7. Limitador Soft-Knee (DynamicsCompressorNode) para proteção contra estouros/gritos
    const limiter = audioCtx.createDynamicsCompressor()
    limiter.threshold.setValueAtTime(-6.0, audioCtx.currentTime)
    limiter.knee.setValueAtTime(6.0, audioCtx.currentTime)
    limiter.ratio.setValueAtTime(12.0, audioCtx.currentTime)
    limiter.attack.setValueAtTime(0.003, audioCtx.currentTime)
    limiter.release.setValueAtTime(0.060, audioCtx.currentTime)

    // 8. Destino de saída para o MediaStream
    const destination = audioCtx.createMediaStreamDestination()

    // Encadeamento do grafo de áudio:
    // source -> highPass -> notch60 -> notch50 -> lowPass -> analyser -> gateGainNode -> limiter -> destination
    source.connect(highPass)
    highPass.connect(notch60)
    notch60.connect(notch50)
    notch50.connect(lowPass)
    lowPass.connect(analyser)
    lowPass.connect(gateGainNode)
    gateGainNode.connect(limiter)
    limiter.connect(destination)

    // Aplica configurações do perfil atual
    const applyProfileParams = (profileName: string) => {
      const cfg = PROFILE_CONFIGS[profileName] || PROFILE_CONFIGS.alura_crisp_smart
      highPass.frequency.setTargetAtTime(cfg.highPassFreq, audioCtx.currentTime, 0.05)
      highPass.Q.setTargetAtTime(cfg.highPassQ, audioCtx.currentTime, 0.05)
      lowPass.frequency.setTargetAtTime(cfg.lowPassFreq, audioCtx.currentTime, 0.05)
      lowPass.Q.setTargetAtTime(0.707, audioCtx.currentTime, 0.05)
    }

    applyProfileParams(currentProfile)

    // Rastreamento dinâmico de sinal, piso de ruído e VAD
    const timeDomainBuffer = new Float32Array(analyser.fftSize)
    const freqDomainBuffer = new Uint8Array(analyser.frequencyBinCount)

    let isUserMuted = false
    let isGateOpen = true
    let lastVoiceDetectedTimestamp = Date.now()
    let estimatedNoiseFloorDb = -65.0
    let lastCalculatedInputDb = -60.0
    let lastCalculatedOutputDb = -60.0
    let lastGainReductionDb = 0.0

    const updateInterval = setInterval(() => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
      }

      if (isUserMuted) {
        gateGainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        lastGainReductionDb = 80
        return
      }

      // 1. Mede RMS no domínio do tempo
      analyser.getFloatTimeDomainData(timeDomainBuffer)
      let sumSquares = 0
      for (let i = 0; i < timeDomainBuffer.length; i++) {
        sumSquares += timeDomainBuffer[i] * timeDomainBuffer[i]
      }
      const rms = Math.sqrt(sumSquares / timeDomainBuffer.length)
      const inputDb = 20 * Math.log10(Math.max(rms, 1e-5))
      lastCalculatedInputDb = Math.round(inputDb)

      // 2. Mede energia espectral no domínio da frequência
      analyser.getByteFrequencyData(freqDomainBuffer)
      
      // Amostra bandas vocais principais (300Hz a 3400Hz)
      const binCount = freqDomainBuffer.length
      const sampleRate = audioCtx.sampleRate || 48000
      const nyquist = sampleRate / 2
      const hzPerBin = nyquist / binCount

      const vocalBinStart = Math.floor(300 / hzPerBin)
      const vocalBinEnd = Math.min(binCount - 1, Math.floor(3400 / hzPerBin))

      let vocalEnergy = 0
      let vocalBinTotal = 0
      for (let b = vocalBinStart; b <= vocalBinEnd; b++) {
        vocalEnergy += freqDomainBuffer[b]
        vocalBinTotal++
      }
      const avgVocalEnergy = vocalBinTotal > 0 ? vocalEnergy / vocalBinTotal : 0

      // 3. Atualização adaptativa do piso de ruído (Minimum Statistics)
      if (inputDb < estimatedNoiseFloorDb + 4) {
        estimatedNoiseFloorDb = estimatedNoiseFloorDb * 0.98 + inputDb * 0.02
      } else {
        estimatedNoiseFloorDb = estimatedNoiseFloorDb * 0.999 + inputDb * 0.001
      }
      estimatedNoiseFloorDb = Math.max(-80, Math.min(-35, estimatedNoiseFloorDb))

      const cfg = PROFILE_CONFIGS[currentProfile] || PROFILE_CONFIGS.alura_crisp_smart
      const now = Date.now()

      // 4. Critério VAD composto: RMS acima do limiar configurado E energia vocal presente
      const isSpeechDetected = inputDb > cfg.thresholdDb && avgVocalEnergy > 8

      if (isSpeechDetected) {
        lastVoiceDetectedTimestamp = now
        if (!isGateOpen) {
          isGateOpen = true
          // Ataque ultrarrápido (4-5ms) para não perder o início da palavra
          gateGainNode.gain.setTargetAtTime(1.0, audioCtx.currentTime, cfg.attackTimeSec)
        }
        lastGainReductionDb = 0
        lastCalculatedOutputDb = lastCalculatedInputDb
      } else if (now - lastVoiceDetectedTimestamp > cfg.holdTimeMs) {
        if (isGateOpen) {
          isGateOpen = false
          // Decaimento suave sem cliques digitais
          gateGainNode.gain.setTargetAtTime(cfg.attenuationFloor, audioCtx.currentTime, cfg.releaseTimeSec)
        }
        lastGainReductionDb = Math.min(60, Math.round(Math.abs(20 * Math.log10(cfg.attenuationFloor))))
        lastCalculatedOutputDb = Math.max(-80, lastCalculatedInputDb - lastGainReductionDb)
      }

      if (onMetrics) {
        onMetrics({
          inputDb: lastCalculatedInputDb,
          outputDb: lastCalculatedOutputDb,
          noiseFloorDb: Math.round(estimatedNoiseFloorDb),
          speechDetected: isSpeechDetected,
          gainReductionDb: lastGainReductionDb,
        })
      }
    }, 16) // ~60 FPS para máxima responsividade

    return {
      filteredStream: destination.stream,
      setMuted: (muted: boolean) => {
        isUserMuted = !!muted
        if (isUserMuted) {
          gateGainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        } else {
          gateGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime)
        }
      },
      setProfile: (newProfile: AluraCrispProfile) => {
        currentProfile = AluraCrispProcessor.normalizeProfile(newProfile)
        applyProfileParams(currentProfile)
      },
      getMetrics: () => ({
        inputDb: lastCalculatedInputDb,
        outputDb: lastCalculatedOutputDb,
        noiseFloorDb: Math.round(estimatedNoiseFloorDb),
        speechDetected: isGateOpen,
        gainReductionDb: lastGainReductionDb,
      }),
      cleanup: () => {
        clearInterval(updateInterval)
        try {
          source.disconnect()
          highPass.disconnect()
          notch60.disconnect()
          notch50.disconnect()
          lowPass.disconnect()
          analyser.disconnect()
          gateGainNode.disconnect()
          limiter.disconnect()
          destination.disconnect()
          audioCtx.close().catch(() => {})
        } catch {}
      },
    }
  }
}

export default AluraCrispProcessor
