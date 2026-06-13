'use client'

import { BookOpen, FileText, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function ProfileView() {
  const { user } = useAuth()
  const displayName = user?.fullName ?? 'Study member'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">AI-focused Dashboard</p>
          <h1>What do you want to learn today?</h1>
          <p>Ask anything, review account access, and keep your study workspace connected with quota-aware AI requests.</p>
        </div>
        <div className="hero-search">
          <span>Ask AI Study Hub anything...</span>
          <button type="button">
            AI
            <Sparkles size={16} />
          </button>
        </div>
        <div className="hero-actions">
          <article>
            <FileText size={20} />
            <strong>Ask This Document</strong>
            <span>Get answers from a specific file.</span>
          </article>
          <article>
            <BookOpen size={20} />
            <strong>Ask My Library</strong>
            <span>Search across your documents.</span>
          </article>
          <article>
            <ShieldCheck size={20} />
            <strong>Account Access</strong>
            <span>Role and status are synced with backend auth.</span>
          </article>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="content-panel profile-card">
          <div className="avatar">{initial}</div>
          <div>
            <p className="eyebrow">Profile</p>
            <h2>{displayName}</h2>
            <span>{user?.email}</span>
          </div>
          <div className="profile-badges">
            <span className="status-pill role">{user?.role}</span>
            <span className={`status-pill ${user?.status === 'ACTIVE' ? 'success' : user?.status === 'BLOCKED' ? 'danger' : ''}`}>
              {user?.status}
            </span>
          </div>
        </article>

        <article className="content-panel">
          <div className="panel-title">
            <h2>Account Overview</h2>
            <span>This month</span>
          </div>
          <div className="metric-list">
            <div>
              <span>Authentication</span>
              <strong>{user?.authProvider ?? 'Firebase token verified'}</strong>
            </div>
            <div>
              <span>Firebase UID</span>
              <strong>{user?.firebaseUid ?? 'Verified by backend'}</strong>
            </div>
            <div>
              <span>Route guard</span>
              <strong>ProtectedRoute</strong>
            </div>
            <div>
              <span>Role access</span>
              <strong>{user?.role === 'ADMIN' ? 'Admin enabled' : 'Learner access'}</strong>
            </div>
            <div>
              <span>Plan & quota</span>
              <strong>Loaded after login</strong>
            </div>
            <div>
              <span>Last login</span>
              <strong>{user?.lastLogin ?? 'No data yet'}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
