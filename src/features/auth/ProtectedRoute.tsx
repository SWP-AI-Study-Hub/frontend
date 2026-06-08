'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import type { UserRole } from '../../types/auth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectPath = pathname ?? '/profile'
      router.replace(`/login?from=${encodeURIComponent(redirectPath)}`)
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized')
    }
  }, [allowedRoles, isLoading, pathname, router, user])

  if (isLoading) {
    return <div className="screen-message">Checking your session...</div>
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return children
}
