import React from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical } from 'lucide-react'

export interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  dragHandle?: boolean
}

export function SortableGroup<T extends { id: string }>({
  items,
  onReorder,
  children,
  className = '',
}: {
  items: T[]
  onReorder: (newItems: T[]) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={`space-y-1 list-none p-0 m-0 ${className}`}
    >
      {children}
    </Reorder.Group>
  )
}

export function SortableItem<T extends { id: string }>({
  value,
  children,
  className = '',
  disabled = false,
}: {
  value: T
  children: (dragHandleProps: { dragControls: any }) => React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={value}
      id={value.id}
      dragListener={false}
      dragControls={disabled ? undefined : dragControls}
      className={`relative select-none list-none ${className}`}
      whileDrag={{
        scale: 1.02,
        zIndex: 50,
        boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
      }}
      transition={{ duration: 0.15 }}
    >
      {children({ dragControls })}
    </Reorder.Item>
  )
}

export function SortableDragHandle({
  dragControls,
  className = '',
}: {
  dragControls: any
  className?: string
}) {
  return (
    <div
      onPointerDown={(e) => {
        dragControls?.start(e)
      }}
      style={{ touchAction: 'none' }}
      className={`cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary transition-colors touch-none shrink-0 ${className}`}
      title="Arrastar para reordenar"
    >
      <GripVertical size={14} />
    </div>
  )
}
