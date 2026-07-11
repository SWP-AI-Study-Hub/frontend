import { API_BASE_URL, apiRequest, getApiAuthorizationToken } from '../lib/http'
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

export async function askLibraryStream(
  payload: {
    question: string
    filters?: LibraryFilters
    sessionId?: string
  },
  handlers: {
    onStatus?: (phase: string) => void
    onSources?: (sources: AiChatResponse['sources']) => void
    onDelta?: (text: string) => void
  },
  signal?: AbortSignal,
) {
  const token = await getApiAuthorizationToken()
  const response = await fetch(`${API_BASE_URL}/chat/ask-library/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
    signal,
  })
  if (!response.ok || !response.body) throw new Error('Stream request failed')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed: AiChatResponse | undefined

  for (;;) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const event = /^event: (.+)$/m.exec(frame)?.[1]
      const rawData = /^data: (.+)$/m.exec(frame)?.[1]
      if (!event || !rawData) continue
      const data = JSON.parse(rawData) as unknown
      if (event === 'status') handlers.onStatus?.((data as { phase: string }).phase)
      if (event === 'sources') handlers.onSources?.(data as AiChatResponse['sources'])
      if (event === 'delta') handlers.onDelta?.((data as { text: string }).text)
      if (event === 'done') completed = data as AiChatResponse
      if (event === 'error') throw new Error('Stream failed')
    }
    if (done) break
  }

  if (!completed) throw new Error('Stream ended without a result')
  return completed
}
