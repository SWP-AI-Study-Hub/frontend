import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
      const from = location.state?.from?.pathname
      navigate(from ?? (user.role === 'ADMIN' ? '/admin/users' : '/profile'), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Log in</h2>
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
        <Link to="/forgot-password">Forgot password</Link>
        <Link to="/register">Create account</Link>
      </div>
    </section>
  )
}
