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
  const getIndexStatusLabel = (status: LibraryDocument["indexStatus"]) => {
    if (status === "READY") return text("AI sẵn sàng", "AI ready");
    if (status === "PROCESSING") return text("Đang xử lý", "Processing");
    return text("Thất bại", "Failed");
  };
  const getVisibilityLabel = (visibility: LibraryDocument["visibility"]) =>
    visibility === "PRIVATE"
      ? text("riêng tư", "private")
      : text("công khai", "public");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [previewDocument, setPreviewDocument] = useState<LibraryDocument>();
  const documents = useMemo(
    () =>
      getLibraryDocuments().map((document) =>
        localizeLibraryDocument(document, locale),
      ),
    [locale],
  );
  const subjects = [...new Set(documents.map((document) => document.subject))];

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
      return (
        matchesQuery &&
        (!subject || document.subject === subject) &&
        (!fileType || document.fileType === fileType) &&
        (!status || document.indexStatus === status)
      );
    });
  }, [documents, fileType, query, status, subject]);

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
        <Link href={ROUTES.upload} className="primary-button">
          <Upload size={17} />
          {text("Tải tài liệu lên", "Upload document")}
        </Link>
      </header>

      <section className="library-controls">
        <label className="library-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text("Tìm theo nội dung, tiêu đề hoặc thẻ...", "Search by content, title, or tag...")}
          />
        </label>
        <div className="library-filters">
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">{text("Tất cả môn học", "All subjects")}</option>
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={fileType}
            onChange={(event) => setFileType(event.target.value)}
          >
            <option value="">{text("Tất cả loại tệp", "All file types")}</option>
            {["PDF", "DOCX", "PPTX", "XLSX"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">{text("Tất cả trạng thái", "All statuses")}</option>
            <option value="READY">{text("AI sẵn sàng", "AI ready")}</option>
            <option value="PROCESSING">{text("Đang xử lý", "Processing")}</option>
            <option value="FAILED">{text("Thất bại", "Failed")}</option>
          </select>
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
              {filteredDocuments.map((document) => (
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
                      className={`index-status index-status--${document.indexStatus.toLowerCase()}`}
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
                      <Link
                        href={`${ROUTES.aiChat}?scope=document&document=${document.id}`}
                        className="ask-document-action"
                      >
                        <Bot size={16} />
                        {text("Hỏi AI", "Ask AI")}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="library-card-grid">
          {filteredDocuments.map((document) => (
            <article className="library-document-card" key={document.id}>
              <div className="library-card-top">
                <span className="document-type-icon">
                  <DocumentIcon type={document.fileType} />
                </span>
                <span
                  className={`index-status index-status--${document.indexStatus.toLowerCase()}`}
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
                <Link
                  href={`${ROUTES.aiChat}?scope=document&document=${document.id}`}
                  className="ask-document-action"
                >
                  <Bot size={16} />
                  {text("Hỏi AI", "Ask AI")}
                </Link>
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
              <Link
                href={`${ROUTES.aiChat}?scope=document&document=${previewDocument.id}`}
                className="primary-button"
              >
                <Bot size={16} />
                {text("Hỏi AI", "Ask AI")}
              </Link>
            </footer>
          </article>
        </div>
      ) : null}
    </main>
  );
}
