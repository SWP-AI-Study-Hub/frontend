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
          <p className="eyebrow">MY LIBRARY</p>
          <h1>Your documents, ready to think with.</h1>
          <p>
            Search metadata and content, inspect indexing status, or continue
            with AI.
          </p>
        </div>
        <Link href={ROUTES.upload} className="primary-button">
          <Upload size={17} />
          Upload document
        </Link>
      </header>

      <section className="library-controls">
        <label className="library-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by content, title, or tag..."
          />
        </label>
        <div className="library-filters">
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={fileType}
            onChange={(event) => setFileType(event.target.value)}
          >
            <option value="">All file types</option>
            {["PDF", "DOCX", "PPTX", "XLSX"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All indexing states</option>
            <option value="READY">AI ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
          <div className="view-toggle" aria-label="Library view">
            <button
              type="button"
              className={view === "table" ? "active" : undefined}
              onClick={() => setView("table")}
              title="List view"
            >
              <List size={17} />
            </button>
            <button
              type="button"
              className={view === "grid" ? "active" : undefined}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              <Grid2X2 size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="library-result-count">
        <strong>{filteredDocuments.length} documents</strong>
        <span>
          {
            documents.filter((document) => document.indexStatus === "READY")
              .length
          }{" "}
          AI ready
        </span>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="soft-empty-state library-empty">
          <Search size={28} />
          <strong>No matching documents</strong>
          <p>Clear a filter or upload a new source to your library.</p>
        </div>
      ) : view === "table" ? (
        <div className="library-table-wrap">
          <table className="library-table">
            <thead>
              <tr>
                <th>Document title</th>
                <th>Subject</th>
                <th>Upload date</th>
                <th>AI index</th>
                <th>Actions</th>
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
                          {document.visibility.toLowerCase()}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>{document.subject}</td>
                  <td>{new Date(document.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`index-status index-status--${document.indexStatus.toLowerCase()}`}
                    >
                      {document.indexStatus === "READY"
                        ? "AI ready"
                        : document.indexStatus.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <div className="document-actions">
                      <button
                        type="button"
                        title="Preview"
                        onClick={() => setPreviewDocument(document)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        onClick={() => downloadDemoDocument(document)}
                      >
                        <Download size={16} />
                      </button>
                      <Link
                        href={ROUTES.askDocument}
                        className="ask-document-action"
                      >
                        <Bot size={16} />
                        Ask AI
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
                  {document.indexStatus === "READY"
                    ? "AI ready"
                    : document.indexStatus.toLowerCase()}
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
                  title="Preview"
                  onClick={() => setPreviewDocument(document)}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  title="Download"
                  onClick={() => downloadDemoDocument(document)}
                >
                  <Download size={16} />
                </button>
                <Link href={ROUTES.askDocument} className="ask-document-action">
                  <Bot size={16} />
                  Ask AI
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
            aria-label={`Preview ${previewDocument.title}`}
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
                AI preview is ready. Open Ask This Document to explore this
                source with grounded citations.
              </blockquote>
            </div>
            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={() => downloadDemoDocument(previewDocument)}
              >
                <Download size={16} />
                Download
              </button>
              <Link href={ROUTES.askDocument} className="primary-button">
                <Bot size={16} />
                Ask AI
              </Link>
            </footer>
          </article>
        </div>
      ) : null}
    </main>
  );
}
