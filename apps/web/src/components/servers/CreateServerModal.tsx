import React, { useState } from 'react'
import { X, ArrowRight, ArrowLeft, Upload, Check, Globe, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SERVER_CATEGORIES } from './ServerCategoryFilter'

interface CreateServerModalProps {
  isOpen: boolean
  userId: string
  onClose: () => void
  onCreated: (newServerId: string) => void
}

export function CreateServerModal({
  isOpen,
  userId,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dados do Formulário
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [category, setCategory] = useState('Tecnologia')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(['comunidade', 'alura'])
  const [isPublic, setIsPublic] = useState(true)
  const [isNsfw, setIsNsfw] = useState(false)

  if (!isOpen) return null

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const clean = tagInput.trim().replace(/^#/, '').toLowerCase()
      if (clean && !tags.includes(clean) && tags.length < 8) {
        setTags([...tags, clean])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg('O nome do servidor deve ter pelo menos 3 caracteres.')
      return
    }
    if (!userId) {
      setErrorMsg('Usuário não autenticado.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      // 1. Cria o servidor no banco
      const { data: newServer, error: serverError } = await supabase
        .from('servers')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          icon_url: iconUrl.trim() || null,
          banner_url: bannerUrl.trim() || null,
          category,
          tags,
          is_public: isPublic,
          is_nsfw: isNsfw,
          is_verified: false,
          member_count: 1,
          online_count: 1,
          owner_id: userId,
        })
        .select('id')
        .single()

      if (serverError || !newServer) {
        throw new Error(serverError?.message || 'Erro ao criar servidor.')
      }

      const serverId = newServer.id

      // 2. Adiciona o criador como primeiro membro
      await supabase.from('server_members').insert({
        server_id: serverId,
        user_id: userId,
      })

      // 3. Cria espaço padrão "Geral" e canais iniciais
      const { data: space } = await supabase
        .from('spaces')
        .insert({
          server_id: serverId,
          name: 'Geral',
          position: 0,
        })
        .select('id')
        .single()

      if (space) {
        await supabase.from('rooms').insert([
          {
            server_id: serverId,
            space_id: space.id,
            name: 'boas-vindas',
            description: 'Canal de boas-vindas aos novos membros',
            type: 'text',
            position: 0,
          },
          {
            server_id: serverId,
            space_id: space.id,
            name: 'geral',
            description: 'Bate-papo livre da comunidade',
            type: 'text',
            position: 1,
          },
          {
            server_id: serverId,
            space_id: space.id,
            name: 'Voz Geral',
            description: 'Canal de áudio e transmissão',
            type: 'voice',
            position: 2,
          },
        ])
      }

      onCreated(serverId)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na criação do servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-alura-surface1 border border-alura-border shadow-[0_24px_70px_rgba(0,0,0,0.9)] flex flex-col text-alura-textPrimary animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal com Indicador de Etapas */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-alura-border/60">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-alura-accent/20 text-alura-accent font-extrabold text-xs flex items-center justify-center border border-alura-accent/30">
              {step}
            </span>
            <span className="text-sm font-extrabold text-alura-textPrimary tracking-tight">
              {step === 1 && 'Identidade da Comunidade'}
              {step === 2 && 'Categoria e Classificação'}
              {step === 3 && 'Visibilidade e Confirmação'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-alura-surface2 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo do Formulário por Etapa */}
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── ETAPA 1: Identidade ── */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  Nome do Servidor *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alura Game Club, Devs Brasil..."
                  maxLength={40}
                  className="w-full h-11 px-4 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sobre o que é a sua comunidade..."
                  maxLength={180}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  URL do Ícone (Avatar Squircle)
                </label>
                <input
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://exemplo.com/icone.png ou deixe vazio"
                  className="w-full h-11 px-4 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  URL do Banner Horizontal
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://exemplo.com/banner.jpg ou deixe vazio"
                  className="w-full h-11 px-4 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all"
                />
              </div>
            </>
          )}

          {/* ── ETAPA 2: Categoria e Tags ── */}
          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  Categoria Principal *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary outline-none transition-all cursor-pointer"
                >
                  {SERVER_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-alura-surface1 text-alura-textPrimary">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider block mb-1.5">
                  Tags Temáticas (pressione Enter para adicionar)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Ex: react, jogos, anime..."
                  className="w-full h-11 px-4 rounded-xl bg-alura-surface2 border border-alura-border focus:border-alura-accent text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none transition-all mb-2"
                />

                <div className="flex items-center gap-1.5 flex-wrap min-h-[32px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-alura-surface2 text-alura-accent border border-alura-accent/30 flex items-center gap-1.5"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-alura-border/60">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNsfw}
                    onChange={(e) => setIsNsfw(e.target.checked)}
                    className="w-4 h-4 rounded accent-alura-accent cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-alura-textPrimary">Conteúdo Adulto / +18</span>
                    <span className="text-[11px] text-alura-textMuted">
                      O servidor terá aviso obrigatório de classificação indicativa antes de entrar.
                    </span>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ── ETAPA 3: Visibilidade & Resumo ── */}
          {step === 3 && (
            <>
              <div className="flex flex-col gap-3">
                <label
                  onClick={() => setIsPublic(true)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isPublic
                      ? 'bg-alura-selected border-alura-borderStrong shadow-md'
                      : 'bg-alura-surface2/60 border-alura-border hover:bg-alura-surface2'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-alura-surface1 text-alura-accent border border-alura-border">
                    <Globe size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-alura-textPrimary">Comunidade Pública</span>
                    <span className="text-[11px] text-alura-textSecondary mt-0.5 leading-relaxed">
                      Qualquer membro da Alura pode encontrar seu servidor na aba de Descoberta e entrar.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setIsPublic(false)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    !isPublic
                      ? 'bg-alura-selected border-alura-borderStrong shadow-md'
                      : 'bg-alura-surface2/60 border-alura-border hover:bg-alura-surface2'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-alura-surface1 text-amber-400 border border-alura-border">
                    <Lock size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-alura-textPrimary">Comunidade Privada</span>
                    <span className="text-[11px] text-alura-textSecondary mt-0.5 leading-relaxed">
                      O servidor não será exibido na busca pública. O acesso só é permitido por convite direto.
                    </span>
                  </div>
                </label>
              </div>

              {/* Resumo */}
              <div className="mt-2 p-3.5 rounded-2xl bg-alura-surface2/40 border border-alura-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-alura-surface1 border border-alura-border flex items-center justify-center font-bold text-alura-accent">
                    {name[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-alura-textPrimary">{name || 'Nome do servidor'}</span>
                    <span className="text-[10px] text-alura-textMuted">{category} • {tags.length} tags</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-alura-surface2 text-alura-accent">
                  {isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Botões de Navegação */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-alura-border/60 bg-alura-surface1/95">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-alura-textSecondary hover:text-alura-textPrimary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && (!name.trim() || name.trim().length < 3)) {
                  setErrorMsg('Por favor, informe um nome com pelo menos 3 caracteres.')
                  return
                }
                setErrorMsg(null)
                setStep((s) => (s + 1) as any)
              }}
              className="px-5 py-2.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-alura-accent/20"
            >
              <span>Próximo</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-alura-accent/25 disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>{loading ? 'Criando servidor...' : 'Criar Comunidade'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
