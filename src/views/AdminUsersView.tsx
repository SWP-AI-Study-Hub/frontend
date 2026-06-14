'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck, FileWarning, Search, ShieldCheck, UserCheck, UsersRound, UserX } from 'lucide-react'
import { getUsers, updateUserRole, updateUserStatus, type UserQuery } from '../api/users.api'
import type { CurrentUser, UserListResponse, UserRole, UserStatus } from '../types/auth'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

const roles: UserRole[] = ['ADMIN', 'USER']
const statuses: UserStatus[] = ['ACTIVE', 'BLOCKED', 'INACTIVE']
const DEFAULT_QUERY: UserQuery = { page: 1, pageSize: 10 }

export function AdminUsersView() {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
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
    await loadUsers({ ...DEFAULT_QUERY, keyword, role, status })
  }

  async function handleStatusChange(targetUser: CurrentUser, nextStatus: UserStatus) {
    setError('')

    if (targetUser.id === currentUser?.id && nextStatus === 'BLOCKED') {
      setError(t('admin.selfBlock'))
      return
    }

    setUpdatingUserId(targetUser.id)

    try {
      await updateUserStatus(targetUser.id, nextStatus)
      await loadUsers({ ...DEFAULT_QUERY, keyword, role, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.statusFailed'))
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
      setError(err instanceof Error ? err.message : t('admin.roleFailed'))
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
          <strong>{data?.total ?? users.length}</strong>
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
        {!isLoading && data?.items.length === 0 ? <div className="empty-state"><UsersRound size={28} /><p>{t('admin.noUsers')}</p></div> : null}
        {!isLoading && data?.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.user')}</th>
                  <th>{t('admin.role')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.lastLogin')}</th>
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
                    <td>
                      <span className={`status-pill ${item.status === 'ACTIVE' ? 'success' : item.status === 'BLOCKED' ? 'danger' : ''}`}>
                        {item.lastLogin ?? t('profile.noData')}
                      </span>
                    </td>
                    <td>
                      <Link className="detail-link" href={`/admin/users/${item.id}`}>
                        {t('common.details')}
                      </Link>
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
