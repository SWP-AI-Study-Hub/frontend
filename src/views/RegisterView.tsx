'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

export function RegisterView() {
  const { register } = useAuth()
  const { t } = useLanguage()
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
      setError(err instanceof Error ? err.message : t('auth.registerFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">{t('auth.registerEyebrow')}</p>
      <h2>{t('auth.registerTitle')}</h2>
      <p className="auth-copy">{t('auth.registerBody')}</p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          {t('auth.fullName')}
          <input name="fullName" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <UserPlus size={18} />
          {isSubmitting ? t('auth.creating') : t('auth.signup')}
        </button>
      </form>
      <div className="form-links">
        <Link href="/login">{t('auth.haveAccount')}</Link>
      </div>
    </section>
  )
}
