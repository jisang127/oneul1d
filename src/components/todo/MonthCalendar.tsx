'use client'
import { useState } from 'react'
import { getMonthDates, formatMonthLabel, todayStr, COLOR_MAP, toDateStr } from '@/lib/utils'
import type { Todo } from '@/types'

interface Props {
  selectedDate: string
  onSelect: (date: string) => void
  todosByDate: Record<string, Todo[]>
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function MonthCalendar({ selectedDate, onSelect, todosByDate }: Props) {
  const [viewDate, setViewDate] = useState(selectedDate)
  const today = todayStr()
  const cells = getMonthDates(viewDate)

  const prevMonth = () => {
    const d = new Date(viewDate + 'T00:00:00')
    d.setMonth(d.getMonth() - 1)
    setViewDate(toDateStr(d))
  }
  const nextMonth = () => {
    const d = new Date(viewDate + 'T00:00:00')
    d.setMonth(d.getMonth() + 1)
    setViewDate(toDateStr(d))
  }

  return (
    <div style={{ padding: '12px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#A090A0', padding: '4px 8px' }}>‹</button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E2A5E' }}>{formatMonthLabel(viewDate)}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#A090A0', padding: '4px 8px' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#C0B0C0', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />
          const todos = todosByDate[date] || []
          const activeTodos = todos.filter((t) => !t.done)
          const hasDone = todos.some((t) => t.done)
          const dots = [...new Set(activeTodos.map((t) => t.color).filter((c) => c !== 'white'))].slice(0, 4)
          const isToday = date === today
          const isSelected = date === selectedDate

          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '4px 2px', borderRadius: '10px', border: 'none',
                background: isSelected ? '#EEF1F7' : 'transparent',
                cursor: 'pointer', minHeight: '48px',
              }}
            >
              <span style={{
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#1E2A5E' : '#666',
                width: '24px', height: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? '#1E2A5E' : 'transparent',
              }}>
                {parseInt(date.split('-')[2])}
              </span>
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '28px' }}>
                {dots.map((color, j) => (
                  <div key={j} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: COLOR_MAP[color] || '#ccc',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                  }} />
                ))}
                {hasDone && (
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', border: '1px solid #ccc', background: 'transparent' }} />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
