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
  answerStatus: 'ANSWERED' | 'FALLBACK_WITH_SOURCES' | 'NO_SOURCES'
  errorCode?: string | null
}

export type ChatMessage = {
  id: string
  sender: 'USER' | 'AI'
  content: string
  sources: Citation[]
  answerStatus?: AiChatResponse['answerStatus']
  errorCode?: string | null
  scope?: 'MY_LIBRARY' | 'SELECTED_SOURCES'
}

export type LibraryFilters = {
  subjectId?: string
  subjectIds?: string[]
  categoryId?: string
  fileType?: string
  documentIds?: string[]
}
