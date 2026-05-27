'use client'
import { useState, useCallback, useMemo } from 'react'
import { useAuthStore, useTodoStore } from '@/store'
import { useTodos } from '@/hooks/useTodos'
import { useAllTodos } from '@/hooks/useAllTodos'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useServiceWorker } from '@/hooks/usePushNotification'
import { useTheme } from '@/components/ui/ThemeProvider'
import { addTodo, updateTodo, deleteTodo, toggleDone, togglePin, updateSortOrder, updateSubtasks } from '@/lib/todos'
import { signOut } from '@/lib/auth'
import { WeekStrip } from '@/components/todo/WeekStrip'
import { MonthCalendar } from '@/components/todo/MonthCalendar'
import { TodoList } from '@/components/todo/TodoList'
import { TodoModal } from '@/components/todo/TodoModal'
import { SearchModal } from '@/components/todo/SearchModal'
import { PomodoroTimer } from '@/components/ui/PomodoroTimer'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import type { Todo } from '@/types'

type ViewMode = 'week' | 'month'

export default function HomePage() {
  const { user } = useAuthStore()
  const { todos, selectedDate, setSelectedDate } = useTodoStore()
  const { theme, toggle: toggleTheme } = useTheme()
  useTodos()
  useServiceWorker()
  const allTodos = useAllTodos()

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null)

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {}
    allTodos.forEach((t) => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [allTodos])

  const handleAddTodo = useCallback(async (data: Partial<Todo>) => {
    if (!user) return
    const maxOrder = todos.length > 0 ? Math.max(...todos.map((t) => t.sortOrder)) + 1 : 0
    await addTodo(user.uid, {
      title: data.title || '',
      content: data.content || '',
      done: false,
      doneAt: null,
      doneDates: {},
      color: data.color || 'white',
      pinned: false,
      sortOrder: maxOrder,
      date: selectedDate,
      repeatType: data.repeatType || 'none',
      repeatDays: data.repeatDays || [],
      repeatDayOfMonth: data.repeatDayOfMonth || null,
      alertEnabled: data.alertEnabled || false,
      alertTime: data.alertTime || null,
      dueDate: data.dueDate || null,
      subtasks: [],
    })
  }, [user, todos, selectedDate])

  const handleEditTodo = useCallback(async (data: Partial<Todo>) => {
    if (!user || !editingTodo) return
    await updateTodo(user.uid, editingTodo.id, data)
  }, [user, editingTodo])

  const handleDeleteTodo = useCallback(async (id: string) => {
    if (!user) return
    await deleteTodo(user.uid, id)
  }, [user])

  const handleReorder = useCallback(async (reordered: Todo[]) => {
    if (!user) return
    await Promise.all(reordered.map((t) => updateSortOrder(user.uid, t.id, t.sortOrder)))
  }, [user])

  const handleSearchSelect = (todo: Todo) => {
    setSelectedDate(todo.date)
    setViewMode('week')
    setEditingTodo(todo)
  }

  const closeAll = useCallback(() => {
    setShowAddModal(false)
    setShowSearch(false)
    setShowPomodoro(false)
    setEditingTodo(null)
  }, [])

  useKeyboardShortcuts({
    onNewTodo: () => { closeAll(); setShowAddModal(true) },
    onSearch: () => { closeAll(); setShowSearch(true) },
    onEscape: closeAll,
  })

  const isDark = theme === 'dark'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: isDark ? '#16213E' : '#F8F6FA', maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: isDark ? '#1A1A2E' : '#fff', borderBottom: `0.5px solid ${isDark ? '#2A3A5E' : '#EEE8F0'}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', color: isDark ? '#4A6ADE' : '#1E2A5E' }}>✓</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#E8E0F0' : '#1E2A5E' }}>Doto</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* 검색 */}
          <button onClick={() => { closeAll(); setShowSearch(true) }} title="검색 (/)" style={iconBtnStyle(isDark)}>🔍</button>
          {/* 포모도로 */}
          <button onClick={() => { closeAll(); setShowPomodoro(true) }} title="포모도로 타이머" style={iconBtnStyle(isDark)}>🍅</button>
          {/* 다크모드 */}
          <button onClick={toggleTheme} title="다크모드 토글" style={iconBtnStyle(isDark)}>{isDark ? '☀️' : '🌙'}</button>
          {/* 주간/월간 토글 */}
          <div style={{ display: 'flex', border: `1.5px solid ${isDark ? '#2A3A5E' : '#EEE8F0'}`, borderRadius: '10px', overflow: 'hidden' }}>
            {(['week', 'month'] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setViewMode(v)} style={{ padding: '5px 10px', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: viewMode === v ? (isDark ? '#4A6ADE' : '#1E2A5E') : 'transparent', color: viewMode === v ? '#fff' : (isDark ? '#8878A0' : '#A090A0'), transition: 'all 0.2s' }}>
                {v === 'week' ? '주간' : '월간'}
              </button>
            ))}
          </div>
          <button onClick={() => signOut()} style={{ background: 'none', border: 'none', fontSize: '11px', color: isDark ? '#60506A' : '#C0B0C0', cursor: 'pointer' }}>로그아웃</button>
        </div>
      </div>

      {/* 캘린더 */}
      {viewMode === 'week'
        ? <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} todosByDate={todosByDate} />
        : <MonthCalendar selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setViewMode('week') }} todosByDate={todosByDate} />
      }

      {/* 투두 목록 */}
      <TodoList
        todos={todos}
        selectedDate={selectedDate}
        onToggleDone={(todo, done) => user && toggleDone(user.uid, todo, done, selectedDate)}
        onTogglePin={(id, pinned) => user && togglePin(user.uid, id, pinned)}
        onEdit={setEditingTodo}
        onDelete={(id) => {
          if (localStorage.getItem('skip-todo-delete-confirm') === 'true') { handleDeleteTodo(id) }
          else { setDeletingTodoId(id) }
        }}
        onUpdateSubtasks={(id, subs) => user && updateSubtasks(user.uid, id, subs)}
        onReorder={handleReorder}
      />

      {/* 추가 버튼 + 단축키 힌트 */}
      <div style={{ padding: '12px 16px 24px', background: isDark ? '#1A1A2E' : '#fff', borderTop: `0.5px solid ${isDark ? '#2A3A5E' : '#EEE8F0'}`, flexShrink: 0 }}>
        <button onClick={() => { closeAll(); setShowAddModal(true) }} style={{ width: '100%', padding: '12px', border: `1.5px dashed ${isDark ? '#2A3A5E' : '#D0C8D8'}`, borderRadius: '12px', background: 'transparent', fontSize: '13px', color: isDark ? '#8878A0' : '#A090A0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> 할 일 추가
          <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.5 }}>N</span>
        </button>
      </div>

      {/* 팝업들 */}
      {showSearch && <SearchModal todos={allTodos} onSelect={handleSearchSelect} onClose={() => setShowSearch(false)} />}
      {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)} />}
      {showAddModal && <TodoModal mode="add" defaultDate={selectedDate} onSave={handleAddTodo} onClose={() => setShowAddModal(false)} />}
      {editingTodo && (
        <TodoModal mode="edit" initialData={editingTodo} onSave={handleEditTodo}
          onDelete={() => {
            if (localStorage.getItem('skip-todo-delete-confirm') === 'true') { handleDeleteTodo(editingTodo.id); setEditingTodo(null) }
            else { setDeletingTodoId(editingTodo.id); setEditingTodo(null) }
          }}
          onClose={() => setEditingTodo(null)}
        />
      )}
      {deletingTodoId && (
        <DeleteConfirmModal message="삭제하면 되돌릴 수 없어요." skipKey="skip-todo-delete-confirm"
          onConfirm={() => { handleDeleteTodo(deletingTodoId); setDeletingTodoId(null) }}
          onCancel={() => setDeletingTodoId(null)}
        />
      )}
    </div>
  )
}

const iconBtnStyle = (isDark: boolean): React.CSSProperties => ({
  background: 'none',
  border: `1.5px solid ${isDark ? '#2A3A5E' : '#EEE8F0'}`,
  borderRadius: '8px',
  padding: '5px 8px',
  fontSize: '14px',
  cursor: 'pointer',
  lineHeight: 1,
})
