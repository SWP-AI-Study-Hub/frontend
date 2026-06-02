import { Suspense } from 'react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { LoginPage } from '../../views/LoginPage'

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<section className="auth-card">Loading...</section>}>
        <LoginPage />
      </Suspense>
    </AuthLayout>
  )
}
