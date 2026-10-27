import React from 'react'
import { Radio, Mic, MicOff, Headphones, VolumeX, PhoneOff } from 'lucide-react'
import { useCall } from '../../contexts/CallContext'

export function VoiceConnectionCard({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { serverVoiceConnection } = useCall()

  if (!serverVoiceConnection) return null

  if (isCollapsed) {
    return (
      <div className="p-2 border-t border-[var(--border)] bg-[var(--card)] flex flex-col items-center gap-2 select-none">
        <button
          type="button"
          onClick={serverVoiceConnection.openVoiceRoom}
          className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          title={`Voz conectada: #${serverVoiceConnection.roomName}`}
        >
          <Radio size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            serverVoiceConnection.disconnect()
          }}
          className="w-8 h-8 rounded-lg bg-[rgba(240,71,71,0.15)] text-[var(--dnd)] hover:bg-[rgba(240,71,71,0.25)] flex items-center justify-center transition-colors cursor-pointer"
          title="Desconectar da Voz"
        >
          <PhoneOff size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="voice-card">
      {/* Informações da Sala e Conexão */}
      <button
        type="button"
        onClick={serverVoiceConnection.openVoiceRoom}
        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer bg-transparent border-0 p-0"
        title="Clique para abrir a chamada"
      >
        {/* Barras de Sinal RTC */}
        <div className="bars" aria-label="Sinal RTC">
          <span />
          <span />
          <span />
        </div>

        {/* Textos */}
        <div className="info">
          <div className="status-line">
            Voz conectada
          </div>
          <div className="chan-sub">
            #{serverVoiceConnection.roomName} / {serverVoiceConnection.serverName}
          </div>
          <div className="ms">
            {serverVoiceConnection.ping || 18}ms RTC
          </div>
        </div>
      </button>

      {/* Controles Rápidos */}
      <div className="controls">
        {serverVoiceConnection.toggleMute && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              serverVoiceConnection.toggleMute?.()
            }}
            className={`ctrl-btn ${serverVoiceConnection.isMuted ? 'hang' : ''}`}
            title={serverVoiceConnection.isMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
          >
            {serverVoiceConnection.isMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}

        {serverVoiceConnection.toggleDeafen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              serverVoiceConnection.toggleDeafen?.()
            }}
            className={`ctrl-btn ${serverVoiceConnection.isDeafened ? 'hang' : ''}`}
            title={serverVoiceConnection.isDeafened ? 'Ativar Áudio' : 'Desativar Áudio'}
          >
            {serverVoiceConnection.isDeafened ? <VolumeX size={15} /> : <Headphones size={15} />}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            serverVoiceConnection.disconnect()
          }}
          className="ctrl-btn hang"
          title="Desconectar da Voz"
        >
          <PhoneOff size={15} />
        </button>
      </div>
    </div>
  )
}

