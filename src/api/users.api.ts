import { apiRequest } from '../lib/http'
import type { CurrentUser, UserListResponse, UserRole, UserStatus } from '../types/auth'

type UserQuery = {
  page?: number
  pageSize?: number
  keyword?: string
  role?: UserRole | ''
  status?: UserStatus | ''
}

function toQueryString(query: UserQuery) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const text = params.toString()
  return text ? `?${text}` : ''
}

export function getUsers(query: UserQuery = {}) {
  return apiRequest<UserListResponse>(`/users${toQueryString(query)}`)
}

export function getUserById(id: string) {
  return apiRequest<CurrentUser>(`/users/${id}`)
}

export function updateUserStatus(id: string, status: UserStatus) {
  return apiRequest<CurrentUser>(`/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function updateUserRole(id: string, role: UserRole) {
  return apiRequest<CurrentUser>(`/users/${id}/role`, {
    method: 'PATCH',
    body: { role },
  })
}
