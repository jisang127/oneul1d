import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Todo, Subtask } from '@/types'

const todosCol = (userId: string) => collection(db, 'users', userId, 'todos')

const matchesRepeat = (todo: Todo, date: string): boolean => {
  if (todo.repeatType === 'daily') return true
  if (todo.repeatType === 'weekly') {
    const dow = new Date(date + 'T00:00:00').getDay()
    return todo.repeatDays.includes(dow)
  }
  if (todo.repeatType === 'monthly') {
    const parts = date.split('-')
    const day = parseInt(parts[2])
    const lastDay = new Date(parseInt(parts[0]), parseInt(parts[1]), 0).getDate()
    const targetDay = Math.min(todo.repeatDayOfMonth || 1, lastDay)
    return day === targetDay
  }
  return false
}

export const subscribeTodos = (
  userId: string,
  date: string,
  callback: (todos: Todo[]) => void
): Unsubscribe => {
  const q = query(todosCol(userId), orderBy('sortOrder', 'asc'))
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Todo))
    const filtered = all.filter((t) => {
      if (t.repeatType === 'none') return t.date === date
      if (t.date > date) return false
      return matchesRepeat(t, date)
    })
    // 반복 항목은 해당 날짜 done 상태를 doneDates에서 읽어서 주입
    const withDoneState = filtered.map((t) => {
      if (t.repeatType === 'none') return t
      const donedOnDate = t.doneDates?.[date] === true
      return { ...t, done: donedOnDate, doneAt: donedOnDate ? (t.doneAt || Date.now()) : null }
    })
    callback(withDoneState)
  })
}

export const addTodo = async (
  userId: string,
  data: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(todosCol(userId), {
    ...data,
    doneDates: {},
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  return ref.id
}

export const updateTodo = (userId: string, todoId: string, data: Partial<Todo>) =>
  updateDoc(doc(db, 'users', userId, 'todos', todoId), {
    ...data,
    updatedAt: Date.now(),
  })

export const deleteTodo = (userId: string, todoId: string) =>
  deleteDoc(doc(db, 'users', userId, 'todos', todoId))

// 반복 항목과 일반 항목 완료 처리 분기
export const toggleDone = (userId: string, todo: Todo, done: boolean, date: string) => {
  if (todo.repeatType === 'none') {
    return updateTodo(userId, todo.id, { done, doneAt: done ? Date.now() : null })
  }
  // 반복 항목: doneDates에 해당 날짜만 기록
  const doneDates = { ...(todo.doneDates || {}) }
  if (done) {
    doneDates[date] = true
  } else {
    delete doneDates[date]
  }
  return updateTodo(userId, todo.id, { doneDates })
}

export const togglePin = (userId: string, todoId: string, pinned: boolean) =>
  updateTodo(userId, todoId, { pinned })

export const updateSortOrder = (userId: string, todoId: string, sortOrder: number) =>
  updateTodo(userId, todoId, { sortOrder })

export const updateSubtasks = (userId: string, todoId: string, subtasks: Subtask[]) =>
  updateTodo(userId, todoId, { subtasks })
