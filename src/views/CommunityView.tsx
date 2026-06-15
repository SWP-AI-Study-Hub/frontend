'use client'

import { useMemo, useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import {
  communityDocuments,
  getSavedCommunityDocumentIds,
  toggleSavedCommunityDocument,
} from '../api/community.api'

export function CommunityView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    getSavedCommunityDocumentIds(),
  )
  const categories = ['All', ...new Set(communityDocuments.map((item) => item.category))]

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return communityDocuments.filter((document) => {
      const categoryMatches = category === 'All' || document.category === category
      const queryMatches =
        !normalized ||
        [document.title, document.description, document.subject, document.category].some(
          (value) => value.toLowerCase().includes(normalized),
        )
      return categoryMatches && queryMatches
    })
  }, [category, query])

  function toggleSaved(id: string) {
    setSavedIds(toggleSavedCommunityDocument(id))
  }

  return (
    <main id="main-content" className="community-page">
      <header className="community-heading">
        <p className="eyebrow">COMMUNITY LIBRARY</p>
        <h1>Useful knowledge, shared with context.</h1>
        <p>
          Discover public study materials, inspect their academic focus, and save the
          strongest sources into your own library.
        </p>
      </header>

      <section className="community-search-band">
        <div className="community-search">
          <Sparkles size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask AI to find useful public study materials..."
          />
          <button type="button" aria-label="Search community">
            <Search size={18} />
          </button>
        </div>
        <div className="category-tabs" role="tablist" aria-label="Document categories">
          {categories.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? 'active' : undefined}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="community-results-heading">
        <div>
          <strong>{filteredDocuments.length} public documents</strong>
          <span>Curated by the DocuMind learning community</span>
        </div>
        <span className="ai-summary-badge">
          <Sparkles size={14} />
          AI summaries available
        </span>
      </div>

      {filteredDocuments.length > 0 ? (
        <section className="community-grid">
          {filteredDocuments.map((document) => {
            const isSaved = savedIds.includes(document.id)
            return (
              <article className="community-card" key={document.id}>
                <div className={`community-cover community-cover--${document.accent}`}>
                  <span>{document.fileType}</span>
                  <strong>{document.subject}</strong>
                  <small>{document.pages} pages</small>
                </div>
                <div className="community-card-body">
                  <div className="community-card-meta">
                    <span>{document.category}</span>
                    <span>{document.updatedAt}</span>
                  </div>
                  <h2>{document.title}</h2>
                  <p>{document.description}</p>
                  <div className="community-owner">
                    <span className="owner-avatar">
                      <UserRound size={15} />
                    </span>
                    <span>
                      <strong>{document.owner}</strong>
                      <small>{document.savedCount + (isSaved ? 1 : 0)} saves</small>
                    </span>
                  </div>
                  <button
                    type="button"
                    className={isSaved ? 'save-library-button saved' : 'save-library-button'}
                    onClick={() => toggleSaved(document.id)}
                  >
                    {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    {isSaved ? 'Saved to My Library' : 'Save to My Library'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <div className="soft-empty-state community-empty">
          <Search size={30} />
          <strong>No public documents match this search</strong>
          <p>Try a broader topic or switch to another category.</p>
        </div>
      )}
    </main>
  )
}
