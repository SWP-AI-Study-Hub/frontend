"use client"

import { BookOpen, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../features/auth/useAuth'

type AppLayoutProps = {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const currentPath = pathname ?? '/'

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand">
          <BookOpen size={24} />
          <span>AI Study Hub</span>
        </Link>
        <nav className="side-nav">
          <Link href="/profile" className={currentPath === '/profile' ? 'active' : undefined}>
            <UserRound size={18} />
            Profile
          </Link>
          {user?.role === 'ADMIN' ? (
            <Link href="/admin/users" className={currentPath.startsWith('/admin/users') ? 'active' : undefined}>
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
