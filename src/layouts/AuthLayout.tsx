'use client'

import type { ReactNode } from 'react'
import { BrainCircuit, FileSearch, GraduationCap, ShieldCheck } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand-mark">
          <BrainCircuit size={32} />
        </div>
        <h1>AI Study Hub</h1>
        <p>Your AI-powered study workspace for documents, citations, quizzes, and role-based collaboration.</p>
        <div className="feature-list">
          <span>
            <ShieldCheck size={18} />
            Secure account access
          </span>
          <span>
            <FileSearch size={18} />
            Document-aware learning
          </span>
          <span>
            <GraduationCap size={18} />
            Admin-ready management
          </span>
        </div>
      </section>
      {children}
    </main>
  )
}
