export type UserRole = 'ADMIN' | 'USER'

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE'

export type AuthProvider = 'GOOGLE' | 'EMAIL_PASSWORD'

export type CurrentUser = {
  id: string
  roleId?: number
  firebaseUid?: string
  authProvider?: AuthProvider
  fullName: string
  email: string
  avatarUrl: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt?: string
  lastLogin: string | null
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
}

export type UserListResponse = {
  items: CurrentUser[]
  page: number
  pageSize: number
  total: number
}
