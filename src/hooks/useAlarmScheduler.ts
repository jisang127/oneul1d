'use client'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store'
import { showToast } from '@/components/ui/ToastNotification'
import type { Todo } from '@/types'

export const useAlarmScheduler = (allTodos: Todo[]) => {
  const { user } = useAuthStore()
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const check = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      allTodos.forEach((todo) => {
        if (!todo.alertEnabled || !todo.alertTime) return
        if (todo.alertTime !== currentTime) return
        if (todo.done) return

        const isToday = todo.date === todayStr || todo.repeatType !== 'none'
        if (!isToday) return
        if (todo.dueDate && todayStr > todo.dueDate) return

        const key = `${todo.id}-${currentTime}`
        if (firedRef.current.has(key)) return
        firedRef.current.add(key)
        setTimeout(() => firedRef.current.delete(key), 60 * 60 * 1000)

        // 포그라운드: 인앱 토스트 알림
        showToast('오늘하루 🔔', todo.title)

        // 백그라운드: 브라우저 알림
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification('오늘하루 🔔', {
            body: todo.title,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          })
        }
      })
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [user, allTodos])
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}
