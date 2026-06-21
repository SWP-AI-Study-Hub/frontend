export type Citation = {
  sourceNumber: number
  documentId: string
  title: string
  snippet: string
  relevanceScore: number | null
}

export type AiChatResponse = {
  answer: string
  sessionId: string
  messageId: string
  suggestedPrompts: string[]
  sources: Citation[]
}

export type ChatMessage = {
  id: string
  sender: 'USER' | 'AI'
  content: string
  sources: Citation[]
}

export type LibraryFilters = {
  subjectId?: string
  categoryId?: string
  fileType?: string
  documentIds?: string[]
}
