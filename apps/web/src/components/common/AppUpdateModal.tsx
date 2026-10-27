import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Wrench, Check, ArrowRight, PartyPopper } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export type ChangeType = 'novidade' | 'melhoria' | 'correcao'

export interface ChangeItem {
  type: ChangeType
  title: string
  description: string
}

export interface AppRelease {
  id: string
  version: string
  title: string
  tagline?: string
  release_notes?: string
  changes?: ChangeItem[]
  download_url: string
  is_active: boolean
  created_at: string
}

const STORAGE_KEY = 'alura_seen_release_version'

export const AppUpdateModal: React.FC = () => {
  const [release, setRelease] = useState<AppRelease | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    async function checkReleaseNotes() {
      try {
        const { data, error } = await supabase
          .from('app_versions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error || !data) return

        const activeRelease = data as AppRelease
        const seenVersion = localStorage.getItem(STORAGE_KEY)

        // Se o usuário ainda não viu as notas desta versão, exibe apenas uma vez
        if (seenVersion !== activeRelease.version) {
          setRelease(activeRelease)
          setIsOpen(true)
        }
      } catch (err) {
        console.warn('[ReleaseNotes] Erro ao carregar informe da versão:', err)
      }
    }

    checkReleaseNotes()
  }, [])

  const handleDismiss = () => {
    if (release) {
      localStorage.setItem(STORAGE_KEY, release.version)
    }
    setIsOpen(false)
  }

  if (!isOpen || !release) return null

  // Processa itens de mudanças (seja pelo array estruturado ou fallback de parse markdown)
  let changeItems: ChangeItem[] = []
  if (Array.isArray(release.changes) && release.changes.length > 0) {
    changeItems = release.changes
  } else if (release.release_notes) {
    // Parser inteligente de markdown para versões antigas
    const lines = release.release_notes.split('\n')
    let currentType: ChangeType = 'novidade'

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.toLowerCase().includes('novidade') || trimmed.includes('###') && trimmed.includes('Chat')) {
        currentType = 'novidade'
      } else if (trimmed.toLowerCase().includes('melhoria') || trimmed.includes('Otimiza')) {
        currentType = 'melhoria'
      } else if (trimmed.toLowerCase().includes('corre')) {
        currentType = 'correcao'
      } else if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
        const match = trimmed.match(/^[-*]\s*\*\*(.*?)\*\*:?\s*(.*)$/)
        if (match) {
          changeItems.push({
            type: currentType,
            title: match[1],
            description: match[2] || ''
          })
        }
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.substring(2)
        if (text.length > 4) {
          changeItems.push({
            type: currentType,
            title: text.split(':')[0],
            description: text.includes(':') ? text.split(':').slice(1).join(':').trim() : ''
          })
        }
      }
    }
  }

  // Fallback caso não haja itens explícitos
  if (changeItems.length === 0 && release.release_notes) {
    changeItems.push({
      type: 'melhoria',
      title: release.title || `Atualização v${release.version}`,
      description: release.release_notes
    })
  }

  const renderBadge = (type: ChangeType) => {
    switch (type) {
      case 'novidade':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-alura-accent/15 text-alura-accent border border-alura-accent/30 shrink-0">
            <Sparkles className="w-3 h-3" />
            Novidade
          </span>
        )
      case 'melhoria':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Zap className="w-3 h-3" />
            Melhoria
          </span>
        )
      case 'correcao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Wrench className="w-3 h-3" />
            Correção
          </span>
        )
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-alura-borderStrong bg-alura-surface1 p-6 md:p-8 shadow-2xl shadow-black/80 flex flex-col max-h-[88vh]"
        >
          {/* Brilho decorativo no tema do usuário */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-alura-accent/10 blur-3xl pointer-events-none" />

          {/* Cabeçalho */}
          <div className="flex items-start gap-4 mb-6 shrink-0">
            <div className="h-12 w-12 rounded-2xl bg-alura-surface2 border border-alura-borderStrong flex items-center justify-center text-alura-accent shadow-inner shrink-0">
              <PartyPopper className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-alura-selected text-alura-accent border border-alura-borderStrong">
                  v{release.version}
                </span>
                <span className="text-xs text-alura-textMuted font-medium">
                  {new Date(release.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-alura-textPrimary tracking-tight">
                {release.title || 'O que há de novo na Alura'}
              </h2>
              {release.tagline && (
                <p className="text-xs text-alura-textSecondary mt-1 leading-relaxed">
                  {release.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Lista de Novidades e Atualizações (Formato idêntico ao site) */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar mb-6">
            {changeItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-alura-border bg-alura-surface2/60 hover:bg-alura-surface2 hover:border-alura-borderStrong transition-all group"
              >
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  {renderBadge(item.type)}
                  <h4 className="text-sm font-bold text-alura-textPrimary group-hover:text-alura-accent transition-colors">
                    {item.title}
                  </h4>
                </div>
                {item.description && (
                  <p className="text-xs text-alura-textSecondary leading-relaxed pl-1">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Rodapé com botão único de confirmação */}
          <div className="pt-4 border-t border-alura-border flex items-center justify-between shrink-0 gap-3">
            <span className="text-[11px] text-alura-textMuted hidden sm:inline">
              Informe exibido uma única vez após atualização
            </span>
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-alura-accent text-alura-background text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-alura-accent/25 flex items-center justify-center gap-2 cursor-pointer ml-auto"
            >
              <span>Explorar Novidades</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
