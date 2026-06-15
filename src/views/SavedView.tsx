import { Bookmark, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../lib/routes";

export function SavedView() {
  return (
    <main id="main-content" className="simple-workspace-page">
      <header>
        <p className="eyebrow">ĐÃ LƯU</p>
        <h1>Các nguồn học tập bạn đã đánh dấu.</h1>
        <p>
          Quay lại những tài liệu cộng đồng hữu ích và tiếp tục đặt câu hỏi có
          căn cứ.
        </p>
      </header>
      <section className="saved-source-list">
        <article>
          <span>
            <FileText size={20} />
          </span>
          <div>
            <strong>Practical Retrieval-Augmented Generation</strong>
            <p>Trí tuệ nhân tạo / Đã lưu từ cộng đồng</p>
          </div>
          <Link href={ROUTES.askDocument}>
            <Sparkles size={15} />
            Hỏi AI
          </Link>
        </article>
        <article>
          <span>
            <Bookmark size={20} />
          </span>
          <div>
            <strong>Database Indexing Explained</strong>
            <p>Khoa học máy tính / Thư viện riêng tư</p>
          </div>
          <Link href={ROUTES.askDocument}>
            <Sparkles size={15} />
            Hỏi AI
          </Link>
        </article>
      </section>
    </main>
  );
}
