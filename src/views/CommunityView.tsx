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
        <p className="eyebrow">THƯ VIỆN CỘNG ĐỒNG</p>
        <h1>Kiến thức hữu ích, được chia sẻ đầy đủ ngữ cảnh.</h1>
        <p>
          Khám phá tài liệu học tập công khai, xem trọng tâm học thuật và lưu
          những nguồn phù hợp nhất vào thư viện của bạn.
        </p>
      </header>

      <section className="community-search-band">
        <div className="community-search">
          <Sparkles size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhờ AI tìm tài liệu học tập công khai hữu ích..."
          />
          <button type="button" aria-label="Tìm kiếm trong cộng đồng">
            <Search size={18} />
          </button>
        </div>
        <div className="category-tabs" role="tablist" aria-label="Danh mục tài liệu">
          {categories.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? 'active' : undefined}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item === 'All' ? 'Tất cả' : item}
            </button>
          ))}
        </div>
      </section>

      <div className="community-results-heading">
        <div>
          <strong>{filteredDocuments.length} tài liệu công khai</strong>
          <span>Được tuyển chọn bởi cộng đồng học tập DocuMind</span>
        </div>
        <span className="ai-summary-badge">
          <Sparkles size={14} />
          Có bản tóm tắt bằng AI
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
                  <small>{document.pages} trang</small>
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
                      <small>{document.savedCount + (isSaved ? 1 : 0)} lượt lưu</small>
                    </span>
                  </div>
                  <button
                    type="button"
                    className={isSaved ? 'save-library-button saved' : 'save-library-button'}
                    onClick={() => toggleSaved(document.id)}
                  >
                    {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    {isSaved ? 'Đã lưu vào thư viện' : 'Lưu vào thư viện'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <div className="soft-empty-state community-empty">
          <Search size={30} />
          <strong>Không có tài liệu công khai phù hợp</strong>
          <p>Thử chủ đề rộng hơn hoặc chuyển sang danh mục khác.</p>
        </div>
      )}
    </main>
  )
}
