'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function LoginView() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await login({ email, password })
      const from = searchParams?.get('from')
      router.replace(from ?? (user.role === 'ADMIN' ? '/admin/users' : '/profile'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Log in</h2>
      <p className="auth-copy">Sign in to load your profile, role, plan, quota, and protected study workspace.</p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <LogIn size={18} />
          {isSubmitting ? 'Processing...' : 'Log in'}
        </button>
      </form>
      <div className="form-links">
        <Link href="/forgot-password">Forgot password</Link>
        <Link href="/register">Create account</Link>
      </div>
      <div className="auth-meta">
        <span>
          <KeyRound size={16} />
          Backend verifies session
        </span>
        <span>
          <ShieldCheck size={16} />
          Role-based access guard
        </span>
      </div>
    </section>
  )
}
