"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { getSavedCommunityDocuments } from "../api/community.api";
import { useLanguage } from "../i18n/LanguageProvider";
import { localizeCommunityDocument } from "../i18n/document-display";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";
import type { CommunityDocument } from "../types/community";

export function SavedView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  const [savedDocuments, setSavedDocuments] = useState<CommunityDocument[]>([]);

  useEffect(() => {
    function refreshSavedDocuments() {
      setSavedDocuments(getSavedCommunityDocuments());
    }

    refreshSavedDocuments();
    window.addEventListener("focus", refreshSavedDocuments);
    window.addEventListener("storage", refreshSavedDocuments);

    return () => {
      window.removeEventListener("focus", refreshSavedDocuments);
      window.removeEventListener("storage", refreshSavedDocuments);
    };
  }, []);

  const displayedDocuments = useMemo(
    () =>
      savedDocuments.map((document) =>
        localizeCommunityDocument(document, locale),
      ),
    [locale, savedDocuments],
  );

  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">{text("ĐÃ LƯU", "SAVED")}</p>
        <h1>{text("Tài liệu đã lưu.", "Saved documents.")}</h1>
      </header>
      <section className="saved-source-list">
        {displayedDocuments.length > 0 ? (
          displayedDocuments.map((document) => (
            <article key={document.id}>
              <span>
                <FileText size={20} />
              </span>
              <div>
                <strong>{document.title}</strong>
                <p>
                  {document.subject} /{" "}
                  {text("Đã lưu từ cộng đồng", "Saved from Community")}
                </p>
              </div>
              <Link href={`${ROUTES.aiChat}?scope=document`}>
                <Sparkles size={15} />
                {text("Hỏi AI", "Ask AI")}
              </Link>
            </article>
          ))
        ) : (
          <article>
            <span>
              <Bookmark size={20} />
            </span>
            <div>
              <strong>
                {text("Chưa có tài liệu đã lưu", "No saved documents yet")}
              </strong>
              <p>
                {text(
                  "Lưu tài liệu từ trang Cộng đồng để xem lại ở đây.",
                  "Save documents from Community to see them here.",
                )}
              </p>
            </div>
            <Link href={ROUTES.community}>
              <Sparkles size={15} />
              {text("Xem cộng đồng", "Browse Community")}
            </Link>
          </article>
        )}
      </section>
    </main>
  );
}
