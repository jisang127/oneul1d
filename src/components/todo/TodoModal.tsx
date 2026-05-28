'use client'
import { useState, useEffect } from 'react'
import type { Todo, TodoColor, RepeatType } from '@/types'
import { DAY_LABELS, COLOR_MAP } from '@/lib/utils'

const COLORS: TodoColor[] = ['white', 'red', 'blue', 'green', 'yellow', 'gray']
const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
]

interface Props {
  mode: 'add' | 'edit'
  initialData?: Partial<Todo>
  defaultDate?: string
  onSave: (data: Partial<Todo>) => void
  onDelete?: () => void
  onClose: () => void
}

export function TodoModal({ mode, initialData, defaultDate, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [color, setColor] = useState<TodoColor>(initialData?.color || 'white')
  const [repeatType, setRepeatType] = useState<RepeatType>(initialData?.repeatType || 'none')
  const [repeatDays, setRepeatDays] = useState<number[]>(initialData?.repeatDays || [])
  const [repeatDayOfMonth, setRepeatDayOfMonth] = useState<number | null>(initialData?.repeatDayOfMonth || null)
  const [alertEnabled, setAlertEnabled] = useState(initialData?.alertEnabled || false)

  const handleAlertToggle = async () => {
    if (!alertEnabled && 'Notification' in window && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission()
      if (result !== 'granted') return
    }
    setAlertEnabled((v) => !v)
  }
  const [alertTime, setAlertTime] = useState(initialData?.alertTime || '09:00')
  const [alertH, alertM] = alertTime.split(':')
  const [dueDate, setDueDate] = useState<string>(initialData?.dueDate || '')

  const toggleRepeatDay = (dow: number) => {
    setRepeatDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
    )
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      content: content.trim(),
      color,
      repeatType,
      repeatDays: repeatType === 'weekly' ? repeatDays : [],
      repeatDayOfMonth: repeatType === 'monthly' ? repeatDayOfMonth : null,
      alertEnabled,
      alertTime: alertEnabled ? alertTime : null,
      dueDate: dueDate || null,
      date: initialData?.date || defaultDate || '',
    })
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(30,42,94,0.4)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000, padding: '0',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: '480px',
          padding: '20px 20px 32px',
          display: 'flex', flexDirection: 'column', gap: '14px',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1E2A5E' }}>
            {mode === 'add' ? '할 일 추가' : '수정'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#C0B0C0', lineHeight: 1 }}>×</button>
        </div>

        {/* 제목 */}
        <div>
          <div style={labelStyle}>제목</div>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={inputStyle}
          />
        </div>

        {/* 내용 */}
        <div>
          <div style={labelStyle}>내용</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세 내용 (선택)"
            rows={3}
            style={{ ...inputStyle, resize: 'none', height: '72px' }}
          />
        </div>

        {/* 반복 */}
        <div>
          <div style={labelStyle}>반복</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRepeatType(opt.value)}
                style={chipStyle(repeatType === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {repeatType === 'weekly' && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleRepeatDay(i)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1.5px solid',
                    borderColor: repeatDays.includes(i) ? '#E8C5D8' : '#EEE8F0',
                    background: repeatDays.includes(i) ? '#E8C5D8' : '#fff',
                    color: repeatDays.includes(i) ? '#1E2A5E' : '#A090A0',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {repeatType === 'monthly' && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#A090A0', marginBottom: '6px' }}>매월 반복할 날짜 선택</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => setRepeatDayOfMonth(day)}
                    style={{
                      height: '32px', borderRadius: '8px', border: '1.5px solid',
                      borderColor: repeatDayOfMonth === day ? '#1E2A5E' : '#EEE8F0',
                      background: repeatDayOfMonth === day ? '#EEF1F7' : '#fff',
                      color: repeatDayOfMonth === day ? '#1E2A5E' : '#888',
                      fontSize: '11px', fontWeight: repeatDayOfMonth === day ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 마감일 */}
        <div>
          <div style={labelStyle}>마감일</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            {dueDate && (<button onClick={() => setDueDate('')} style={{ background: 'none', border: 'none', color: '#C0B0C0', fontSize: '18px', cursor: 'pointer' }}>×</button>)}
          </div>
        </div>

        {/* 색 지정 */}
        <div>
          <div style={labelStyle}>색 지정</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: COLOR_MAP[c],
                  border: color === c ? '3px solid #1E2A5E' : '1.5px solid #D0C0D0',
                  cursor: 'pointer', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>
        </div>

        {/* 알림 */}
        <div>
          <div style={labelStyle}>알림</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleAlertToggle}
                style={{
                  width: '38px', height: '22px', borderRadius: '20px',
                  background: alertEnabled ? '#E8C5D8' : '#EEE8F0',
                  border: 'none', position: 'relative', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: alertEnabled ? '#1E2A5E' : '#C0B0C0',
                  position: 'absolute', top: '3px',
                  left: alertEnabled ? '19px' : '3px',
                  transition: 'left 0.2s',
                }} />
              </button>
              <span style={{ fontSize: '13px', color: alertEnabled ? '#1E2A5E' : '#A090A0', fontWeight: alertEnabled ? 500 : 400 }}>
                {alertEnabled ? '알림 켬' : '알림 끔'}
              </span>
            </div>
            {alertEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number" min="0" max="23" value={alertH}
                  onChange={(e) => setAlertTime(`${e.target.value.padStart(2,'0')}:${alertM}`)}
                  style={{ ...inputStyle, width: '60px', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}
                />
                <span style={{ fontSize: '18px', color: '#1E2A5E', fontWeight: 500 }}>:</span>
                <input
                  type="number" min="0" max="59" value={alertM}
                  onChange={(e) => setAlertTime(`${alertH}:${e.target.value.padStart(2,'0')}`)}
                  style={{ ...inputStyle, width: '60px', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}
                />
                <span style={{ fontSize: '12px', color: '#A090A0' }}>시 / 분</span>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '4px', paddingTop: '12px', borderTop: '0.5px solid #EEE8F0' }}>
          {mode === 'edit' && onDelete && (
            <button onClick={onDelete} style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#E24B4A', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              삭제
            </button>
          )}
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1.5px solid #EEE8F0', borderRadius: '10px', background: '#fff', color: '#A090A0', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            style={{ padding: '9px 20px', border: 'none', borderRadius: '10px', background: title.trim() ? '#1E2A5E' : '#D0C8D8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: title.trim() ? 'pointer' : 'not-allowed' }}
          >
            {mode === 'add' ? '추가' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#A090A0', fontWeight: 500, marginBottom: '6px', letterSpacing: '0.04em' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#F8F6FA', border: 'none', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#1E2A5E', outline: 'none', display: 'block' }
const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 14px', borderRadius: '20px', border: '1.5px solid', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
  borderColor: active ? '#1E2A5E' : '#EEE8F0',
  background: active ? '#1E2A5E' : '#fff',
  color: active ? '#fff' : '#A090A0',
})
