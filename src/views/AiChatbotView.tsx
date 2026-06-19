"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  FileSearch,
  FileText,
  Library,
  Search,
  Sparkles,
  Plus,
  X,
  ArrowUp,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Database,
  ChevronRight,
  Info,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  ArrowDownToLine,
} from "lucide-react";
import { askDocument, askLibrary } from "../api/chat.api";
import { createDownloadUrl, fetchLibraryDocuments } from "../api/documents.api";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";
import { demoDocumentAnswer, demoLibraryAnswer } from "../lib/chat-demo";
import type { ChatMessage, Citation } from "../types/chat";
import { ROUTES } from "../lib/routes";
import type { LibraryDocument } from "../types/document";

type ActiveMode = "CURRENT_DOCUMENT" | "SELECTED_SOURCES" | "MY_LIBRARY";

export function AiChatbotView() {
  const router = useRouter();
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);

  // 1. Fetch Library Documents
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);

  useEffect(() => {
    let active = true;
    fetchLibraryDocuments({ limit: 100 })
      .then((result) => {
        if (active) setDocuments(result.items);
      })
      .catch(() => {
        if (active) setDocuments([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // 2. React State
  const [activeMode, setActiveMode] = useState<ActiveMode>("MY_LIBRARY");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"ALL" | "PDF" | "DOCX" | "PPTX" | "XLSX">("ALL");

  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Citation[]>([]);

  // UI Panel states
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [referencesCollapsed, setReferencesCollapsed] = useState(false);
  const [sourcesDrawerOpen, setSourcesDrawerOpen] = useState(false);
  const [referencesDrawerOpen, setReferencesDrawerOpen] = useState(false);

  // Citation Preview Drawer state
  const [previewCitation, setPreviewCitation] = useState<Citation | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 3. Currently active document
  const currentDocument = useMemo(() => {
    return documents.find((doc) => doc.id === currentDocumentId) || documents[0];
  }, [documents, currentDocumentId]);

  // Welcome message per mode
  const welcomeMessage = useMemo(() => {
    if (activeMode === "CURRENT_DOCUMENT") {
      return text(
        `Chào mừng! Bạn đang đặt câu hỏi dựa trên tài liệu: "${currentDocument?.title || ""}".`,
        `Welcome! You are asking questions grounded in: "${currentDocument?.title || ""}".`,
      );
    }
    if (activeMode === "SELECTED_SOURCES") {
      return text(
        "Hãy chọn các tài liệu từ danh sách bên trái để đặt câu hỏi.",
        "Select documents from the list on the left to ask questions based on them.",
      );
    }
    return text(
      "Chào mừng! Bạn đang đặt câu hỏi trên toàn bộ thư viện của mình.",
      "Welcome! You are asking questions across your entire library.",
    );
  }, [locale, activeMode, currentDocument]);

  // 4. Load sessionStorage on mount (hydration-safe)
  useEffect(() => {
    const savedMode = sessionStorage.getItem("documind.workspace.activeMode");
    if (savedMode && ["CURRENT_DOCUMENT", "SELECTED_SOURCES", "MY_LIBRARY"].includes(savedMode)) {
      setActiveMode(savedMode as ActiveMode);
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scope") === "document") setActiveMode("CURRENT_DOCUMENT");
    }

    const savedSelected = sessionStorage.getItem("documind.workspace.selectedDocumentIds");
    if (savedSelected) {
      try { setSelectedDocumentIds(JSON.parse(savedSelected)); } catch { /* ignore */ }
    }

    const savedCurrent = sessionStorage.getItem("documind.workspace.currentDocumentId");
    if (savedCurrent) {
      setCurrentDocumentId(savedCurrent);
    } else {
      const params = new URLSearchParams(window.location.search);
      const requestedDocument = params.get("document");
      setCurrentDocumentId(requestedDocument || documents[0]?.id || "");
    }

    const params = new URLSearchParams(window.location.search);
    const requestedQuestion = params.get("q");
    if (requestedQuestion) setQuestion(requestedQuestion);
  }, [documents]);

  // 5. Persist state to sessionStorage
  useEffect(() => { sessionStorage.setItem("documind.workspace.activeMode", activeMode); }, [activeMode]);
  useEffect(() => { sessionStorage.setItem("documind.workspace.selectedDocumentIds", JSON.stringify(selectedDocumentIds)); }, [selectedDocumentIds]);
  useEffect(() => { if (currentDocumentId) sessionStorage.setItem("documind.workspace.currentDocumentId", currentDocumentId); }, [currentDocumentId]);

  // 6. Reset chat on mode / document change
  useEffect(() => {
    setMessages([{ id: "welcome", sender: "AI", content: welcomeMessage, sources: [] }]);
    setSources([]);
    setSessionId(undefined);
  }, [activeMode, currentDocumentId, welcomeMessage]);

  // Auto-scroll
  useEffect(() => { messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  // Filtered document list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        doc.title.toLowerCase().includes(q) ||
        (doc.subject || "").toLowerCase().includes(q) ||
        (doc.category || "").toLowerCase().includes(q);
      const matchesType = fileTypeFilter === "ALL" || doc.fileType === fileTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, fileTypeFilter]);

  const handleCheckboxToggle = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  const clearSelection = () => setSelectedDocumentIds([]);

  const handleDocumentRowClick = (docId: string) => {
    setCurrentDocumentId(docId);
    if (activeMode !== "CURRENT_DOCUMENT") setActiveMode("CURRENT_DOCUMENT");
  };

  const openCitationDrawer = (citation: Citation) => {
    setPreviewCitation(citation);
    setDrawerOpen(true);
  };

  const handlePromptCardClick = (key: string) => {
    const map: Record<string, [string, string]> = {
      summarize: ["Tóm tắt các điểm chính và thông tin quan trọng nhất trong tài liệu này.", "Summarize the main points and most important details in this document."],
      quiz: ["Tạo một bộ câu hỏi trắc nghiệm gồm 5 câu để kiểm tra kiến thức về tài liệu này.", "Create a 5-question multiple choice quiz to test my knowledge of this document."],
      compare: ["So sánh và đối chiếu các thông tin khác nhau giữa các tài liệu trong thư viện.", "Compare and contrast the different details across the library documents."],
      concepts: ["Giải thích các khái niệm cốt lõi và các thuật ngữ chuyên ngành được sử dụng ở đây.", "Explain the core concepts and technical terms used here."],
    };
    const [vi, en] = map[key] || ["", ""];
    setQuestion(text(vi, en));
    textareaRef.current?.focus();
  };

  // 7. Submit question
  const submitQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    if (activeMode === "CURRENT_DOCUMENT" && !currentDocument) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "USER", content: trimmed, sources: [] }]);
    setQuestion("");
    setIsLoading(true);
    setSources([]);

    if (activeMode === "SELECTED_SOURCES") {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          sender: "AI",
          content: text("Chế độ Nguồn đã Chọn hiện tại chưa được hỗ trợ bởi backend.", "Selected Sources mode is pending backend support."),
          sources: [],
        }]);
        setIsLoading(false);
      }, 700);
      return;
    }

    try {
      const response = activeMode === "CURRENT_DOCUMENT" && currentDocument
        ? await askDocument({ documentId: currentDocument.id, question: trimmed, sessionId })
            .catch(() => demoDocumentAnswer(trimmed, locale))
        : await askLibrary({ question: trimmed, sessionId })
            .catch(() => demoLibraryAnswer(trimmed, locale));

      setSessionId(response.sessionId);
      setSources(response.sources);
      setMessages((prev) => [...prev, { id: response.messageId, sender: "AI", content: response.answer, sources: response.sources }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        sender: "AI",
        content: text("Đã xảy ra lỗi. Vui lòng thử lại sau.", "An error occurred. Please try again."),
        sources: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toUpperCase()) {
      case "PDF":   return <FileText size={16} className="ws-file-icon ws-file-icon--pdf" />;
      case "DOCX":  return <FileCode size={16} className="ws-file-icon ws-file-icon--docx" />;
      case "PPTX":  return <FileArchive size={16} className="ws-file-icon ws-file-icon--pptx" />;
      case "XLSX":  return <FileSpreadsheet size={16} className="ws-file-icon ws-file-icon--xlsx" />;
      default:      return <FileText size={16} className="ws-file-icon" />;
    }
  };

  const getPlaceholderText = () => {
    if (activeMode === "CURRENT_DOCUMENT")
      return text(`Đặt câu hỏi về "${currentDocument?.title || "tài liệu hiện tại"}"...`, `Ask about "${currentDocument?.title || "current document"}"...`);
    if (activeMode === "SELECTED_SOURCES")
      return text("Nhập câu hỏi dựa trên các nguồn đã chọn...", "Ask about selected sources...");
    return text("Đặt câu hỏi trên toàn bộ thư viện...", "Ask across your entire library...");
  };

  return (
    <main id="main-content" className="ai-workspace">

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`ws-sources-panel${sourcesCollapsed ? " ws-panel--collapsed" : ""}${sourcesDrawerOpen ? " ws-panel--open" : ""}`}>
        <div className="ws-sources-header">
          <div className="ws-sources-title-row">
            <h2>{text("Tài liệu Nguồn", "Sources")}</h2>
            <button onClick={() => router.push(ROUTES.upload)} className="ws-add-source-btn">
              <Plus size={14} />
              <span>{text("Thêm", "Add")}</span>
            </button>
          </div>
          <div className="ws-search-wrapper">
            <Search size={14} className="ws-search-icon" />
            <input
              type="text"
              className="ws-search-input"
              placeholder={text("Tìm kiếm tài liệu...", "Search sources...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* File Type Filters */}
        <div className="ws-filter-chips">
          {(["ALL", "PDF", "DOCX", "PPTX", "XLSX"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFileTypeFilter(type)}
              className={`ws-filter-chip${fileTypeFilter === type ? " active" : ""}`}
            >
              {type === "ALL" ? text("Tất cả", "All") : type}
            </button>
          ))}
        </div>

        {/* Sources List */}
        <div className="ws-sources-list">
          {filteredDocuments.map((doc) => {
            const isSelected = selectedDocumentIds.includes(doc.id);
            const isCurrent = doc.id === (currentDocumentId || documents[0]?.id);
            return (
              <div
                key={doc.id}
                className={`ws-source-card${isCurrent ? " active" : ""}`}
                onClick={() => handleDocumentRowClick(doc.id)}
              >
                <input
                  type="checkbox"
                  className="ws-source-checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => handleCheckboxToggle(doc.id, e)}
                />
                <div className="ws-source-icon">{getFileIcon(doc.fileType)}</div>
                <div className="ws-source-details">
                  <span className="ws-source-title" title={doc.title}>{doc.title}</span>
                  <div className="ws-source-meta">
                    <span>{doc.category || doc.fileType}</span>
                    <span className="ws-source-meta-dot">·</span>
                    <span className={`ws-source-status${doc.indexStatus === "READY" ? " ready" : " processing"}`}>
                      {doc.indexStatus === "READY" ? text("Sẵn sàng", "Ready") : text("Đang xử lý", "Processing")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDocuments.length === 0 && (
            <div className="ws-sources-empty">{text("Không tìm thấy tài liệu", "No documents found")}</div>
          )}
        </div>

        {/* Footer */}
        <div className="ws-sources-footer">
          <span className="ws-selected-count">
            {selectedDocumentIds.length} {text("đã chọn", "selected")}
          </span>
          {selectedDocumentIds.length > 0 && (
            <button onClick={clearSelection} className="ws-clear-btn">
              {text("Bỏ chọn", "Clear")}
            </button>
          )}
        </div>
      </aside>

      {/* ─── CENTER CHAT ───────────────────────────────────────────── */}
      <section className="ws-chat-panel">
        <header className="ws-chat-header">
          {/* Mobile: open left drawer */}
          <button
            className="ws-toggle-btn ws-toggle-mobile"
            onClick={() => setSourcesDrawerOpen(!sourcesDrawerOpen)}
            title={text("Danh sách tài liệu", "Sources list")}
          >
            <Library size={18} />
          </button>

          {/* Mode Selector */}
          <div className="ws-mode-selector">
            <button
              className={`ws-mode-btn${activeMode === "CURRENT_DOCUMENT" ? " active" : ""}`}
              onClick={() => setActiveMode("CURRENT_DOCUMENT")}
            >
              {text("Tài liệu Hiện tại", "Current Document")}
            </button>
            <button
              className={`ws-mode-btn${activeMode === "SELECTED_SOURCES" ? " active" : ""}`}
              onClick={() => setActiveMode("SELECTED_SOURCES")}
            >
              {text(`Nguồn đã chọn (${selectedDocumentIds.length})`, `Selected (${selectedDocumentIds.length})`)}
            </button>
            <button
              className={`ws-mode-btn${activeMode === "MY_LIBRARY" ? " active" : ""}`}
              onClick={() => setActiveMode("MY_LIBRARY")}
            >
              {text("Thư viện của tôi", "My Library")}
            </button>
          </div>

          {/* Sidebar toggles */}
          <div className="ws-panel-toggles">
            <button
              onClick={() => setSourcesCollapsed(!sourcesCollapsed)}
              className={`ws-toggle-btn ws-toggle-desktop${!sourcesCollapsed ? " active" : ""}`}
              title={text("Ẩn/Hiện Sidebar Trái", "Toggle Left Sidebar")}
            >
              {sourcesCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {/* Mobile: open right drawer */}
            <button
              className="ws-toggle-btn ws-toggle-mobile"
              onClick={() => setReferencesDrawerOpen(!referencesDrawerOpen)}
              title={text("Nguồn tham chiếu", "References")}
            >
              <Info size={18} />
            </button>
            <button
              onClick={() => setReferencesCollapsed(!referencesCollapsed)}
              className={`ws-toggle-btn ws-toggle-desktop${!referencesCollapsed ? " active" : ""}`}
              title={text("Ẩn/Hiện Sidebar Phải", "Toggle Right Sidebar")}
            >
              {referencesCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            </button>
          </div>
        </header>

        {/* Message stream */}
        <div className="ws-message-stream">
          {messages.map((msg) => (
            <div key={msg.id} className={`ws-message${msg.sender === "USER" ? " user" : " ai"}`}>
              <div className="ws-message-avatar">
                {msg.sender === "USER" ? "U" : <Sparkles size={15} />}
              </div>
              <div className="ws-message-bubble">
                <div className="ws-message-text">
                  <p>{msg.content}</p>
                </div>
                {msg.sources.length > 0 && (
                  <div className="ws-message-citations">
                    {msg.sources.map((src) => (
                      <button
                        type="button"
                        key={src.sourceNumber}
                        className="ws-citation-tag"
                        onClick={() => openCitationDrawer(src)}
                      >
                        <span className="ws-citation-num">[{src.sourceNumber}]</span>
                        <span className="ws-citation-label">{src.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ws-message ai">
              <div className="ws-message-avatar"><Sparkles size={15} /></div>
              <div className="retrieval-skeleton">
                <span /><span /><span />
                <p>{text("Đang tìm câu trả lời...", "Finding an answer...")}</p>
              </div>
            </div>
          )}

          {/* Empty / welcome state */}
          {messages.length <= 1 && !isLoading && (
            <div className="ws-empty-state">
              <div className="ws-empty-icon"><Bot size={26} /></div>
              <h3>{text("Hỏi đáp học tập thông minh", "Smart Academic Companion")}</h3>
              <p>
                {text(
                  "Đặt câu hỏi dựa trên nội dung nguồn học tập của bạn. Trích dẫn và liên kết tài liệu sẽ được đính kèm trực tiếp trong câu trả lời.",
                  "Ask questions grounded in your learning sources. Citations and document links will be attached directly to the answers.",
                )}
              </p>
              <div className="ws-prompt-cards">
                {(["summarize", "concepts", "quiz", "compare"] as const).map((key) => {
                  const labels: Record<string, [string, string, string, string]> = {
                    summarize: ["Tóm tắt tài liệu", "Summarize Source", "Trích xuất thông tin cốt lõi nhất.", "Extract the core takeaways."],
                    concepts: ["Giải thích thuật ngữ", "Explain Concepts", "Làm rõ thuật ngữ và định lý phức tạp.", "Clarify complex terms and theorems."],
                    quiz: ["Tạo bài trắc nghiệm", "Generate Quiz", "Tạo bộ câu hỏi để tự đánh giá.", "Generate a self-assessment quiz."],
                    compare: ["So sánh các nguồn", "Compare Sources", "Tìm điểm tương đồng giữa các bài đọc.", "Find common themes across readings."],
                  };
                  const [vi, en, viSub, enSub] = labels[key];
                  return (
                    <div key={key} className="ws-prompt-card" onClick={() => handlePromptCardClick(key)}>
                      <h4>{text(vi, en)}</h4>
                      <p>{text(viSub, enSub)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Bottom input */}
        <div className="ws-chat-footer">
          {activeMode === "SELECTED_SOURCES" && (
            <div className="ws-pending-alert">
              <AlertTriangle size={15} />
              <span>{text("Chế độ Nguồn đã Chọn đang chờ bổ sung kết nối backend.", "Selected Sources mode is pending backend support.")}</span>
            </div>
          )}
          <div className="ws-input-container">
            <textarea
              ref={textareaRef}
              rows={2}
              className="ws-textarea"
              placeholder={getPlaceholderText()}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitQuestion(); } }}
              maxLength={4000}
            />
            <button
              onClick={submitQuestion}
              className="ws-send-btn"
              disabled={!question.trim() || isLoading}
              aria-label={text("Gửi câu hỏi", "Send question")}
            >
              <ArrowUp size={18} />
            </button>
          </div>
          <div className="ws-grounding-indicator">
            <Database size={12} />
            <span>
              {activeMode === "CURRENT_DOCUMENT"
                ? text(`Nguồn tham chiếu: ${currentDocument?.title || "Tài liệu hiện tại"}`, `Grounded in: ${currentDocument?.title || "Current document"}`)
                : activeMode === "SELECTED_SOURCES"
                ? text(`Nguồn tham chiếu: ${selectedDocumentIds.length} tài liệu đã chọn`, `Grounded in: ${selectedDocumentIds.length} selected sources`)
                : text("Nguồn tham chiếu: Toàn bộ thư viện", "Grounded in: Entire library")}
            </span>
          </div>
        </div>
      </section>

      {/* ─── RIGHT SIDEBAR ────────────────────────────────────────── */}
      <aside className={`ws-references-panel${referencesCollapsed ? " ws-panel--collapsed" : ""}${referencesDrawerOpen ? " ws-panel--open" : ""}`}>
        <div className="ws-references-header">
          <h2>{text("Tài liệu Tham chiếu", "References")}</h2>
          <span className="ws-references-count">{sources.length}</span>
        </div>

        <div className="ws-references-content">
          {sources.length > 0 ? (
            sources.map((source) => (
              <div key={source.sourceNumber} className="ws-reference-card" onClick={() => openCitationDrawer(source)}>
                <div className="ws-reference-title-row">
                  <span className="ws-reference-number">{source.sourceNumber}</span>
                  <span className="ws-reference-title" title={source.title}>{source.title}</span>
                </div>
                <p className="ws-reference-snippet">{source.snippet}</p>
                <div className="ws-reference-footer">
                  <span>
                    {source.relevanceScore !== null
                      ? `${Math.round(source.relevanceScore * 100)}% Match`
                      : "Ground Source"}
                  </span>
                  <button className="ws-open-doc-btn" onClick={(e) => { e.stopPropagation(); openCitationDrawer(source); }}>
                    <span>{text("Xem đoạn trích", "View snippet")}</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="ws-refs-empty">
              <FileSearch size={32} />
              <strong>{text("Chưa có trích dẫn", "No references yet")}</strong>
              <p>{text("Đặt câu hỏi để hệ thống tìm kiếm và trích dẫn các tài liệu liên quan.", "Ask a question to see grounded source citations here.")}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ─── CITATION PREVIEW DRAWER ──────────────────────────────── */}
      <div className={`ws-drawer-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="ws-drawer" onClick={(e) => e.stopPropagation()}>
          <header className="ws-drawer-header">
            <h3>{text("Chi tiết Đoạn trích", "Snippet Preview")}</h3>
            <button onClick={() => setDrawerOpen(false)} className="ws-drawer-close" aria-label={text("Đóng", "Close")}>
              <X size={18} />
            </button>
          </header>

          <div className="ws-drawer-content">
            {previewCitation && (
              <>
                <div className="ws-drawer-meta-grid">
                  <div className="ws-drawer-meta-item">
                    <span className="ws-drawer-meta-label">{text("Tên tài liệu", "Document Title")}</span>
                    <span className="ws-drawer-meta-value">{previewCitation.title}</span>
                  </div>
                  <div className="ws-drawer-meta-item">
                    <span className="ws-drawer-meta-label">{text("Chỉ số nguồn", "Source ID")}</span>
                    <span className="ws-drawer-meta-value">#{previewCitation.sourceNumber}</span>
                  </div>
                  {previewCitation.relevanceScore !== null && (
                    <div className="ws-drawer-meta-item">
                      <span className="ws-drawer-meta-label">{text("Độ liên quan", "Relevance")}</span>
                      <span className="ws-drawer-meta-value">{Math.round((previewCitation.relevanceScore ?? 0) * 100)}%</span>
                    </div>
                  )}
                </div>

                <div className="ws-drawer-snippet-section">
                  <span className="ws-drawer-snippet-title">{text("Đoạn trích nguồn", "Source Passage")}</span>
                  <div className="ws-drawer-snippet-box">{previewCitation.snippet}</div>
                </div>

                <div className="ws-drawer-notice">
                  <Info size={14} style={{ flexShrink: 0, color: "var(--ws-subtle)" }} />
                  <span>{text("Lưu ý: Nhảy trang chính xác hiện tại chưa được hỗ trợ bởi dữ liệu trích xuất.", "Note: Page-level jumping is not yet supported by document extract metadata.")}</span>
                </div>
              </>
            )}
          </div>

          <div className="ws-drawer-footer">
            <button
              className="ws-drawer-footer-btn"
              onClick={async () => {
                if (previewCitation) {
                  const doc = documents.find((d) => d.id === previewCitation.documentId);
                  if (doc) {
                    const result = await createDownloadUrl(doc.id);
                    window.open(result.url, "_blank", "noopener,noreferrer");
                  }
                }
              }}
            >
              <ArrowDownToLine size={16} />
              <span>{text("Tải tài liệu đầy đủ", "Download Full Document")}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
