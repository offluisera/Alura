import React, { useEffect, useRef } from 'react'
import { Crown, MessageSquare, Copy, Check, Shield, Calendar, Sparkles, UserMinus, Ban } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePresence } from '../../contexts/PresenceContext'

export interface MemberProfilePopoverProps {
  isOpen?: boolean
  onClose: () => void
  anchorRect: DOMRect | null
  member: any
  server?: {
    id?: string
    owner_id?: string
    name?: string
  } | null
  roles?: any[]
  userRoles?: any[]
  isOwner?: boolean
  isHoverMode?: boolean
  canKick?: boolean
  onKick?: (userId: string) => void
  canBan?: boolean
  onBan?: (userId: string) => void
  onOpenDm?: (userId: string) => void
}

export function MemberProfilePopover({
  isOpen = true,
  onClose,
  anchorRect,
  member,
  server,
  roles,
  userRoles,
  isOwner: isOwnerProp,
  isHoverMode = false,
  canKick = false,
  onKick,
  canBan = false,
  onBan,
  onOpenDm,
}: MemberProfilePopoverProps) {
  const navigate = useNavigate()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fecha ao clicar fora quando for por clique
  useEffect(() => {
    if (!isOpen || isHoverMode) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isHoverMode, onClose])

  const { getUserStatus, getStatusColor, getStatusBadgeText } = usePresence()

  if (!isOpen || !member || !anchorRect) return null

  const isOwner = Boolean(
    isOwnerProp !== undefined
      ? isOwnerProp
      : (server?.owner_id && member?.user_id && server.owner_id === member.user_id)
  )
  const p = member.profile
  const effectiveStatus = getUserStatus(p || member, p?.status)
  const statusColor = getStatusColor(effectiveStatus)
  const statusText = getStatusBadgeText(effectiveStatus)
  const displayName = member.nickname || p?.display_name || p?.username || 'Membro'
  const username = p?.username || 'usuario'

  // Cargo mais alto
  const rawRoles = Array.isArray(userRoles)
    ? userRoles
    : Array.isArray(member?.roles)
    ? member.roles
    : Array.isArray(roles)
    ? roles
    : []
  const sortedRoles = [...rawRoles].sort((a, b) => (b.position || 0) - (a.position || 0))
  const topRole = sortedRoles[0]
  const accentColor = member.topRoleColor || topRole?.color || (isOwner ? '#F59E0B' : '#00E6A0')

  // Calcula posição para não estourar a tela
  const popoverWidth = 320
  const popoverHeight = 420
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  let left = anchorRect.right + 12
  if (left + popoverWidth > windowWidth - 16) {
    // Se não cabe na direita, posiciona à esquerda
    left = Math.max(16, anchorRect.left - popoverWidth - 12)
  }

  let top = anchorRect.top - 20
  if (top + popoverHeight > windowHeight - 16) {
    top = Math.max(16, windowHeight - popoverHeight - 16)
  }
  if (top < 16) top = 16

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.user_id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleStartDM = () => {
    onClose()
    if (onOpenDm) {
      onOpenDm(member.user_id)
    } else {
      navigate(`/messages/${member.user_id}`)
    }
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (isHoverMode) {
      hoverTimeoutRef.current = setTimeout(() => {
        onClose()
      }, 250)
    }
  }

  return (
    <div
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 9999,
      }}
      className="rounded-3xl bg-alura-surface1 border border-alura-borderStrong shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150 select-text font-sans"
    >
      {/* ── Banner Superior ── */}
      <div className="h-28 w-full relative flex items-end px-4 pb-2 bg-alura-surface2 overflow-hidden shrink-0">
        {p?.banner_url ? (
          <img
            src={p.banner_url}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${accentColor}33 0%, #001B0B 60%, #001609 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-alura-surface1 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isOwner && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md backdrop-blur-md">
              <Crown size={12} className="text-amber-400" /> Dono
            </span>
          )}
        </div>
      </div>

      {/* ── Header: Avatar Squircle + Informações ── */}
      <div className="px-5 pb-5 pt-0 relative space-y-4">
        {/* Avatar Squircle sobreposto ao banner */}
        <div className="flex items-end justify-between -mt-8 mb-2">
          <div className="relative w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-2xl overflow-hidden bg-alura-surface2 border-2 border-alura-surface1 shadow-xl shrink-0 flex items-center justify-center">
            {p?.avatar_url ? (
              <img src={p.avatar_url} alt={username} className="w-16 h-16 object-cover rounded-2xl" />
            ) : (
              <span className="font-black text-2xl text-alura-accent">
                {username[0]?.toUpperCase() || '?'}
              </span>
            )}
            {/* Status Dot */}
            <span
              className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ${statusColor} border-2 border-alura-surface1 shadow-sm flex items-center justify-center`}
              title={statusText}
            >
              {effectiveStatus === 'dnd' && <div className="w-1.5 h-[1.5px] bg-white rounded-full" />}
            </span>
          </div>

          {/* Botão de Mensagem Direta Rápida */}
          <button
            type="button"
            onClick={handleStartDM}
            className="px-3.5 py-1.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Enviar Mensagem Direta"
          >
            <MessageSquare size={13} />
            <span>Conversar</span>
          </button>
        </div>

        {/* Nomes e Tags */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h3
              className="text-base font-black truncate max-w-[220px]"
              style={{ color: accentColor }}
            >
              {displayName}
            </h3>
            {isOwner && <Crown size={14} className="text-amber-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-alura-textMuted">
            <span>@{username}</span>
            <span className="text-[10px] text-alura-textDisabled">•</span>
            <span className="capitalize">{statusText}</span>
          </div>
        </div>

        {/* Bio ou Mensagem de Status */}
        {p?.bio && (
          <p className="text-xs text-alura-textSecondary leading-relaxed bg-alura-surface2/60 p-2.5 rounded-xl border border-alura-border/60">
            {p.bio}
          </p>
        )}

        <div className="w-full h-px bg-alura-border/60" />

        {/* ── Seção: Cargos no Servidor ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-alura-textMuted uppercase tracking-wider flex items-center gap-1">
              <Shield size={11} className="text-alura-accent" />
              Cargos na Comunidade ({(sortedRoles?.length || 0) + (isOwner ? 1 : 0)})
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
            {isOwner && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                <Crown size={11} className="text-amber-400" />
                Proprietário
              </span>
            )}

            {sortedRoles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border shadow-sm transition-all"
                style={{
                  backgroundColor: `${role.color || '#00E6A0'}15`,
                  borderColor: `${role.color || '#00E6A0'}45`,
                  color: role.color || '#00E6A0',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: role.color || '#00E6A0' }}
                />
                {role.name}
              </span>
            ))}

            {!isOwner && (sortedRoles?.length || 0) === 0 && (
              <span className="text-[11px] text-alura-textMuted italic">
                Nenhum cargo atribuído.
              </span>
            )}
          </div>
        </div>

        {/* ── Moderação Rápida (Expulsar / Banir) ── */}
        {!isOwner && (canKick || canBan) && (
          <div className="pt-2 flex items-center gap-2 border-t border-alura-border/40">
            {canKick && onKick && (
              <button
                type="button"
                onClick={() => {
                  onKick(member.user_id)
                  onClose()
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <UserMinus size={13} />
                <span>Expulsar</span>
              </button>
            )}
            {canBan && onBan && (
              <button
                type="button"
                onClick={() => {
                  onBan(member.user_id)
                  onClose()
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Ban size={13} />
                <span>Banir</span>
              </button>
            )}
          </div>
        )}

        {/* ── Rodapé: Ações e Info de Entrada ── */}
        <div className="pt-1 flex items-center justify-between border-t border-alura-border/40 text-[11px] text-alura-textMuted">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Membro desde {member.joined_at ? new Date(member.joined_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'recentemente'}
          </span>

          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-alura-surface2 text-alura-textMuted hover:text-alura-textPrimary transition-colors cursor-pointer"
            title="Copiar ID"
          >
            {copiedId ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copiar ID</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
