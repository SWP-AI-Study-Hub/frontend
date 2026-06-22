"use client";

import {
  BarChart3,
  Check,
  Cloud,
  Download,
  FileText,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";

export function SubscriptionView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
  const featureLabels = {
    storage: text("Dung lượng", "Storage"),
    uploadLimit: text("Giới hạn tải lên", "Upload limit"),
    aiChat: "AI Chat",
    offlineAccess: text("Truy cập ngoại tuyến", "Offline access"),
    paymentReporting: text("Báo cáo thanh toán", "Payment reporting"),
  };

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
          <p>{text("Đã dùng 68 trong 300 lượt chat AI", "68 of 300 AI chats used")}</p>
          <div className="usage-meter"><span style={{ width: "22.67%" }} /></div>
          <small>{text("Hạn mức được đặt lại vào ngày 1 tháng 7, 2026", "Usage resets on July 1, 2026")}</small>
        </article>
        <div className="plan-grid">
          <article>
            <p className="eyebrow">FREE</p>
            <h2>$0</h2>
            <span>{text("Phù hợp nhất cho người dùng không thường xuyên.", "Best for casual users.")}</span>
            <ul className="plan-features">
              <li><span><Cloud size={17} />{featureLabels.storage}</span><strong>100 MB</strong></li>
              <li><span><FileText size={17} />{featureLabels.uploadLimit}</span><strong>10 {text("tài liệu", "documents")}</strong></li>
              <li><span><MessageSquare size={17} />{featureLabels.aiChat}</span><strong>20 {text("lượt chat / tháng", "chats / month")}</strong></li>
              <li><span><Download size={17} />{featureLabels.offlineAccess}</span><strong className="feature-negative"><X size={16} />{text("Không", "No")}</strong></li>
              <li><span><BarChart3 size={17} />{featureLabels.paymentReporting}</span><strong>N/A</strong></li>
            </ul>
            <button type="button" disabled>{text("Gói cơ bản hiện tại", "Current baseline")}</button>
          </article>
          <article className="featured">
            <span className="recommended-badge">{text("Đề xuất", "Recommended")}</span>
            <p className="eyebrow">STUDENT</p>
            <h2>$6 <small>/ {text("tháng", "month")}</small></h2>
            <span>{text("Phù hợp nhất cho học sinh, sinh viên học tập tích cực.", "Best for active students.")}</span>
            <ul className="plan-features">
              <li><span><Cloud size={17} />{featureLabels.storage}</span><strong>1 GB</strong></li>
              <li><span><FileText size={17} />{featureLabels.uploadLimit}</span><strong>100 {text("tài liệu", "documents")}</strong></li>
              <li><span><MessageSquare size={17} />{featureLabels.aiChat}</span><strong>300 {text("lượt chat / tháng", "chats / month")}</strong></li>
              <li><span><Download size={17} />{featureLabels.offlineAccess}</span><strong className="feature-limited">{text("Giới hạn", "Limited")}</strong></li>
              <li><span><BarChart3 size={17} />{featureLabels.paymentReporting}</span><strong className="feature-highlight">{text("Cơ bản", "Basic")}</strong></li>
            </ul>
            <button type="button">{text("Quản lý gói Student", "Manage Student plan")}</button>
          </article>
          <article>
            <p className="eyebrow">PRO</p>
            <h2>$14 <small>/ {text("tháng", "month")}</small></h2>
            <span>{text("Phù hợp nhất cho người dùng chuyên sâu.", "Best for power users.")}</span>
            <ul className="plan-features">
              <li><span><Cloud size={17} />{featureLabels.storage}</span><strong>5 GB ({text("có thể mở rộng", "expandable")})</strong></li>
              <li><span><FileText size={17} />{featureLabels.uploadLimit}</span><strong>500 {text("tài liệu", "documents")}</strong></li>
              <li><span><MessageSquare size={17} />{featureLabels.aiChat}</span><strong>{text("Không giới hạn", "Unlimited")}</strong></li>
              <li><span><Download size={17} />{featureLabels.offlineAccess}</span><strong className="feature-positive"><Check size={16} />{text("Có", "Yes")}</strong></li>
              <li><span><BarChart3 size={17} />{featureLabels.paymentReporting}</span><strong>{text("Quản lý qua bảng thanh toán", "Managed via payments table")}</strong></li>
            </ul>
            <button type="button">{text("Nâng cấp lên Pro", "Upgrade to Pro")}</button>
          </article>
        </div>
      </section>
    </main>
  );
}
