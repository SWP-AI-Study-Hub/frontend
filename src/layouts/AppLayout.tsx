'use client'

import type { ReactNode } from 'react'
import {
  BookOpen,
  Bookmark,
  CreditCard,
  FileUp,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brand } from '../components/ui/Brand'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname() ?? '/'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Workspace navigation">
          <Link href="/profile" className={pathname === '/profile' ? 'active' : undefined}>
            <LayoutDashboard size={18} />
            {t('nav.dashboard')}
          </Link>
          <span className="disabled-nav">
            <Sparkles size={18} />
            {t('nav.askAi')}
            <small>{t('common.comingSoon')}</small>
          </span>
          <span className="disabled-nav">
            <BookOpen size={18} />
            {t('nav.library')}
            <small>{t('common.comingSoon')}</small>
          </span>
          <span className="disabled-nav">
            <UsersRound size={18} />
            {t('nav.community')}
            <small>{t('common.comingSoon')}</small>
          </span>
          <span className="disabled-nav">
            <Bookmark size={18} />
            {t('nav.saved')}
            <small>{t('common.comingSoon')}</small>
          </span>
        </nav>
        <button className="sidebar-upload" type="button" disabled>
          <FileUp size={18} />
          {t('nav.upload')}
        </button>
        <nav className="side-nav side-nav--utility" aria-label="Account navigation">
          <span className="disabled-nav">
            <CreditCard size={18} />
            {t('nav.subscription')}
            <small>{t('common.comingSoon')}</small>
          </span>
          <Link href="/profile" className={pathname === '/profile' ? 'active' : undefined}>
            <UserRound size={18} />
            {t('common.profile')}
          </Link>
          {user?.role === 'ADMIN' ? (
            <Link href="/admin/users" className={pathname.startsWith('/admin/users') ? 'active' : undefined}>
              <UsersRound size={18} />
              {t('common.admin')}
            </Link>
          ) : null}
        </nav>
      </aside>

      <div className="main-column">
        <header className="app-topbar">
          <div className="app-topbar-user">
            <span className="mini-avatar">{user?.fullName?.charAt(0).toUpperCase() ?? 'D'}</span>
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="app-topbar-actions">
            <LanguageSwitcher />
            <button type="button" className="icon-text-button" onClick={() => void logout()}>
              <LogOut size={17} />
              {t('common.logout')}
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
