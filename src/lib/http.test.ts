import { getFirebaseAuth } from './firebase'
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  notifyUnauthorized,
  setStoredAuthToken,
} from './auth-token'
import { ApiError, apiRequest } from './http'

vi.mock('./firebase', () => ({
  getFirebaseAuth: vi.fn(),
}))

vi.mock('./auth-token', () => ({
  clearStoredAuthToken: vi.fn(),
  getStoredAuthToken: vi.fn(),
  notifyUnauthorized: vi.fn(),
  setStoredAuthToken: vi.fn(),
}))

const mockedGetFirebaseAuth = vi.mocked(getFirebaseAuth)
const mockedGetStoredAuthToken = vi.mocked(getStoredAuthToken)

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('apiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetFirebaseAuth.mockReturnValue({ currentUser: null } as ReturnType<
      typeof getFirebaseAuth
    >)
    mockedGetStoredAuthToken.mockReturnValue(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('attaches a fresh Firebase ID token and unwraps the shared response', async () => {
    const getIdToken = vi.fn().mockResolvedValue('fresh-token')
    mockedGetFirebaseAuth.mockReturnValue({
      currentUser: { getIdToken },
    } as unknown as ReturnType<typeof getFirebaseAuth>)
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        success: true,
        data: { id: 'user-1' },
        timestamp: '2026-06-15T00:00:00.000Z',
      }),
    )

    await expect(apiRequest<{ id: string }>('/auth/me')).resolves.toEqual({
      id: 'user-1',
    })

    const [, request] = vi.mocked(fetch).mock.calls[0]
    const headers = new Headers(request?.headers)
    expect(headers.get('Authorization')).toBe('Bearer fresh-token')
    expect(setStoredAuthToken).toHaveBeenCalledWith('fresh-token')
  })

  it('uses the stored token when Firebase has not restored its user yet', async () => {
    mockedGetStoredAuthToken.mockReturnValue('stored-token')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ success: true, data: [] }))

    await apiRequest('/admin/users')

    const [, request] = vi.mocked(fetch).mock.calls[0]
    expect(new Headers(request?.headers).get('Authorization')).toBe(
      'Bearer stored-token',
    )
  })

  it('clears auth state and notifies the provider on 401', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        {
          success: false,
          error: { message: 'Invalid Firebase token' },
        },
        401,
      ),
    )

    await expect(apiRequest('/auth/me')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        message: 'Invalid Firebase token',
        status: 401,
      }),
    )
    expect(clearStoredAuthToken).toHaveBeenCalledOnce()
    expect(notifyUnauthorized).toHaveBeenCalledOnce()
  })

  it('does not sign out an authenticated user for a resource-level 403', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        {
          success: false,
          error: { message: 'Admin role required' },
        },
        403,
      ),
    )

    await expect(apiRequest('/admin/users')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        message: 'Admin role required',
        status: 403,
      }),
    )
    expect(clearStoredAuthToken).not.toHaveBeenCalled()
    expect(notifyUnauthorized).not.toHaveBeenCalled()
  })
})
