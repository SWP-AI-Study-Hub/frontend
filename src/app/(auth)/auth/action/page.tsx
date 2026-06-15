'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'

function AuthActionDispatcher() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (!oobCode) {
      router.push('/login')
      return
    }

    switch (mode) {
      case 'resetPassword':
        router.push(`/reset-password?oobCode=${oobCode}`)
        break
      case 'verifyEmail':
        router.push(`/verify-email?oobCode=${oobCode}`)
        break
      case 'recoverEmail':
        router.push(`/recover-email?oobCode=${oobCode}`)
        break
      default:
        router.push('/login')
    }
  }, [searchParams, router])

  return (
    <section className="auth-card reset-link-state">
      <LoaderCircle className="spin" size={24} />
      <h2>Processing request...</h2>
      <p className="auth-copy">Please wait while we verify your credentials and redirect you.</p>
    </section>
  )
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-card reset-link-state">
          <LoaderCircle className="spin" size={24} />
          <h2>Loading...</h2>
        </section>
      }
    >
      <AuthActionDispatcher />
    </Suspense>
  )
}
