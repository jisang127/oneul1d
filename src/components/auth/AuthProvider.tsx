'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthInit } from '@/hooks/useAuthInit'
import { useAuthStore } from '@/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInit()
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user && pathname !== '/auth') {
      router.replace('/auth')
    } else if (user && pathname === '/auth') {
      router.replace('/')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F6FA',
      }}>
        <div style={{ fontSize: '13px', color: '#A090A0' }}>로딩 중...</div>
      </div>
    )
  }

  return <>{children}</>
}
