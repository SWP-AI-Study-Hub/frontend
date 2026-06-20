'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardCheck, FileWarning, Search, ShieldCheck, UserCheck, UsersRound, UserX } from 'lucide-react'
import { getUsers, updateUserStatus, type UserQuery } from '../api/users.api'
import type { AdminMutableUserStatus, CurrentUser, UserListResponse, UserRole, UserStatus } from '../types/auth'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

const roles: UserRole[] = ['ADMIN', 'USER']
const statuses: UserStatus[] = ['ACTIVE', 'BLOCKED', 'INACTIVE']
const mutableStatuses: AdminMutableUserStatus[] = ['ACTIVE', 'BLOCKED']
const DEFAULT_QUERY: UserQuery = { page: 1, limit: 10 }
type UserFilters = Pick<UserQuery, 'keyword' | 'role' | 'status'>

export function AdminUsersView() {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>({})
  const [data, setData] = useState<UserListResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const users = data?.items ?? []
  const activeUsers = users.filter((item) => item.status === 'ACTIVE').length
  const blockedUsers = users.filter((item) => item.status === 'BLOCKED').length
  const adminUsers = users.filter((item) => item.role === 'ADMIN').length

  const loadUsers = useCallback(async (query: UserQuery = DEFAULT_QUERY) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await getUsers(query)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    const filters = { keyword, role, status }
    setAppliedFilters(filters)
    await loadUsers({ ...DEFAULT_QUERY, ...filters })
  }

  async function handlePageChange(page: number) {
    if (isLoading || page === data?.meta.page || page < 1 || page > (data?.meta.totalPages ?? 1)) {
      return
    }

    await loadUsers({ ...DEFAULT_QUERY, ...appliedFilters, page })
  }

  async function handleStatusChange(targetUser: CurrentUser, nextStatus: AdminMutableUserStatus) {
    setError('')

    if (targetUser.id === currentUser?.id && nextStatus === 'BLOCKED') {
      setError(t('admin.selfBlock'))
      return
    }

    setUpdatingUserId(targetUser.id)

    try {
      await updateUserStatus(targetUser.id, nextStatus)
      await loadUsers({ ...DEFAULT_QUERY, ...appliedFilters, page: data?.meta.page ?? 1 })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.statusFailed'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <main className="page" id="main-content">
      <div className="page-header page-header--editorial">
        <div>
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h1>{t('admin.usersTitle')}</h1>
          <p>{t('admin.usersBody')}</p>
        </div>
        <span className="page-number">02 / ADMIN</span>
      </div>

      <section className="admin-stats">
        <article className="stat-card">
          <UsersRound size={20} />
          <span>{t('admin.totalUsers')}</span>
          <strong>{data?.meta?.totalItems ?? users.length}</strong>
        </article>
        <article className="stat-card">
          <UserCheck size={20} />
          <span>{t('admin.active')}</span>
          <strong>{activeUsers}</strong>
        </article>
        <article className="stat-card">
          <ShieldCheck size={20} />
          <span>{t('admin.admins')}</span>
          <strong>{adminUsers}</strong>
        </article>
        <article className="stat-card">
          <UserX size={20} />
          <span>{t('admin.blocked')}</span>
          <strong>{blockedUsers}</strong>
        </article>
      </section>

      <section className="admin-workflow">
        <article>
          <ShieldCheck size={18} />
          <strong>{t('admin.accessTitle')}</strong>
          <span>{t('admin.accessBody')}</span>
        </article>
        <article>
          <FileWarning size={18} />
          <strong>{t('admin.moderationTitle')}</strong>
          <span>{t('admin.moderationBody')}</span>
        </article>
        <article>
          <ClipboardCheck size={18} />
          <strong>{t('admin.auditTitle')}</strong>
          <span>{t('admin.auditBody')}</span>
        </article>
      </section>

      <form className="toolbar" onSubmit={handleSearch}>
        <label className="search-box">
          <Search size={18} />
          <input
            name="userSearch"
            aria-label={t('admin.searchPlaceholder')}
            autoComplete="off"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={`${t('admin.searchPlaceholder')}…`}
          />
        </label>
        <select name="roleFilter" aria-label={t('admin.allRoles')} value={role} onChange={(event) => setRole(event.target.value as UserRole | '')}>
          <option value="">{t('admin.allRoles')}</option>
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select name="statusFilter" aria-label={t('admin.allStatuses')} value={status} onChange={(event) => setStatus(event.target.value as UserStatus | '')}>
          <option value="">{t('admin.allStatuses')}</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="secondary-button" type="submit" disabled={isLoading}>
          {isLoading ? t('common.searching') : t('common.search')}
        </button>
      </form>

      <section className="content-panel">
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? <div className="loading-state"><span className="loading-line" /><p>{t('admin.loadingUsers')}</p></div> : null}
        {!isLoading && users.length === 0 ? <div className="empty-state"><UsersRound size={28} /><p>{t('admin.noUsers')}</p></div> : null}
        {!isLoading && users.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.user')}</th>
                    <th>{t('admin.role')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.lastLogin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.fullName}</strong>
                        <span>{item.email}</span>
                      </td>
                      <td>
                        <span className="status-pill role">{item.role}</span>
                      </td>
                      <td>
                        {item.status === 'INACTIVE' ? (
                          <span className="status-pill">INACTIVE</span>
                        ) : (
                          <select
                            value={item.status}
                            disabled={isLoading || updatingUserId === item.id}
                            onChange={(event) => void handleStatusChange(item, event.target.value as AdminMutableUserStatus)}
                          >
                            {mutableStatuses.map((statusItem) => (
                              <option key={statusItem} value={statusItem}>
                                {statusItem}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${item.status === 'ACTIVE' ? 'success' : item.status === 'BLOCKED' ? 'danger' : ''}`}>
                          {item.lastLogin ?? t('profile.noData')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && data.meta.totalPages > 1 ? (
              <nav className="admin-pagination" aria-label="User pagination">
                <span>
                  {data.meta.totalItems} {t('admin.totalUsers').toLowerCase()}
                </span>
                <div>
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={!data.meta.hasPrevious || isLoading}
                    onClick={() => void handlePageChange(data.meta.page - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: data.meta.totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={page === data.meta.page ? 'active' : undefined}
                      aria-current={page === data.meta.page ? 'page' : undefined}
                      aria-label={`Page ${page}`}
                      disabled={isLoading}
                      onClick={() => void handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={!data.meta.hasNext || isLoading}
                    onClick={() => void handlePageChange(data.meta.page + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  )
}
