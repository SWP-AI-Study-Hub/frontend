import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
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
      navigate(user.role === 'ADMIN' ? '/admin/users' : '/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Create account</h2>
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
        <Link to="/login">Already have an account</Link>
      </div>
    </section>
  )
}
