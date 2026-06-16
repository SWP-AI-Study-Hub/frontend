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
import { useLanguage } from "../i18n/LanguageProvider";
import { localizeLibraryDocument } from "../i18n/document-display";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";

export function DashboardView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  const suggestions =
    locale === "vi"
      ? [
          "Tóm tắt ghi chú bài giảng mới nhất",
          "Tạo bài kiểm tra từ các tệp đã tải lên",
          "Tìm nguồn về xác thực JWT",
          "Giải thích chủ đề này thật đơn giản",
        ]
      : [
          "Summarize my latest lecture notes",
          "Create a quiz from uploaded files",
          "Find sources about JWT authentication",
          "Explain this topic simply",
        ];
  const [question, setQuestion] = useState("");
  const documents = getLibraryDocuments().map((document) =>
    localizeLibraryDocument(document, locale),
  );
  const readyDocuments = documents.filter(
    (document) => document.indexStatus === "READY",
  );

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    window.location.href = `${ROUTES.aiChat}?q=${encodeURIComponent(question.trim())}`;
  }

  return (
    <main id="main-content" className="workspace-dashboard">
      <section className="dashboard-welcome">
        <p className="eyebrow">{text("KHÔNG GIAN HỌC TẬP AI", "AI STUDY WORKSPACE")}</p>
        <h1>{text("Hôm nay bạn muốn tìm hiểu điều gì?", "What would you like to understand today?")}</h1>
        <p>
          {text(
            "Tìm kiếm nguồn tài liệu, tiếp tục chủ đề nghiên cứu hoặc đặt câu hỏi trên toàn bộ thư viện của bạn.",
            "Search your sources, continue a research thread, or ask across your entire library.",
          )}
        </p>

        <form className="dashboard-ai-search" onSubmit={submitQuestion}>
          <Sparkles size={21} />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={text("Hỏi bất kỳ điều gì từ tài liệu học tập...", "Ask anything from your study documents...")}
            aria-label={text("Hỏi thư viện của bạn", "Ask your library")}
          />
          <button type="submit" aria-label={text("Hỏi AI", "Ask AI")} disabled={!question.trim()}>
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
                <p className="eyebrow">{text("NGUỒN GẦN ĐÂY", "RECENT SOURCES")}</p>
                <h2>{text("Tiếp tục từ thư viện của bạn", "Continue from your library")}</h2>
              </div>
              <Link href={ROUTES.library}>
                {text("Xem tất cả", "View all")} <ArrowRight size={15} />
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
                      ? text("AI sẵn sàng", "AI ready")
                      : text("Đang xử lý", "Processing")}
                  </span>
                  <Link href={`${ROUTES.aiChat}?scope=document&document=${document.id}`}>
                    <Sparkles size={15} />
                    {text("Hỏi AI", "Ask AI")}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <header className="dashboard-section-heading">
              <div>
                <p className="eyebrow">{text("TRÒ CHUYỆN GẦN ĐÂY", "RECENT CHAT")}</p>
                <h2>{text("Tiếp tục chủ đề học tập", "Pick up a study thread")}</h2>
              </div>
            </header>
            <div className="recent-chat-grid">
              <Link href={ROUTES.aiChat}>
                <MessageSquareText size={19} />
                <div>
                  <strong>{text("So sánh các mô hình hệ thống phân tán", "Compare distributed system models")}</strong>
                  <span>{text("Trên 3 nguồn / 12 phút trước", "Across 3 sources / 12 minutes ago")}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href={`${ROUTES.aiChat}?scope=document`}>
                <BookOpen size={19} />
                <div>
                  <strong>{text("Tóm tắt phương pháp nghiên cứu", "Research methodology summary")}</strong>
                  <span>{text("Research Methods Handbook / Hôm qua", "Research Methods Handbook / Yesterday")}</span>
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
                {text("Mức sử dụng AI", "AI usage")}
              </span>
              <strong>68%</strong>
            </div>
            <div className="usage-meter">
              <span style={{ width: "68%" }} />
            </div>
            <p>{text("Đã dùng 68 trong 100 câu hỏi có dẫn nguồn trong tháng này.", "68 of 100 grounded questions used this month.")}</p>
            <Link href={ROUTES.subscription}>
              {text("Quản lý gói", "Manage plan")} <ArrowRight size={14} />
            </Link>
          </section>
          <section className="dashboard-metrics">
            <article>
              <FileCheck2 size={19} />
              <span>{text("Tệp đã lập chỉ mục", "Files indexed")}</span>
              <strong>{readyDocuments.length}</strong>
            </article>
            <article>
              <HardDrive size={19} />
              <span>{text("Dung lượng đã dùng", "Storage used")}</span>
              <strong>17.9 MB</strong>
            </article>
            <article>
              <Clock3 size={19} />
              <span>{text("Đang xử lý", "Processing")}</span>
              <strong>{documents.length - readyDocuments.length}</strong>
            </article>
          </section>
          <Link href={ROUTES.upload} className="dashboard-upload-cta">
            <span>
              <FileText size={21} />
            </span>
            <div>
              <strong>{text("Thêm nguồn tài liệu mới", "Add a new source")}</strong>
              <small>PDF, DOCX, PPTX hoặc XLSX</small>
            </div>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </section>
    </main>
  );
}
