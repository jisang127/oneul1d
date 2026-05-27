'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/store'
import type { Todo } from '@/types'

export const useAllTodos = () => {
  const { user } = useAuthStore()
  const [allTodos, setAllTodos] = useState<Todo[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'todos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setAllTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Todo)))
    })
    return () => unsub()
  }, [user])

  return allTodos
}
