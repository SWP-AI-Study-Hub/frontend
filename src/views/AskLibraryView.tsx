'use client'

import { useState } from 'react'
import { FileSearch, Filter, Library, Sparkles } from 'lucide-react'
import { askLibrary } from '../api/chat.api'
import { ChatComposer } from '../components/chat/ChatComposer'
import { CitationList } from '../components/chat/CitationList'
import { demoLibraryAnswer } from '../lib/chat-demo'
import type { ChatMessage, Citation } from '../types/chat'

export function AskLibraryView() {
  const [question, setQuestion] = useState('')
  const [sessionId, setSessionId] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Citation>()
  const [fileType, setFileType] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      content:
        'Ask a question across your indexed library. I will retrieve the strongest matching sources and show why they matter.',
      sources: [],
    },
  ])
  const [sources, setSources] = useState<Citation[]>([])

  async function submitQuestion() {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender: 'USER', content: trimmed, sources: [] },
    ])
    setQuestion('')
    setIsLoading(true)
    setSources([])

    try {
      const response = await askLibrary({
        question: trimmed,
        filters: fileType ? { fileType } : undefined,
        sessionId,
      }).catch(() => demoLibraryAnswer(trimmed))
      setSessionId(response.sessionId)
      setSources(response.sources)
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
    <main id="main-content" className="ai-page ai-page--library">
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">ASK MY LIBRARY</p>
          <h1>Connect ideas across every source.</h1>
        </div>
        <span className="scope-chip">
          <Library size={15} />
          Scope: Entire library
        </span>
      </header>

      <section className="library-research-grid">
        <article className="chat-panel library-chat">
          <header className="chat-header">
            <div>
              <span className="ai-mark">
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Library research session</strong>
                <span>Retrieval across indexed documents</span>
              </div>
            </div>
            <label className="compact-filter">
              <Filter size={15} />
              <select value={fileType} onChange={(event) => setFileType(event.target.value)}>
                <option value="">All files</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="PPTX">PPTX</option>
              </select>
            </label>
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
                  {message.sources.length > 0 ? (
                    <p className="inline-source-links">
                      {message.sources.map((source) => (
                        <button
                          type="button"
                          key={source.sourceNumber}
                          onClick={() => setSelectedSource(source)}
                        >
                          [{source.sourceNumber}]
                        </button>
                      ))}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="retrieval-skeleton">
                <span />
                <span />
                <span />
                <p>Searching your library...</p>
              </div>
            ) : null}
          </div>

          <div className="chat-footer">
            <div className="prompt-chips">
              {[
                'Compare my notes on distributed systems',
                'Find evidence about research validity',
                'Build a study plan from my files',
              ].map((prompt) => (
                <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <ChatComposer
              value={question}
              onChange={setQuestion}
              onSubmit={() => void submitQuestion()}
              isLoading={isLoading}
              placeholder="Ask across your study library..."
            />
          </div>
        </article>

        <aside className="retrieved-panel">
          <header>
            <div>
              <p className="eyebrow">RETRIEVED SOURCES</p>
              <h2>Evidence used</h2>
            </div>
            <span>{sources.length || '—'}</span>
          </header>
          {isLoading ? (
            <div className="source-card-skeletons">
              {[1, 2, 3].map((item) => (
                <div key={item} className="source-card-skeleton" />
              ))}
            </div>
          ) : sources.length > 0 ? (
            <CitationList
              citations={sources}
              selected={selectedSource?.sourceNumber}
              onSelect={setSelectedSource}
            />
          ) : (
            <div className="soft-empty-state">
              <FileSearch size={28} />
              <strong>Your evidence panel is ready</strong>
              <p>Ask a question to retrieve the most relevant document snippets.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}
