'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { resetPassword } from '../api/auth.api'

export function ResetPasswordView() {
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
      setError('Liên kết đặt lại mật khẩu không hợp lệ')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(code, password)
      setMessage('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại.')
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Account Recovery</p>
      <h2>Set new password</h2>
      <p className="auth-copy">Enter a new password for your AI Study Hub account.</p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          New password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </label>
        <label>
          Confirm password
          <input
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
          {isSubmitting ? 'Updating...' : 'Update password'}
        </button>
      </form>
      <div className="form-links">
        <Link href="/login">Back to login</Link>
      </div>
    </section>
  )
}
