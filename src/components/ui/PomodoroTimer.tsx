'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type TimerMode = 'focus' | 'break'

interface Props {
  onClose: () => void
  todoTitle?: string
}

const FOCUS_SEC = 25 * 60
const BREAK_SEC = 5 * 60

export function PomodoroTimer({ onClose, todoTitle }: Props) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [seconds, setSeconds] = useState(FOCUS_SEC)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = mode === 'focus' ? FOCUS_SEC : BREAK_SEC
  const progress = ((total - seconds) / total) * 100

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const switchMode = useCallback((next: TimerMode) => {
    setMode(next)
    setSeconds(next === 'focus' ? FOCUS_SEC : BREAK_SEC)
    setRunning(false)
  }, [])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // 타이머 완료
          if (mode === 'focus') {
            setSessions((n) => n + 1)
            new Notification('🍅 집중 완료!', { body: '5분 휴식을 시작하세요.' })
            switchMode('break')
          } else {
            new Notification('☕ 휴식 완료!', { body: '다시 집중해 봐요.' })
            switchMode('focus')
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, switchMode])

  const handleStart = () => {
    if (Notification.permission === 'default') Notification.requestPermission()
    setRunning(true)
  }

  const reset = () => { setRunning(false); setSeconds(mode === 'focus' ? FOCUS_SEC : BREAK_SEC) }

  // 원형 프로그레스
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ - (progress / 100) * circ

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(30,42,94,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary, #fff)', borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 8px 40px rgba(30,42,94,0.2)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #1E2A5E)' }}>🍅 포모도로</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-muted, #C0B0C0)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {todoTitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary, #A090A0)', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {todoTitle}
          </p>
        )}

        {/* 모드 토글 */}
        <div style={{ display: 'flex', border: '1.5px solid var(--border, #EEE8F0)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          {(['focus', 'break'] as TimerMode[]).map((m) => (
            <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: '7px', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: mode === m ? 'var(--navy, #1E2A5E)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-tertiary, #A090A0)', transition: 'all 0.2s' }}>
              {m === 'focus' ? '집중 25분' : '휴식 5분'}
            </button>
          ))}
        </div>

        {/* 원형 타이머 */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border, #EEE8F0)" strokeWidth="8" />
            <circle cx="64" cy="64" r={r} fill="none"
              stroke={mode === 'focus' ? 'var(--navy, #1E2A5E)' : 'var(--pink, #E8C5D8)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dash}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary, #1E2A5E)', letterSpacing: '0.05em' }}>{mm}:{ss}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary, #A090A0)', marginTop: '2px' }}>{mode === 'focus' ? '집중' : '휴식'}</span>
          </div>
        </div>

        {/* 컨트롤 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
          <button onClick={reset} style={{ padding: '9px 20px', border: '1.5px solid var(--border, #EEE8F0)', borderRadius: '12px', background: 'transparent', color: 'var(--text-tertiary, #A090A0)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>초기화</button>
          <button
            onClick={running ? () => setRunning(false) : handleStart}
            style={{ padding: '9px 28px', border: 'none', borderRadius: '12px', background: mode === 'focus' ? 'var(--navy, #1E2A5E)' : 'var(--pink, #E8C5D8)', color: mode === 'focus' ? '#fff' : 'var(--text-primary, #1E2A5E)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            {running ? '일시정지' : '시작'}
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted, #C0B0C0)' }}>
          오늘 완료한 세션: {sessions}개 🍅
        </p>
      </div>
    </div>
  )
}
