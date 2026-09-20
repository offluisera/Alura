import { AlertTriangle, X } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel,
  isDanger = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-alura-surface2 border border-alura-border rounded-[24px] w-full max-w-[420px] p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow de fundo */}
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 ${isDanger ? 'bg-alura-danger' : 'bg-alura-accent'}`}></div>

        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-alura-surface3 text-alura-textSecondary hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-[16px] flex items-center justify-center mb-6 shadow-lg ${isDanger ? 'bg-[#1A0A0A] text-alura-danger border border-alura-danger/20' : 'bg-alura-selected text-alura-accent border border-alura-accent/20'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-[20px] font-bold text-white mb-3 leading-tight">{title}</h2>
          <p className="text-[15px] text-alura-textSecondary leading-relaxed mb-8">{message}</p>

          <div className="flex w-full gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 h-12 rounded-[12px] bg-transparent border border-alura-border text-alura-textPrimary font-bold hover:bg-alura-hover transition-all"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 h-12 rounded-[12px] font-bold text-[#0B0D0F] transition-all ${isDanger ? 'bg-alura-danger hover:brightness-110' : 'bg-alura-accent hover:brightness-110'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
