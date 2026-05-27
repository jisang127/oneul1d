'use client'
import { useState, useEffect, useRef } from 'react'
import type { Todo } from '@/types'
import { COLOR_MAP, DAY_LABELS } from '@/lib/utils'

interface Props {
  todos: Todo[]
  onSelect: (todo: Todo) => void
  onClose: () => void
}

export function SearchModal({ todos, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = query.trim().length === 0 ? [] : todos.filter((t) => {
    const q = query.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.subtasks?.some((s) => s.text.toLowerCase().includes(q))
    )
  })

  const highlight = (text: string) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#E8C5D8', color: '#1E2A5E', borderRadius: '2px', padding: '0 1px' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  const repeatLabel = (todo: Todo) => {
    if (todo.repeatType === 'daily') return '매일'
    if (todo.repeatType === 'weekly') return `매주 ${todo.repeatDays.sort().map((d) => DAY_LABELS[d]).join('·')}`
    if (todo.repeatType === 'monthly') return `매월 ${todo.repeatDayOfMonth}일`
    return null
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(30,42,94,0.4)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '16px', overflow: 'hidden', margin: '0 16px', boxShadow: '0 8px 32px rgba(30,42,94,0.15)' }}
      >
        {/* 검색 입력 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '0.5px solid #EEE8F0' }}>
          <span style={{ fontSize: '16px', color: '#C0B0C0' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목, 내용, 하위항목 검색"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#1E2A5E', background: 'transparent' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#C0B0C0', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A090A0', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>취소</button>
        </div>

        {/* 결과 */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {query.trim() && results.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#C0B0C0', fontSize: '13px' }}>
              "{query}"에 대한 결과가 없어요
            </div>
          )}

          {results.map((todo) => {
            const bg = COLOR_MAP[todo.color] || '#fff'
            const repeat = repeatLabel(todo)
            const matchedSub = todo.subtasks?.find((s) => s.text.toLowerCase().includes(query.toLowerCase()))

            return (
              <button
                key={todo.id}
                onClick={() => { onSelect(todo); onClose() }}
                style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', textAlign: 'left', borderBottom: '0.5px solid #F5F0F8' }}
              >
                <div style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
                  <div style={{ width: '4px', background: bg === '#ffffff' || bg === '#fff' ? '#EEE8F0' : bg, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 500, color: todo.done ? '#C0B0C0' : '#1E2A5E',
                        textDecoration: todo.done ? 'line-through' : 'none',
                      }}>
                        {highlight(todo.title)}
                      </span>
                      {todo.done && <span style={{ fontSize: '10px', color: '#C0B0C0' }}>완료</span>}
                      {todo.pinned && <span style={{ fontSize: '11px' }}>📌</span>}
                    </div>
                    {todo.content && (
                      <div style={{ fontSize: '11px', color: '#A090A0', marginBottom: '4px' }}>
                        {highlight(todo.content)}
                      </div>
                    )}
                    {matchedSub && (
                      <div style={{ fontSize: '11px', color: '#A090A0', paddingLeft: '10px', borderLeft: '2px solid #EEE8F0' }}>
                        ↳ {highlight(matchedSub.text)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#C0B0C0' }}>{todo.date}</span>
                      {repeat && <span style={{ fontSize: '10px', color: '#C0B0C0' }}>↻ {repeat}</span>}
                      {todo.alertEnabled && todo.alertTime && <span style={{ fontSize: '10px', color: '#C0B0C0' }}>🔔 {todo.alertTime}</span>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {!query.trim() && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#C0B0C0', fontSize: '13px' }}>
              검색어를 입력하세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
