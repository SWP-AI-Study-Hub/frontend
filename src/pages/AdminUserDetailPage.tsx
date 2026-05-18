import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserById } from '../api/users.api'
import type { CurrentUser } from '../types/auth'

export function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    getUserById(id)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load user'))
  }, [id])

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h2>User Detail</h2>
          <p>Detailed information for this account.</p>
        </div>
        <Link className="secondary-button" to="/admin/users">
          Back
        </Link>
      </div>
      <section className="content-panel">
        {error ? <p className="form-error">{error}</p> : null}
        {!user && !error ? <p>Loading user...</p> : null}
        {user ? (
          <div className="info-grid">
            <span>Full name</span>
            <strong>{user.fullName}</strong>
            <span>Email</span>
            <strong>{user.email}</strong>
            <span>Role</span>
            <strong>{user.role}</strong>
            <span>Status</span>
            <strong>{user.status}</strong>
            <span>Created at</span>
            <strong>{user.createdAt}</strong>
            <span>Last login</span>
            <strong>{user.lastLogin ?? 'No data yet'}</strong>
          </div>
        ) : null}
      </section>
    </main>
  )
}
