import {
  signInWithCustomToken,
} from 'firebase/auth'
import { auth } from './firebase'

// 카카오 SDK 초기화 (클라이언트 사이드)
export const initKakao = () => {
  if (typeof window === 'undefined') return
  const kakao = (window as unknown as { Kakao?: { isInitialized: () => boolean; init: (key: string) => void } }).Kakao
  if (kakao && !kakao.isInitialized()) {
    kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '')
  }
}

// 카카오 로그인 → Firebase Custom Token 교환 (Next.js API Route 경유)
export const signInWithKakao = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const kakao = (window as unknown as { Kakao?: { Auth: { login: (opts: { success: (res: unknown) => void; fail: (err: unknown) => void }) => void } } }).Kakao
    if (!kakao) { reject(new Error('Kakao SDK not loaded')); return }

    kakao.Auth.login({
      success: async (authObj) => {
        try {
          const res = await fetch('/api/auth/kakao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authObj }),
          })
          const { customToken } = await res.json()
          await signInWithCustomToken(auth, customToken)
          resolve()
        } catch (err) {
          reject(err)
        }
      },
      fail: reject,
    })
  })
}
