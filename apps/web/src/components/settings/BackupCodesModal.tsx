import { useState } from "react"
import { ShieldCheck, Copy, Check, Download, RefreshCw, X } from "lucide-react"
import { TwoFactorService } from "../../lib/services/TwoFactorService"

interface BackupCodesModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  initialCodes: string[]
  onCodesUpdated: (newCodes: string[]) => void
}

export function BackupCodesModal({
  isOpen,
  onClose,
  userId,
  initialCodes,
  onCodesUpdated
}: BackupCodesModalProps) {
  const [codes, setCodes] = useState<string[]>(initialCodes)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    const text = `CÓDIGOS DE RECUPERAÇÃO ALURA (2FA):\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      `\n\nGuarde em local seguro. Cada código só pode ser utilizado uma única vez.`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownload = () => {
    const text = `=========================================\n` +
      `ALURA - CÓDIGOS DE RECUPERAÇÃO EM DUAS ETAPAS (2FA)\n` +
      `=========================================\n\n` +
      `Data: ${new Date().toLocaleString("pt-BR")}\n\n` +
      `Cada código é de uso único. Guarde em local protegido.\n\n` +
      codes.map((c, i) => `[ ] ${i + 1}. ${c}`).join("\n") +
      `\n\n=========================================\n`
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alura-codigos-recuperacao-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRegenerate = async () => {
    if (!window.confirm("Gerar novos códigos invalidará os códigos anteriores. Deseja continuar?")) {
      return
    }
    setRegenerating(true)
    const newCodes = await TwoFactorService.regenerateBackupCodes(userId)
    setCodes(newCodes)
    onCodesUpdated(newCodes)
    setRegenerating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#001609] border border-alura-border rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-alura-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-alura-surface2 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white">Códigos de Recuperação</h3>
              <span className="text-[11px] text-alura-textMuted">Backup de segurança 2FA</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-white/10 text-alura-textMuted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-alura-textMuted leading-relaxed">
          Estes códigos permitem que você acesse sua conta caso perca o smartphone ou não consiga abrir seu aplicativo autenticador.
        </p>

        <div className="p-4 rounded-xl bg-alura-surface2 border border-alura-border">
          {codes.length === 0 ? (
            <div className="text-center py-4 text-xs text-alura-textMuted">
              Nenhum código ativo no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {codes.map((c, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-alura-surface1 border border-alura-border/60 text-center font-mono text-xs font-bold text-white select-all tracking-wider"
                >
                  <span className="text-[10px] text-alura-textMuted mr-1.5">{idx + 1}.</span>
                  {c}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-alura-border/40 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-alura-surface3 hover:bg-alura-hover border border-alura-border text-xs text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-alura-accent" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-alura-surface3 hover:bg-alura-hover border border-alura-border text-xs text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-alura-accent" /> Baixar
              </button>
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 text-alura-textMuted hover:text-alura-accent text-[11px] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
              Gerar Novos
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-alura-surface2 hover:bg-alura-hover border border-alura-border text-white text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
