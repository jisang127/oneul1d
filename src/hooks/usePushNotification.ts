'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export const usePushNotification = () => {
  const { user } = useAuthStore()

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) return existing

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Firestore에 구독 정보 저장 (알림 발송에 사용)
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'pushSubscriptions', 'default'), {
          subscription: JSON.parse(JSON.stringify(subscription)),
          updatedAt: Date.now(),
        })
      }
      return subscription
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await subscribe()
      return true
    }
    return false
  }

  return { requestPermission }
}

// Service Worker 등록
export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])
}
