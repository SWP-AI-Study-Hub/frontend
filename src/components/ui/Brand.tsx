import Image from 'next/image'
import Link from 'next/link'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand${compact ? ' brand--compact' : ''}`} aria-label="DocuMind home">
      <Image src="/Logo.png" alt="" width={42} height={42} priority />
      <span>DocuMind</span>
    </Link>
  )
}
