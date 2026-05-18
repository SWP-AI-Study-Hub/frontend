import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { forgotPassword } from '../api/auth.api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      await forgotPassword(email)
      setMessage('If the email exists, reset instructions will be sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
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
        <button className="primary-button" type="submit">
          <Mail size={18} />
          Send request
        </button>
      </form>
      <div className="form-links">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  )
}
