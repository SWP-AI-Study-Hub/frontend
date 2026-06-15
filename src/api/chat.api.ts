import { apiRequest } from '../lib/http'
import type { AiChatResponse, LibraryFilters } from '../types/chat'

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
