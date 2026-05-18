import { BookOpen, LogOut, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <BookOpen size={24} />
          <span>AI Study Hub</span>
        </Link>
        <nav className="side-nav">
          <NavLink to="/profile">
            <UserRound size={18} />
            Profile
          </NavLink>
          {user?.role === 'ADMIN' ? (
            <NavLink to="/admin/users">
              <UserRound size={18} />
              Users
            </NavLink>
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
        <Outlet />
      </div>
    </div>
  )
}
