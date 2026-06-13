import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { apiRequest } from '../lib/http'
import { firebaseAuth } from '../lib/firebase'
import type { CurrentUser, GoogleLoginPayload, LoginPayload, RegisterPayload } from '../types/auth'

export async function register(payload: RegisterPayload) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password)

  await updateProfile(credential.user, { displayName: payload.fullName })
  const idToken = await credential.user.getIdToken(true)

  return loginWithGoogle({ idToken })
}

export async function login(payload: LoginPayload) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, payload.email, payload.password)
  const idToken = await credential.user.getIdToken()

  return loginWithGoogle({ idToken })
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
  return sendPasswordResetEmail(firebaseAuth, email)
}

export function resetPassword(token: string, password: string) {
  return apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  })
}
