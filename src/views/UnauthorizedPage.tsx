import Link from 'next/link'

export function UnauthorizedPage() {
  return (
    <main className="center-page">
      <section className="content-panel narrow">
        <h2>Access denied</h2>
        <p>Your current account does not have permission to view this page.</p>
        <Link className="primary-button" href="/profile">
          Go to profile
        </Link>
      </section>
    </main>
  )
}
