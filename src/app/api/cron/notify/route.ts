import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron: 매분 실행 (vercel.json에 설정)
// 알림 시간이 현재 시간과 일치하는 todo를 찾아 Web Push 발송
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    const webpush = await import('web-push')

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    webpush.default.setVapidDetails(
      'mailto:' + process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    )

    const db = getFirestore()
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const todayStr = now.toISOString().split('T')[0]

    // 모든 사용자의 todo 순회 (실제 서비스에선 컬렉션 그룹 쿼리 사용)
    const usersSnap = await db.collection('users').listDocuments()
    const results: string[] = []

    for (const userRef of usersSnap) {
      const todosSnap = await userRef.collection('todos')
        .where('alertEnabled', '==', true)
        .where('alertTime', '==', currentTime)
        .get()

      if (todosSnap.empty) continue

      const subSnap = await userRef.collection('pushSubscriptions').doc('default').get()
      if (!subSnap.exists) continue
      const { subscription } = subSnap.data()!

      for (const todoDoc of todosSnap.docs) {
        const todo = todoDoc.data()
        // 오늘 날짜에 해당하는 항목만 발송
        const isToday = todo.date === todayStr || todo.repeatType !== 'none'
        if (!isToday) continue

        try {
          await webpush.default.sendNotification(
            subscription,
            JSON.stringify({ title: 'Doto 알림 🔔', body: todo.title })
          )
          results.push(todo.title)
        } catch (e) {
          console.error('Push send error:', e)
        }
      }
    }

    return NextResponse.json({ sent: results.length, titles: results })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
