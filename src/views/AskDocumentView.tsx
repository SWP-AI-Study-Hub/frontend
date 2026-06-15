'use client'

import { useMemo, useState } from 'react'
import {
  BookOpenText,
  ChevronDown,
  FileText,
  PanelLeftClose,
  Sparkles,
} from 'lucide-react'
import { askDocument } from '../api/chat.api'
import { ChatComposer } from '../components/chat/ChatComposer'
import { CitationList } from '../components/chat/CitationList'
import { demoDocumentAnswer } from '../lib/chat-demo'
import type { ChatMessage, Citation } from '../types/chat'

const documentId = '79c555d8-b4ce-4d98-9f93-15f2fe1c9813'

export function AskDocumentView() {
  const [question, setQuestion] = useState('')
  const [sessionId, setSessionId] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [selectedCitation, setSelectedCitation] = useState<Citation>()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      content:
        'I am ready to answer questions grounded in this document. Every answer will keep its source visible.',
      sources: [],
    },
  ])

  const prompts = useMemo(
    () => [
      'Summarize the core argument',
      'Explain the failure models',
      'Create five review questions',
    ],
    [],
  )

  async function submitQuestion(prompt = question) {
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        sender: 'USER',
        content: trimmed,
        sources: [],
      },
    ])
    setQuestion('')
    setIsLoading(true)

    try {
      const response = await askDocument({
        documentId,
        question: trimmed,
        sessionId,
      }).catch(() => demoDocumentAnswer(trimmed))
      setSessionId(response.sessionId)
      setMessages((current) => [
        ...current,
        {
          id: response.messageId,
          sender: 'AI',
          content: response.answer,
          sources: response.sources,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main id="main-content" className="ai-page ai-page--document">
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">ASK THIS DOCUMENT</p>
          <h1>Read closely. Ask precisely.</h1>
        </div>
        <span className="scope-chip">
          <FileText size={15} />
          Scope: Current file
        </span>
      </header>

      <section className="document-chat-grid">
        <article className="document-panel">
          <header className="panel-toolbar">
            <div>
              <span className="file-type-badge">PDF</span>
              <strong>Distributed Systems Field Notes</strong>
            </div>
            <button className="icon-button" type="button" title="Collapse preview">
              <PanelLeftClose size={18} />
            </button>
          </header>

          <button
            type="button"
            className="summary-toggle"
            onClick={() => setSummaryOpen((value) => !value)}
          >
            <span>
              <Sparkles size={16} />
              Generated summary
            </span>
            <ChevronDown className={summaryOpen ? 'rotate' : ''} size={18} />
          </button>
          {summaryOpen ? (
            <p className="document-summary">
              A practical overview of distributed system guarantees, failure assumptions,
              consensus, replication, and the tradeoffs behind consistency models.
            </p>
          ) : null}

          <div className="document-canvas">
            <div className="document-page">
              <p className="document-page-label">LECTURE 04 · PAGE 12 OF 42</p>
              <h2>Consensus begins with failure assumptions</h2>
              <p>
                A distributed system cannot choose a meaningful coordination strategy
                until it states which failures are expected. Crash failures, network
                partitions, and delayed messages each change what the system can promise.
              </p>
              <blockquote
                className={selectedCitation ? 'source-highlight' : undefined}
              >
                Consensus protocols trade additional coordination for a single agreed
                ordering of state transitions.
              </blockquote>
              <h3>Replication is not a consistency model</h3>
              <p>
                Replication improves availability and durability, but the application
                still needs rules for reconciling concurrent state and exposing updates.
              </p>
            </div>
          </div>
        </article>

        <article className="chat-panel">
          <header className="chat-header">
            <div>
              <span className="ai-mark">
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Document research session</strong>
                <span>Answers grounded in one source</span>
              </div>
            </div>
            <span className="status-dot">AI ready</span>
          </header>

          <div className="message-stream">
            {messages.map((message) => (
              <div
                className={message.sender === 'USER' ? 'message user-message' : 'message ai-message'}
                key={message.id}
              >
                {message.sender === 'AI' ? (
                  <span className="message-icon">
                    <Sparkles size={15} />
                  </span>
                ) : null}
                <div>
                  <p>{message.content}</p>
                  <CitationList
                    citations={message.sources}
                    selected={selectedCitation?.sourceNumber}
                    onSelect={setSelectedCitation}
                  />
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="ai-thinking">
                <span />
                <div>
                  <strong>Reading source snippets...</strong>
                  <p>Building an answer from this document.</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="chat-footer">
            <div className="prompt-chips">
              {prompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => void submitQuestion(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <ChatComposer
              value={question}
              onChange={setQuestion}
              onSubmit={() => void submitQuestion()}
              isLoading={isLoading}
              placeholder="Ask about this document..."
            />
            <p className="grounded-note">
              <BookOpenText size={14} />
              Answers may include citations from the current file only.
            </p>
          </div>
        </article>
      </section>
    </main>
  )
}
