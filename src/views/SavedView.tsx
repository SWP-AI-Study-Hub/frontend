"use client";

import { Bookmark, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";

export function SavedView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">{text("ĐÃ LƯU", "SAVED")}</p>
        <h1>{text("Tài liệu đã lưu.", "Saved documents.")}</h1>
      </header>
      <section className="saved-source-list">
        <article>
          <span>
            <FileText size={20} />
          </span>
          <div>
            <strong>Practical Retrieval-Augmented Generation</strong>
            <p>{text("Trí tuệ nhân tạo / Đã lưu từ cộng đồng", "Artificial Intelligence / Saved from Community")}</p>
          </div>
          <Link href={`${ROUTES.aiChat}?scope=document`}>
            <Sparkles size={15} />
            {text("Hỏi AI", "Ask AI")}
          </Link>
        </article>
        <article>
          <span>
            <Bookmark size={20} />
          </span>
          <div>
            <strong>Database Indexing Explained</strong>
            <p>{text("Khoa học máy tính / Thư viện riêng tư", "Computer Science / Private library")}</p>
          </div>
          <Link href={`${ROUTES.aiChat}?scope=document`}>
            <Sparkles size={15} />
            {text("Hỏi AI", "Ask AI")}
          </Link>
        </article>
      </section>
    </main>
  );
}
