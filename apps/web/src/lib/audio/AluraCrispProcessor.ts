/**
 * AluraCrispProcessor.ts
 * Motor próprio de processamento de áudio e redução de ruído em tempo real da Alura.
 *
 * Cadeia: filtros biquad -> noise gate em AudioWorklet (thread de áudio) -> limitador.
 *
 * Por que AudioWorklet: o gate antigo rodava em setInterval no thread principal.
 * Com a janela em segundo plano (jogando, alt-tab, minimizado) o navegador/Electron
 * reduz o timer para ~1 Hz e o gate abria/fechava com até 1s de atraso, cortando palavras.
 * No worklet a decisão é tomada a cada bloco de 128 amostras (~2,7 ms), sem throttling.
 */

export type AluraCrispProfile =
  | 'alura_crisp_smart'      // Padrão Alura Crisp (cancelamento inteligente balanceado)
  | 'alura_crisp_studio'     // Modo Estúdio/Podcast (máxima fidelidade vocal)
  | 'alura_crisp_aggressive' // Agressivo (ambientes barulhentos, ventiladores fortes)
  | 'krisp'                  // Alias legado -> alura_crisp_smart
  | 'cleanvoice'             // Alias legado -> alura_crisp_aggressive
  | 'standard'               // Apenas supressão nativa do navegador (sem DSP Alura)
  | 'passthrough'            // Direto, para quem usa RTX Voice, Sonar ou Elgato
  | 'off'                    // Sem processamento

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

interface CrispConfig {
  highPassFreq: number
  highPassQ: number
  lowPassFreq: number
  /** Limiar absoluto mínimo (dB, potência na banda de voz) para abrir o gate */
  thresholdDb: number
  /** Margem (dB) acima do piso de ruído estimado necessária para abrir o gate */
  marginDb: number
  holdTimeMs: number
  /** Atraso de lookahead: o áudio é atrasado para o gate abrir ANTES da palavra chegar */
  lookaheadMs: number
  attackTimeSec: number
  releaseTimeSec: number
  /** Ganho linear quando o gate está fechado (0.0001 = -80 dB) */
  attenuationFloor: number
}

const PROFILE_CONFIGS: Record<string, CrispConfig> = {
  alura_crisp_smart: {
    highPassFreq: 90, highPassQ: 0.707, lowPassFreq: 14000,
    thresholdDb: -47, marginDb: 9, holdTimeMs: 220, lookaheadMs: 8,
    attackTimeSec: 0.004, releaseTimeSec: 0.038, attenuationFloor: 0.0008, // ~ -62 dB
  },
  alura_crisp_studio: {
    highPassFreq: 75, highPassQ: 0.65, lowPassFreq: 18000,
    thresholdDb: -52, marginDb: 7, holdTimeMs: 260, lookaheadMs: 10,
    attackTimeSec: 0.004, releaseTimeSec: 0.045, attenuationFloor: 0.005, // ~ -46 dB
  },
  alura_crisp_aggressive: {
    highPassFreq: 110, highPassQ: 0.85, lowPassFreq: 12500,
    thresholdDb: -41, marginDb: 12, holdTimeMs: 180, lookaheadMs: 6,
    attackTimeSec: 0.004, releaseTimeSec: 0.030, attenuationFloor: 0.0001, // ~ -80 dB
  },
}

const DSP_PROFILES = new Set(['alura_crisp_smart', 'alura_crisp_studio', 'alura_crisp_aggressive'])

/**
 * Código do AudioWorkletProcessor (string para carregar via Blob, sem depender do bundler).
 * Entrada 0 = sinal completo (é o que sai, atrasado pelo lookahead).
 * Entrada 1 = sinal limitado à banda de voz (300-3400 Hz), usado só para detectar fala.
 * Não usar crases nem ${} dentro desta string.
 */
export const CRISP_WORKLET_SOURCE = `
class AluraCrispGate extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const o = (options && options.processorOptions) || {};
    this.cfg = o.cfg;
    this.muted = false;
    this.gain = 1;
    this.open = true;
    this.holdLeft = 0;
    this.floorDb = -65;
    this.subMin = new Float32Array(12).fill(0); // 12 sub-janelas de 250 ms = 3 s
    this.subIdx = 0;
    this.subBlocks = 0;
    this.subLen = Math.max(1, Math.round((0.25 * sampleRate) / 128));
    this.curMin = Infinity;
    this.smoothPower = 1e-6;
    this.blocks = 0;
    this.reportEvery = Math.max(1, Math.round(sampleRate / 128 / 20)); // ~20 relatórios/s
    this.delay = new Float32Array(Math.ceil(sampleRate * 0.03)); // até 30 ms
    this.wp = 0;
    this.port.onmessage = (e) => {
      const m = e.data || {};
      if (m.cfg) this.cfg = m.cfg;
      if (typeof m.muted === 'boolean') this.muted = m.muted;
    };
  }

  process(inputs, outputs) {
    const out = outputs[0] && outputs[0][0];
    if (!out) return true;
    const main = inputs[0] && inputs[0][0];
    if (!main) { out.fill(0); return true; }
    const det = (inputs[1] && inputs[1][0]) || main;
    const cfg = this.cfg;
    const n = main.length;

    // 1. Potência na banda de voz, suavizada (~13 ms) para não oscilar em blocos de 2,7 ms
    let s = 0;
    for (let i = 0; i < n; i++) s += det[i] * det[i];
    this.smoothPower = this.smoothPower * 0.8 + (s / n) * 0.2;
    const db = 10 * Math.log10(Math.max(this.smoothPower, 1e-10));

    // 2. Piso de ruído por estatística mínima: menor potência numa janela de 3 s
    //    (as pausas entre palavras revelam o ruído de fundo). Desce na hora, sobe no máximo
    //    3 dB por 250 ms, então ruído constante alto (ventilador) também é aprendido.
    if (db < this.curMin) this.curMin = db;
    if (++this.subBlocks >= this.subLen) {
      this.subBlocks = 0;
      this.subMin[this.subIdx] = this.curMin;
      this.subIdx = (this.subIdx + 1) % this.subMin.length;
      this.curMin = Infinity;
      let m = Infinity;
      for (let k = 0; k < this.subMin.length; k++) if (this.subMin[k] < m) m = this.subMin[k];
      if (m > this.floorDb + 3) m = this.floorDb + 3;
      this.floorDb = m < -80 ? -80 : m > -38 ? -38 : m; // teto -38 dB: ruído acima disso é tratado como fala
    }

    // 3. Decisão com histerese (abre em T, só começa a fechar abaixo de T-4 dB) e hold
    const openThr = Math.max(cfg.thresholdDb, this.floorDb + cfg.marginDb);
    const closeThr = openThr - 4;
    const holdSamples = (cfg.holdTimeMs * sampleRate) / 1000;
    if (db > (this.open ? closeThr : openThr)) {
      this.open = true;
      this.holdLeft = holdSamples;
    } else if (this.open) {
      this.holdLeft -= n;
      if (this.holdLeft <= 0) this.open = false;
    }

    // 4. Ganho suavizado por amostra + lookahead (atraso fixo no caminho do áudio)
    const target = this.muted ? 0 : (this.open ? 1 : cfg.attenuationFloor);
    const aUp = 1 - Math.exp(-1 / (cfg.attackTimeSec * sampleRate));
    const aDown = 1 - Math.exp(-1 / ((this.muted ? 0.004 : cfg.releaseTimeSec) * sampleRate));
    const look = Math.min(this.delay.length - 1, Math.round((cfg.lookaheadMs * sampleRate) / 1000));
    const len = this.delay.length;
    let g = this.gain;
    let wp = this.wp;
    for (let i = 0; i < n; i++) {
      this.delay[wp] = main[i];
      let rp = wp - look;
      if (rp < 0) rp += len;
      g += (target - g) * (target > g ? aUp : aDown);
      out[i] = this.delay[rp] * g;
      wp++;
      if (wp >= len) wp = 0;
    }
    this.gain = g;
    this.wp = wp;

    // 5. Métricas para a UI
    if (++this.blocks >= this.reportEvery) {
      this.blocks = 0;
      const gr = -20 * Math.log10(Math.max(g, 1e-5));
      this.port.postMessage({
        inputDb: db,
        noiseFloorDb: this.floorDb,
        speech: this.open,
        gainReductionDb: gr < 0 ? 0 : gr > 80 ? 80 : gr,
      });
    }
    return true;
  }
}
registerProcessor('alura-crisp-gate', AluraCrispGate);
`

const EMPTY_METRICS: AluraCrispMetrics = {
  inputDb: -60,
  outputDb: -60,
  noiseFloorDb: -70,
  speechDetected: false,
  gainReductionDb: 0,
}

export class AluraCrispProcessor {
  /** Converte identificadores legados para os perfis Alura Crisp atuais. */
  public static normalizeProfile(profile: AluraCrispProfile | string): string {
    if (profile === 'krisp' || profile === 'alura_crisp_smart') return 'alura_crisp_smart'
    if (profile === 'cleanvoice' || profile === 'alura_crisp_aggressive') return 'alura_crisp_aggressive'
    if (profile === 'alura_crisp_studio') return 'alura_crisp_studio'
    if (profile === 'passthrough') return 'passthrough'
    if (profile === 'off') return 'off'
    return 'standard'
  }

  /** true quando o perfil usa a cadeia DSP da Alura (os 3 modos Crisp). */
  public static usesDsp(profile: AluraCrispProfile | string | null | undefined): boolean {
    return DSP_PROFILES.has(this.normalizeProfile(profile ?? ''))
  }

  /** Restrições de captura (supressão nativa do navegador) ideais para o perfil. */
  public static getAudioConstraints(
    profile: AluraCrispProfile | string = 'alura_crisp_smart',
    deviceId?: string | null
  ): MediaTrackConstraints {
    const p = this.normalizeProfile(profile)
    const raw = p === 'passthrough' || p === 'off'
    return {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      echoCancellation: !raw,
      noiseSuppression: !raw,
      // Estúdio preserva a dinâmica da voz: sem AGC
      autoGainControl: !raw && p !== 'alura_crisp_studio',
      sampleRate: 48000,
      channelCount: 1,
    }
  }

  /** Instancia a cadeia de DSP de redução de ruído em tempo real. */
  public static createStreamFilter(
    inputStream: MediaStream,
    initialProfile: AluraCrispProfile = 'alura_crisp_smart',
    onMetrics?: (metrics: AluraCrispMetrics) => void
  ): AluraCrispInstance {
    let currentProfile = this.normalizeProfile(initialProfile)

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const canWorklet = !!AudioContextClass && typeof AudioWorkletNode !== 'undefined'

    // Sem DSP (standard/passthrough/off) ou ambiente sem WebAudio/Worklet: devolve o stream original
    if (!this.usesDsp(currentProfile) || !canWorklet) {
      if (this.usesDsp(currentProfile) && !canWorklet) {
        console.warn('[AluraCrisp] AudioWorklet indisponível; usando só a supressão nativa.')
      }
      return {
        filteredStream: inputStream,
        setMuted: (muted: boolean) => {
          inputStream.getAudioTracks().forEach((t) => { t.enabled = !muted })
        },
        setProfile: (p: AluraCrispProfile) => { currentProfile = this.normalizeProfile(p) },
        getMetrics: () => ({ ...EMPTY_METRICS }),
        cleanup: () => {},
      }
    }

    const audioCtx: AudioContext = new AudioContextClass({ latencyHint: 'interactive' })
    const resume = () => { if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {}) }
    resume()
    audioCtx.onstatechange = resume

    const source = audioCtx.createMediaStreamSource(inputStream)

    // Filtros de limpeza (full band)
    const highPass = audioCtx.createBiquadFilter()
    highPass.type = 'highpass'
    const notch60 = audioCtx.createBiquadFilter()
    notch60.type = 'notch'
    notch60.frequency.value = 60
    notch60.Q.value = 4.5
    const notch50 = audioCtx.createBiquadFilter()
    notch50.type = 'notch'
    notch50.frequency.value = 50
    notch50.Q.value = 4.5
    const lowPass = audioCtx.createBiquadFilter()
    lowPass.type = 'lowpass'

    // Caminho de detecção: só a banda de voz (300-3400 Hz)
    const bandHigh = audioCtx.createBiquadFilter()
    bandHigh.type = 'highpass'
    bandHigh.frequency.value = 300
    bandHigh.Q.value = 0.707
    const bandLow = audioCtx.createBiquadFilter()
    bandLow.type = 'lowpass'
    bandLow.frequency.value = 3400
    bandLow.Q.value = 0.707

    // Limitador soft-knee contra estouros/gritos
    const limiter = audioCtx.createDynamicsCompressor()
    limiter.threshold.value = -6
    limiter.knee.value = 6
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.06

    const destination = audioCtx.createMediaStreamDestination()

    // Caminho provisório (até o worklet carregar): áudio passa só pelos filtros
    const bypass = audioCtx.createGain()
    bypass.gain.value = 1

    source.connect(highPass)
    highPass.connect(notch60)
    notch60.connect(notch50)
    notch50.connect(lowPass)
    lowPass.connect(bypass)
    bypass.connect(limiter)
    lowPass.connect(bandHigh)
    bandHigh.connect(bandLow)
    limiter.connect(destination)

    const applyFilterParams = (name: string) => {
      const cfg = PROFILE_CONFIGS[name] || PROFILE_CONFIGS.alura_crisp_smart
      const t = audioCtx.currentTime
      highPass.frequency.setTargetAtTime(cfg.highPassFreq, t, 0.05)
      highPass.Q.setTargetAtTime(cfg.highPassQ, t, 0.05)
      lowPass.frequency.setTargetAtTime(cfg.lowPassFreq, t, 0.05)
      lowPass.Q.setTargetAtTime(0.707, t, 0.05)
    }
    applyFilterParams(currentProfile)

    let gateNode: AudioWorkletNode | null = null
    let disposed = false
    let isMuted = false
    let last: AluraCrispMetrics = { ...EMPTY_METRICS }

    const currentCfg = () => PROFILE_CONFIGS[currentProfile] || PROFILE_CONFIGS.alura_crisp_smart

    // Carrega o worklet de forma assíncrona e troca o caminho provisório pelo gate real.
    // O MediaStream de saída (destination.stream) é o mesmo, então quem chamou não precisa mudar nada.
    const blobUrl = URL.createObjectURL(new Blob([CRISP_WORKLET_SOURCE], { type: 'application/javascript' }))
    audioCtx.audioWorklet
      .addModule(blobUrl)
      .then(() => {
        if (disposed) return
        const node = new AudioWorkletNode(audioCtx, 'alura-crisp-gate', {
          numberOfInputs: 2,
          numberOfOutputs: 1,
          outputChannelCount: [1],
          channelCount: 1,
          channelCountMode: 'explicit',
          processorOptions: { cfg: currentCfg() },
        })
        node.port.onmessage = (e) => {
          const m = e.data || {}
          const inputDb = Math.round(m.inputDb)
          const gr = Math.round(m.gainReductionDb)
          last = {
            inputDb,
            outputDb: Math.max(-80, inputDb - gr),
            noiseFloorDb: Math.round(m.noiseFloorDb),
            speechDetected: !!m.speech,
            gainReductionDb: gr,
          }
          if (onMetrics) onMetrics(last)
        }
        lowPass.connect(node, 0, 0)
        bandLow.connect(node, 0, 1)
        node.connect(limiter)
        lowPass.disconnect(bypass)
        node.port.postMessage({ muted: isMuted })
        gateNode = node
      })
      .catch((err) => {
        console.warn('[AluraCrisp] Falha ao carregar o worklet; mantendo só filtros + supressão nativa.', err)
      })
      .finally(() => URL.revokeObjectURL(blobUrl))

    return {
      filteredStream: destination.stream,
      setMuted: (muted: boolean) => {
        isMuted = !!muted
        bypass.gain.setTargetAtTime(isMuted ? 0 : 1, audioCtx.currentTime, 0.004)
        gateNode?.port.postMessage({ muted: isMuted })
      },
      setProfile: (newProfile: AluraCrispProfile) => {
        currentProfile = AluraCrispProcessor.normalizeProfile(newProfile)
        applyFilterParams(currentProfile)
        gateNode?.port.postMessage({ cfg: currentCfg() })
      },
      getMetrics: () => ({ ...last }),
      cleanup: () => {
        disposed = true
        try {
          gateNode?.port.close()
          gateNode?.disconnect()
          source.disconnect()
          highPass.disconnect()
          notch60.disconnect()
          notch50.disconnect()
          lowPass.disconnect()
          bandHigh.disconnect()
          bandLow.disconnect()
          bypass.disconnect()
          limiter.disconnect()
          destination.disconnect()
        } catch {
          /* nós já desconectados */
        }
        audioCtx.onstatechange = null
        audioCtx.close().catch(() => {})
      },
    }
  }
}

export default AluraCrispProcessor
