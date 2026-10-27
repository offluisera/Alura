import React, { useState } from 'react'
import { X, BarChart2, Plus, Trash2, Clock, CheckSquare } from 'lucide-react'

export interface PollData {
  question: string
  options: string[]
  durationHours: number
  allowMultiple: boolean
}

export interface CreatePollModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pollData: PollData) => void
}

export function CreatePollModal({ isOpen, onClose, onSubmit }: CreatePollModalProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [durationHours, setDurationHours] = useState(24)
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddOption = () => {
    if (options.length >= 10) return
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options]
    updated[index] = val
    setOptions(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!question.trim()) {
      setError('Por favor, digite a pergunta da enquete.')
      return
    }

    const validOptions = options.map((o) => o.trim()).filter(Boolean)
    if (validOptions.length < 2) {
      setError('A enquete precisa de no mínimo 2 opções preenchidas.')
      return
    }

    onSubmit({
      question: question.trim(),
      options: validOptions,
      durationHours,
      allowMultiple,
    })

    // Reset
    setQuestion('')
    setOptions(['', ''])
    setDurationHours(24)
    setAllowMultiple(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-alura-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-alura-textPrimary tracking-tight">
                Criar Enquete
              </h3>
              <p className="text-xs text-alura-textMuted">
                Faça uma pergunta para a comunidade votar em tempo real.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pergunta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
              Pergunta da Enquete *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="O que você gostaria de perguntar?"
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs sm:text-sm font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-accent transition-colors"
            />
          </div>

          {/* Opções */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider flex items-center justify-between">
              <span>Opções de Voto ({options.length}/10)</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-alura-textMuted w-4 text-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Opção ${idx + 1}`}
                    maxLength={100}
                    className="flex-1 px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary focus:outline-none focus:border-alura-accent transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 rounded-lg text-alura-textMuted hover:text-red-400 hover:bg-alura-surface3 transition-colors cursor-pointer"
                      title="Remover opção"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2 rounded-xl border border-dashed border-alura-border hover:border-alura-accent/50 bg-alura-surface2/40 hover:bg-alura-surface2 text-xs font-bold text-alura-accent flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar Opção</span>
              </button>
            )}
          </div>

          {/* Configurações extras: Duração e Múltipla Escolha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} className="text-alura-accent" />
                <span>Duração</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-xs font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-accent transition-colors cursor-pointer"
              >
                <option value={1}>1 hora</option>
                <option value={4}>4 horas</option>
                <option value={8}>8 horas</option>
                <option value={24}>24 horas (1 dia)</option>
                <option value={72}>3 dias</option>
                <option value={168}>1 semana</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-alura-surface2/60 border border-alura-border mt-auto">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-alura-textPrimary block">
                  Múltiplas respostas
                </span>
                <span className="text-[10px] text-alura-textMuted">
                  Permite votar em mais de uma opção
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-alura-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-textSecondary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 text-xs font-black transition-all shadow-md cursor-pointer"
            >
              Criar Enquete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
