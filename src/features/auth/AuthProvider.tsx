'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../../api/auth.api'
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

  const handleLogout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
    }),
    [handleLogin, handleLogout, handleRegister, isLoading, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
