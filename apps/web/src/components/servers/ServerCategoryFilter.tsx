import React from 'react'
import { Sparkles, Gamepad2, Code2, GraduationCap, Palette, Film, Music, Globe } from 'lucide-react'

export interface CategoryOption {
  id: string
  label: string
  icon: React.ReactNode
}

export const SERVER_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Todos', icon: <Sparkles size={14} /> },
  { id: 'Jogos', label: 'Jogos', icon: <Gamepad2 size={14} /> },
  { id: 'Tecnologia', label: 'Tecnologia', icon: <Code2 size={14} /> },
  { id: 'Estudos', label: 'Estudos', icon: <GraduationCap size={14} /> },
  { id: 'Criatividade', label: 'Criatividade', icon: <Palette size={14} /> },
  { id: 'Entretenimento', label: 'Entretenimento', icon: <Film size={14} /> },
  { id: 'Música', label: 'Música', icon: <Music size={14} /> },
  { id: 'Comunidade', label: 'Comunidade', icon: <Globe size={14} /> },
]

interface ServerCategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function ServerCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: ServerCategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 select-none custom-scrollbar">
      {SERVER_CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                : 'bg-alura-surface1/60 hover:bg-alura-surface2 text-alura-textSecondary hover:text-alura-textPrimary border border-alura-border/60'
            }`}
          >
            <span className={isActive ? 'text-alura-accent' : 'text-alura-textMuted'}>
              {cat.icon}
            </span>
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
