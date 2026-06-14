'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import type { UserRole } from '../../types/auth'
import { useLanguage } from '../../i18n/LanguageProvider'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()

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
    return (
      <div className="screen-message">
        <span className="loading-line" />
        <strong>{t('auth.checking')}</strong>
      </div>
    )
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return children
}
