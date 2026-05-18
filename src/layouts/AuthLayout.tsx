import { BookOpen } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand-mark">
          <BookOpen size={28} />
        </div>
        <h1>AI Study Hub</h1>
        <p>Manage study documents, users, and access permissions in one place.</p>
      </section>
      <Outlet />
    </main>
  )
}
