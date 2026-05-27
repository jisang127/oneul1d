'use client'
import { useRef, useEffect } from 'react'
import { getWeekDates, getDayOfWeekLabel, todayStr, COLOR_MAP } from '@/lib/utils'
import type { Todo } from '@/types'

interface Props {
  selectedDate: string
  onSelect: (date: string) => void
  todosByDate: Record<string, Todo[]>
}

export function WeekStrip({ selectedDate, onSelect, todosByDate }: Props) {
  const today = todayStr()
  const weekDates = getWeekDates(selectedDate)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const idx = weekDates.indexOf(selectedDate)
    if (stripRef.current && idx >= 0) {
      const cell = stripRef.current.children[idx] as HTMLElement
      cell?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedDate])

  return (
    <div
      ref={stripRef}
      style={{
        display: 'flex',
        gap: '4px',
        padding: '10px 16px',
        overflowX: 'auto',
        borderBottom: '0.5px solid #EEE8F0',
        scrollbarWidth: 'none',
      }}
    >
      {weekDates.map((date) => {
        const todos = todosByDate[date] || []
        const activeTodos = todos.filter((t) => !t.done)
        const hasDone = todos.some((t) => t.done)
        const dotColors = [...new Set(activeTodos.map((t) => t.color).filter((c) => c !== 'white'))].slice(0, 3)
        const isSelected = date === selectedDate
        const isToday = date === today

        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            style={{
              flex: 1,
              minWidth: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 4px',
              borderRadius: '12px',
              border: 'none',
              background: isSelected ? '#EEF1F7' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: '10px',
              color: isSelected ? '#1E2A5E' : '#A090A0',
              fontWeight: isToday ? 600 : 400,
            }}>
              {getDayOfWeekLabel(date)}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? '#1E2A5E' : isToday ? '#1E2A5E' : '#888',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: isToday && !isSelected ? '#E8C5D8' : 'transparent',
            }}>
              {parseInt(date.split('-')[2])}
            </span>
            <div style={{ display: 'flex', gap: '2px', height: '6px', alignItems: 'center' }}>
              {dotColors.map((color, i) => (
                <div key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: COLOR_MAP[color] || '#ccc',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                }} />
              ))}
              {hasDone && (
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  border: '1px solid #ccc', background: 'transparent',
                }} />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
