'use client'
import { useEffect, useRef } from 'react'
import { useAuthStore, useTodoStore } from '@/store'
import type { Todo } from '@/types'

// 브라우저가 열려있을 때 매분 체크해서 알림 발송 (옵션 C)
export const useAlarmScheduler = (allTodos: Todo[]) => {
  const { user } = useAuthStore()
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const check = () => {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      allTodos.forEach((todo) => {
        if (!todo.alertEnabled || !todo.alertTime) return
        if (todo.alertTime !== currentTime) return
        if (todo.done) return

        // 오늘 날짜에 해당하는 항목만
        const isToday = todo.date === todayStr || todo.repeatType !== 'none'
        if (!isToday) return

        // 마감일 지난 항목은 알림 안 보냄
        if (todo.dueDate && todayStr > todo.dueDate) return

        // 같은 분에 중복 발송 방지
        const key = `${todo.id}-${currentTime}`
        if (firedRef.current.has(key)) return
        firedRef.current.add(key)

        // 1시간 후 key 제거 (다음 날 같은 시간에 다시 알림 오게)
        setTimeout(() => firedRef.current.delete(key), 60 * 60 * 1000)

        new Notification('오늘하루 🔔', {
          body: todo.title,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      })
    }

    // 즉시 한 번 체크
    check()

    // 매 10초마다 체크 (분 경계 놓치지 않게)
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [user, allTodos])
}

// 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}
