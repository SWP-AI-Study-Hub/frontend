'use client'

import type { ReactNode } from 'react'
import { BookOpen } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand-mark">
          <BookOpen size={28} />
        </div>
        <h1>AI Study Hub</h1>
        <p>Manage study documents, users, and access permissions in one place.</p>
      </section>
      {children}
    </main>
  )
}
