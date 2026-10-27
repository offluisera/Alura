import { useEffect, useState, useRef } from 'react'

/**
 * Hook para detecção de atividade de voz (VAD) em tempo real via Web Audio API.
 * Faz a borda do avatar acender quando o usuário ou participante remoto estiver falando.
 */
export function useVoiceActivity(stream: MediaStream | null, isMuted: boolean = false): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!stream || isMuted) {
      setIsSpeaking(false)
      return
    }

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0 || !audioTracks[0].enabled) {
      setIsSpeaking(false)
      return
    }

    let audioCtx: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let animationId: number | null = null
    let isMounted = true

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return

      audioCtx = new AudioContextClass()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.4

      source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkAudio = () => {
        if (!isMounted || !analyser) return

        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength

        // Limiar calibrado para fala humana (~12 em 255)
        if (average > 12) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
          }
          setIsSpeaking(true)
        } else {
          // Debounce de 350ms para manter a borda iluminada suavemente entre palavras
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (isMounted) setIsSpeaking(false)
              silenceTimerRef.current = null
            }, 350)
          }
        }

        animationId = requestAnimationFrame(checkAudio)
      }

      checkAudio()
    } catch (err) {
      console.warn('[useVoiceActivity] Erro ao inicializar AudioContext:', err)
    }

    return () => {
      isMounted = false
      if (animationId) cancelAnimationFrame(animationId)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      try {
        source?.disconnect()
        analyser?.disconnect()
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {})
        }
      } catch {}
    }
  }, [stream, isMuted])

  return isSpeaking
}
