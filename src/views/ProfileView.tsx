'use client'

import { Fingerprint, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

export function ProfileView() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const displayName = user?.fullName ?? 'Study member'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <main className="page" id="main-content">
      <header className="page-header page-header--editorial">
        <div>
          <p className="eyebrow">{t('profile.eyebrow')}</p>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.body')}</p>
        </div>
        <span className="page-number">01 / PROFILE</span>
      </header>

      <section className="dashboard-grid">
        <article className="content-panel profile-card">
          <div className="avatar">{initial}</div>
          <div>
            <p className="eyebrow">{t('profile.account')}</p>
            <h2>{displayName}</h2>
            <span>{user?.email}</span>
          </div>
          <div className="profile-badges">
            <span className="status-pill role">{user?.role}</span>
            <span className={`status-pill ${user?.status === 'ACTIVE' ? 'success' : user?.status === 'BLOCKED' ? 'danger' : ''}`}>
              {user?.status}
            </span>
          </div>
        </article>

        <article className="content-panel">
          <div className="panel-title">
            <h2>{t('profile.overview')}</h2>
            <ShieldCheck size={21} />
          </div>
          <div className="metric-list">
            <div>
              <span><KeyRound size={16} />{t('profile.auth')}</span>
              <strong>{user?.authProvider ?? t('profile.firebaseVerified')}</strong>
            </div>
            <div>
              <span><Fingerprint size={16} />{t('profile.firebaseUid')}</span>
              <strong>{user?.firebaseUid ?? t('profile.verified')}</strong>
            </div>
            <div>
              <span><ShieldCheck size={16} />{t('profile.routeGuard')}</span>
              <strong>ProtectedRoute</strong>
            </div>
            <div>
              <span><UserRound size={16} />{t('profile.roleAccess')}</span>
              <strong>{user?.role === 'ADMIN' ? t('profile.adminEnabled') : t('profile.learnerAccess')}</strong>
            </div>
            <div>
              <span>{t('profile.planQuota')}</span>
              <strong>{t('profile.loaded')}</strong>
            </div>
            <div>
              <span>{t('profile.lastLogin')}</span>
              <strong>{user?.lastLogin ?? t('profile.noData')}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
