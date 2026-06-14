'use client'

import type { ReactNode } from 'react'
import {
  BookOpen,
  BrainCircuit,
  FileUp,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../features/auth/useAuth'

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const initial = user?.fullName?.charAt(0).toUpperCase() ?? 'U'

  async function handleSignOut() {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand">
          <span className="brand-symbol">
            <BrainCircuit size={22} />
          </span>
          <span>
            <strong>AI Study</strong>
            <small>Hub</small>
          </span>
        </Link>
        <nav className="side-nav">
          <Link href="/profile" className={pathname === '/profile' ? 'active' : undefined}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <span className="disabled-nav">
            <BookOpen size={18} />
            My Library
          </span>
          <span className="disabled-nav">
            <FileUp size={18} />
            Upload
          </span>
          <span className="disabled-nav">
            <Sparkles size={18} />
            Ask AI
          </span>
          <Link href="/profile">
            <UserRound size={18} />
            Profile
          </Link>
          {user?.role === 'ADMIN' ? (
            <Link href="/admin/users" className={pathname.startsWith('/admin/users') ? 'active' : undefined}>
              <UsersRound size={18} />
              Admin
            </Link>
          ) : null}
        </nav>
        <section className="usage-card" aria-label="AI usage">
          <div className="usage-ring">78%</div>
          <strong>AI Usage</strong>
          <span>156 / 200 queries used</span>
          <a href="#top">View usage details</a>
        </section>
      </aside>

      <div className="main-column">
        <div className="account-corner" aria-label="Current account">
          <div className="account-chip">
            {user?.avatarUrl ? (
              <span
                className="account-avatar account-avatar-image"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <span className="account-avatar">{initial}</span>
            )}
            <span className="account-name">{user?.fullName ?? 'Study member'}</span>
            <button type="button" className="account-signout" onClick={handleSignOut} aria-label="Sign out">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
