import { createContext } from 'react'
import type { CurrentUser, LoginPayload, RegisterPayload } from '../../types/auth'

export type AuthContextValue = {
  user: CurrentUser | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<CurrentUser>
  loginWithGoogle: () => Promise<CurrentUser>
  register: (payload: RegisterPayload) => Promise<CurrentUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<CurrentUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
