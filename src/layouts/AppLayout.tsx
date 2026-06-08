'use client'

import type { ReactNode } from 'react'
import { BookOpen, LogOut, UserRound } from 'lucide-react'
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
          <BookOpen size={24} />
          <span>AI Study Hub</span>
        </Link>
        <nav className="side-nav">
          <Link href="/profile" className={pathname === '/profile' ? 'active' : undefined}>
            <UserRound size={18} />
            Profile
          </Link>
          {user?.role === 'ADMIN' ? (
            <Link href="/admin/users" className={pathname.startsWith('/admin/users') ? 'active' : undefined}>
              <UserRound size={18} />
              Users
            </Link>
          ) : null}
        </nav>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
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
