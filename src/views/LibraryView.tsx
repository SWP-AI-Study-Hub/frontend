"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Grid2X2,
  List,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  downloadDemoDocument,
  formatFileSize,
  getLibraryDocuments,
  fetchSubjects,
} from "../api/documents.api";
import type { LibraryDocument } from "../types/document";
import { useLanguage } from "../i18n/LanguageProvider";
import { localizeLibraryDocument } from "../i18n/document-display";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";

function DocumentIcon({ type }: { type: string }) {
  return type === "XLSX" ? (
    <FileSpreadsheet size={20} />
  ) : (
    <FileText size={20} />
  );
}

export function LibraryView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  const getIndexStatusLabel = (status: LibraryDocument["indexStatus"] | null | undefined) => {
    if (status === "READY") return text("AI sẵn sàng", "AI ready");
    if (status === "PROCESSING") return text("Đang xử lý", "Processing");
    if (status === "FAILED") return text("Thất bại", "Failed");
    return text("Chưa lập chỉ mục", "Not Indexed");
  };
  const getVisibilityLabel = (visibility: LibraryDocument["visibility"]) =>
    visibility === "PRIVATE"
      ? text("riêng tư", "private")
      : text("công khai", "public");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState("");
  const [status, setStatus] = useState("");
  const [visibility, setVisibility] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState<"table" | "grid">("table");
  const [previewDocument, setPreviewDocument] = useState<LibraryDocument>();
  const documents = useMemo(
    () =>
      getLibraryDocuments().map((document) =>
        localizeLibraryDocument(document, locale),
      ),
    [locale],
  );

  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  useEffect(() => {
    async function load() {
      const list = await fetchSubjects();
      setDbSubjects(list.map((s) => s.name));
    }
    void load();
  }, []);

  const subjects = useMemo(() => {
    const docSubjects = documents.map((document) => document.subject);
    return [...new Set([...dbSubjects, ...docSubjects])];
  }, [documents, dbSubjects]);

  useEffect(() => {
    setSubject("");
  }, [locale]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesQuery =
        !normalized ||
        [document.title, document.description, ...document.tags].some((value) =>
          value.toLowerCase().includes(normalized),
        );

      let mappedStatus = "NOT_INDEXED";
      if (document.indexStatus === "READY") mappedStatus = "READY";
      else if (document.indexStatus === "PROCESSING") mappedStatus = "PROCESSING";
      else if (document.indexStatus === "FAILED") mappedStatus = "FAILED";

      return (
        matchesQuery &&
        (!subject || document.subject === subject) &&
        (!fileType || document.fileType === fileType) &&
        (!status || mappedStatus === status) &&
        (!visibility || document.visibility === visibility)
      );
    });
  }, [documents, fileType, query, status, subject, visibility]);

  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments];
    if (sortBy === "oldest") {
      docs.sort(
        (a, b) =>
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      );
    } else if (sortBy === "name-asc") {
      docs.sort((a, b) =>
        a.title.localeCompare(b.title, locale === "vi" ? "vi" : "en")
      );
    } else if (sortBy === "size-desc") {
      docs.sort((a, b) => b.fileSize - a.fileSize);
    } else {
      docs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    }
    return docs;
  }, [filteredDocuments, sortBy, locale]);

  const isFilterActive =
    query !== "" ||
    subject !== "" ||
    fileType !== "" ||
    status !== "" ||
    visibility !== "" ||
    sortBy !== "newest";

  const clearFilters = () => {
    setQuery("");
    setSubject("");
    setFileType("");
    setStatus("");
    setVisibility("");
    setSortBy("newest");
  };

  return (
    <main id="main-content" className="library-page">
      <header className="library-page-heading">
        <div>
          <p className="eyebrow">{text("THƯ VIỆN CỦA TÔI", "MY LIBRARY")}</p>
          <h1>{text("Tài liệu của bạn, sẵn sàng để khám phá.", "Your documents, ready to think with.")}</h1>
          <p>
            {text(
              "Tìm kiếm nội dung và metadata, kiểm tra trạng thái lập chỉ mục hoặc tiếp tục với AI.",
              "Search metadata and content, inspect indexing status, or continue with AI.",
            )}
          </p>
        </div>
      </header>

      <section className="library-controls">
        <div className="library-controls-row-1">
          <label className="library-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text("Tìm theo nội dung, tiêu đề hoặc thẻ...", "Search by content, title, or tag...")}
            />
          </label>
          <Link href={ROUTES.upload} className="primary-button upload-btn-cta">
            <Upload size={17} />
            {text("Tải tài liệu lên", "Upload document")}
          </Link>
        </div>

        <div className="library-controls-row-2">
          <div className="library-filters-scroll-container">
            <div className="library-filters">
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={subject ? "filter-active" : undefined}
              >
                <option value="">{text("Tất cả môn học", "All subjects")}</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                className={fileType ? "filter-active" : undefined}
              >
                <option value="">{text("Tất cả loại tệp", "All file types")}</option>
                {["PDF", "DOCX", "PPTX", "XLSX"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={status ? "filter-active" : undefined}
              >
                <option value="">{text("Tất cả trạng thái", "All AI statuses")}</option>
                <option value="READY">{text("AI sẵn sàng", "AI Ready")}</option>
                <option value="PROCESSING">{text("Đang xử lý", "Processing")}</option>
                <option value="FAILED">{text("Thất bại", "Failed")}</option>
                <option value="NOT_INDEXED">{text("Chưa lập chỉ mục", "Not Indexed")}</option>
              </select>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className={visibility ? "filter-active" : undefined}
              >
                <option value="">{text("Tất cả chế độ", "All visibility")}</option>
                <option value="PUBLIC">{text("Công khai", "Public")}</option>
                <option value="PRIVATE">{text("Riêng tư", "Private")}</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className={sortBy !== "newest" ? "filter-active" : undefined}
              >
                <option value="newest">{text("Mới nhất", "Newest")}</option>
                <option value="oldest">{text("Cũ nhất", "Oldest")}</option>
                <option value="name-asc">{text("Tên A-Z", "Name A-Z")}</option>
                <option value="size-desc">{text("Dung lượng", "File size")}</option>
              </select>
              {isFilterActive && (
                <button
                  type="button"
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  <X size={14} />
                  {text("Xóa bộ lọc", "Clear filters")}
                </button>
              )}
            </div>
          </div>
          <div className="view-toggle" aria-label={text("Kiểu hiển thị thư viện", "Library view")}>
            <button
              type="button"
              className={view === "table" ? "active" : undefined}
              onClick={() => setView("table")}
              title={text("Dạng danh sách", "List view")}
            >
              <List size={17} />
            </button>
            <button
              type="button"
              className={view === "grid" ? "active" : undefined}
              onClick={() => setView("grid")}
              title={text("Dạng lưới", "Grid view")}
            >
              <Grid2X2 size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="library-result-count">
        <strong>{filteredDocuments.length} {text("tài liệu", "documents")}</strong>
        <span>
          {
            documents.filter((document) => document.indexStatus === "READY")
              .length
          }{" "}
          {text("AI sẵn sàng", "AI ready")}
        </span>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="soft-empty-state library-empty">
          <Search size={28} />
          <strong>{text("Không có tài liệu phù hợp", "No matching documents")}</strong>
          <p>{text("Xóa bộ lọc hoặc tải nguồn tài liệu mới lên thư viện.", "Clear a filter or upload a new source to your library.")}</p>
        </div>
      ) : view === "table" ? (
        <div className="library-table-wrap">
          <table className="library-table">
            <thead>
              <tr>
                <th>{text("Tiêu đề tài liệu", "Document title")}</th>
                <th>{text("Môn học", "Subject")}</th>
                <th>{text("Ngày tải lên", "Upload date")}</th>
                <th>{text("Chỉ mục AI", "AI index")}</th>
                <th>{text("Thao tác", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="library-document-cell">
                      <span className="document-type-icon">
                        <DocumentIcon type={document.fileType} />
                      </span>
                      <span>
                        <strong>{document.title}</strong>
                        <small>
                          {document.fileType} /{" "}
                          {formatFileSize(document.fileSize)} /{" "}
                          {getVisibilityLabel(document.visibility)}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>{document.subject}</td>
                  <td>
                    {new Date(document.uploadedAt).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : "en-US",
                    )}
                  </td>
                  <td>
                    <span
                      className={`index-status index-status--${(document.indexStatus ?? "NOT_INDEXED").toLowerCase()}`}
                    >
                      {getIndexStatusLabel(document.indexStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="document-actions">
                      <button
                        type="button"
                        title={text("Xem trước", "Preview")}
                        onClick={() => setPreviewDocument(document)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title={text("Tải xuống", "Download")}
                        onClick={() => downloadDemoDocument(document)}
                      >
                        <Download size={16} />
                      </button>
                      {document.indexStatus === "READY" ? (
                        <Link
                          href={`${ROUTES.aiChat}?scope=document&document=${document.id}`}
                          className="ask-document-action"
                        >
                          <Bot size={16} />
                          {text("Hỏi AI", "Ask AI")}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="ask-document-action disabled"
                          disabled
                          title={text(
                            "Không thể hỏi AI khi tài liệu đang xử lý hoặc thất bại",
                            "Cannot ask AI while document is processing or failed"
                          )}
                          style={{
                            opacity: 0.5,
                            cursor: "not-allowed",
                            pointerEvents: "none",
                            backgroundColor: "var(--border)",
                            color: "var(--muted)",
                          }}
                        >
                          <Bot size={16} />
                          {text("Hỏi AI", "Ask AI")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="library-card-grid">
          {sortedDocuments.map((document) => (
            <article className="library-document-card" key={document.id}>
              <div className="library-card-top">
                <span className="document-type-icon">
                  <DocumentIcon type={document.fileType} />
                </span>
                <span
                  className={`index-status index-status--${(document.indexStatus ?? "NOT_INDEXED").toLowerCase()}`}
                >
                  {getIndexStatusLabel(document.indexStatus)}
                </span>
              </div>
              <div>
                <h2>{document.title}</h2>
                <p>{document.description}</p>
              </div>
              <div className="library-card-meta">
                <span>{document.subject}</span>
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="document-actions">
                <button
                  type="button"
                  title={text("Xem trước", "Preview")}
                  onClick={() => setPreviewDocument(document)}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  title={text("Tải xuống", "Download")}
                  onClick={() => downloadDemoDocument(document)}
                >
                  <Download size={16} />
                </button>
                {document.indexStatus === "READY" ? (
                  <Link
                    href={`${ROUTES.aiChat}?scope=document&document=${document.id}`}
                    className="ask-document-action"
                  >
                    <Bot size={16} />
                    {text("Hỏi AI", "Ask AI")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="ask-document-action disabled"
                    disabled
                    title={text(
                      "Không thể hỏi AI khi tài liệu đang xử lý hoặc thất bại",
                      "Cannot ask AI while document is processing or failed"
                    )}
                    style={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                      pointerEvents: "none",
                      backgroundColor: "var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    <Bot size={16} />
                    {text("Hỏi AI", "Ask AI")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {previewDocument ? (
        <div
          className="preview-overlay"
          role="presentation"
          onMouseDown={() => setPreviewDocument(undefined)}
        >
          <article
            className="preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${text("Xem trước", "Preview")} ${previewDocument.title}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="document-type-icon">
                  <DocumentIcon type={previewDocument.fileType} />
                </span>
                <span>
                  <strong>{previewDocument.title}</strong>
                  <small>{previewDocument.fileName}</small>
                </span>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPreviewDocument(undefined)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="preview-document-sheet">
              <p className="eyebrow">{previewDocument.subject}</p>
              <h2>{previewDocument.title}</h2>
              <p>{previewDocument.description}</p>
              <blockquote>
                {text(
                  "Bản xem trước đã sẵn sàng. Mở AI Chatbot để đặt câu hỏi về tài liệu này.",
                  "The preview is ready. Open AI Chatbot to ask questions about this document.",
                )}
              </blockquote>
            </div>
            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={() => downloadDemoDocument(previewDocument)}
              >
                <Download size={16} />
                {text("Tải xuống", "Download")}
              </button>
              {previewDocument.indexStatus === "READY" ? (
                <Link
                  href={`${ROUTES.aiChat}?scope=document&document=${previewDocument.id}`}
                  className="primary-button"
                >
                  <Bot size={16} />
                  {text("Hỏi AI", "Ask AI")}
                </Link>
              ) : (
                <button
                  type="button"
                  className="primary-button disabled"
                  disabled
                  title={text(
                    "Không thể hỏi AI khi tài liệu đang xử lý hoặc thất bại",
                    "Cannot ask AI while document is processing or failed"
                  )}
                  style={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                    pointerEvents: "none",
                    backgroundColor: "var(--border)",
                    color: "var(--muted)",
                  }}
                >
                  <Bot size={16} />
                  {text("Hỏi AI", "Ask AI")}
                </button>
              )}
            </footer>
          </article>
        </div>
      ) : null}
    </main>
  );
}
