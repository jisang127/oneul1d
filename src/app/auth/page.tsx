'use client'
import { useState, useEffect } from 'react'
import { signIn, signUp, signInWithGoogle } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [saveId, setSaveId] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 저장된 아이디 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('oneul1d-saved-id')
    if (saved) {
      setUsername(saved)
      setSaveId(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(username, password)
        if (saveId) {
          localStorage.setItem('oneul1d-saved-id', username)
        } else {
          localStorage.removeItem('oneul1d-saved-id')
        }
      } else {
        await signUp(username, password)
      }
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('아이디 또는 비밀번호가 올바르지 않아요')
      } else if (msg.includes('email-already-in-use')) {
        setError('이미 사용 중인 아이디예요')
      } else if (msg.includes('weak-password')) {
        setError('비밀번호는 6자 이상이어야 해요')
      } else {
        setError('오류가 발생했어요. 다시 시도해주세요')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push('/')
    } catch {
      setError('구글 로그인에 실패했어요')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#F8F6FA',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#1E2A5E',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '360px', boxShadow: '0 2px 24px rgba(30,42,94,0.08)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>✓</div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1E2A5E', marginBottom: '4px' }}>오늘하루</h1>
          <p style={{ fontSize: '13px', color: '#A090A0' }}>
            {mode === 'login' ? '로그인해서 시작해요' : '새 계정을 만들어요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#A090A0', fontWeight: 500, display: 'block', marginBottom: '4px' }}>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#A090A0', fontWeight: 500, display: 'block', marginBottom: '4px' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              style={inputStyle}
            />
          </div>

          {/* 아이디 저장 (로그인 모드에서만) */}
          {mode === 'login' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div
                onClick={() => setSaveId((v) => !v)}
                style={{
                  width: '16px', height: '16px', borderRadius: '4px',
                  border: `1.5px solid ${saveId ? '#1E2A5E' : '#D0C0D0'}`,
                  background: saveId ? '#EEF1F7' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {saveId && <span style={{ fontSize: '10px', color: '#1E2A5E', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '12px', color: '#A090A0' }}>아이디 저장</span>
            </label>
          )}

          {error && (
            <p style={{ fontSize: '12px', color: '#E24B4A', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#1E2A5E', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px',
            }}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: '#EEE8F0' }} />
          <span style={{ fontSize: '11px', color: '#C0B0C0' }}>또는</span>
          <div style={{ flex: 1, height: '0.5px', background: '#EEE8F0' }} />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', background: '#fff', border: '1.5px solid #EEE8F0',
            borderRadius: '10px', padding: '10px', fontSize: '13px', color: '#1E2A5E',
            fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          구글로 계속하기
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#A090A0', marginTop: '20px' }}>
          {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          {' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#1E2A5E', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  )
}
