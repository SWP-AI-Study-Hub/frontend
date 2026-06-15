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
  "Tóm tắt ghi chú bài giảng mới nhất",
  "Tạo bài kiểm tra từ các tệp đã tải lên",
  "Tìm nguồn về xác thực JWT",
  "Giải thích chủ đề này thật đơn giản",
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
        <p className="eyebrow">KHÔNG GIAN HỌC TẬP AI</p>
        <h1>Hôm nay bạn muốn tìm hiểu điều gì?</h1>
        <p>
          Tìm kiếm nguồn tài liệu, tiếp tục chủ đề nghiên cứu hoặc đặt câu hỏi
          trên toàn bộ thư viện của bạn.
        </p>

        <form className="dashboard-ai-search" onSubmit={submitQuestion}>
          <Sparkles size={21} />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Hỏi bất kỳ điều gì từ tài liệu học tập..."
            aria-label="Hỏi thư viện của bạn"
          />
          <button type="submit" aria-label="Hỏi AI" disabled={!question.trim()}>
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
                <p className="eyebrow">NGUỒN GẦN ĐÂY</p>
                <h2>Tiếp tục từ thư viện của bạn</h2>
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
                      ? "AI sẵn sàng"
                      : "Đang xử lý"}
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
                <p className="eyebrow">TRÒ CHUYỆN GẦN ĐÂY</p>
                <h2>Tiếp tục chủ đề học tập</h2>
              </div>
            </header>
            <div className="recent-chat-grid">
              <Link href={ROUTES.askLibrary}>
                <MessageSquareText size={19} />
                <div>
                  <strong>So sánh các mô hình hệ thống phân tán</strong>
                  <span>Trên 3 nguồn / 12 phút trước</span>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href={ROUTES.askDocument}>
                <BookOpen size={19} />
                <div>
                  <strong>Tóm tắt phương pháp nghiên cứu</strong>
                  <span>Cẩm nang phương pháp nghiên cứu / Hôm qua</span>
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
                Mức sử dụng AI
              </span>
              <strong>68%</strong>
            </div>
            <div className="usage-meter">
              <span style={{ width: "68%" }} />
            </div>
            <p>Đã dùng 68 trong 100 câu hỏi có dẫn nguồn trong tháng này.</p>
            <Link href={ROUTES.subscription}>
              Quản lý gói <ArrowRight size={14} />
            </Link>
          </section>
          <section className="dashboard-metrics">
            <article>
              <FileCheck2 size={19} />
              <span>Tệp đã lập chỉ mục</span>
              <strong>{readyDocuments.length}</strong>
            </article>
            <article>
              <HardDrive size={19} />
              <span>Dung lượng đã dùng</span>
              <strong>17.9 MB</strong>
            </article>
            <article>
              <Clock3 size={19} />
              <span>Đang xử lý</span>
              <strong>{documents.length - readyDocuments.length}</strong>
            </article>
          </section>
          <Link href={ROUTES.upload} className="dashboard-upload-cta">
            <span>
              <FileText size={21} />
            </span>
            <div>
              <strong>Thêm nguồn tài liệu mới</strong>
              <small>PDF, DOCX, PPTX hoặc XLSX</small>
            </div>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </section>
    </main>
  );
}
