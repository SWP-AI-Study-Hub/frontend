'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getUsers, updateUserRole, updateUserStatus, type UserQuery } from '../api/users.api'
import type { CurrentUser, UserListResponse, UserRole, UserStatus } from '../types/auth'
import { useAuth } from '../features/auth/useAuth'

const roles: UserRole[] = ['ADMIN', 'MODERATOR', 'USER']
const statuses: UserStatus[] = ['ACTIVE', 'LOCKED', 'INACTIVE']
const DEFAULT_QUERY: UserQuery = { page: 1, pageSize: 10 }

export function AdminUsersView() {
  const { user: currentUser } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [data, setData] = useState<UserListResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async (query: UserQuery = DEFAULT_QUERY) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await getUsers(query)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    await loadUsers({ ...DEFAULT_QUERY, keyword, role, status })
  }

  async function handleStatusChange(targetUser: CurrentUser, nextStatus: UserStatus) {
    setError('')

    if (targetUser.id === currentUser?.id && nextStatus === 'LOCKED') {
      setError('Admins should not lock their own account.')
      return
    }

    setUpdatingUserId(targetUser.id)

    try {
      await updateUserStatus(targetUser.id, nextStatus)
      await loadUsers({ ...DEFAULT_QUERY, keyword, role, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user status')
    } finally {
      setUpdatingUserId(null)
    }
  }

  async function handleRoleChange(targetUser: CurrentUser, nextRole: UserRole) {
    setError('')
    setUpdatingUserId(targetUser.id)

    try {
      await updateUserRole(targetUser.id, nextRole)
      await loadUsers({ ...DEFAULT_QUERY, keyword, role, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p>Manage user roles and account status.</p>
        </div>
      </div>

      <form className="toolbar" onSubmit={handleSearch}>
        <label className="search-box">
          <Search size={18} />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search name or email" />
        </label>
        <select value={role} onChange={(event) => setRole(event.target.value as UserRole | '')}>
          <option value="">All roles</option>
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as UserStatus | '')}>
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="secondary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <section className="content-panel">
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? <p>Loading users...</p> : null}
        {!isLoading && data?.items.length === 0 ? <p>No matching users found.</p> : null}
        {!isLoading && data?.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      <span>{item.email}</span>
                    </td>
                    <td>
                      <select
                        value={item.role}
                        disabled={isLoading || updatingUserId === item.id}
                        onChange={(event) => void handleRoleChange(item, event.target.value as UserRole)}
                      >
                        {roles.map((roleItem) => (
                          <option key={roleItem} value={roleItem}>
                            {roleItem}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.status}
                        disabled={isLoading || updatingUserId === item.id}
                        onChange={(event) => void handleStatusChange(item, event.target.value as UserStatus)}
                      >
                        {statuses.map((statusItem) => (
                          <option key={statusItem} value={statusItem}>
                            {statusItem}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{item.lastLogin ?? 'No data yet'}</td>
                    <td>
                      <Link href={`/admin/users/${item.id}`}>Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}
