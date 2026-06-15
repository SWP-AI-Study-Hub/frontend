import { Bookmark, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function SavedView() {
  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">SAVED</p>
        <h1>Your bookmarked study sources.</h1>
        <p>Return to useful community material and continue asking grounded questions.</p>
      </header>
      <section className="saved-source-list">
        <article>
          <span><FileText size={20} /></span>
          <div><strong>Practical Retrieval-Augmented Generation</strong><p>Artificial Intelligence / Saved from Community</p></div>
          <Link href="/ask-document"><Sparkles size={15} />Ask AI</Link>
        </article>
        <article>
          <span><Bookmark size={20} /></span>
          <div><strong>Database Indexing Explained</strong><p>Computer Science / Private library</p></div>
          <Link href="/ask-document"><Sparkles size={15} />Ask AI</Link>
        </article>
      </section>
    </main>
  )
}
