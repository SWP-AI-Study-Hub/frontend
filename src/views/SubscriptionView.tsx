"use client";

import { Check, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";

export function SubscriptionView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);

  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">{text("GÓI DỊCH VỤ", "SUBSCRIPTION")}</p>
        <h1>{text("Gói dịch vụ phù hợp với quá trình nghiên cứu.", "A plan that grows with your research.")}</h1>
        <p>{text("Xem mức sử dụng hiện tại và so sánh dung lượng học tập của từng gói.", "Review your current usage and compare the study capacity available to you.")}</p>
      </header>
      <section className="subscription-layout">
        <article className="current-plan-panel">
          <div>
            <span><Sparkles size={18} />{text("Gói hiện tại", "Current plan")}</span>
            <strong>Student</strong>
          </div>
          <p>{text("Đã dùng 68 trong 100 câu hỏi AI", "68 of 100 AI questions used")}</p>
          <div className="usage-meter"><span style={{ width: "68%" }} /></div>
          <small>{text("Hạn mức được đặt lại vào ngày 1 tháng 7, 2026", "Usage resets on July 1, 2026")}</small>
        </article>
        <div className="plan-grid">
          <article>
            <p className="eyebrow">FREE</p>
            <h2>$0</h2>
            <span>{text("Dùng thử tìm kiếm tài liệu có dẫn nguồn.", "For trying grounded document search.")}</span>
            <ul>
              <li><Check size={15} />10 {text("câu hỏi AI", "AI questions")}</li>
              <li><Check size={15} />5 {text("tài liệu", "documents")}</li>
            </ul>
            <button type="button" disabled>{text("Gói cơ bản hiện tại", "Current baseline")}</button>
          </article>
          <article className="featured">
            <p className="eyebrow">STUDENT</p>
            <h2>$6 <small>/ {text("tháng", "month")}</small></h2>
            <span>{text("Dành cho học tập và nghiên cứu thường xuyên.", "For active coursework and research.")}</span>
            <ul>
              <li><Check size={15} />100 {text("câu hỏi AI", "AI questions")}</li>
              <li><Check size={15} />100 {text("tài liệu", "documents")}</li>
            </ul>
            <button type="button">{text("Quản lý gói Student", "Manage Student plan")}</button>
          </article>
          <article>
            <p className="eyebrow">PRO</p>
            <h2>$14 <small>/ {text("tháng", "month")}</small></h2>
            <span>{text("Dành cho quy trình học thuật chuyên sâu.", "For intensive academic workflows.")}</span>
            <ul>
              <li><Check size={15} />500 {text("câu hỏi AI", "AI questions")}</li>
              <li><Check size={15} />{text("Không giới hạn tài liệu", "Unlimited documents")}</li>
            </ul>
            <button type="button">{text("Nâng cấp lên Pro", "Upgrade to Pro")}</button>
          </article>
        </div>
      </section>
    </main>
  );
}
