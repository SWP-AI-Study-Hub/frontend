"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import type { UserRole } from '../../types/auth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const currentPath = pathname ?? '/'
  const isUnauthorized = Boolean(allowedRoles && user && !allowedRoles.includes(user.role))

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(currentPath)}`)
      return
    }

    if (isUnauthorized) {
      router.replace('/unauthorized')
    }
  }, [currentPath, isLoading, isUnauthorized, router, user])

  if (isLoading) {
    return <div className="screen-message">Checking your session...</div>
  }

  if (!user) {
    return <div className="screen-message">Redirecting to login...</div>
  }

  if (isUnauthorized) {
    return <div className="screen-message">Redirecting...</div>
  }

  return <>{children}</>
}
