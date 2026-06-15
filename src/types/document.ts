export type DocumentVisibility = 'PRIVATE' | 'PUBLIC'
export type DocumentIndexStatus = 'READY' | 'PROCESSING' | 'FAILED'

export type LibraryDocument = {
  id: string
  title: string
  description: string
  subject: string
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
  subject: string
  category: string
  tags: string[]
  visibility: DocumentVisibility
  file: File
}
