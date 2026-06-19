import type { LibraryDocument, UploadDocumentInput } from '../types/document'
import type { Locale } from '../i18n/translations'
import { apiRequest } from '../lib/http'

const STORAGE_KEY = 'documind.demoDocuments'
export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx']

const seedDocuments: LibraryDocument[] = [
  {
    id: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
    title: 'Distributed Systems Field Notes',
    description: 'Consensus, replication, failure models, and practical system design tradeoffs.',
    subject: 'Computer Science',
    category: 'Systems',
    tags: ['consensus', 'replication'],
    visibility: 'PRIVATE',
    fileName: 'distributed-systems-notes.pdf',
    fileType: 'PDF',
    fileSize: 4_820_000,
    pages: 42,
    uploadedAt: '2026-06-12T08:30:00.000Z',
    indexStatus: 'READY',
  },
  {
    id: '16f32b32-68da-43bf-86a3-c9ad003a8a39',
    title: 'Research Methods Handbook',
    description: 'Research questions, literature reviews, sampling, and evidence quality.',
    subject: 'Research',
    category: 'Methodology',
    tags: ['research', 'evidence'],
    visibility: 'PUBLIC',
    fileName: 'research-methods.docx',
    fileType: 'DOCX',
    fileSize: 2_140_000,
    pages: 68,
    uploadedAt: '2026-06-09T11:10:00.000Z',
    indexStatus: 'READY',
  },
  {
    id: '26ce9f92-23ad-4bba-b197-9196fb0c5ad6',
    title: 'Applied Machine Learning Review',
    description: 'Model selection, evaluation metrics, leakage, and deployment checks.',
    subject: 'Artificial Intelligence',
    category: 'Machine Learning',
    tags: ['ml', 'evaluation'],
    visibility: 'PRIVATE',
    fileName: 'applied-ml-review.pptx',
    fileType: 'PPTX',
    fileSize: 8_630_000,
    pages: 31,
    uploadedAt: '2026-06-07T15:45:00.000Z',
    indexStatus: 'PROCESSING',
  },
  {
    id: '9433ffbd-2fed-40b3-a7a3-16ef4153503e',
    title: 'Database Indexing Explained',
    description: 'B-trees, composite indexes, query plans, and common performance pitfalls.',
    subject: 'Computer Science',
    category: 'Database',
    tags: ['database', 'performance'],
    visibility: 'PRIVATE',
    fileName: 'database-indexing.pdf',
    fileType: 'PDF',
    fileSize: 3_270_000,
    pages: 35,
    uploadedAt: '2026-06-02T09:15:00.000Z',
    indexStatus: 'READY',
  },
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLibraryDocuments(): LibraryDocument[] {
  if (!canUseStorage()) return seedDocuments

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as LibraryDocument[]
    return [...stored, ...seedDocuments]
  } catch {
    return seedDocuments
  }
}

export function validateDocumentFile(file: File, locale: Locale = 'vi'): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
    return locale === 'vi'
      ? 'Hãy sử dụng tệp PDF, DOCX, PPTX hoặc XLSX.'
      : 'Use a PDF, DOCX, PPTX, or XLSX file.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return locale === 'vi'
      ? 'Kích thước tệp không được vượt quá 20 MB.'
      : 'File size must be 20 MB or smaller.'
  }
  return null
}

export function createDemoDocument(input: UploadDocumentInput): LibraryDocument {
  const extension = input.file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
  const document: LibraryDocument = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    subject: input.subject,
    category: input.category,
    tags: input.tags,
    visibility: input.visibility,
    fileName: input.file.name,
    fileType: extension,
    fileSize: input.file.size,
    pages: 0,
    uploadedAt: new Date().toISOString(),
    indexStatus: 'PROCESSING',
  }

  if (canUseStorage()) {
    const stored = getLibraryDocuments().filter(
      (item) => !seedDocuments.some((seed) => seed.id === item.id),
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([document, ...stored]))
  }

  return document
}

export function downloadDemoDocument(document: LibraryDocument) {
  const content = `${document.title}\n\n${document.description}\n\nTệp tải xuống mẫu được tạo bởi DocuMind.`
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = `${document.title.replaceAll(' ', '-').toLowerCase()}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ----------------------------------------------------
// Subject & Category Helpers
// ----------------------------------------------------

export type SubjectItem = {
  id: string
  code: string
  name: string
  description?: string
}

export type CategoryItem = {
  id: string
  name: string
  description?: string
}

const SUBJECTS_KEY = 'documind.subjects'
const CATEGORIES_KEY = 'documind.categories'

const defaultSubjects: SubjectItem[] = [
  { id: '1', code: 'CS', name: 'Computer Science' },
  { id: '2', code: 'AI', name: 'Artificial Intelligence' },
  { id: '3', code: 'RES', name: 'Research' },
  { id: '4', code: 'BUS', name: 'Business' },
]

const defaultCategories: CategoryItem[] = [
  { id: '1', name: 'Lecture Notes' },
  { id: '2', name: 'Research Paper' },
  { id: '3', name: 'Methodology' },
  { id: '4', name: 'Reference' },
]

export async function fetchSubjects(): Promise<SubjectItem[]> {
  try {
    const res = await apiRequest<SubjectItem[]>('/subjects')
    if (Array.isArray(res)) return res
  } catch (err) {
    console.warn('Backend subjects API failed, falling back to LocalStorage:', err)
  }

  if (canUseStorage()) {
    try {
      const stored = window.localStorage.getItem(SUBJECTS_KEY)
      if (stored) return JSON.parse(stored) as SubjectItem[]
    } catch {}
  }
  return defaultSubjects
}

export async function createSubject(name: string, code: string): Promise<SubjectItem> {
  const payload = { name, code, description: '' }
  try {
    const res = await apiRequest<SubjectItem>('/subjects', {
      method: 'POST',
      body: payload,
    })
    if (res && res.id) return res
  } catch (err) {
    console.warn('Backend subject creation failed, falling back to LocalStorage:', err)
  }

  const newItem: SubjectItem = {
    id: crypto.randomUUID(),
    code: code.toUpperCase(),
    name,
  }
  if (canUseStorage()) {
    const current = await fetchSubjects()
    const updated = [...current, newItem]
    window.localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
  }
  return newItem
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await apiRequest<CategoryItem[]>('/categories')
    if (Array.isArray(res)) return res
  } catch (err) {
    console.warn('Backend categories API failed, falling back to LocalStorage:', err)
  }

  if (canUseStorage()) {
    try {
      const stored = window.localStorage.getItem(CATEGORIES_KEY)
      if (stored) return JSON.parse(stored) as CategoryItem[]
    } catch {}
  }
  return defaultCategories
}

export async function createCategory(name: string): Promise<CategoryItem> {
  const payload = { name, description: '' }
  try {
    const res = await apiRequest<CategoryItem>('/categories', {
      method: 'POST',
      body: payload,
    })
    if (res && res.id) return res
  } catch (err) {
    console.warn('Backend category creation failed, falling back to LocalStorage:', err)
  }

  const newItem: CategoryItem = {
    id: crypto.randomUUID(),
    name,
  }
  if (canUseStorage()) {
    const current = await fetchCategories()
    const updated = [...current, newItem]
    window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
  }
  return newItem
}
