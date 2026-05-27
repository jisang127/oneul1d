import { create } from 'zustand'
import type { User, Todo } from '@/types'

interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}))

interface TodoStore {
  todos: Todo[]
  selectedDate: string
  setTodos: (todos: Todo[]) => void
  setSelectedDate: (date: string) => void
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  selectedDate: todayStr(),
  setTodos: (todos) => set({ todos }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
