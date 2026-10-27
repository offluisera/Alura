import React from 'react'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  label?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className = '',
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onCheckedChange(!checked)
      }}
      className={`group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alura-accent focus-visible:ring-offset-2 focus-visible:ring-offset-alura-background disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'bg-alura-accent shadow-[0_0_12px_rgba(0,230,160,0.35)]'
          : 'bg-alura-surface3 border-alura-border hover:bg-alura-surface3/80'
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full shadow-md ring-0 transition-transform duration-200 ease-in-out ${
          checked
            ? 'translate-x-4 bg-alura-background font-bold'
            : 'translate-x-0.5 bg-alura-textMuted'
        }`}
      />
    </button>
  )
}

export default Switch
