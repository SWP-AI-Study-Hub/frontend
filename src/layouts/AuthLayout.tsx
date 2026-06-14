'use client'

import type { ReactNode } from 'react'
import { BrainCircuit, FileSearch, GraduationCap, MessageSquareText, ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  return (
    <main className={`auth-shell${isLogin ? ' auth-shell-legacy' : ''}`}>
      <section className="auth-brand">
        {isLogin ? (
          <>
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
          </>
        ) : (
          <>
            <div className="auth-brand-header">
              <div className="brand-mark">
                <BrainCircuit size={30} />
              </div>
              <span>DocuMind</span>
            </div>
            <h1>Turn study files into focused answers.</h1>
            <p>DocuMind keeps your documents, questions, and learning context connected in one AI-first workspace.</p>
            <div className="auth-preview" aria-label="DocuMind AI document preview">
              <div className="preview-toolbar">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-content">
                <FileSearch size={22} />
                <div>
                  <strong>Research notes.pdf</strong>
                  <p>Summarized with citations and next-step prompts.</p>
                </div>
              </div>
              <div className="preview-answer">
                <MessageSquareText size={18} />
                <span>Ask across your library without losing source context.</span>
              </div>
            </div>
            <div className="feature-list">
              <span>
                <ShieldCheck size={18} />
                Firebase-secured access
              </span>
              <span>
                <FileSearch size={18} />
                Document-aware retrieval
              </span>
              <span>
                <MessageSquareText size={18} />
                AI chat built around your sources
              </span>
            </div>
          </>
        )}
      </section>
      {children}
    </main>
  )
}
