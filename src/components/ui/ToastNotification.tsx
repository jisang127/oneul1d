'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from './ThemeProvider'

export interface Toast {
  id: string
  title: string
  body: string
}

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null

// 외부에서 토스트 호출용
export const showToast = (title: string, body: string) => {
  if (addToastFn) addToastFn({ title, body })
}

export function ToastContainer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      maxWidth: '360px',
      padding: '0 16px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: isDark ? '#1A1A2E' : '#1E2A5E',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(30,42,94,0.25)',
            animation: 'slideDown 0.3s ease',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: '#E8C5D8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>
            🔔
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8E0F0', marginBottom: '2px' }}>
              {toast.title}
            </div>
            <div style={{
              fontSize: '13px', color: '#C0B8D0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {toast.body}
            </div>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            style={{
              background: 'none', border: 'none', color: '#8878A0',
              fontSize: '18px', cursor: 'pointer', lineHeight: 1, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
