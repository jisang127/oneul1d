'use client'
import { useState } from 'react'
import type { Todo, Subtask } from '@/types'
import { COLOR_MAP, DAY_LABELS } from '@/lib/utils'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

interface Props {
  todo: Todo
  onToggleDone: () => void
  onTogglePin: () => void
  onEdit: () => void
  onDelete: () => void
  onUpdateSubtasks: (subtasks: Subtask[]) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function TodoCard({ todo, onToggleDone, onTogglePin, onEdit, onDelete, onUpdateSubtasks, dragHandleProps }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [newSubText, setNewSubText] = useState('')
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null)

  const bgColor = todo.done ? '#fff' : (COLOR_MAP[todo.color] || '#fff')
  const hasSubs = todo.subtasks && todo.subtasks.length > 0
  const doneSubs = todo.subtasks?.filter((s) => s.done).length || 0

  const repeatLabel = () => {
    if (todo.repeatType === 'daily') return '매일'
    if (todo.repeatType === 'weekly') {
      const labels = todo.repeatDays.sort().map((d) => DAY_LABELS[d]).join('·')
      return `매주 ${labels}`
    }
    if (todo.repeatType === 'monthly') return `매월 ${todo.repeatDayOfMonth}일`
    return null
  }
  const dueDateLabel = () => {
    if (!todo.dueDate) return null
    const today = new Date(); today.setHours(0,0,0,0)
    const due = new Date(todo.dueDate + 'T00:00:00'); due.setHours(0,0,0,0)
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return { label: `D+${Math.abs(diff)}`, overdue: true }
    if (diff === 0) return { label: 'D-day', overdue: false }
    return { label: `D-${diff}`, overdue: false }
  }

  const addSubtask = () => {
    if (!newSubText.trim() || (todo.subtasks?.length || 0) >= 5) return
    const newSub: Subtask = { id: Date.now().toString(), text: newSubText.trim(), done: false, createdAt: Date.now() }
    onUpdateSubtasks([...(todo.subtasks || []), newSub])
    setNewSubText('')
  }

  const toggleSubDone = (id: string) => {
    const updated = todo.subtasks.map((s) => s.id === id ? { ...s, done: !s.done } : s)
    onUpdateSubtasks(updated)
  }

  const deleteSubtask = (id: string) => {
    const skipKey = `skip-sub-delete-confirm`
    if (localStorage.getItem(skipKey) === 'true') {
      onUpdateSubtasks(todo.subtasks.filter((s) => s.id !== id))
      return
    }
    setDeletingSubId(id)
  }

  return (
    <>
      <div style={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: todo.done ? '1.5px solid #F0EAF4' : '1.5px solid transparent',
        opacity: todo.done ? 0.45 : 1,
        marginBottom: '8px',
      }}>
        {/* 상위 항목 — 색 배경 */}
        <div style={{ background: bgColor, padding: '11px 13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 드래그 핸들 */}
            <div {...dragHandleProps} style={{ cursor: 'grab', color: '#C8B8C8', fontSize: '16px', flexShrink: 0 }}>⠿</div>

            {/* 체크 */}
            <button
              onClick={onToggleDone}
              style={{
                width: '19px', height: '19px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${todo.done ? '#1E2A5E' : todo.color === 'white' ? '#C8B8C8' : 'rgba(0,0,0,0.2)'}`,
                background: todo.done ? '#1E2A5E' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {todo.done && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
            </button>

            {/* 제목 */}
            <button
              onClick={onEdit}
              style={{
                flex: 1, background: 'none', border: 'none', textAlign: 'left',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                color: todo.done ? '#B8A8B8' : '#1E2A5E',
                textDecoration: todo.done ? 'line-through' : 'none',
                padding: 0,
              }}
            >
              {todo.title}
            </button>

            {/* 핀 */}
            <button
              onClick={onTogglePin}
              style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: todo.pinned ? '#1E2A5E' : '#C8B8C8', padding: '0 2px' }}
            >
              📌
            </button>
          </div>

          {/* 뱃지 */}
          {(repeatLabel() || todo.alertEnabled || todo.dueDate) && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', paddingLeft: '40px', flexWrap: 'wrap' }}>
              {repeatLabel() && (
                <span style={badgeStyle(bgColor)}>↻ {repeatLabel()}</span>
              )}
              {todo.alertEnabled && todo.alertTime && (
                <span style={badgeStyle(bgColor)}>🔔 {todo.alertTime}</span>
              )}
              {dueDateLabel() && (
                <span style={{ ...badgeStyle(bgColor), color: dueDateLabel()!.overdue ? '#E24B4A' : undefined, fontWeight: 600 }}>
                  {dueDateLabel()!.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 하위 항목 — 항상 흰 배경 */}
        {hasSubs && (
          <div style={{ background: '#fff', padding: '8px 13px 10px', borderTop: '0.5px solid rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: expanded ? '8px' : '0', width: '100%' }}
            >
              <span style={{ fontSize: '11px', color: '#C0B0C0' }}>{expanded ? '▼' : '▶'}</span>
              <span style={{ fontSize: '11px', color: '#A090A0' }}>하위 항목</span>
              <span style={{ fontSize: '10px', color: '#C0B0C0' }}>{doneSubs} / {todo.subtasks.length}</span>
              <div style={{ flex: 1, height: '2px', background: '#EEE8F0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#1E2A5E', width: `${(doneSubs / todo.subtasks.length) * 100}%`, borderRadius: '2px' }} />
              </div>
            </button>

            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {todo.subtasks.map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#F8F6FA', borderRadius: '10px' }}>
                    <button
                      onClick={() => toggleSubDone(sub.id)}
                      style={{
                        width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                        border: `1.5px solid ${sub.done ? '#1E2A5E' : '#C8B8C8'}`,
                        background: sub.done ? '#1E2A5E' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      {sub.done && <span style={{ color: '#fff', fontSize: '8px', fontWeight: 700 }}>✓</span>}
                    </button>
                    <span style={{ flex: 1, fontSize: '12px', color: sub.done ? '#C0B0C0' : '#3A2A4A', textDecoration: sub.done ? 'line-through' : 'none' }}>
                      {sub.text}
                    </span>
                    <button onClick={() => deleteSubtask(sub.id)} style={{ background: 'none', border: 'none', color: '#D0C0D0', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>
                      🗑
                    </button>
                  </div>
                ))}

                {(todo.subtasks?.length || 0) < 5 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px dashed #C8B8C8', flexShrink: 0 }} />
                    <input
                      value={newSubText}
                      onChange={(e) => setNewSubText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                      placeholder={`하위 항목 추가 (최대 5개, 현재 ${todo.subtasks?.length || 0}개)`}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '12px', color: '#A090A0', outline: 'none' }}
                    />
                    {newSubText && (
                      <button onClick={addSubtask} style={{ background: 'none', border: 'none', color: '#1E2A5E', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>추가</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 하위 항목 없을 때 추가 버튼 */}
        {!hasSubs && !todo.done && (
          <div style={{ background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.05)', padding: '0' }}>
            {expanded ? (
              <div style={{ padding: '8px 13px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px dashed #C8B8C8', flexShrink: 0 }} />
                  <input
                    autoFocus
                    value={newSubText}
                    onChange={(e) => setNewSubText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                    placeholder="하위 항목 추가 (최대 5개)"
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '12px', color: '#A090A0', outline: 'none' }}
                  />
                  {newSubText && (
                    <button onClick={addSubtask} style={{ background: 'none', border: 'none', color: '#1E2A5E', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>추가</button>
                  )}
                </div>
                <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#C0B0C0', fontSize: '11px', cursor: 'pointer', paddingLeft: '10px' }}>닫기</button>
              </div>
            ) : (
              <button
                onClick={() => setExpanded(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 13px', width: '100%' }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px dashed #C8B8C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#C8B8C8', lineHeight: 1 }}>+</span>
                </div>
                <span style={{ fontSize: '11px', color: '#C0B0C0' }}>하위 항목 추가</span>
              </button>
            )}
          </div>
        )}
      </div>

      {deletingSubId && (
        <DeleteConfirmModal
          message="삭제하면 되돌릴 수 없어요."
          skipKey="skip-sub-delete-confirm"
          onConfirm={() => {
            onUpdateSubtasks(todo.subtasks.filter((s) => s.id !== deletingSubId))
            setDeletingSubId(null)
          }}
          onCancel={() => setDeletingSubId(null)}
        />
      )}
    </>
  )
}

const badgeStyle = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '3px',
  fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
  background: bg === '#ffffff' || bg === '#fff' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.5)',
  color: '#5A4A6A',
  border: '0.5px solid rgba(0,0,0,0.06)',
})
