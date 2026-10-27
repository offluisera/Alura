import React from 'react'
import { AtSign, Users, Volume2, Shield } from 'lucide-react'

export interface MentionItem {
  id: string
  type: 'special' | 'role' | 'member'
  title: string
  subtitle?: string
  color?: string
  avatarUrl?: string
  tag: string
}

export interface MentionAutocompleteProps {
  query: string
  members: Array<{
    user_id: string
    profile?: {
      id?: string
      username: string
      display_name?: string | null
      avatar_url?: string | null
    }
  }>
  roles: Array<{
    id: string
    name: string
    color: string | null
  }>
  selectedIndex: number
  onSelect: (item: MentionItem) => void
}

export function MentionAutocomplete({
  query,
  members,
  roles,
  selectedIndex,
  onSelect,
}: MentionAutocompleteProps) {
  const cleanQuery = query.toLowerCase().replace(/^@/, '')

  // 1. Itens especiais
  const specialItems: MentionItem[] = [
    {
      id: 'special-everyone',
      type: 'special',
      title: '@everyone',
      subtitle: 'Notifica todas as pessoas nesta comunidade',
      color: '#FF5C6C',
      tag: '@everyone',
    },
    {
      id: 'special-here',
      type: 'special',
      title: '@here',
      subtitle: 'Notifica pessoas ativas e online agora',
      color: '#00E6A0',
      tag: '@here',
    },
    {
      id: 'special-notify',
      type: 'special',
      title: '@notificar',
      subtitle: 'Alerta geral de avisos e novidades',
      color: '#D9B84A',
      tag: '@notificar',
    },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(cleanQuery) ||
      item.subtitle?.toLowerCase().includes(cleanQuery)
  )

  // 2. Cargos
  const roleItems: MentionItem[] = roles
    .filter((r) => r.name.toLowerCase().includes(cleanQuery))
    .map((r) => ({
      id: `role-${r.id}`,
      type: 'role',
      title: `@${r.name}`,
      subtitle: 'Cargo da comunidade',
      color: r.color || '#00E6A0',
      tag: `@${r.name}`,
    }))

  // 3. Membros
  const memberItems: MentionItem[] = members
    .filter((m) => {
      const u = m.profile?.username?.toLowerCase() || ''
      const d = m.profile?.display_name?.toLowerCase() || ''
      return u.includes(cleanQuery) || d.includes(cleanQuery)
    })
    .slice(0, 8)
    .map((m) => ({
      id: `member-${m.user_id}`,
      type: 'member',
      title: `@${m.profile?.username || 'usuario'}`,
      subtitle: m.profile?.display_name || undefined,
      avatarUrl: m.profile?.avatar_url || undefined,
      tag: `@${m.profile?.username || 'usuario'}`,
    }))

  const allItems = [...specialItems, ...roleItems, ...memberItems]

  if (allItems.length === 0) return null

  return (
    <div className="w-80 sm:w-96 rounded-2xl bg-alura-surface1 border border-alura-borderStrong shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto custom-scrollbar p-1.5 space-y-1 select-none">
      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-alura-textMuted flex items-center justify-between border-b border-alura-border/60">
        <span className="flex items-center gap-1">
          <AtSign size={11} className="text-alura-accent" />
          Mencionar
        </span>
        <span className="text-[9px] font-medium text-alura-textMuted">
          TAB ou ENTER para autocompletar
        </span>
      </div>

      {allItems.map((item, idx) => {
        const isSelected = idx === selectedIndex

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
              isSelected
                ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                : 'hover:bg-alura-surface2 text-alura-textSecondary hover:text-alura-textPrimary border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Ícone ou Avatar */}
              {item.type === 'member' ? (
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-alura-surface2 border border-alura-border shrink-0 flex items-center justify-center text-[10px] font-bold text-alura-accent">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    item.title[1]?.toUpperCase() || '?'
                  )}
                </div>
              ) : item.type === 'role' ? (
                <span
                  className="w-4 h-4 rounded-full shrink-0 border border-black/30"
                  style={{ backgroundColor: item.color || '#00E6A0' }}
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${item.color}20`,
                    borderColor: `${item.color}50`,
                    color: item.color,
                  }}
                >
                  <AtSign size={12} />
                </div>
              )}

              <div className="min-w-0">
                <span
                  className="text-xs font-bold block truncate"
                  style={{ color: item.color || undefined }}
                >
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-[10px] text-alura-textMuted block truncate">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[10px] font-mono font-semibold text-alura-textMuted px-1.5 py-0.5 rounded bg-alura-surface2/60 shrink-0">
              {item.tag}
            </span>
          </button>
        )
      })}
    </div>
  )
}
