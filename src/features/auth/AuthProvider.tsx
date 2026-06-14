'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { onIdTokenChanged, signInWithPopup, signOut } from 'firebase/auth'
import * as authApi from '../../api/auth.api'
import { clearStoredAuthToken, setStoredAuthToken } from '../../lib/auth-token'
import { getFirebaseAuth, getGoogleAuthProvider } from '../../lib/firebase'
import type { CurrentUser, LoginPayload, RegisterPayload } from '../../types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth()
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      setIsLoading(true)

      if (!firebaseUser) {
        clearStoredAuthToken()
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()
        setStoredAuthToken(idToken)
        const currentUser = await authApi.loginWithFirebaseToken({ idToken })
        setUser(currentUser)
      } catch {
        clearStoredAuthToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    function handleUnauthorized() {
      clearStoredAuthToken()
      setUser(null)
      void signOut(firebaseAuth)
    }

    window.addEventListener('ai-study-hub:unauthorized', handleUnauthorized)

    return () => {
      unsubscribe()
      window.removeEventListener('ai-study-hub:unauthorized', handleUnauthorized)
    }
  }, [])

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const currentUser = await authApi.login(payload)
      setUser(currentUser)
      setIsLoading(false)
      return currentUser
    },
    [],
  )

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      const currentUser = await authApi.register(payload)
      setUser(currentUser)
      setIsLoading(false)
      return currentUser
    },
    [],
  )

  const handleGoogleLogin = useCallback(async () => {
    const firebaseAuth = getFirebaseAuth()
    const googleAuthProvider = getGoogleAuthProvider()
    const credential = await signInWithPopup(firebaseAuth, googleAuthProvider)
    const idToken = await credential.user.getIdToken()
    setStoredAuthToken(idToken)
    const currentUser = await authApi.loginWithFirebaseToken({ idToken })

    setUser(currentUser)
    setIsLoading(false)

    if (!currentUser) {
      await signOut(firebaseAuth)
      throw new Error('Cannot load current user after Google login')
    }

    return currentUser
  }, [])

  const handleLogout = useCallback(async () => {
    await authApi.logout()
    clearStoredAuthToken()
    await signOut(getFirebaseAuth())
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: handleLogin,
      loginWithGoogle: handleGoogleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
    }),
    [handleGoogleLogin, handleLogin, handleLogout, handleRegister, isLoading, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
