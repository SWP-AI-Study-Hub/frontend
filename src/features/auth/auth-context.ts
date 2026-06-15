import { createContext } from 'react'
import type {
  CurrentUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '../../types/auth'

export type AuthContextValue = {
  user: CurrentUser | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<CurrentUser>
  loginWithGoogle: () => Promise<CurrentUser>
  register: (payload: RegisterPayload) => Promise<CurrentUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<CurrentUser | null>
  updateProfile: (payload: UpdateProfilePayload) => Promise<CurrentUser>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
