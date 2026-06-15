import { getFirebaseAuth } from './firebase'
import { clearStoredAuthToken, getStoredAuthToken, notifyUnauthorized, setStoredAuthToken } from './auth-token'

export function normalizeApiBaseUrl(value: string) {
  const baseUrl = value.replace(/\/+$/, '')
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api',
)

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
  timestamp?: string
  path?: string
  requestId?: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  let body = options.body
  const firebaseAuth = getFirebaseAuth()

  if (!headers.has('Authorization') && firebaseAuth.currentUser) {
    const idToken = await firebaseAuth.currentUser.getIdToken()
    setStoredAuthToken(idToken)
    headers.set('Authorization', `Bearer ${idToken}`)
  }

  if (!headers.has('Authorization')) {
    const storedToken = getStoredAuthToken()

    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`)
    }
  }

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')
  const data = (contentType?.includes('application/json') ? await response.json() : null) as ApiEnvelope<T> | T | null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? data.error?.message ?? 'Request failed'
        : 'Request failed'

    if (response.status === 401) {
      clearStoredAuthToken()
      notifyUnauthorized()
    }

    throw new ApiError(message, response.status)
  }

  if (data && typeof data === 'object' && 'success' in data && data.success) {
    return data.data as T
  }

  return data as T
}
