'use client'
import { useEffect } from 'react'
import { onAuth } from '@/lib/auth'
import { useAuthStore } from '@/store'

export const useAuthInit = () => {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuth((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [setUser, setLoading])
}
