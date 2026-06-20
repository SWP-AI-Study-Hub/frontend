import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { fetchLibraryDocuments } from '../api/documents.api'
import { useLanguage } from '../i18n/LanguageProvider'
import type { LibraryDocument } from '../types/document'
import { AiChatbotView } from './AiChatbotView'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('../api/documents.api', () => ({
  fetchLibraryDocuments: vi.fn(),
  createDownloadUrl: vi.fn(),
}))

vi.mock('../api/chat.api', () => ({
  askDocument: vi.fn(),
  askLibrary: vi.fn(),
}))

vi.mock('../i18n/LanguageProvider', () => ({
  useLanguage: vi.fn(),
}))

const documents: LibraryDocument[] = [
  {
    id: 'doc-ai',
    title: 'AI Foundations',
    description: '',
    subjectId: 'subject-ai',
    subject: 'Artificial Intelligence',
    categoryId: 'category-1',
    category: 'Lecture Notes',
    tags: [],
    visibility: 'PRIVATE',
    fileName: 'ai.pdf',
    fileType: 'PDF',
    fileSize: 1000,
    pages: 0,
    uploadedAt: '2026-06-20T00:00:00.000Z',
    indexStatus: 'READY',
  },
  {
    id: 'doc-db',
    title: 'Database Design',
    description: '',
    subjectId: 'subject-db',
    subject: 'Database Systems',
    categoryId: 'category-2',
    category: 'Reference',
    tags: [],
    visibility: 'PRIVATE',
    fileName: 'db.pdf',
    fileType: 'PDF',
    fileSize: 1000,
    pages: 0,
    uploadedAt: '2026-06-20T00:00:00.000Z',
    indexStatus: 'READY',
  },
]

describe('AiChatbotView subject filter', () => {
  beforeEach(() => {
    sessionStorage.clear()
    Element.prototype.scrollIntoView = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>)
    vi.mocked(useLanguage).mockReturnValue({
      locale: 'en',
      setLocale: vi.fn(),
      t: vi.fn(),
    })
    vi.mocked(fetchLibraryDocuments).mockResolvedValue({
      items: documents,
      pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
    })
  })

  it('supports selecting multiple subjects and filters the source list', async () => {
    render(<AiChatbotView />)

    await screen.findByText('AI Foundations')
    fireEvent.click(screen.getByRole('button', { name: /Filter by subject/i }))
    fireEvent.click(screen.getByRole('button', { name: /Artificial Intelligence/i }))

    expect(screen.getByText('AI Foundations')).toBeInTheDocument()
    expect(screen.queryByText('Database Design')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Database Systems/i }))

    await waitFor(() => {
      expect(screen.getByText('AI Foundations')).toBeInTheDocument()
      expect(screen.getByText('Database Design')).toBeInTheDocument()
    })
    expect(screen.getByText('2 subjects')).toBeInTheDocument()
  })
})
