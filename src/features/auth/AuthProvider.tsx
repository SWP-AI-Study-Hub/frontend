'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import * as authApi from '../../api/auth.api'
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
    void refreshUser()
  }, [refreshUser])

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      await authApi.login(payload)
      const currentUser = await refreshUser()

      if (!currentUser) {
        throw new Error('Cannot load current user after login')
      }

      return currentUser
    },
    [refreshUser],
  )

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload)
      const currentUser = await refreshUser()

      if (!currentUser) {
        throw new Error('Cannot load current user after register')
      }

      return currentUser
    },
    [refreshUser],
  )

  const handleGoogleLogin = useCallback(async () => {
    const firebaseAuth = getFirebaseAuth()
    const googleAuthProvider = getGoogleAuthProvider()
    const credential = await signInWithPopup(firebaseAuth, googleAuthProvider)
    const idToken = await credential.user.getIdToken()
    const currentUser = await authApi.loginWithGoogle({ idToken })

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
