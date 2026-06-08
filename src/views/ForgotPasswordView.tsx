'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { forgotPassword } from '../api/auth.api'

export function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      setMessage('If the email exists, reset instructions will be sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Forgot password</h2>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        {message ? <p className="form-success">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <Mail size={18} />
          {isSubmitting ? 'Sending...' : 'Send request'}
        </button>
      </form>
      <div className="form-links">
        <Link href="/login">Back to login</Link>
      </div>
    </section>
  )
}
