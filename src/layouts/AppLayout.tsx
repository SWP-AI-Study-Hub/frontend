'use client'

import type { ReactNode } from 'react'
import {
  Bell,
  BookOpen,
  BrainCircuit,
  FileUp,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../features/auth/useAuth'

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname() ?? '/'
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
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
        <header id="top" className="topbar">
          <nav className="top-nav" aria-label="Primary navigation">
            <Link className={pathname === '/profile' ? 'active' : undefined} href="/profile">
              Dashboard
            </Link>
            <span>My Library</span>
            <span>Upload</span>
            <span>Ask AI</span>
            {user?.role === 'ADMIN' ? <Link href="/admin/users">Admin</Link> : null}
          </nav>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <span className="mini-avatar">{user?.fullName.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{user?.fullName}</strong>
                <span>{user?.role}</span>
              </div>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mobile-user">
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
