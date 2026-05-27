'use client'
import { useEffect } from 'react'

interface ShortcutHandlers {
  onNewTodo: () => void
  onSearch: () => void
  onEscape: () => void
}

export const useKeyboardShortcuts = ({ onNewTodo, onSearch, onEscape }: ShortcutHandlers) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // input/textarea 포커스 중엔 단축키 비활성
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable

      if (e.key === 'Escape') { onEscape(); return }

      if (isInput) return

      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); onNewTodo() }
      if (e.key === '/' ) { e.preventDefault(); onSearch() }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNewTodo, onSearch, onEscape])
}
