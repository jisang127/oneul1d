'use client'
import { useCallback } from 'react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo, Subtask } from '@/types'
import { TodoCard } from './TodoCard'
import { formatLabel, todayStr } from '@/lib/utils'

interface Props {
  todos: Todo[]
  selectedDate: string
  onToggleDone: (todo: Todo, done: boolean) => void
  onTogglePin: (id: string, pinned: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onUpdateSubtasks: (id: string, subtasks: Subtask[]) => void
  onReorder: (todos: Todo[]) => void
}

function SortableTodoCard({ todo, ...props }: { todo: Todo } & Omit<React.ComponentProps<typeof TodoCard>, 'dragHandleProps'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 99 : 'auto' }}>
      <TodoCard todo={todo} {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

export function TodoList({ todos, selectedDate, onToggleDone, onTogglePin, onEdit, onDelete, onUpdateSubtasks, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const pinned = todos.filter((t) => t.pinned && !t.done)
  const active = todos.filter((t) => !t.pinned && !t.done)
  const done = todos.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active: dragActive, over } = event
    if (!over || dragActive.id === over.id) return
    const allActive = [...pinned, ...active]
    const oldIdx = allActive.findIndex((t) => t.id === dragActive.id)
    const newIdx = allActive.findIndex((t) => t.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove(allActive, oldIdx, newIdx).map((t, i) => ({ ...t, sortOrder: i }))
    onReorder(reordered)
  }, [pinned, active, onReorder])

  const isToday = selectedDate === todayStr()
  const label = isToday ? `오늘 · ${formatLabel(selectedDate)}` : formatLabel(selectedDate)

  return (
    <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E2A5E', marginBottom: '14px' }}>{label}</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={[...pinned, ...active].map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {pinned.map((todo) => (
            <SortableTodoCard key={todo.id} todo={todo}
              onToggleDone={() => onToggleDone(todo, !todo.done)}
              onTogglePin={() => onTogglePin(todo.id, !todo.pinned)}
              onEdit={() => onEdit(todo)}
              onDelete={() => onDelete(todo.id)}
              onUpdateSubtasks={(subs) => onUpdateSubtasks(todo.id, subs)}
            />
          ))}
          {active.map((todo) => (
            <SortableTodoCard key={todo.id} todo={todo}
              onToggleDone={() => onToggleDone(todo, !todo.done)}
              onTogglePin={() => onTogglePin(todo.id, !todo.pinned)}
              onEdit={() => onEdit(todo)}
              onDelete={() => onDelete(todo.id)}
              onUpdateSubtasks={(subs) => onUpdateSubtasks(todo.id, subs)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {done.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#C0B0C0' }}>완료 {done.length}개</span>
            <div style={{ flex: 1, height: '0.5px', background: '#EEE8F0' }} />
          </div>
          {done.map((todo) => (
            <TodoCard key={todo.id} todo={todo}
              onToggleDone={() => onToggleDone(todo, !todo.done)}
              onTogglePin={() => onTogglePin(todo.id, !todo.pinned)}
              onEdit={() => onEdit(todo)}
              onDelete={() => onDelete(todo.id)}
              onUpdateSubtasks={(subs) => onUpdateSubtasks(todo.id, subs)}
            />
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#C0B0C0', fontSize: '13px' }}>할 일이 없어요</div>
      )}
    </div>
  )
}
