'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, UserRound } from 'lucide-react'
import { getUserById } from '../api/users.api'
import type { CurrentUser } from '../types/auth'
import { useLanguage } from '../i18n/LanguageProvider'

export function AdminUserDetailView({ userId }: { userId: string }) {
  const { t } = useLanguage()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserById(userId)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : t('admin.detailFailed')))
  }, [t, userId])

  return (
    <main className="page" id="main-content">
      <div className="page-header page-header--editorial">
        <div>
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h1>{t('admin.detailTitle')}</h1>
          <p>{t('admin.detailBody')}</p>
        </div>
        <Link className="secondary-button" href="/admin/users">
          {t('common.back')}
        </Link>
      </div>
      <section className="content-panel">
        {error ? <p className="form-error">{error}</p> : null}
        {!user && !error ? <div className="loading-state"><span className="loading-line" /><p>{t('common.loading')}</p></div> : null}
        {user ? (
          <div className="detail-layout">
            <aside className="detail-summary">
              <div className="avatar">{user.fullName.charAt(0).toUpperCase()}</div>
              <h3>{user.fullName}</h3>
              <span>{user.email}</span>
              <div className="profile-badges">
                <span className="status-pill role">
                  <ShieldCheck size={14} />
                  {user.role}
                </span>
                <span className={`status-pill ${user.status === 'ACTIVE' ? 'success' : user.status === 'BLOCKED' ? 'danger' : ''}`}>
                  <UserRound size={14} />
                  {user.status}
                </span>
              </div>
            </aside>
            <div className="info-grid">
              <span>{t('auth.fullName')}</span>
              <strong>{user.fullName}</strong>
              <span>{t('auth.email')}</span>
              <strong>{user.email}</strong>
              <span>{t('admin.role')}</span>
              <strong>{user.role}</strong>
              <span>{t('admin.status')}</span>
              <strong>{user.status}</strong>
              <span>{t('admin.authProvider')}</span>
              <strong>{user.authProvider ?? 'Firebase Auth'}</strong>
              <span>Firebase UID</span>
              <strong>{user.firebaseUid ?? t('profile.verified')}</strong>
              <span>{t('admin.createdAt')}</span>
              <strong>{user.createdAt}</strong>
              <span>{t('admin.lastLogin')}</span>
              <strong>{user.lastLogin ?? t('profile.noData')}</strong>
              <span>{t('admin.rule')}</span>
              <strong>{t('admin.ruleBody')}</strong>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
