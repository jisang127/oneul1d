import { NextRequest, NextResponse } from 'next/server'

// 카카오 access_token으로 사용자 정보 조회 후 Firebase Custom Token 발급
// Firebase Admin SDK가 필요 — 서버 환경에서만 동작
export async function POST(req: NextRequest) {
  try {
    const { authObj } = await req.json()
    const accessToken = authObj?.access_token
    if (!accessToken) return NextResponse.json({ error: 'no access token' }, { status: 400 })

    // 카카오 사용자 정보 조회
    const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const kakaoUser = await kakaoRes.json()
    const uid = `kakao:${kakaoUser.id}`

    // Firebase Admin으로 Custom Token 발급
    // 주의: firebase-admin은 서버 환경에서만 import 가능
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    const customToken = await getAuth().createCustomToken(uid, {
      provider: 'kakao',
      email: kakaoUser.kakao_account?.email || '',
      name: kakaoUser.properties?.nickname || '',
    })

    return NextResponse.json({ customToken })
  } catch (err) {
    console.error('Kakao auth error:', err)
    return NextResponse.json({ error: 'auth failed' }, { status: 500 })
  }
}
