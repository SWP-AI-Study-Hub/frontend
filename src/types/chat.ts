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

export type ChatSession = {
  id: string
  mode: 'ASK_MY_LIBRARY' | 'ASK_THIS_DOCUMENT'
  documentId: string | null
  title: string | null
  document?: { id: string; title: string } | null
  messageCount: number
  lastMessage: {
    id: string
    sender: 'USER' | 'AI'
    content: string
    createdAt: string
  } | null
  createdAt: string
  updatedAt: string
}

export type ChatPaginationMeta = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}
