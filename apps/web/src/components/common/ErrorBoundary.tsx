import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Alura ErrorBoundary capturou um erro:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = "#/"
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-[#001609] text-center select-none animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-alura-surface1 border border-alura-border/60 flex items-center justify-center shadow-lg shadow-black/40 mb-5">
            <AlertTriangle className="w-8 h-8 text-alura-accent animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {this.props.fallbackTitle || "Ops! Algo inesperado aconteceu"}
          </h2>
          
          <p className="text-xs text-alura-textMuted max-w-md mt-2 leading-relaxed">
            Ocorreu uma inconsistência temporária na interface. Os seus dados e preferências estão seguros.
          </p>

          {this.state.error && (
            <div className="mt-4 px-3.5 py-2 rounded-lg bg-black/40 border border-alura-border/40 text-[11px] text-alura-textSecondary max-w-md font-mono truncate">
              {this.state.error.message || "Erro desconhecido"}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-[#0B0D0F] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recarregar Página
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-alura-hover border border-alura-border text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-alura-textMuted" /> Voltar ao Início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
