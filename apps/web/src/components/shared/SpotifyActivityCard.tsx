import React, { useState, useEffect } from "react"
import { ExternalLink, Disc3, Music2, Volume2, Pause, Play } from "lucide-react"
import type { SpotifyTrack } from "../../lib/services/SpotifyService"

interface SpotifyActivityCardProps {
  track: SpotifyTrack | null | undefined
  compact?: boolean
  className?: string
  showBadge?: boolean
  userName?: string
}

/**
 * Ícone SVG oficial do Spotify
 */
export function SpotifyIcon({ className = "w-4 h-4", color = "#1DB954" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

/**
 * Formatador de milissegundos para MM:SS
 */
function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0:00"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

export function SpotifyActivityCard({
  track,
  compact = false,
  className = "",
  showBadge = true,
  userName
}: SpotifyActivityCardProps) {
  const [currentProgress, setCurrentProgress] = useState(track?.progressMs || 0)

  // Simula avanço suave do relógio de progresso enquanto a música toca
  useEffect(() => {
    if (!track?.isPlaying) {
      setCurrentProgress(track?.progressMs || 0)
      return
    }

    setCurrentProgress(track.progressMs || 0)
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (track.durationMs && prev >= track.durationMs) {
          return track.durationMs
        }
        return prev + 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [track?.trackName, track?.progressMs, track?.isPlaying, track?.durationMs])

  if (!track || !track.isPlaying) {
    return null
  }

  const duration = track.durationMs || 1
  const progressPercent = Math.min(100, Math.max(0, (currentProgress / duration) * 100))

  // MODO COMPACTO (Para uso em listas de amigos, popovers ou cards menores)
  if (compact) {
    return (
      <div className={`p-2.5 rounded-xl bg-alura-surface1/80 border border-alura-border backdrop-blur-md flex items-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all ${className}`}>
        {/* Capa com overlay do Spotify */}
        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm group">
          {track.albumArt ? (
            <img src={track.albumArt} alt={track.albumName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-alura-surface2 flex items-center justify-center text-[#1DB954]">
              <Disc3 className="w-5 h-5 animate-spin duration-3000" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <SpotifyIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Informações da música */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <SpotifyIcon className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#39FF88]/90">
              Ouvindo no Spotify
            </span>
          </div>
          <a
            href={track.trackUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-bold text-white hover:text-[#39FF88] transition-colors truncate block mt-0.5"
            title={track.trackName}
          >
            {track.trackName}
          </a>
          <p className="text-[11px] text-alura-textSecondary truncate">
            {track.artistName}
          </p>
        </div>

        {/* Barras de equalizador animadas */}
        <div className="flex items-end gap-0.5 h-4 shrink-0 px-1">
          <span className="w-0.5 bg-[#39FF88] rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-3" />
          <span className="w-0.5 bg-[#39FF88] rounded-full animate-[bounce_1.1s_ease-in-out_infinite_0.2s] h-4" />
          <span className="w-0.5 bg-[#39FF88] rounded-full animate-[bounce_0.9s_ease-in-out_infinite_0.4s] h-2.5" />
          <span className="w-0.5 bg-[#39FF88] rounded-full animate-[bounce_1.2s_ease-in-out_infinite_0.1s] h-3.5" />
        </div>
      </div>
    )
  }

  // MODO COMPLETO (Para Profile, Settings e visualização rica)
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#004B1F]/60 bg-gradient-to-br from-[#001B0B]/95 via-[#001609]/95 to-[#00220E]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl ${className}`}>
      
      {/* Brilho de fundo temático Spotify / Alura Verde */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#39FF88]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header do Card com Status e Equalizador */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center shadow-[0_0_12px_rgba(29,185,84,0.25)]">
            <SpotifyIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#39FF88]">
                {userName ? `${userName} está ouvindo` : "Ouvindo no Spotify"}
              </span>
              {showBadge && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[9px] font-mono text-[#39FF88] uppercase">
                  Ao Vivo
                </span>
              )}
            </div>
            <p className="text-[11px] text-alura-textMuted">Atividade em tempo real</p>
          </div>
        </div>

        {/* Visualizador de ondas sonoras / Equalizador verde */}
        <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-lg bg-black/40 border border-white/5">
          <span className="w-1 bg-[#39FF88] rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3 shadow-[0_0_6px_#39FF88]" />
          <span className="w-1 bg-[#39FF88] rounded-full animate-[pulse_1.1s_ease-in-out_infinite_0.2s] h-5 shadow-[0_0_6px_#39FF88]" />
          <span className="w-1 bg-[#39FF88] rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-2.5 shadow-[0_0_6px_#39FF88]" />
          <span className="w-1 bg-[#39FF88] rounded-full animate-[pulse_1.3s_ease-in-out_infinite_0.1s] h-4 shadow-[0_0_6px_#39FF88]" />
          <span className="w-1 bg-[#39FF88] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.3s] h-3 shadow-[0_0_6px_#39FF88]" />
        </div>
      </div>

      {/* Conteúdo Central: Capa do Álbum + Metadados */}
      <div className="flex items-center gap-4 relative z-10 mb-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-xl group">
          {track.albumArt ? (
            <img 
              src={track.albumArt} 
              alt={track.albumName || track.trackName} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-alura-surface2 flex items-center justify-center text-alura-accent">
              <Disc3 className="w-8 h-8 animate-spin duration-3000" />
            </div>
          )}

          {/* Botão de abrir no Spotify sobre a capa */}
          <a
            href={track.trackUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            title="Abrir no Spotify"
          >
            <ExternalLink className="w-5 h-5 text-alura-accent" />
          </a>
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={track.trackUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-bold text-white hover:text-alura-accent transition-colors truncate block leading-snug tracking-tight"
            title={track.trackName}
          >
            {track.trackName}
          </a>

          <p className="text-[13px] text-alura-textSecondary truncate mt-0.5 font-medium">
            por <span className="text-white/90">{track.artistName}</span>
          </p>

          {track.albumName && (
            <p className="text-[11px] text-alura-textMuted truncate mt-1 flex items-center gap-1.5">
              <Disc3 className="w-3 h-3 text-[#39FF88]/70 shrink-0" />
              <span>{track.albumName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Barra de Progresso com Contadores de Tempo */}
      <div className="space-y-1.5 relative z-10">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#1DB954] to-[#39FF88] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(57,255,136,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-alura-textMuted">
          <span>{formatDuration(currentProgress)}</span>
          <span>{formatDuration(track.durationMs)}</span>
        </div>
      </div>

      {/* Rodapé com Link Externo */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
        <span className="text-[10px] text-alura-textMuted flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-[#39FF88]" />
          Reproduzindo em alta fidelidade
        </span>

        <a
          href={track.trackUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#39FF88] hover:text-white transition-colors cursor-pointer"
        >
          <span>Ouvir no Spotify</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </div>
  )
}
