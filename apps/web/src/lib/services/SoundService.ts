// Importação dos arquivos de áudio já existentes no projeto
import msgReceivedUrl from '../../assets/sounds/notifications/recebeu-mensagem.mp3'
import voiceJoinUrl from '../../assets/sounds/call/entrou-call.mp3'
import voiceLeaveUrl from '../../assets/sounds/call/saiu-call.mp3'
import callRingUrl from '../../assets/sounds/call/ligando.mp3'

export type SoundType = 
  | 'messageReceived' 
  | 'mention' 
  | 'messageSent' 
  | 'incomingCall' 
  | 'voiceJoin' 
  | 'voiceLeave' 
  | 'systemAlert'
  | 'mute'
  | 'unmute'
  | 'deafen'
  | 'undeafen'

class SoundEngine {
  private masterVolume: number = 0.8
  private audioCtx: AudioContext | null = null

  constructor() {
    // Carregar volume salvo se existir
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('alura_sound_master_volume')
      if (savedVol !== null) {
        this.masterVolume = Math.min(1, Math.max(0, parseFloat(savedVol) / 100))
      }
    }
  }

  public setMasterVolume(vol0to100: number) {
    this.masterVolume = Math.min(1, Math.max(0, vol0to100 / 100))
    if (typeof window !== 'undefined') {
      localStorage.setItem('alura_sound_master_volume', vol0to100.toString())
    }
  }

  public getMasterVolume(): number {
    return Math.round(this.masterVolume * 100)
  }

  private ringtoneAudio: HTMLAudioElement | null = null

  public startRingtone() {
    this.stopRingtone()
    if (this.masterVolume <= 0) return
    try {
      this.ringtoneAudio = new Audio(callRingUrl)
      this.ringtoneAudio.loop = true
      this.ringtoneAudio.volume = Math.min(1, Math.max(0, this.masterVolume * 0.7))
      this.ringtoneAudio.play().catch(err => {
        console.warn("SoundEngine: erro ao tocar ringtone:", err)
      })
    } catch (err) {
      console.warn("SoundEngine: erro ao iniciar ringtone:", err)
    }
  }

  public stopRingtone() {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause()
      this.ringtoneAudio.currentTime = 0
      this.ringtoneAudio.src = ''
      this.ringtoneAudio = null
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {})
    }
    return this.audioCtx
  }

  /**
   * Reproduz um arquivo de áudio com controle de volume
   */
  private playAudioFile(url: string, volumeScale: number = 1.0) {
    if (this.masterVolume <= 0) return
    try {
      const audio = new Audio(url)
      audio.volume = Math.min(1, Math.max(0, this.masterVolume * volumeScale))
      audio.play().catch(err => {
        console.warn("SoundEngine: áudio impedido pelo navegador:", err)
      })
    } catch (err) {
      console.warn("SoundEngine: erro ao tocar arquivo:", err)
    }
  }

  /**
   * Sintetizador moderno via Web Audio API para sons customizados
   */
  public playSynthesized(type: 'mention' | 'messageSent' | 'systemAlert') {
    if (this.masterVolume <= 0) return
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)

    if (type === 'messageSent') {
      // "Pop" sutil e suave de envio de mensagem (estilo Discord/Telegram)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)

      gainNode.gain.setValueAtTime(this.masterVolume * 0.25, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gainNode)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'mention') {
      // Acorde tríade ascendente brilhante para menção direta (@)
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const noteGain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)

        noteGain.gain.setValueAtTime(0, now)
        noteGain.gain.linearRampToValueAtTime((this.masterVolume * 0.3) / notes.length, now + idx * 0.04 + 0.02)
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35)

        osc.connect(noteGain)
        noteGain.connect(gainNode)

        osc.start(now + idx * 0.04)
        osc.stop(now + idx * 0.04 + 0.4)
      })
    } else if (type === 'systemAlert') {
      // Tom de sino suave para alertas
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)

      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

      osc.connect(gainNode)
      osc.start(now)
      osc.stop(now + 0.35)
    }
  }

  /**
   * Sons de alternância de microfone e fone
   */
  public playMicToggle(isMuted: boolean) {
    if (this.masterVolume <= 0) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    if (isMuted) {
      // Tom descendente (mutado)
      osc.frequency.setValueAtTime(480, now)
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12)
      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
    } else {
      // Tom ascendente (desmutado)
      osc.frequency.setValueAtTime(280, now)
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12)
      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
    }
    osc.connect(gainNode)
    osc.start(now)
    osc.stop(now + 0.15)
  }

  public playDeafenToggle(isDeafened: boolean) {
    if (this.masterVolume <= 0) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    if (isDeafened) {
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16)
    } else {
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.16)
    }
    gainNode.gain.setValueAtTime(this.masterVolume * 0.35, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(gainNode)
    osc.start(now)
    osc.stop(now + 0.18)
  }

  /**
   * Som de encerramento / desconexão de chamada (estilo Alura / Discord)
   */
  public playCallEnd() {
    if (this.masterVolume <= 0) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)

    // Acorde tríade descendente elegante (G4 -> E4 -> C4)
    const tones = [
      { freq: 392.00, start: 0, duration: 0.12 },    // G4
      { freq: 329.63, start: 0.08, duration: 0.12 }, // E4
      { freq: 261.63, start: 0.16, duration: 0.22 }, // C4
    ]

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      noteGain.gain.setValueAtTime(0, now + start)
      noteGain.gain.linearRampToValueAtTime(this.masterVolume * 0.35, now + start + 0.015)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

      osc.connect(noteGain)
      noteGain.connect(gainNode)

      osc.start(now + start)
      osc.stop(now + start + duration)
    })
  }

  /**
   * Sons divertidos e percussivos para o Soundboard
   */
  public playSoundboard(soundId: string) {
    if (this.masterVolume <= 0) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.masterVolume, now)
    masterGain.connect(ctx.destination)

    switch (soundId) {
      case 'applause': {
        // Síntese de palmas / aplausos
        for (let i = 0; i < 8; i++) {
          const clapTime = now + (i * 0.05) + (Math.random() * 0.02)
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(800 + Math.random() * 400, clapTime)
          gain.gain.setValueAtTime(0.2, clapTime)
          gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.08)
          osc.connect(gain)
          gain.connect(masterGain)
          osc.start(clapTime)
          osc.stop(clapTime + 0.09)
        }
        break
      }
      case 'rimshot': {
        // Ba-Dum-Tss
        // Ba
        const osc1 = ctx.createOscillator()
        const g1 = ctx.createGain()
        osc1.frequency.setValueAtTime(140, now)
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.08)
        g1.gain.setValueAtTime(0.4, now)
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
        osc1.connect(g1)
        g1.connect(masterGain)
        osc1.start(now)
        osc1.stop(now + 0.09)

        // Dum
        const t2 = now + 0.1
        const osc2 = ctx.createOscillator()
        const g2 = ctx.createGain()
        osc2.frequency.setValueAtTime(180, t2)
        osc2.frequency.exponentialRampToValueAtTime(60, t2 + 0.08)
        g2.gain.setValueAtTime(0.45, t2)
        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09)
        osc2.connect(g2)
        g2.connect(masterGain)
        osc2.start(t2)
        osc2.stop(t2 + 0.09)

        // Tss (Prato)
        const t3 = now + 0.22
        const osc3 = ctx.createOscillator()
        const g3 = ctx.createGain()
        osc3.type = 'triangle'
        osc3.frequency.setValueAtTime(2400, t3)
        g3.gain.setValueAtTime(0.35, t3)
        g3.gain.exponentialRampToValueAtTime(0.001, t3 + 0.3)
        osc3.connect(g3)
        g3.connect(masterGain)
        osc3.start(t3)
        osc3.stop(t3 + 0.3)
        break
      }
      case 'victory': {
        // Fanfarra heroica C4, E4, G4, C5
        const notes = [261.63, 329.63, 392.00, 523.25]
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.09
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(freq, t)
          gain.gain.setValueAtTime(0.2, t)
          gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.4 : 0.15))
          osc.connect(gain)
          gain.connect(masterGain)
          osc.start(t)
          osc.stop(t + (idx === 3 ? 0.42 : 0.16))
        })
        break
      }
      case 'bell': {
        // Sino límpido
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1318.5, now) // E6
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(now)
        osc.stop(now + 0.82)
        break
      }
      case 'levelup': {
        // Subida de nível rápida estilo RPG
        const freqs = [330, 392, 494, 659, 988]
        freqs.forEach((f, i) => {
          const t = now + i * 0.05
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(f, t)
          g.gain.setValueAtTime(0.25, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
          osc.connect(g)
          g.connect(masterGain)
          osc.start(t)
          osc.stop(t + 0.13)
        })
        break
      }
      case 'boing': {
        // Efeito elástico cômico
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(160, now)
        osc.frequency.linearRampToValueAtTime(450, now + 0.18)
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(now)
        osc.stop(now + 0.4)
        break
      }
      default:
        this.playSynthesized('systemAlert')
    }
  }

  // Reprodução de som específica por evento
  public play(type: SoundType) {
    switch (type) {
      case 'messageReceived':
        this.playAudioFile(msgReceivedUrl, 0.9)
        break
      case 'voiceJoin':
        this.playAudioFile(voiceJoinUrl, 0.8)
        break
      case 'voiceLeave':
        this.playAudioFile(voiceLeaveUrl, 0.8)
        break
      case 'incomingCall':
        this.playAudioFile(callRingUrl, 0.7)
        break
      case 'mention':
        this.playSynthesized('mention')
        break
      case 'messageSent':
        this.playSynthesized('messageSent')
        break
      case 'systemAlert':
        this.playSynthesized('systemAlert')
        break
      case 'mute':
        this.playMicToggle(true)
        break
      case 'unmute':
        this.playMicToggle(false)
        break
      case 'deafen':
        this.playDeafenToggle(true)
        break
      case 'undeafen':
        this.playDeafenToggle(false)
        break
    }
  }
}

export const SoundService = new SoundEngine()
