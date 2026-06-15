'use client'

import { FileText } from 'lucide-react'
import type { Citation } from '../../types/chat'

export function CitationList({
  citations,
  selected,
  onSelect,
}: {
  citations: Citation[]
  selected?: number
  onSelect?: (citation: Citation) => void
}) {
  if (citations.length === 0) return null

  return (
    <div className="citation-list" aria-label="Nguồn của câu trả lời">
      {citations.map((citation) => (
        <button
          type="button"
          className={selected === citation.sourceNumber ? 'citation-row active' : 'citation-row'}
          key={`${citation.documentId}-${citation.sourceNumber}`}
          onClick={() => onSelect?.(citation)}
        >
          <span className="citation-number">{citation.sourceNumber}</span>
          <span className="citation-copy">
            <strong>{citation.title}</strong>
            <span>{citation.snippet}</span>
          </span>
          {citation.relevanceScore !== null ? (
            <span className="relevance-score">
              {Math.round(citation.relevanceScore * 100)}%
            </span>
          ) : (
            <FileText size={16} />
          )}
        </button>
      ))}
    </div>
  )
}
