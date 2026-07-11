"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  Check,
  ChevronDown,
} from "lucide-react";
import { askLibraryStream } from "../api/chat.api";
import { createDownloadUrl, fetchLibraryDocuments } from "../api/documents.api";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";
import type { ChatMessage, Citation } from "../types/chat";
import { ROUTES } from "../lib/routes";
import type { LibraryDocument } from "../types/document";

type ActiveMode = "SELECTED_SOURCES" | "MY_LIBRARY";

function renderMessageContent(
  content: string,
  citations: Citation[] = [],
  onCitationClick?: (citation: Citation) => void
) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const parseInline = (text: string) => {
    // Basic bold parsing: **text**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.flatMap((boldPart, boldIdx) => {
      if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
        return <strong key={`b-${boldIdx}`}>{boldPart.slice(2, -2)}</strong>;
      }

      // Parse citations: e.g. [Source 1], [Source 2], [1], [2] inside normal text
      const citationRegex = /(\[Source\s+\d+\]|\[\d+\])/gi;
      const citationParts = boldPart.split(citationRegex);

      return citationParts.map((part, citeIdx) => {
        if (/^(\[Source\s+\d+\]|\[\d+\])$/i.test(part)) {
          const match = part.match(/\d+/);
          if (match) {
            const sourceNumber = parseInt(match[0], 10);
            const citation = citations.find((c) => c.sourceNumber === sourceNumber);
            if (citation && onCitationClick) {
              return (
                <button
                  key={`cite-${boldIdx}-${citeIdx}`}
                  type="button"
                  className="ws-inline-citation"
                  onClick={() => onCitationClick(citation)}
                  title={citation.title}
                >
                  {part}
                </button>
              );
            }
          }
        }
        return part;
      });
    });
  };

  const flushList = (key: string | number) => {
    if (!currentList) return null;
    const listItems = currentList.items.map((item, idx) => (
      <li key={idx}>{parseInline(item)}</li>
    ));
    const listNode =
      currentList.type === "ul" ? (
        <ul key={key} className="ws-chat-ul">{listItems}</ul>
      ) : (
        <ol key={key} className="ws-chat-ol">{listItems}</ol>
      );
    currentList = null;
    return listNode;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentList) {
        elements.push(flushList(i));
      }
      continue;
    }

    // Unordered list item: starts with * or -
    const ulMatch = line.match(/^(\s*)[*-]\s+(.*)$/);
    if (ulMatch) {
      const itemContent = ulMatch[2];
      if (currentList && currentList.type !== "ul") {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(itemContent);
      continue;
    }

    // Ordered list item: starts with 1. 2. etc
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      const itemContent = olMatch[2];
      if (currentList && currentList.type !== "ol") {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(itemContent);
      continue;
    }

    // Normal line: if we had a list, flush it
    if (currentList) {
      elements.push(flushList(i));
    }

    elements.push(
      <p key={i} className="ws-chat-p">
        {parseInline(line)}
      </p>
    );
  }

  if (currentList) {
    elements.push(flushList("end"));
  }

  return elements;
}

export function AiChatbotView() {
  const router = useRouter();
  const { locale } = useLanguage();
  const text = useCallback(
    (vi: string, en: string) => localize(locale, vi, en),
    [locale],
  );

  // 1. Fetch Library Documents (Uploaded & Saved from Community)
  const [documents, setDocuments] = useState<(LibraryDocument & { isCommunitySaved?: boolean })[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchLibraryDocuments({ limit: 100 }),
      fetchLibraryDocuments({ savedOnly: true, limit: 100 }).catch(() => ({ items: [] }))
    ])
      .then(([uploadedResult, savedResult]) => {
        if (!active) return;
        
        const mergedMap = new Map<string, LibraryDocument & { isCommunitySaved?: boolean }>();
        uploadedResult.items.forEach((doc) => mergedMap.set(doc.id, doc));
        savedResult.items.forEach((doc) => {
          mergedMap.set(doc.id, {
            ...doc,
            isCommunitySaved: true,
          });
        });
        
        setDocuments(Array.from(mergedMap.values()));
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
  const [activeSelectedDocumentIds, setActiveSelectedDocumentIds] = useState<string[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"ALL" | "PDF" | "DOCX" | "PPTX" | "XLSX">("ALL");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [librarySessionId, setLibrarySessionId] = useState<string>();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [libraryMessages, setLibraryMessages] = useState<ChatMessage[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
  const [librarySources, setLibrarySources] = useState<Citation[]>([]);
  const [selectedSources, setSelectedSources] = useState<Citation[]>([]);
  const sessionId = activeMode === "MY_LIBRARY" ? librarySessionId : selectedSessionId;
  const setSessionId = activeMode === "MY_LIBRARY" ? setLibrarySessionId : setSelectedSessionId;
  const messages = activeMode === "MY_LIBRARY" ? libraryMessages : selectedMessages;
  const setMessages = activeMode === "MY_LIBRARY" ? setLibraryMessages : setSelectedMessages;
  const sources = activeMode === "MY_LIBRARY" ? librarySources : selectedSources;
  const setSources = activeMode === "MY_LIBRARY" ? setLibrarySources : setSelectedSources;
  const visibleSources = useMemo(
    () =>
      sources.filter(
        (source) => source.relevanceScore === null || source.relevanceScore >= 0.62,
      ),
    [sources],
  );

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
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [question]);

  const subjects = useMemo(() => {
    const uniqueSubjects = new Map<string, { id: string; name: string }>();
    documents.forEach((document) => {
      uniqueSubjects.set(document.subjectId, {
        id: document.subjectId,
        name: document.subject,
      });
    });
    return [...uniqueSubjects.values()].sort((a, b) =>
      a.name.localeCompare(b.name, locale === "vi" ? "vi" : "en"),
    );
  }, [documents, locale]);

  const selectedSubjectNames = useMemo(
    () =>
      subjects
        .filter((subject) => selectedSubjectIds.includes(subject.id))
        .map((subject) => subject.name),
    [selectedSubjectIds, subjects],
  );

  const subjectFilterLabel =
    selectedSubjectIds.length === 0
      ? text("Tất cả môn học", "All subjects")
      : selectedSubjectIds.length === 1
        ? selectedSubjectNames[0]
        : text(
            `${selectedSubjectIds.length} môn học`,
            `${selectedSubjectIds.length} subjects`,
          );

  useEffect(() => {
    function closeSubjectDropdown(event: MouseEvent) {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setSubjectDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", closeSubjectDropdown);
    return () => document.removeEventListener("mousedown", closeSubjectDropdown);
  }, []);



  // 4. Load sessionStorage on mount (hydration-safe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDocument = params.get("document");
    const requestedScope = params.get("scope");
    const requestedQuestion = params.get("q");

    if (requestedScope === "document") {
      setActiveMode("SELECTED_SOURCES");

      if (requestedDocument) {
        setSelectedDocumentIds([requestedDocument]);
        setCurrentDocumentId(requestedDocument);
        setSelectedSubjectIds([]);
      }
    }

    const savedMode = sessionStorage.getItem("documind.workspace.activeMode");
    if (
      requestedScope !== "document" &&
      savedMode &&
      ["SELECTED_SOURCES", "MY_LIBRARY"].includes(savedMode)
    ) {
      setActiveMode(savedMode as ActiveMode);
    }

    const savedSelected = sessionStorage.getItem("documind.workspace.selectedDocumentIds");
    if (!requestedDocument && savedSelected) {
      try { setSelectedDocumentIds(JSON.parse(savedSelected)); } catch { /* ignore */ }
    }
    const savedActiveSelected = sessionStorage.getItem("documind.workspace.activeSelectedDocumentIds");
    if (requestedDocument) {
      setActiveSelectedDocumentIds([requestedDocument]);
    } else if (savedActiveSelected) {
      try { setActiveSelectedDocumentIds(JSON.parse(savedActiveSelected)); } catch { /* ignore */ }
    }

    const savedSubjects = sessionStorage.getItem("documind.workspace.selectedSubjectIds");
    if (!requestedDocument && savedSubjects) {
      try { setSelectedSubjectIds(JSON.parse(savedSubjects)); } catch { /* ignore */ }
    }

    const savedCurrent = sessionStorage.getItem("documind.workspace.currentDocumentId");
    if (requestedDocument) {
      setCurrentDocumentId(requestedDocument);
    } else if (savedCurrent) {
      setCurrentDocumentId(savedCurrent);
    } else {
      setCurrentDocumentId(documents[0]?.id || "");
    }

    if (requestedQuestion) setQuestion(requestedQuestion);
  }, [documents]);

  // 5. Persist state to sessionStorage
  useEffect(() => { sessionStorage.setItem("documind.workspace.activeMode", activeMode); }, [activeMode]);
  useEffect(() => { sessionStorage.setItem("documind.workspace.selectedDocumentIds", JSON.stringify(selectedDocumentIds)); }, [selectedDocumentIds]);
  useEffect(() => { sessionStorage.setItem("documind.workspace.activeSelectedDocumentIds", JSON.stringify(activeSelectedDocumentIds)); }, [activeSelectedDocumentIds]);
  useEffect(() => { sessionStorage.setItem("documind.workspace.selectedSubjectIds", JSON.stringify(selectedSubjectIds)); }, [selectedSubjectIds]);
  useEffect(() => { if (currentDocumentId) sessionStorage.setItem("documind.workspace.currentDocumentId", currentDocumentId); }, [currentDocumentId]);

  // 6. Initialize welcome message if empty
  useEffect(() => {
    if (libraryMessages.length === 0) {
      setLibraryMessages([{ id: "welcome-library", sender: "AI", content: text("Chào mừng! Bạn đang đặt câu hỏi trên toàn bộ thư viện của mình.", "Welcome! You are asking across your entire library."), sources: [] }]);
    }
    if (selectedMessages.length === 0) {
      setSelectedMessages([{ id: "welcome-selected", sender: "AI", content: text("Chọn file, sau đó áp dụng để bắt đầu một cuộc trò chuyện có phạm vi cố định.", "Select files, then apply them to start a chat with a fixed scope."), sources: [] }]);
    }
  }, [libraryMessages.length, selectedMessages.length, text]);

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
      const matchesSubject =
        selectedSubjectIds.length === 0 ||
        selectedSubjectIds.includes(doc.subjectId);
      return matchesSearch && matchesType && matchesSubject;
    });
  }, [documents, searchQuery, fileTypeFilter, selectedSubjectIds]);

  useEffect(() => {
    if (filteredDocuments.length === 0) {
      if (currentDocumentId) setCurrentDocumentId("");
      return;
    }
    if (
      !currentDocumentId ||
      !filteredDocuments.some((document) => document.id === currentDocumentId)
    ) {
      setCurrentDocumentId(filteredDocuments[0].id);
    }
  }, [currentDocumentId, filteredDocuments]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  };

  const handleCheckboxToggle = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  const clearSelection = () => setSelectedDocumentIds([]);

  const handleDocumentRowClick = (docId: string) => {
    setCurrentDocumentId(docId);
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      openCitationDrawer({
        sourceNumber: 0,
        documentId: doc.id,
        title: doc.title,
        snippet: doc.description || text("Tài liệu chưa có mô tả chi tiết.", "No detailed description for this document."),
        relevanceScore: null,
      });
    }
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

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "USER", content: trimmed, sources: [], scope: activeMode }]);
    setQuestion("");
    setIsLoading(true);

    if (activeMode === "SELECTED_SOURCES" && activeSelectedDocumentIds.length === 0) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          sender: "AI",
          content: text(
            "Vui lòng chọn ít nhất một tài liệu nguồn ở danh sách bên trái để đặt câu hỏi.",
            "Please select at least one source document from the left list to ask questions.",
          ),
          sources: [],
          scope: activeMode
        }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const pendingMessageId = crypto.randomUUID();
      setMessages((prev) => [...prev.filter((message) => message.content), {
        id: pendingMessageId,
        sender: "AI",
        content: "",
        sources: [],
        scope: activeMode,
      }]);
      const response = await askLibraryStream({
            question: trimmed,
            sessionId,
            filters: activeMode === "SELECTED_SOURCES"
              ? { documentIds: activeSelectedDocumentIds }
              : {
                  subjectIds: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
                  fileType: fileTypeFilter === "ALL" ? undefined : fileTypeFilter,
                },
          }, {
            onSources: (nextSources) => {
              setMessages((prev) => prev.map((message) => message.id === pendingMessageId ? { ...message, sources: nextSources } : message));
            },
            onDelta: (delta) => {
              setMessages((prev) => prev.map((message) => message.id === pendingMessageId ? { ...message, content: message.content + delta } : message));
            },
          });

      setSessionId(response.sessionId);
      setSources(response.sources);
      setMessages((prev) => prev.map((message) => message.id === pendingMessageId ? {
        ...message,
        content: response.answer,
        sources: response.sources,
        answerStatus: response.answerStatus,
        errorCode: response.errorCode,
      } : message));
    } catch {
      setMessages((prev) => [...prev.filter((message) => message.content), {
        id: crypto.randomUUID(),
        sender: "AI",
        content: text(
          "Không thể nhận phản hồi AI lúc này. Vui lòng thử lại; câu trả lời mẫu sẽ không được dùng thay thế.",
          "The AI response is unavailable right now. Please retry; no demo answer has been substituted.",
        ),
        sources: [],
        errorCode: "REQUEST_FAILED",
        scope: activeMode
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRelevanceBadge = (score: number | null) => {
    if (score === null) {
      return (
        <span className="ws-relevance-badge ws-relevance-badge--ground">
          {text("Tài liệu gốc", "Ground Source")}
        </span>
      );
    }
    if (score >= 0.85) {
      return (
        <span className="ws-relevance-badge ws-relevance-badge--high">
          {text("Độ liên quan cao", "High relevance")}
        </span>
      );
    }
    if (score >= 0.70) {
      return (
        <span className="ws-relevance-badge ws-relevance-badge--medium">
          {text("Có liên quan", "Relevant")}
        </span>
      );
    }
    return (
      <span className="ws-relevance-badge ws-relevance-badge--low">
        {text("Nguồn bổ sung", "Supporting source")}
      </span>
    );
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
    if (activeMode === "SELECTED_SOURCES") {
      if (activeSelectedDocumentIds.length === 1) {
        const doc = documents.find((d) => d.id === activeSelectedDocumentIds[0]);
        return text(`Đặt câu hỏi về "${doc?.title || "tài liệu đã chọn"}"...`, `Ask about "${doc?.title || "selected document"}"...`);
      }
      return text("Nhập câu hỏi dựa trên các nguồn đã chọn...", "Ask about selected sources...");
    }
    return text("Đặt câu hỏi trên toàn bộ thư viện...", "Ask across your entire library...");
  };

  const applySelectedScope = () => {
    if (selectedDocumentIds.length === 0) return;
    setActiveSelectedDocumentIds([...selectedDocumentIds]);
    setSelectedSessionId(undefined);
    setSelectedSources([]);
    setSelectedMessages([{ id: crypto.randomUUID(), sender: "AI", content: text(`Đã khóa phạm vi ${selectedDocumentIds.length} file. Hãy đặt câu hỏi mới.`, `Scope locked to ${selectedDocumentIds.length} files. Ask a new question.`), sources: [] }]);
  };

  const getAnswerIssueCopy = (msg: ChatMessage) => {
    if (msg.errorCode === "REQUEST_FAILED") {
      return {
        title: text("Không nhận được phản hồi AI", "AI response was not received"),
        description: text(
          "Hệ thống không thay thế lỗi bằng câu trả lời mẫu. Hãy thử lại sau ít phút.",
          "The system did not replace the failure with a demo answer. Please retry shortly.",
        ),
      };
    }
    if (msg.answerStatus === "FALLBACK_WITH_SOURCES") {
      const title = text("AI chưa tạo được phần diễn giải", "AI could not generate the narrative answer");
      const descriptionByCode: Record<string, string> = {
        GEMINI_MISSING_API_KEY: text(
          "Thiếu cấu hình khóa Gemini. Hệ thống vẫn đã tìm nguồn liên quan để bạn đọc ngay.",
          "Gemini API key is not configured. Relevant sources are still available.",
        ),
        GEMINI_RATE_LIMIT: text(
          "Gemini đang bị giới hạn quota hoặc tần suất. Bạn có thể xem nguồn hoặc thử lại sau.",
          "Gemini is rate limited or out of quota. Review the sources or retry later.",
        ),
        GEMINI_TIMEOUT: text(
          "Gemini phản hồi quá lâu. Nguồn liên quan vẫn được giữ lại ở phần tham chiếu.",
          "Gemini took too long to respond. Relevant sources are still shown.",
        ),
        GEMINI_NETWORK_ERROR: text(
          "Kết nối đến Gemini gặp lỗi mạng. Hãy kiểm tra backend hoặc thử lại sau.",
          "The Gemini connection failed. Check the backend network or retry later.",
        ),
        GEMINI_API_ERROR: text(
          "Gemini trả về lỗi dịch vụ. Các trích dẫn đã tìm được vẫn có thể mở để kiểm tra.",
          "Gemini returned a service error. Retrieved citations are still available.",
        ),
        GEMINI_INVALID_RESPONSE: text(
          "Gemini trả về phản hồi rỗng. Hãy thử hỏi lại cụ thể hơn hoặc thử lại sau.",
          "Gemini returned an empty response. Try a more specific question or retry later.",
        ),
      };
      return {
        title,
        description:
          descriptionByCode[msg.errorCode || ""] ||
          text(
            "Dịch vụ tạo sinh đang lỗi. Hệ thống vẫn đã tìm được tài liệu tham chiếu phù hợp.",
            "The generation service failed. Relevant references were still retrieved.",
          ),
      };
    }

    if (msg.answerStatus === "NO_SOURCES") {
      return {
        title: text("Chưa tìm thấy nguồn phù hợp", "No matching source found"),
        description: text(
          "Thử đổi từ khóa, bỏ bớt bộ lọc hoặc chọn trực tiếp một vài tài liệu nguồn.",
          "Try different keywords, remove filters, or select source documents directly.",
        ),
      };
    }

    return null;
  };

  return (
    <main
      id="main-content"
      className={`ai-workspace${sourcesCollapsed ? " left-collapsed" : ""}${referencesCollapsed ? " right-collapsed" : ""}`}
    >

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

          <div className="ws-subject-filter" ref={subjectDropdownRef}>
            <button
              type="button"
              className={`ws-subject-filter-trigger${selectedSubjectIds.length ? " active" : ""}`}
              onClick={() => setSubjectDropdownOpen((open) => !open)}
              aria-expanded={subjectDropdownOpen}
            >
              <span>
                <small>{text("Lọc theo môn học", "Filter by subject")}</small>
                <strong title={selectedSubjectNames.join(", ")}>
                  {subjectFilterLabel}
                </strong>
              </span>
              <ChevronDown size={16} />
            </button>

            {subjectDropdownOpen ? (
              <div className="ws-subject-dropdown">
                <div className="ws-subject-dropdown-heading">
                  <strong>{text("Chọn môn học", "Choose subjects")}</strong>
                  <span>
                    {selectedSubjectIds.length || text("Tất cả", "All")}
                  </span>
                </div>
                <button
                  type="button"
                  className={`ws-subject-option${selectedSubjectIds.length === 0 ? " selected" : ""}`}
                  onClick={() => setSelectedSubjectIds([])}
                >
                  <span className="ws-subject-check">
                    {selectedSubjectIds.length === 0 ? <Check size={13} /> : null}
                  </span>
                  <span>
                    <strong>{text("Tất cả môn học", "All subjects")}</strong>
                    <small>
                      {text(
                        `${documents.length} tài liệu trong thư viện`,
                        `${documents.length} library documents`,
                      )}
                    </small>
                  </span>
                </button>
                <div className="ws-subject-options">
                  {subjects.map((subject) => {
                    const checked = selectedSubjectIds.includes(subject.id);
                    const count = documents.filter(
                      (document) => document.subjectId === subject.id,
                    ).length;
                    return (
                      <button
                        type="button"
                        key={subject.id}
                        className={`ws-subject-option${checked ? " selected" : ""}`}
                        onClick={() => toggleSubject(subject.id)}
                      >
                        <span className="ws-subject-check">
                          {checked ? <Check size={13} /> : null}
                        </span>
                        <span>
                          <strong>{subject.name}</strong>
                          <small>
                            {count} {text("tài liệu", "documents")}
                          </small>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <footer>
                  <span>
                    {text(
                      "Có thể chọn nhiều môn",
                      "Multiple selection supported",
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubjectDropdownOpen(false)}
                  >
                    {text("Xong", "Done")}
                  </button>
                </footer>
              </div>
            ) : null}
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
            // Only highlight the active card in SELECTED_SOURCES mode (when user explicitly views a doc)
            const isCurrent = activeMode === "SELECTED_SOURCES" && doc.id === (currentDocumentId || documents[0]?.id);
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
                    <span>{doc.fileType}</span>
                    {doc.category && (
                      <>
                        <span className="ws-source-meta-dot">·</span>
                        <span>{doc.category}</span>
                      </>
                    )}
                    {doc.isCommunitySaved && (
                      <>
                        <span className="ws-source-meta-dot">·</span>
                        <span className="ws-community-badge" title={text("Đã lưu từ cộng đồng", "Saved from community")}>
                          {text("Cộng đồng", "Community")}
                        </span>
                      </>
                    )}
                    <span className="ws-source-meta-dot">·</span>
                    <span className={`ws-source-status${doc.indexStatus === "READY" ? " ready" : " processing"}`}>
                      {doc.indexStatus === "READY" ? text("Sẵn sàng", "Ready") : text("Đang xử lý", "Processing")}
                    </span>
                  </div>
                  {/* Quick-action button: only shown in SELECTED_SOURCES mode for the currently focused card */}
                  {isCurrent && doc.indexStatus === "READY" && (
                    <button
                      type="button"
                      className="ws-ask-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDocumentIds([doc.id]);
                      }}
                    >
                      <Sparkles size={11} />
                      <span>{text("Hỏi tài liệu này", "Ask this file")}</span>
                    </button>
                  )}
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
            <>
              {activeMode === "SELECTED_SOURCES" ? (
                <button onClick={applySelectedScope} className="ws-clear-btn">
                  {text("Áp dụng & chat mới", "Apply & new chat")}
                </button>
              ) : null}
              <button onClick={clearSelection} className="ws-clear-btn">
                {text("Bỏ chọn", "Clear")}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ─── CENTER CHAT ───────────────────────────────────────────── */}
      <section className="ws-chat-panel">
        <header className="ws-chat-header">
          {/* Left Toggles (Mobile & Desktop) */}
          <div className="ws-header-left-toggles">
            <button
              className="ws-toggle-btn ws-toggle-mobile"
              onClick={() => setSourcesDrawerOpen(!sourcesDrawerOpen)}
              title={text("Danh sách tài liệu", "Sources list")}
            >
              <Library size={18} />
            </button>
            <button
              onClick={() => setSourcesCollapsed(!sourcesCollapsed)}
              className={`ws-toggle-btn ws-toggle-desktop${!sourcesCollapsed ? " active" : ""}`}
              title={text("Ẩn/Hiện Sidebar Trái", "Toggle Left Sidebar")}
            >
              {sourcesCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Mode Selector */}
          <div className="ws-mode-selector">
            <button
              type="button"
              className={`ws-mode-btn${activeMode === "MY_LIBRARY" ? " active" : ""}`}
              onClick={() => setActiveMode("MY_LIBRARY")}
            >
              <strong>{text("Toàn bộ thư viện", "Entire Library")}</strong>
              <small>{text("AI tự động tìm tài liệu liên quan", "AI finds relevant files automatically")}</small>
            </button>
            <button
              type="button"
              className={`ws-mode-btn${activeMode === "SELECTED_SOURCES" ? " active" : ""}`}
              onClick={() => setActiveMode("SELECTED_SOURCES")}
            >
              <strong>{text(`File đã chọn (${selectedDocumentIds.length})`, `Selected Files (${selectedDocumentIds.length})`)}</strong>
              <small>{text("AI chỉ tìm kiếm trong file được chọn", "AI searches selected files only")}</small>
            </button>
          </div>

          {/* Right Toggles (Mobile & Desktop) */}
          <div className="ws-header-right-toggles">
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
          {activeMode === "SELECTED_SOURCES" && activeSelectedDocumentIds.length === 0 ? (
            <div className="ws-empty-state ws-empty-state--no-selection">
              <div className="ws-empty-icon"><AlertTriangle size={26} /></div>
              <h3>{text("Chưa chọn tài liệu nguồn", "No source documents selected")}</h3>
              <p>
                {text(
                  "Vui lòng đánh dấu chọn (checkbox) vào các tài liệu ở danh sách bên trái để đặt câu hỏi trên nhóm tài liệu đó.",
                  "Please check the boxes next to the documents on the left sidebar to ask questions about them.",
                )}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const answerIssue = getAnswerIssueCopy(msg);
                return (
                  <div
                    key={msg.id}
                    className={`ws-message${msg.sender === "USER" ? " user" : " ai"}`}
                    onClick={() => {
                      if (msg.sender === "AI" && msg.sources.length > 0) setSources(msg.sources);
                    }}
                  >
                    <div className="ws-message-avatar">
                      {msg.sender === "USER" ? "U" : <Sparkles size={15} />}
                    </div>
                    <div className={`ws-message-bubble${answerIssue ? " ws-message-bubble--notice" : ""}`}>
                      {answerIssue && (
                        <div className="ws-answer-issue" role="status">
                          <AlertTriangle size={16} aria-hidden="true" />
                          <div>
                            <strong>{answerIssue.title}</strong>
                            <span>{answerIssue.description}</span>
                          </div>
                        </div>
                      )}
                      {msg.sender === "AI" && msg.id !== "welcome" && msg.scope && (
                        <div className="ws-message-scope-indicator">
                          {msg.scope === "MY_LIBRARY" ? (
                            <span className="ws-scope-tag">
                              <Library size={12} />
                              {text(
                                "Dựa trên các tài liệu liên quan tìm thấy trong thư viện của bạn...",
                                "Based on relevant literature in your library...",
                              )}
                            </span>
                          ) : (
                            <span className="ws-scope-tag">
                              <FileText size={12} />
                              {text(
                                "Dựa trên các file bạn đã chọn...",
                                "Based on the selected files...",
                              )}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="ws-message-text">
                        {renderMessageContent(msg.content, msg.sources, openCitationDrawer)}
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
                );
              })}

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
            </>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Bottom input */}
        <div className="ws-chat-footer">
          {/* Selected sources chips */}
          {activeSelectedDocumentIds.length > 0 && (
            <div className="ws-selected-chips-container">
              <div className="ws-selected-chips-header">
                <span>
                  <strong>{activeSelectedDocumentIds.length}</strong> {text("File đang dùng cho câu hỏi tiếp theo", "Files used for next question")}
                </span>
                <button type="button" onClick={clearSelection} className="ws-selected-clear-all">
                  {text("Bỏ chọn tất cả", "Clear all")}
                </button>
              </div>
              <div className="ws-selected-chips-list">
                {activeSelectedDocumentIds.map((id) => {
                  const doc = documents.find((d) => d.id === id);
                  if (!doc) return null;
                  return (
                    <div key={id} className="ws-selected-chip">
                      <span>{doc.title}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedDocumentIds((prev) => prev.filter((item) => item !== id))}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
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
              {activeMode === "SELECTED_SOURCES"
                ? text(`Câu hỏi tiếp theo dựa trên: ${activeSelectedDocumentIds.length} file đang dùng`, `Next question based on: ${activeSelectedDocumentIds.length} selected files`)
                : selectedSubjectIds.length > 0
                  ? text(
                      `Câu hỏi tiếp theo dựa trên: các môn ${selectedSubjectNames.join(", ")}`,
                      `Next question based on: subjects ${selectedSubjectNames.join(", ")}`,
                    )
                  : text("Câu hỏi tiếp theo dựa trên: Toàn bộ thư viện", "Next question based on: Entire library")}
            </span>
          </div>
        </div>
      </section>

      {/* ─── RIGHT SIDEBAR ────────────────────────────────────────── */}
      <aside className={`ws-references-panel${referencesCollapsed ? " ws-panel--collapsed" : ""}${referencesDrawerOpen ? " ws-panel--open" : ""}`}>
        <div className="ws-references-header">
          <div className="ws-references-title-group">
            <h2>{activeMode === "MY_LIBRARY" ? text("Nguồn cho câu trả lời này", "Sources for this answer") : text("File trong phạm vi", "Files in scope")}</h2>
            <span className="ws-references-count">
              {activeMode === "MY_LIBRARY" ? visibleSources.length : activeSelectedDocumentIds.length}
            </span>
          </div>
        </div>

        <div className="ws-references-content">
          {activeMode === "MY_LIBRARY" ? (
            <>
              {visibleSources.length > 0 ? (
                <>
                  <div style={{ padding: "16px 16px 0", fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                    {text("Nguồn tìm thấy", "Sources found")}
                  </div>
                  <div className="ws-sidebar-selected-list">
                    {visibleSources.map((source) => (
                        <div key={source.sourceNumber} className="ws-reference-card" onClick={() => openCitationDrawer(source)}>
                          <div className="ws-reference-title-row">
                            <span className="ws-reference-number">{source.sourceNumber}</span>
                            <span className="ws-reference-title" title={source.title}>{source.title}</span>
                          </div>
                          <p className="ws-reference-snippet">{source.snippet}</p>
                          <div className="ws-reference-footer">
                            {renderRelevanceBadge(source.relevanceScore)}
                            <button type="button" className="ws-open-doc-btn" onClick={(e) => { e.stopPropagation(); openCitationDrawer(source); }}>
                              <span>{text("Xem đoạn trích", "View snippet")}</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    className="ws-sidebar-use-sources-btn"
                    onClick={() => {
                      const newIds = Array.from(new Set([...selectedDocumentIds, ...visibleSources.map(s => s.documentId)]));
                      setSelectedDocumentIds(newIds);
                      setActiveMode("SELECTED_SOURCES");
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{text("Dùng các nguồn này cho câu hỏi tiếp theo", "Use these sources for next question")}</span>
                  </button>
                </>
              ) : (
                <div className="ws-refs-empty">
                  <FileSearch size={32} />
                  <strong>{text("Chưa có trích dẫn", "No references yet")}</strong>
                  <p>
                    {text("Đặt câu hỏi để tìm kiếm trích dẫn từ toàn bộ thư viện của bạn.", "Ask a question to see citations from your entire library.")}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {activeSelectedDocumentIds.length > 0 ? (
                <>
                  <div style={{ padding: "16px 16px 0", fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                    {text("File đang dùng cho câu hỏi tiếp theo", "Files used for next question")}
                  </div>
                  <div className="ws-sidebar-selected-list">
                    {activeSelectedDocumentIds.map((id) => {
                      const doc = documents.find((d) => d.id === id);
                      if (!doc) return null;
                      return (
                        <div key={id} className="ws-sidebar-selected-item">
                          {getFileIcon(doc.fileType)}
                          <span title={doc.title}>{doc.title}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedDocumentIds((prev) => prev.filter((item) => item !== id))}
                            aria-label={text("Bỏ chọn", "Remove selection")}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="ws-refs-empty">
                  <FileSearch size={32} />
                  <strong>{text("Chưa chọn file nào", "No files selected")}</strong>
                  <p>
                    {text("Vui lòng đánh dấu chọn tài liệu từ danh sách bên trái để sử dụng.", "Please select documents from the list on the left to use them.")}
                  </p>
                </div>
              )}
              <button
                type="button"
                className="ws-sidebar-add-sources-btn"
                onClick={() => {
                  const searchInput = document.querySelector(".ws-search-input") as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                  }
                }}
              >
                <Plus size={14} />
                <span>{text("Thêm nguồn", "Add sources")}</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ─── CITATION PREVIEW DRAWER ──────────────────────────────── */}
      <div className={`ws-drawer-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="ws-drawer" onClick={(e) => e.stopPropagation()}>
          <header className="ws-drawer-header">
            <h3>{text("Đoạn trích tham khảo", "Reference Passage")}</h3>
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
                  {previewCitation.sourceLocator?.length ? (
                    <div className="ws-drawer-meta-item">
                      <span className="ws-drawer-meta-label">{text("Vị trí nguồn", "Source location")}</span>
                      <span className="ws-drawer-meta-value">{previewCitation.sourceLocator.join(" · ")}</span>
                    </div>
                  ) : null}
                </div>

                <div className="ws-drawer-snippet-section">
                  <span className="ws-drawer-snippet-title">{text("Đoạn trích tham khảo", "Reference Passage")}</span>
                  <div className="ws-drawer-snippet-box">{previewCitation.quote || previewCitation.snippet}</div>
                </div>

                {!previewCitation.sourceLocator?.length && <div className="ws-drawer-notice">
                  <Info size={14} style={{ flexShrink: 0, color: "var(--ws-subtle)" }} />
                  <span>{text("Lưu ý: Nhảy trang chính xác hiện tại chưa được hỗ trợ bởi dữ liệu trích xuất.", "Note: Page-level jumping is not yet supported by document extract metadata.")}</span>
                </div>}
              </>
            )}
          </div>

          <div className="ws-drawer-footer" style={{ display: "flex", gap: "10px" }}>
            {previewCitation && documents.some((d) => d.id === previewCitation.documentId) && (
              <button
                type="button"
                className="ws-drawer-footer-btn ws-drawer-footer-btn--primary"
                onClick={() => {
                  setSelectedDocumentIds([previewCitation.documentId]);
                  setActiveMode("SELECTED_SOURCES");
                  setDrawerOpen(false);
                }}
              >
                <Sparkles size={16} />
                <span>{text("Hỏi tài liệu này", "Ask this file")}</span>
              </button>
            )}
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
