import React, { useState, useEffect } from 'react'
import { X, Monitor, Layers, Volume2, VolumeX, Sparkles, Check } from 'lucide-react'

export interface ScreenSource {
  id: string
  name: string
  thumbnail: string
  appIcon?: string | null
  display_id?: string
}

export interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onStartShare?: (stream: MediaStream) => void
  onSelectSource?: (sourceId: string, withAudio: boolean) => void
}

export function ScreenShareModal({ isOpen, onClose, onStartShare, onSelectSource }: ScreenShareModalProps) {
  const [sources, setSources] = useState<ScreenSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'screens' | 'windows'>('screens')
  const [includeAudio, setIncludeAudio] = useState(true)
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p')
  const [fps, setFps] = useState<30 | 60>(60)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isElectron = Boolean(
    typeof window !== 'undefined' &&
      ((window as any).electronIPC?.isElectron?.() ||
        (window as any).electronAPI ||
        (window as any).isElectron ||
        (window as any).ipcRenderer)
  )

  // Carrega fontes de telas e janelas
  useEffect(() => {
    if (!isOpen) return

    const loadSources = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (isElectron) {
          const ipc = (window as any).electronIPC || (window as any).electronAPI
          if (ipc?.invoke) {
            const res = await ipc.invoke('get-screen-sources')
            if (Array.isArray(res) && res.length > 0) {
              setSources(res)
              setSelectedSourceId(res[0].id)
            }
          }
        }
      } catch (err: any) {
        console.error('Erro ao obter fontes de tela:', err)
        setError('Não foi possível listar as janelas e telas.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSources()
  }, [isOpen, isElectron])

  if (!isOpen) return null

  // Filtra por Telas ou Janelas
  const screens = sources.filter((s) => s.id.startsWith('screen:') || s.name.toLowerCase().includes('screen') || s.name.toLowerCase().includes('tela'))
  const windows = sources.filter((s) => !screens.some((sc) => sc.id === s.id))
  const displayedSources = activeTab === 'screens' ? (screens.length > 0 ? screens : sources) : windows

  const handleConfirmShare = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (isElectron && selectedSourceId && onSelectSource) {
        onSelectSource(selectedSourceId, includeAudio)
        onClose()
        return
      }

      let stream: MediaStream

      if (isElectron && selectedSourceId) {
        // Captura direta pelo ID da janela/tela selecionada no Electron
        const maxW = resolution === '1080p' ? 1920 : 1280
        const maxH = resolution === '1080p' ? 1080 : 720

        let captured: MediaStream | null = null

        if (includeAudio) {
          try {
            captured = await (navigator.mediaDevices as any).getUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                },
              },
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: selectedSourceId,
                  maxWidth: maxW,
                  maxHeight: maxH,
                  maxFrameRate: fps,
                },
              },
            })
          } catch (audioErr) {
            console.warn('[ScreenShareModal] Falha na captura com áudio desktop, tentando apenas vídeo:', audioErr)
          }
        }

        if (!captured) {
          captured = await (navigator.mediaDevices as any).getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: selectedSourceId,
                maxWidth: maxW,
                maxHeight: maxH,
                maxFrameRate: fps,
              },
            },
          })
        }

        stream = captured
      } else {
        // Navegador web comum
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: resolution === '1080p' ? 1920 : 1280,
            height: resolution === '1080p' ? 1080 : 720,
            frameRate: fps,
          },
          audio: includeAudio,
        })
      }

      if (onStartShare) {
        onStartShare(stream)
      }
      onClose()
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Erro ao iniciar compartilhamento:', err)
        setError(err.message || 'Falha ao iniciar compartilhamento de tela.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-alura-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
              <Monitor size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-alura-textPrimary tracking-tight">
                Compartilhar Tela
              </h3>
              <p className="text-xs text-alura-textMuted">
                Selecione o que deseja transmitir e configure a qualidade.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-alura-surface2 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* Abas Telas vs Janelas */}
        {isElectron && (
          <div className="flex items-center gap-2 bg-alura-surface2 p-1 rounded-2xl border border-alura-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('screens')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'screens'
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted hover:text-alura-textPrimary'
              }`}
            >
              <Monitor size={14} />
              <span>Telas Inteiras ({screens.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'windows'
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted hover:text-alura-textPrimary'
              }`}
            >
              <Layers size={14} />
              <span>Janelas de Aplicativos ({windows.length})</span>
            </button>
          </div>
        )}

        {/* Grade de Telas/Janelas com Thumbnails */}
        {isElectron && (
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-alura-textMuted space-y-2">
                <div className="w-6 h-6 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Carregando janelas abertas...</span>
              </div>
            ) : displayedSources.length === 0 ? (
              <div className="text-center py-12 text-xs text-alura-textMuted">
                Nenhuma janela encontrada nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayedSources.map((source) => {
                  const isSelected = selectedSourceId === source.id

                  return (
                    <div
                      key={source.id}
                      onClick={() => setSelectedSourceId(source.id)}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-alura-surface2 flex flex-col ${
                        isSelected
                          ? 'border-alura-accent ring-2 ring-alura-accent/30 shadow-lg'
                          : 'border-alura-border hover:border-alura-borderStrong hover:bg-alura-surface3'
                      }`}
                    >
                      {/* Thumbnail com aspect ratio 16:9 */}
                      <div className="aspect-video w-full bg-black/40 overflow-hidden relative flex items-center justify-center">
                        {source.thumbnail ? (
                          <img
                            src={source.thumbnail}
                            alt={source.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Monitor size={24} className="text-alura-textMuted" />
                        )}

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-alura-accent text-alura-surface0 flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Nome da Janela / App */}
                      <div className="p-2 flex items-center gap-1.5 min-w-0">
                        {source.appIcon && (
                          <img src={source.appIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="text-[11px] font-bold text-alura-textPrimary truncate">
                          {source.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {!isElectron && (
          <div className="p-4 rounded-2xl bg-alura-surface2/70 border border-alura-border flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent shrink-0">
              <Monitor size={20} />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-alura-textPrimary">
                Transmissão via Navegador Web
              </p>
              <p className="text-alura-textMuted leading-relaxed">
                Ao clicar em <span className="text-alura-accent font-semibold">Iniciar Transmissão</span>, seu navegador exibirá a janela nativa para você escolher entre <strong>Telas Inteiras</strong>, <strong>Janelas de Aplicativos</strong> ou <strong>Guias</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Configurações Adicionais: Áudio do Sistema, Qualidade e FPS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-alura-border">
          {/* Toggle de Áudio */}
          <div
            onClick={() => setIncludeAudio((v) => !v)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              includeAudio
                ? 'bg-alura-selected border-alura-accent/60 text-white'
                : 'bg-alura-surface2/60 border-alura-border text-alura-textMuted'
            }`}
          >
            <div className="flex items-center gap-2">
              {includeAudio ? (
                <Volume2 size={16} className="text-alura-accent" />
              ) : (
                <VolumeX size={16} className="text-alura-textMuted" />
              )}
              <span className="text-xs font-bold">
                {includeAudio ? 'Com áudio' : 'Sem áudio'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeAudio}
              onChange={() => {}}
              className="w-4 h-4 accent-emerald-500 rounded pointer-events-none"
            />
          </div>

          {/* Resolução */}
          <div className="flex items-center gap-1 bg-alura-surface2 p-1 rounded-2xl border border-alura-border">
            <button
              type="button"
              onClick={() => setResolution('720p')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                resolution === '720p'
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted'
              }`}
            >
              720p
            </button>
            <button
              type="button"
              onClick={() => setResolution('1080p')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                resolution === '1080p'
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted'
              }`}
            >
              1080p HD
            </button>
          </div>

          {/* Taxa de Quadros (FPS) */}
          <div className="flex items-center gap-1 bg-alura-surface2 p-1 rounded-2xl border border-alura-border">
            <button
              type="button"
              onClick={() => setFps(30)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fps === 30
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted'
              }`}
            >
              30 FPS
            </button>
            <button
              type="button"
              onClick={() => setFps(60)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fps === 60
                  ? 'bg-alura-selected text-alura-accent shadow-sm'
                  : 'text-alura-textMuted'
              }`}
            >
              60 FPS
            </button>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-alura-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-textSecondary transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmShare}
            disabled={isLoading || (isElectron && !selectedSourceId)}
            className="px-5 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover disabled:opacity-50 text-alura-surface0 text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>{isLoading ? 'Conectando...' : 'Iniciar Transmissão'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScreenShareModal
