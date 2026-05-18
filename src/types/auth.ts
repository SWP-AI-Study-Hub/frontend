export type UserRole = 'ADMIN' | 'MODERATOR' | 'USER'

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE'

export type CurrentUser = {
  id: string
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
