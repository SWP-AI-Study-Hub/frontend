import type { LibraryDocument, UploadDocumentInput } from '../types/document'

const STORAGE_KEY = 'documind.demoDocuments'
export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx']

const seedDocuments: LibraryDocument[] = [
  {
    id: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
    title: 'Distributed Systems Field Notes',
    description: 'Đồng thuận, sao chép, mô hình lỗi và các đánh đổi trong thiết kế hệ thống.',
    subject: 'Khoa học máy tính',
    category: 'Hệ thống',
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
    description: 'Câu hỏi nghiên cứu, tổng quan tài liệu, lấy mẫu và chất lượng bằng chứng.',
    subject: 'Nghiên cứu',
    category: 'Phương pháp luận',
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
    description: 'Lựa chọn mô hình, chỉ số đánh giá, rò rỉ dữ liệu và kiểm tra triển khai.',
    subject: 'Trí tuệ nhân tạo',
    category: 'Học máy',
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
    description: 'B-tree, chỉ mục kết hợp, kế hoạch truy vấn và các lỗi hiệu năng thường gặp.',
    subject: 'Khoa học máy tính',
    category: 'Cơ sở dữ liệu',
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

export function validateDocumentFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
    return 'Hãy sử dụng tệp PDF, DOCX, PPTX hoặc XLSX.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Kích thước tệp không được vượt quá 20 MB.'
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
