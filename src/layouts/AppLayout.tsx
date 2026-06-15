'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  Bookmark,
  CreditCard,
  FileText,
  FileUp,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  PanelLeftClose,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brand } from '../components/ui/Brand'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  accent?: boolean
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname() ?? '/dashboard'
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isSidebarCompact, setIsSidebarCompact] = useState(false)
  const initial = user?.fullName?.charAt(0).toUpperCase() ?? 'D'

  const workspaceNav: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/library', label: t('nav.library'), icon: LibraryBig },
    { href: '/upload', label: t('nav.upload'), icon: FileUp },
    { href: '/community', label: t('nav.community'), icon: UsersRound },
    { href: '/saved', label: t('nav.saved'), icon: Bookmark },
  ]

  const aiNav: NavItem[] = [
    { href: '/ask-document', label: 'Ask this document', icon: FileText, accent: true },
    { href: '/ask-library', label: 'Ask my library', icon: BookOpen, accent: true },
  ]

  const accountNav: NavItem[] = [
    { href: '/subscription', label: t('nav.subscription'), icon: CreditCard },
    { href: '/profile', label: t('common.profile'), icon: UserRound },
  ]

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  function renderLink(item: NavItem) {
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${isActivePath(pathname, item.href) ? 'active' : ''}${item.accent ? ' ai-nav-link' : ''}`}
        title={isSidebarCompact ? item.label : undefined}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className={`app-shell${isSidebarCompact ? ' app-shell--compact' : ''}`}>
      {isMobileNavOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <aside className={`sidebar${isMobileNavOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-brand-row">
          <Brand compact={isSidebarCompact} />
          <button
            type="button"
            className="sidebar-close-mobile"
            aria-label="Close navigation"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Workspace navigation">
          <span className="side-nav-label">Workspace</span>
          {workspaceNav.map(renderLink)}
        </nav>

        <nav className="side-nav side-nav--ai" aria-label="AI navigation">
          <span className="side-nav-label"><Sparkles size={13} />Ask AI</span>
          {aiNav.map(renderLink)}
        </nav>

        <nav className="side-nav side-nav--utility" aria-label="Account navigation">
          <span className="side-nav-label">Account</span>
          {accountNav.map(renderLink)}
          {user?.role === 'ADMIN' ? (
            renderLink({ href: '/admin/users', label: t('common.admin'), icon: UsersRound })
          ) : (
            <span className="disabled-nav" title={isSidebarCompact ? t('common.admin') : undefined}>
              <UsersRound size={18} />
              <span>{t('common.admin')}</span>
              <small>Admin only</small>
            </span>
          )}
        </nav>

        <button
          type="button"
          className="sidebar-collapse"
          onClick={() => setIsSidebarCompact((current) => !current)}
          aria-label={isSidebarCompact ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCompact ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftClose size={17} />
          <span>Collapse sidebar</span>
        </button>
      </aside>

      <div className="main-column">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="app-topbar-user">
            {user?.avatarUrl ? (
              <span
                className="mini-avatar mini-avatar--image"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <span className="mini-avatar">{initial}</span>
            )}
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="app-topbar-actions">
            <LanguageSwitcher />
            <button type="button" className="icon-text-button" onClick={() => void handleLogout()}>
              <LogOut size={17} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
