import type { ReactNode } from 'react'

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`reveal${className ? ` ${className}` : ''}`}>{children}</div>
}
