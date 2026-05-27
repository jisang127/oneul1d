export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'

export type TodoColor = 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'gray'

export interface Subtask {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface Todo {
  id: string
  userId: string
  title: string
  content: string
  done: boolean
  doneAt: number | null
  // 반복 항목의 날짜별 완료 상태 { 'YYYY-MM-DD': true }
  doneDates: Record<string, boolean>
  color: TodoColor
  pinned: boolean
  sortOrder: number
  date: string // 'YYYY-MM-DD' (생성 날짜 / 비반복 항목 소속 날짜)
  repeatType: RepeatType
  repeatDays: number[]   // 0=일 1=월 2=화 ... 6=토 (weekly용)
  repeatDayOfMonth: number | null  // 1~31 (monthly용)
  alertEnabled: boolean
  alertTime: string | null  // 'HH:mm'
  dueDate: string | null   // 'YYYY-MM-DD'
  subtasks: Subtask[]
  createdAt: number
  updatedAt: number
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
