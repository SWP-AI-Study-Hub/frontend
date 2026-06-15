"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileCheck2,
  FileText,
  HardDrive,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getLibraryDocuments } from "../api/documents.api";
import { ROUTES } from "../lib/routes";

const suggestions = [
  "Summarize my latest lecture notes",
  "Create a quiz from uploaded files",
  "Find sources about JWT authentication",
  "Explain this topic simply",
];

export function DashboardView() {
  const [question, setQuestion] = useState("");
  const documents = getLibraryDocuments();
  const readyDocuments = documents.filter(
    (document) => document.indexStatus === "READY",
  );

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    window.location.href = `${ROUTES.askLibrary}?q=${encodeURIComponent(question.trim())}`;
  }

  return (
    <main id="main-content" className="workspace-dashboard">
      <section className="dashboard-welcome">
        <p className="eyebrow">AI STUDY WORKSPACE</p>
        <h1>What would you like to understand today?</h1>
        <p>
          Search your sources, continue a research thread, or ask across your
          entire library.
        </p>

        <form className="dashboard-ai-search" onSubmit={submitQuestion}>
          <Sparkles size={21} />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything from your study documents..."
            aria-label="Ask your library"
          />
          <button type="submit" aria-label="Ask AI" disabled={!question.trim()}>
            <ArrowRight size={19} />
          </button>
        </form>

        <div className="dashboard-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => setQuestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-primary-column">
          <section className="dashboard-section">
            <header className="dashboard-section-heading">
              <div>
                <p className="eyebrow">RECENT SOURCES</p>
                <h2>Continue from your library</h2>
              </div>
              <Link href={ROUTES.library}>
                Xem tất cả <ArrowRight size={15} />
              </Link>
            </header>
            <div className="dashboard-document-list">
              {documents.slice(0, 3).map((document) => (
                <article key={document.id}>
                  <span className="dashboard-file-icon">
                    <FileText size={19} />
                  </span>
                  <div>
                    <strong>{document.title}</strong>
                    <span>
                      {document.subject} / {document.fileType}
                    </span>
                  </div>
                  <span
                    className={`index-status index-status--${document.indexStatus.toLowerCase()}`}
                  >
                    {document.indexStatus === "READY"
                      ? "AI ready"
                      : "Processing"}
                  </span>
                  <Link href={ROUTES.askDocument}>
                    <Sparkles size={15} />
                    Hỏi AI
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <header className="dashboard-section-heading">
              <div>
                <p className="eyebrow">RECENT CHAT</p>
                <h2>Pick up a study thread</h2>
              </div>
            </header>
            <div className="recent-chat-grid">
              <Link href={ROUTES.askLibrary}>
                <MessageSquareText size={19} />
                <div>
                  <strong>Compare distributed system models</strong>
                  <span>Across 3 sources / 12 minutes ago</span>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href={ROUTES.askDocument}>
                <BookOpen size={19} />
                <div>
                  <strong>Research methodology summary</strong>
                  <span>Research Methods Handbook / Yesterday</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>

        <aside className="dashboard-insights">
          <section className="usage-panel">
            <div className="usage-panel-heading">
              <span>
                <Sparkles size={17} />
                AI usage
              </span>
              <strong>68%</strong>
            </div>
            <div className="usage-meter">
              <span style={{ width: "68%" }} />
            </div>
            <p>68 of 100 grounded questions used this month.</p>
            <Link href={ROUTES.subscription}>
              Quản lý gói <ArrowRight size={14} />
            </Link>
          </section>
          <section className="dashboard-metrics">
            <article>
              <FileCheck2 size={19} />
              <span>Files indexed</span>
              <strong>{readyDocuments.length}</strong>
            </article>
            <article>
              <HardDrive size={19} />
              <span>Storage used</span>
              <strong>17.9 MB</strong>
            </article>
            <article>
              <Clock3 size={19} />
              <span>Processing</span>
              <strong>{documents.length - readyDocuments.length}</strong>
            </article>
          </section>
          <Link href={ROUTES.upload} className="dashboard-upload-cta">
            <span>
              <FileText size={21} />
            </span>
            <div>
              <strong>Add a new source</strong>
              <small>PDF, DOCX, PPTX, or XLSX</small>
            </div>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </section>
    </main>
  );
}
