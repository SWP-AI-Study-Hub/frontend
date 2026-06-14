'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { resetPassword } from '../api/auth.api'
import { useLanguage } from '../i18n/LanguageProvider'

export function ResetPasswordView() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const code = searchParams?.get('oobCode') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!code) {
      setError(t('auth.invalidResetLink'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(code, password)
      setMessage(t('auth.passwordUpdated'))
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError(t('auth.expiredResetLink'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">{t('auth.recovery')}</p>
      <h2>{t('auth.resetTitle')}</h2>
      <p className="auth-copy">{t('auth.resetBody')}</p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          {t('auth.newPassword')}
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
        <label>
          {t('auth.confirmPassword')}
          <input
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </label>
        {message ? <p className="form-success">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <KeyRound size={18} />
          {isSubmitting ? t('auth.updating') : t('auth.updatePassword')}
        </button>
      </form>
      <div className="form-links">
        <Link href="/login">{t('auth.backLogin')}</Link>
      </div>
    </section>
  )
}
