import { useState, useEffect } from 'react'
import { Monitor, AppWindow, Volume2, X } from 'lucide-react'

export interface ScreenSource {
  id: string
  name: string
  thumbnail: string
  appIcon?: string | null
  display_id?: string
}

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSource: (sourceId: string, shareAudio: boolean) => void
}

export function ScreenShareModal({ isOpen, onClose, onSelectSource }: ScreenShareModalProps) {
  const [activeTab, setActiveTab] = useState<'screen' | 'window'>('screen')
  const [sources, setSources] = useState<ScreenSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [shareAudio, setShareAudio] = useState(true)
  const [loading, setLoading] = useState(false)

  const getElectronIPC = () => {
    if (typeof window === 'undefined') return null
    return (window as any).electronIPC || (window as any).require?.('electron')?.ipcRenderer || null
  }

  useEffect(() => {
    if (!isOpen) return

    const fetchSources = async () => {
      setLoading(true)
      const ipc = getElectronIPC()
      if (ipc && ipc.invoke) {
        try {
          const res = await ipc.invoke('get-screen-sources')
          if (Array.isArray(res)) {
            setSources(res)
            // Seleciona a primeira fonte por padrão
            const firstScreen = res.find((s) => s.id.startsWith('screen:')) || res[0]
            if (firstScreen) setSelectedSourceId(firstScreen.id)
          }
        } catch (err) {
          console.error('[ScreenShareModal] Erro ao buscar fontes:', err)
        }
      }
      setLoading(false)
    }

    fetchSources()
  }, [isOpen])

  if (!isOpen) return null

  const screens = sources.filter((s) => s.id.startsWith('screen:'))
  const windows = sources.filter((s) => !s.id.startsWith('screen:'))
  const currentList = activeTab === 'screen' ? screens : windows

  const handleConfirm = () => {
    if (!selectedSourceId) return
    onSelectSource(selectedSourceId, shareAudio)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-alura-surface1 border border-alura-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-alura-border bg-alura-surface2/50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-alura-textPrimary flex items-center gap-2">
              <Monitor className="w-5 h-5 text-alura-accent" />
              Compartilhar sua tela
            </h2>
            <p className="text-xs text-alura-textSecondary mt-0.5">
              Escolha uma tela inteira ou janela de aplicativo para transmitir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-alura-textMuted hover:text-white hover:bg-alura-surface3 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-alura-border px-6 pt-2 gap-4 bg-alura-surface1 shrink-0">
          <button
            onClick={() => {
              setActiveTab('screen')
              const first = screens[0]
              if (first) setSelectedSourceId(first.id)
            }}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'screen'
                ? 'border-alura-accent text-white'
                : 'border-transparent text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            <Monitor size={16} />
            <span>Telas ({screens.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('window')
              const first = windows[0]
              if (first) setSelectedSourceId(first.id)
            }}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'window'
                ? 'border-alura-accent text-white'
                : 'border-transparent text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            <AppWindow size={16} />
            <span>Janelas ({windows.length})</span>
          </button>
        </div>

        {/* Grid de Fontes ou Opções Web */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-xs text-alura-textMuted flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-alura-accent border-t-transparent rounded-full animate-spin" />
              <span>Carregando janelas e telas disponíveis...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col gap-4 py-4">
              <p className="text-xs text-alura-textSecondary">
                Selecione o modo de compartilhamento abaixo para iniciar a transmissão:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedSourceId('web:screen')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2.5 bg-alura-surface2 ${
                    selectedSourceId === 'web:screen' || !selectedSourceId
                      ? 'border-alura-accent ring-2 ring-alura-accent/30 shadow-lg'
                      : 'border-alura-border hover:border-alura-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-alura-accent/15 text-alura-accent flex items-center justify-center">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-alura-textPrimary">Tela Inteira</h4>
                      <p className="text-[11px] text-alura-textMuted">Jogos, desktop e telas cheias</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedSourceId('web:window')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2.5 bg-alura-surface2 ${
                    selectedSourceId === 'web:window'
                      ? 'border-alura-accent ring-2 ring-alura-accent/30 shadow-lg'
                      : 'border-alura-border hover:border-alura-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-alura-accent/15 text-alura-accent flex items-center justify-center">
                      <AppWindow size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-alura-textPrimary">Janela de Aplicativo</h4>
                      <p className="text-[11px] text-alura-textMuted">Programas e navegadores</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {currentList.map((source) => {
                const isSelected = selectedSourceId === source.id
                return (
                  <div
                    key={source.id}
                    onClick={() => setSelectedSourceId(source.id)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col bg-alura-surface2 ${
                      isSelected
                        ? 'border-alura-accent ring-2 ring-alura-accent/30 shadow-lg'
                        : 'border-alura-border hover:border-alura-border/80 hover:bg-alura-surface3/40'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="aspect-video w-full bg-black/40 overflow-hidden flex items-center justify-center relative">
                      {source.thumbnail ? (
                        <img
                          src={source.thumbnail}
                          alt={source.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <Monitor size={32} className="text-alura-textDisabled" />
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-alura-accent text-white flex items-center justify-center text-xs font-bold shadow-md">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Nome / Título */}
                    <div className="p-2.5 flex items-center gap-2 min-w-0">
                      {source.appIcon && (
                        <img src={source.appIcon} alt="" className="w-4 h-4 shrink-0 rounded" />
                      )}
                      <span className="text-xs font-semibold text-alura-textPrimary truncate" title={source.name}>
                        {source.name}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer com Checkbox de Áudio e Botões */}
        <div className="px-6 py-4 border-t border-alura-border bg-alura-surface2/60 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shareAudio}
              onChange={(e) => setShareAudio(e.target.checked)}
              className="w-4 h-4 rounded border-alura-border text-alura-accent focus:ring-alura-accent/30 bg-alura-surface3 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <Volume2 size={15} className="text-alura-accent" />
              <span className="text-xs font-semibold text-alura-textPrimary">
                Compartilhar áudio do sistema (jogos/vídeos)
              </span>
            </div>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-alura-textSecondary hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSourceId && currentList.length > 0}
              className="px-5 py-2 text-xs font-bold bg-alura-accent text-white rounded-xl hover:bg-alura-accentHover disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(var(--alura-accent-rgb),0.35)] transition-all cursor-pointer"
            >
              Compartilhar Tela
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
