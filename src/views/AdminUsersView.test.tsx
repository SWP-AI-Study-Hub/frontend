import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getUsers } from '../api/users.api'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'
import type { CurrentUser, UserListResponse } from '../types/auth'
import { AdminUsersView } from './AdminUsersView'

vi.mock('../api/users.api', () => ({
  getUsers: vi.fn(),
  updateUserStatus: vi.fn(),
}))

vi.mock('../features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../i18n/LanguageProvider', () => ({
  useLanguage: vi.fn(),
}))

const admin: CurrentUser = {
  id: 'admin-id',
  fullName: 'Admin User',
  email: 'admin@example.com',
  avatarUrl: null,
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: '2026-06-18T00:00:00.000Z',
  lastLogin: null,
}

const pageOne: UserListResponse = {
  items: [admin],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 25,
    totalPages: 3,
    hasNext: true,
    hasPrevious: false,
  },
}

describe('AdminUsersView pagination', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: admin,
    } as ReturnType<typeof useAuth>)
    vi.mocked(useLanguage).mockReturnValue({
      locale: 'en',
      setLocale: vi.fn(),
      t: (key) => key,
    })
    vi.mocked(getUsers).mockResolvedValue(pageOne)
  })

  it('renders all available page buttons and requests the selected page', async () => {
    render(<AdminUsersView />)

    await screen.findByText(admin.email)

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))

    await waitFor(() => {
      expect(getUsers).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
      })
    })
  })
})
