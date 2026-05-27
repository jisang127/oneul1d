'use client'
import { useState } from 'react'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  skipKey?: string // localStorage key for "don't ask again"
}

export function DeleteConfirmModal({ message, onConfirm, onCancel, skipKey }: Props) {
  const [skipNext, setSkipNext] = useState(false)

  const handleConfirm = () => {
    if (skipKey && skipNext) {
      localStorage.setItem(skipKey, 'true')
    }
    onConfirm()
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(30,42,94,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '18px',
          width: '100%', maxWidth: '280px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 18px 14px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E2A5E', marginBottom: '8px' }}>
            삭제할까요?
          </p>
          <p style={{ fontSize: '12px', color: '#A090A0', lineHeight: 1.6, marginBottom: '14px' }}>
            {message}
          </p>
          {skipKey && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div
                onClick={() => setSkipNext((v) => !v)}
                style={{
                  width: '16px', height: '16px', borderRadius: '4px',
                  border: `1.5px solid ${skipNext ? '#1E2A5E' : '#D0C0D0'}`,
                  background: skipNext ? '#EEF1F7' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {skipNext && <span style={{ fontSize: '10px', color: '#1E2A5E', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '11px', color: '#C0B0C0' }}>다음부터 묻지 않음</span>
            </label>
          )}
        </div>
        <div style={{
          padding: '10px 18px 16px',
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
        }}>
          <button
            onClick={onCancel}
            style={{ padding: '7px 16px', border: '1.5px solid #EEE8F0', borderRadius: '10px', background: '#fff', color: '#A090A0', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            style={{ padding: '7px 16px', border: '1.5px solid #F5C0C0', borderRadius: '10px', background: 'transparent', color: '#E24B4A', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
