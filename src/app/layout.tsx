import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../index.css'
import { AuthProvider } from '../features/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'AI Study Hub',
  description: 'Frontend for the AI Study Hub MVP',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
