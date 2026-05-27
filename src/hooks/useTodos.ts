'use client'
import { useEffect } from 'react'
import { useAuthStore, useTodoStore } from '@/store'
import { subscribeTodos } from '@/lib/todos'

export const useTodos = () => {
  const { user } = useAuthStore()
  const { selectedDate, setTodos } = useTodoStore()

  useEffect(() => {
    if (!user) return
    const unsub = subscribeTodos(user.uid, selectedDate, setTodos)
    return () => unsub()
  }, [user, selectedDate, setTodos])
}
