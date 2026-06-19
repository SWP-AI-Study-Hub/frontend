export type DocumentVisibility = 'PRIVATE' | 'PUBLIC'
export type DocumentIndexStatus = 'READY' | 'PROCESSING' | 'FAILED' | 'PENDING'

export type LibraryDocument = {
  id: string
  title: string
  description: string
  subjectId: string
  subject: string
  categoryId: string
  category: string
  tags: string[]
  visibility: DocumentVisibility
  fileName: string
  fileType: string
  fileSize: number
  pages: number
  uploadedAt: string
  indexStatus: DocumentIndexStatus
}

export type UploadDocumentInput = {
  title: string
  description: string
  subjectId: string
  categoryId: string
  tags: string[]
  visibility: DocumentVisibility
  file: File
}
