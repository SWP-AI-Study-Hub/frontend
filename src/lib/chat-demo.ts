import type { AiChatResponse, Citation } from '../types/chat'

const documentCitation: Citation = {
  sourceNumber: 1,
  documentId: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
  title: 'Distributed Systems Field Notes',
  snippet:
    'Consensus protocols trade additional coordination for a single agreed ordering of state transitions.',
  relevanceScore: 0.94,
}

export function demoDocumentAnswer(question: string): AiChatResponse {
  return {
    answer: `The document frames "${question}" around three ideas: explicit failure assumptions, replicated state, and a consistency model chosen for the workload. It recommends stating which failures are tolerated before selecting a coordination strategy.`,
    sessionId: crypto.randomUUID(),
    messageId: crypto.randomUUID(),
    suggestedPrompts: [
      'Compare strong and eventual consistency',
      'Explain the main failure models',
      'Create five review questions',
    ],
    sources: [documentCitation],
  }
}

export function demoLibraryAnswer(question: string): AiChatResponse {
  return {
    answer: `Across your library, the strongest answer to "${question}" combines the systems notes with the research handbook: define the claim precisely, identify its assumptions, then compare evidence from independent sources before drawing a conclusion.`,
    sessionId: crypto.randomUUID(),
    messageId: crypto.randomUUID(),
    suggestedPrompts: [
      'Turn this into a study plan',
      'Show disagreements between sources',
      'Generate a concise summary',
    ],
    sources: [
      documentCitation,
      {
        sourceNumber: 2,
        documentId: '16f32b32-68da-43bf-86a3-c9ad003a8a39',
        title: 'Research Methods Handbook',
        snippet:
          'Triangulation improves confidence by comparing evidence gathered through different methods or sources.',
        relevanceScore: 0.88,
      },
      {
        sourceNumber: 3,
        documentId: '9433ffbd-2fed-40b3-a7a3-16ef4153503e',
        title: 'Database Indexing Explained',
        snippet:
          'Query plans should be inspected against actual access patterns rather than optimized from intuition alone.',
        relevanceScore: 0.76,
      },
    ],
  }
}
