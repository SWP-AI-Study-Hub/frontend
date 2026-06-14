'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

export function LoginView() {
  const { login, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
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
      setError(err instanceof Error ? err.message : t('auth.loginFailed'))
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
      setError(err instanceof Error ? err.message : t('auth.googleFailed'))
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">DOCUMIND</p>
      <h2>{t('auth.loginTitle')}</h2>
      <p className="auth-copy">{t('auth.loginBody')}</p>
      <button
        className="google-button"
        type="button"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleLogin}
      >
        <Image src="/google.svg" alt="" aria-hidden="true" width={18} height={18} />
        {isGoogleSubmitting ? t('auth.connecting') : t('auth.google')}
      </button>
      <div className="auth-divider">
        <span>{t('auth.or')}</span>
      </div>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          {t('auth.email')}
          <input
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          {t('auth.password')}
          <input
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting || isGoogleSubmitting}>
          <LogIn size={18} />
          {isSubmitting ? t('auth.processing') : t('common.login')}
        </button>
      </form>
      <div className="form-links">
        <Link href="/forgot-password">{t('auth.forgot')}</Link>
        <Link href="/register">{t('auth.create')}</Link>
      </div>
    </section>
  )
}
