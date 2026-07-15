import { apiRequest } from '../lib/http'
import type { AiChatResponse, ChatMessage, ChatSession, LibraryFilters, PaginationMeta } from '../types/chat'

export function askDocument(payload: {
  documentId: string
  question: string
  sessionId?: string
}) {
  return apiRequest<AiChatResponse>('/chat/ask-document', {
    method: 'POST',
    body: payload,
  })
}

export function askLibrary(payload: {
  question: string
  filters?: LibraryFilters
  sessionId?: string
}) {
  return apiRequest<AiChatResponse>('/chat/ask-library', {
    method: 'POST',
    body: payload,
  })
}

export function fetchChatSessions(limit = 2) {
  return apiRequest<{ items: ChatSession[]; meta: PaginationMeta }>(
    `/chat/sessions?page=1&limit=${limit}`,
  )
}

export function fetchChatMessages(sessionId: string, limit = 100) {
  return apiRequest<{ items: ChatMessage[]; meta: PaginationMeta }>(
    `/chat/messages/${sessionId}?page=1&limit=${limit}`,
  )
}
