import type { CommunityDocument } from '../types/community'

export const communityDocuments: CommunityDocument[] = [
  {
    id: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
    title: 'Distributed Systems Field Notes',
    description:
      'Concise notes on consensus, replication, failure models, and practical system design tradeoffs.',
    subject: 'Computer Science',
    category: 'Systems',
    fileType: 'PDF',
    pages: 42,
    owner: 'Minh Anh',
    savedCount: 128,
    updatedAt: '2 days ago',
    accent: 'blue',
  },
  {
    id: '16f32b32-68da-43bf-86a3-c9ad003a8a39',
    title: 'Research Methods Handbook',
    description:
      'A structured guide to research questions, literature reviews, sampling, and evidence quality.',
    subject: 'Research',
    category: 'Methodology',
    fileType: 'DOCX',
    pages: 68,
    owner: 'Ngoc Ha',
    savedCount: 94,
    updatedAt: '5 days ago',
    accent: 'amber',
  },
  {
    id: '26ce9f92-23ad-4bba-b197-9196fb0c5ad6',
    title: 'Applied Machine Learning Review',
    description:
      'Model selection, evaluation metrics, data leakage, and deployment checks explained with examples.',
    subject: 'Artificial Intelligence',
    category: 'Machine Learning',
    fileType: 'PPTX',
    pages: 31,
    owner: 'Quang Pham',
    savedCount: 203,
    updatedAt: '1 week ago',
    accent: 'green',
  },
  {
    id: 'bc5df6ac-1334-4a6e-8acd-4d822985b481',
    title: 'Academic Writing Patterns',
    description:
      'Reusable structures for arguments, synthesis paragraphs, citations, and clear technical prose.',
    subject: 'Language',
    category: 'Writing',
    fileType: 'PDF',
    pages: 27,
    owner: 'Linh Tran',
    savedCount: 76,
    updatedAt: '1 week ago',
    accent: 'rose',
  },
  {
    id: '9433ffbd-2fed-40b3-a7a3-16ef4153503e',
    title: 'Database Indexing Explained',
    description:
      'B-trees, composite indexes, query plans, and common performance pitfalls in relational databases.',
    subject: 'Computer Science',
    category: 'Database',
    fileType: 'PDF',
    pages: 35,
    owner: 'Bao Nguyen',
    savedCount: 167,
    updatedAt: '2 weeks ago',
    accent: 'blue',
  },
  {
    id: '132b3ce6-62bd-4a43-ad69-a119752ed09c',
    title: 'Product Discovery Workshop',
    description:
      'Interview prompts, opportunity mapping, assumption tests, and workshop templates for product teams.',
    subject: 'Business',
    category: 'Product',
    fileType: 'XLSX',
    pages: 18,
    owner: 'Thao Le',
    savedCount: 51,
    updatedAt: '3 weeks ago',
    accent: 'green',
  },
]

const SAVED_KEY = 'documind.savedCommunityDocuments'

export function getSavedCommunityDocumentIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

export function getSavedCommunityDocuments(): CommunityDocument[] {
  const savedIds = new Set(getSavedCommunityDocumentIds())
  return communityDocuments.filter((document) => savedIds.has(document.id))
}

export function toggleSavedCommunityDocument(id: string): string[] {
  const current = new Set(getSavedCommunityDocumentIds())
  if (current.has(id)) {
    current.delete(id)
  } else {
    current.add(id)
  }
  const saved = [...current]
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  return saved
}
