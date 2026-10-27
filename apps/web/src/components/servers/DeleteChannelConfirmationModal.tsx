import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export interface DeleteChannelConfirmationModalProps {
  isOpen: boolean
  title?: string
  targetName: string
  targetType: 'canal' | 'espaço'
  onConfirm: () => void
  onClose: () => void
  isDeleting?: boolean
}

export function DeleteChannelConfirmationModal({
  isOpen,
  title,
  targetName,
  targetType,
  onConfirm,
  onClose,
  isDeleting = false,
}: DeleteChannelConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-md p-6 rounded-3xl bg-alura-surface1 border border-red-500/40 shadow-[0_24px_60px_rgba(0,0,0,0.9)] space-y-5 animate-in zoom-in-95 duration-150 text-alura-textPrimary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-alura-textPrimary">
                {title || `Excluir ${targetType === 'canal' ? 'Canal' : 'Espaço'}`}
              </h3>
              <p className="text-xs text-alura-textMuted">Ação destrutiva irreversível</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-alura-surface2 border border-alura-border text-xs text-alura-textSecondary leading-relaxed space-y-1">
          <p>
            Tem certeza de que deseja excluir o {targetType}{' '}
            <strong className="text-alura-textPrimary font-mono font-bold">
              "{targetName}"
            </strong>
            ?
          </p>
          <p className="text-[11px] text-red-400/90 font-semibold">
            {targetType === 'canal'
              ? 'Todas as mensagens, anexos e histórico deste canal serão apagados permanentemente.'
              : 'Todos os canais contidos dentro deste espaço serão apagados em cascata.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2 cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-red-500/25 flex items-center gap-1.5"
          >
            {isDeleting && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Confirmar Exclusão</span>
          </button>
        </div>
      </div>
    </div>
  )
}
