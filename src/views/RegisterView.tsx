'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database, UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function RegisterView() {
  const { register } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await register({ fullName, email, password })
      router.replace(user.role === 'ADMIN' ? '/admin/users' : '/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Start your workspace</p>
      <h2>Create your DocuMind account</h2>
      <p className="auth-copy">Set up a secure profile for document search, AI answers, and source-aware study sessions.</p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <UserPlus size={18} />
          {isSubmitting ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <div className="form-links">
        <Link href="/login">Already have an account</Link>
      </div>
      <div className="auth-meta">
        <span>
          <Database size={16} />
          Creates your learning profile
        </span>
      </div>
    </section>
  )
}
