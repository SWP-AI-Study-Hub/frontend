"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bookmark, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { fetchLibraryDocuments } from "../api/documents.api";
import { useLanguage } from "../i18n/LanguageProvider";
import { localizeLibraryDocument } from "../i18n/document-display";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";
import type { LibraryDocument } from "../types/document";

export function SavedView() {
  const { locale } = useLanguage();
  const text = useCallback((vi: string, en: string) => localize(locale, vi, en), [locale]);
  const [savedDocuments, setSavedDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function refreshSavedDocuments() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const result = await fetchLibraryDocuments({ savedOnly: true, limit: 100 });
        if (isMounted) setSavedDocuments(result.items);
      } catch {
        if (isMounted) {
          setErrorMessage(text("Không thể tải tài liệu đã lưu.", "Unable to load saved documents."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void refreshSavedDocuments();
    window.addEventListener("focus", refreshSavedDocuments);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", refreshSavedDocuments);
    };
  }, [locale, text]);

  const displayedDocuments = useMemo(
    () =>
      savedDocuments.map((document) =>
        localizeLibraryDocument(document, locale),
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
        {isLoading ? (
          <article>
            <span>
              <Sparkles size={20} />
            </span>
            <div>
              <strong>{text("Đang tải tài liệu đã lưu...", "Loading saved documents...")}</strong>
            </div>
          </article>
        ) : errorMessage ? (
          <article>
            <span>
              <Bookmark size={20} />
            </span>
            <div>
              <strong>{errorMessage}</strong>
            </div>
            <Link href={ROUTES.community}>
              <Sparkles size={15} />
              {text("Xem cộng đồng", "Browse Community")}
            </Link>
          </article>
        ) : displayedDocuments.length > 0 ? (
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
