"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  FileSearch,
  FileText,
  Library,
  Search,
  Sparkles,
} from "lucide-react";
import { askDocument, askLibrary } from "../api/chat.api";
import { getLibraryDocuments } from "../api/documents.api";
import { ChatComposer } from "../components/chat/ChatComposer";
import { CitationList } from "../components/chat/CitationList";
import { localizeLibraryDocument } from "../i18n/document-display";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";
import { demoDocumentAnswer, demoLibraryAnswer } from "../lib/chat-demo";
import type { ChatMessage, Citation } from "../types/chat";

type ChatScope = "DOCUMENT" | "LIBRARY";

export function AiChatbotView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  const documents = useMemo(
    () =>
      getLibraryDocuments().map((document) =>
        localizeLibraryDocument(document, locale),
      ),
    [locale],
  );
  const [scope, setScope] = useState<ChatScope>("LIBRARY");
  const [documentId, setDocumentId] = useState(documents[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Citation>();
  const [sources, setSources] = useState<Citation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const selectedDocument = documents.find(
    (document) => document.id === documentId,
  );

  const welcomeMessage = useMemo(
    () =>
      scope === "DOCUMENT"
        ? localize(
            locale,
            "Hãy chọn tài liệu và đặt câu hỏi. Câu trả lời sẽ dựa trên nội dung của tài liệu đó.",
            "Choose a document and ask a question. Answers will be grounded in that document.",
          )
        : localize(
            locale,
            "Hãy đặt câu hỏi trên toàn bộ thư viện. Tôi sẽ tìm các tài liệu phù hợp nhất để trả lời.",
            "Ask a question across your library. I will find the most relevant documents to answer it.",
          ),
    [locale, scope],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedScope = params.get("scope");
    const requestedDocument = params.get("document");
    const requestedQuestion = params.get("q");
    if (requestedScope === "document") setScope("DOCUMENT");
    if (requestedDocument) setDocumentId(requestedDocument);
    if (requestedQuestion) setQuestion(requestedQuestion);
  }, []);

  useEffect(() => {
    setMessages((current) => {
      const welcome: ChatMessage = {
        id: "welcome",
        sender: "AI",
        content: welcomeMessage,
        sources: [],
      };
      if (current.length === 0) return [welcome];
      return current.map((message) =>
        message.id === "welcome" ? welcome : message,
      );
    });
  }, [welcomeMessage]);

  function changeScope(nextScope: ChatScope) {
    setScope(nextScope);
    setSessionId(undefined);
    setSources([]);
    setSelectedSource(undefined);
    setMessages([]);
  }

  async function submitQuestion() {
    const trimmed = question.trim();
    if (
      !trimmed ||
      isLoading ||
      (scope === "DOCUMENT" && !selectedDocument)
    ) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        sender: "USER",
        content: trimmed,
        sources: [],
      },
    ]);
    setQuestion("");
    setIsLoading(true);
    setSources([]);

    try {
      const response =
        scope === "DOCUMENT" && selectedDocument
          ? await askDocument({
              documentId: selectedDocument.id,
              question: trimmed,
              sessionId,
            }).catch(() => demoDocumentAnswer(trimmed, locale))
          : await askLibrary({
              question: trimmed,
              sessionId,
            }).catch(() => demoLibraryAnswer(trimmed, locale));

      setSessionId(response.sessionId);
      setSources(response.sources);
      setMessages((current) => [
        ...current,
        {
          id: response.messageId,
          sender: "AI",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main id="main-content" className="ai-page ai-chatbot-page">
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">AI CHATBOT</p>
          <h1>
            {text(
              "Hỏi tài liệu theo cách bạn muốn.",
              "Ask your documents your way.",
            )}
          </h1>
        </div>
        <span className="scope-chip">
          <Bot size={15} />
          {text("Sẵn sàng hỗ trợ", "Ready to help")}
        </span>
      </header>

      <section className="ai-scope-panel" aria-label={text("Chọn phạm vi hỏi", "Choose question scope")}>
        <div className="ai-scope-options">
          <button
            type="button"
            className={scope === "DOCUMENT" ? "active" : undefined}
            onClick={() => changeScope("DOCUMENT")}
          >
            <FileText size={18} />
            <span>
              <strong>{text("Một tài liệu", "One document")}</strong>
              <small>{text("Hỏi theo nội dung của tệp đã chọn", "Ask within a selected file")}</small>
            </span>
          </button>
          <button
            type="button"
            className={scope === "LIBRARY" ? "active" : undefined}
            onClick={() => changeScope("LIBRARY")}
          >
            <Library size={18} />
            <span>
              <strong>{text("Toàn bộ thư viện", "Entire library")}</strong>
              <small>{text("Tìm câu trả lời trên mọi tài liệu", "Search across all documents")}</small>
            </span>
          </button>
        </div>

        {scope === "DOCUMENT" ? (
          <label className="ai-document-select">
            <span>{text("Chọn tài liệu", "Select document")}</span>
            <div>
              <Search size={17} />
              <select
                value={documentId}
                onChange={(event) => {
                  setDocumentId(event.target.value);
                  setSessionId(undefined);
                  setSources([]);
                }}
              >
                {documents.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.title}
                  </option>
                ))}
              </select>
            </div>
          </label>
        ) : null}
      </section>

      <section className="library-research-grid ai-chatbot-grid">
        <article className="chat-panel library-chat">
          <header className="chat-header">
            <div>
              <span className="ai-mark">
                <Sparkles size={17} />
              </span>
              <div>
                <strong>{text("Phiên trò chuyện AI", "AI chat session")}</strong>
                <span>
                  {scope === "DOCUMENT"
                    ? selectedDocument?.title
                    : text("Toàn bộ thư viện", "Entire library")}
                </span>
              </div>
            </div>
            <span className="status-dot">{text("AI sẵn sàng", "AI ready")}</span>
          </header>

          <div className="message-stream">
            {messages.map((message) => (
              <div
                className={
                  message.sender === "USER"
                    ? "message user-message"
                    : "message ai-message"
                }
                key={message.id}
              >
                {message.sender === "AI" ? (
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
                <p>{text("Đang tìm câu trả lời...", "Finding an answer...")}</p>
              </div>
            ) : null}
          </div>

          <div className="chat-footer">
            <ChatComposer
              value={question}
              onChange={setQuestion}
              onSubmit={() => void submitQuestion()}
              isLoading={isLoading}
              placeholder={
                scope === "DOCUMENT"
                  ? text(
                      "Đặt câu hỏi về tài liệu đã chọn...",
                      "Ask about the selected document...",
                    )
                  : text(
                      "Đặt câu hỏi trên toàn bộ thư viện...",
                      "Ask across your entire library...",
                    )
              }
            />
          </div>
        </article>

        <aside className="retrieved-panel">
          <header>
            <div>
              <p className="eyebrow">
                {text("TÀI LIỆU ĐÃ TÌM THẤY", "RETRIEVED DOCUMENTS")}
              </p>
              <h2>{text("Tài liệu tham khảo", "Reference documents")}</h2>
            </div>
            <span>{sources.length || "—"}</span>
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
              <strong>
                {text(
                  "Chưa có tài liệu tham khảo",
                  "No reference documents yet",
                )}
              </strong>
              <p>
                {text(
                  "Đặt câu hỏi để xem các tài liệu liên quan.",
                  "Ask a question to see relevant documents.",
                )}
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
