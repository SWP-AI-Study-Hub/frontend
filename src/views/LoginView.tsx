'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function LoginView() {
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  function redirectAfterLogin(role: 'ADMIN' | 'USER') {
    const from = searchParams?.get('from')
    router.replace(from ?? (role === 'ADMIN' ? '/admin/users' : '/profile'))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await login({ email, password })
      redirectAfterLogin(user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setIsGoogleSubmitting(true)

    try {
      const user = await loginWithGoogle()
      redirectAfterLogin(user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed')
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Log in</h2>
      <p className="auth-copy">Sign in to load your profile, role, plan, quota, and protected study workspace.</p>
      <button
        className="google-button"
        type="button"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleLogin}
      >
        <Image src="/google.svg" alt="" aria-hidden="true" width={18} height={18} />
        {isGoogleSubmitting ? 'Connecting...' : 'Continue with Google'}
      </button>
      <div className="auth-divider">
        <span>or</span>
      </div>
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
        <button className="primary-button" type="submit" disabled={isSubmitting || isGoogleSubmitting}>
          <LogIn size={18} />
          {isSubmitting ? 'Processing...' : 'Log in'}
        </button>
      </form>
      <div className="form-links">
        <Link href="/forgot-password">Forgot password</Link>
        <Link href="/register">Create account</Link>
      </div>
    </section>
  )
}
