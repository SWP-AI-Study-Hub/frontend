"use client";

import { useMemo, useState } from "react";
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
import { ROUTES } from "../lib/routes";

function DocumentIcon({ type }: { type: string }) {
  return type === "XLSX" ? (
    <FileSpreadsheet size={20} />
  ) : (
    <FileText size={20} />
  );
}

function getIndexStatusLabel(status: LibraryDocument["indexStatus"]) {
  if (status === "READY") return "AI sẵn sàng";
  if (status === "PROCESSING") return "Đang xử lý";
  return "Thất bại";
}

function getVisibilityLabel(visibility: LibraryDocument["visibility"]) {
  return visibility === "PRIVATE" ? "riêng tư" : "công khai";
}

export function LibraryView() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [previewDocument, setPreviewDocument] = useState<LibraryDocument>();
  const documents = useMemo(() => getLibraryDocuments(), []);
  const subjects = [...new Set(documents.map((document) => document.subject))];

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
          <p className="eyebrow">THƯ VIỆN CỦA TÔI</p>
          <h1>Tài liệu của bạn, sẵn sàng để khám phá.</h1>
          <p>
            Tìm kiếm nội dung và metadata, kiểm tra trạng thái lập chỉ mục hoặc
            tiếp tục với AI.
          </p>
        </div>
        <Link href={ROUTES.upload} className="primary-button">
          <Upload size={17} />
          Tải tài liệu lên
        </Link>
      </header>

      <section className="library-controls">
        <label className="library-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo nội dung, tiêu đề hoặc thẻ..."
          />
        </label>
        <div className="library-filters">
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={fileType}
            onChange={(event) => setFileType(event.target.value)}
          >
            <option value="">Tất cả loại tệp</option>
            {["PDF", "DOCX", "PPTX", "XLSX"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Tất cả trạng thái lập chỉ mục</option>
            <option value="READY">AI sẵn sàng</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
          </select>
          <div className="view-toggle" aria-label="Kiểu hiển thị thư viện">
            <button
              type="button"
              className={view === "table" ? "active" : undefined}
              onClick={() => setView("table")}
              title="Dạng danh sách"
            >
              <List size={17} />
            </button>
            <button
              type="button"
              className={view === "grid" ? "active" : undefined}
              onClick={() => setView("grid")}
              title="Dạng lưới"
            >
              <Grid2X2 size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="library-result-count">
        <strong>{filteredDocuments.length} tài liệu</strong>
        <span>
          {
            documents.filter((document) => document.indexStatus === "READY")
              .length
          }{" "}
          AI sẵn sàng
        </span>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="soft-empty-state library-empty">
          <Search size={28} />
          <strong>Không có tài liệu phù hợp</strong>
          <p>Xóa bộ lọc hoặc tải nguồn tài liệu mới lên thư viện.</p>
        </div>
      ) : view === "table" ? (
        <div className="library-table-wrap">
          <table className="library-table">
            <thead>
              <tr>
                <th>Tiêu đề tài liệu</th>
                <th>Môn học</th>
                <th>Ngày tải lên</th>
                <th>Chỉ mục AI</th>
                <th>Thao tác</th>
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
                    {new Date(document.uploadedAt).toLocaleDateString("vi-VN")}
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
                        title="Xem trước"
                        onClick={() => setPreviewDocument(document)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Tải xuống"
                        onClick={() => downloadDemoDocument(document)}
                      >
                        <Download size={16} />
                      </button>
                      <Link
                        href={ROUTES.askDocument}
                        className="ask-document-action"
                      >
                        <Bot size={16} />
                        Hỏi AI
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
                  title="Xem trước"
                  onClick={() => setPreviewDocument(document)}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  title="Tải xuống"
                  onClick={() => downloadDemoDocument(document)}
                >
                  <Download size={16} />
                </button>
                <Link href={ROUTES.askDocument} className="ask-document-action">
                  <Bot size={16} />
                  Hỏi AI
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
            aria-label={`Xem trước ${previewDocument.title}`}
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
                Bản xem trước đã sẵn sàng. Mở mục Hỏi tài liệu này để khám phá
                nguồn với các trích dẫn được đối chiếu.
              </blockquote>
            </div>
            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={() => downloadDemoDocument(previewDocument)}
              >
                <Download size={16} />
                Tải xuống
              </button>
              <Link href={ROUTES.askDocument} className="primary-button">
                <Bot size={16} />
                Hỏi AI
              </Link>
            </footer>
          </article>
        </div>
      ) : null}
    </main>
  );
}
