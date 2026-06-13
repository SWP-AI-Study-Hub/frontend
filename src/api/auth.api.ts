import { apiRequest } from '../lib/http'
import type { CurrentUser, GoogleLoginPayload, LoginPayload, RegisterPayload } from '../types/auth'

export function register(payload: RegisterPayload) {
  return apiRequest<CurrentUser>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginPayload) {
  return apiRequest<void>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function loginWithGoogle(payload: GoogleLoginPayload) {
  return apiRequest<CurrentUser>('/auth/firebase-login', {
    method: 'POST',
    body: payload,
  })
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/auth/me')
}

export function forgotPassword(email: string) {
  return apiRequest<void>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function resetPassword(token: string, password: string) {
  return apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  })
}
