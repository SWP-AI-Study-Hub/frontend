import { useAuth } from '../features/auth/useAuth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p>Information for the current signed-in account.</p>
        </div>
      </div>

      <section className="content-panel profile-panel">
        <div className="avatar">{user?.fullName.charAt(0).toUpperCase()}</div>
        <div className="info-grid">
          <span>Full name</span>
          <strong>{user?.fullName}</strong>
          <span>Email</span>
          <strong>{user?.email}</strong>
          <span>Role</span>
          <strong>{user?.role}</strong>
          <span>Status</span>
          <strong>{user?.status}</strong>
          <span>Last login</span>
          <strong>{user?.lastLogin ?? 'No data yet'}</strong>
        </div>
      </section>
    </main>
  )
}
