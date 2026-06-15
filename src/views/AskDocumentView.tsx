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
        'Tôi sẵn sàng trả lời dựa trên tài liệu này. Mỗi câu trả lời đều hiển thị rõ nguồn tham chiếu.',
      sources: [],
    },
  ])

  const prompts = useMemo(
    () => [
      'Tóm tắt luận điểm chính',
      'Giải thích các mô hình lỗi',
      'Tạo năm câu hỏi ôn tập',
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
          <p className="eyebrow">HỎI TÀI LIỆU NÀY</p>
          <h1>Đọc kỹ. Hỏi chính xác.</h1>
        </div>
        <span className="scope-chip">
          <FileText size={15} />
          Phạm vi: Tệp hiện tại
        </span>
      </header>

      <section className="document-chat-grid">
        <article className="document-panel">
          <header className="panel-toolbar">
            <div>
              <span className="file-type-badge">PDF</span>
              <strong>Distributed Systems Field Notes</strong>
            </div>
            <button className="icon-button" type="button" title="Thu gọn bản xem trước">
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
              Bản tóm tắt được tạo
            </span>
            <ChevronDown className={summaryOpen ? 'rotate' : ''} size={18} />
          </button>
          {summaryOpen ? (
            <p className="document-summary">
              Tổng quan thực tế về các đảm bảo của hệ thống phân tán, giả định
              lỗi, đồng thuận, sao chép và những đánh đổi giữa các mô hình nhất
              quán.
            </p>
          ) : null}

          <div className="document-canvas">
            <div className="document-page">
              <p className="document-page-label">BÀI GIẢNG 04 · TRANG 12 / 42</p>
              <h2>Đồng thuận bắt đầu từ các giả định lỗi</h2>
              <p>
                Hệ thống phân tán không thể chọn chiến lược phối hợp phù hợp
                trước khi xác định các loại lỗi dự kiến. Lỗi dừng, phân vùng
                mạng và thông điệp bị trễ đều làm thay đổi những gì hệ thống có
                thể cam kết.
              </p>
              <blockquote
                className={selectedCitation ? 'source-highlight' : undefined}
              >
                Giao thức đồng thuận đánh đổi thêm chi phí phối hợp để đạt được
                một thứ tự chuyển trạng thái thống nhất.
              </blockquote>
              <h3>Sao chép không phải là mô hình nhất quán</h3>
              <p>
                Sao chép cải thiện tính sẵn sàng và độ bền, nhưng ứng dụng vẫn
                cần quy tắc xử lý trạng thái đồng thời và công bố cập nhật.
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
                <strong>Phiên nghiên cứu tài liệu</strong>
                <span>Câu trả lời dựa trên một nguồn</span>
              </div>
            </div>
            <span className="status-dot">AI sẵn sàng</span>
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
                  <strong>Đang đọc các đoạn trích nguồn...</strong>
                  <p>Đang xây dựng câu trả lời từ tài liệu này.</p>
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
              placeholder="Đặt câu hỏi về tài liệu này..."
            />
            <p className="grounded-note">
              <BookOpenText size={14} />
              Câu trả lời chỉ có thể trích dẫn từ tệp hiện tại.
            </p>
          </div>
        </article>
      </section>
    </main>
  )
}
