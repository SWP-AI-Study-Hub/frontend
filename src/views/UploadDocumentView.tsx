"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  CloudUpload,
  FileText,
  LoaderCircle,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import {
  ACCEPTED_FILE_EXTENSIONS,
  createDemoDocument,
  formatFileSize,
  validateDocumentFile,
} from "../api/documents.api";
import type { DocumentVisibility, LibraryDocument } from "../types/document";
import { ROUTES } from "../lib/routes";

export function UploadDocumentView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<DocumentVisibility>("PRIVATE");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState<LibraryDocument>();

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    const error = validateDocumentFile(nextFile);
    setFileError(error ?? "");
    if (error) return;
    setFile(nextFile);
    if (!title) {
      setTitle(nextFile.name);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    setTags((current) => [...current, tag]);
    setTagInput("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file || fileError || !title.trim() || !subject || !category) return;

    setIsUploading(true);
    setProgress(18);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setProgress(48);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setProgress(76);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const document = createDemoDocument({
      title: title.trim(),
      description: description.trim(),
      subject,
      category,
      tags,
      visibility,
      file,
    });
    setProgress(100);
    setCreatedDocument(document);
    setIsUploading(false);
  }

  return (
    <main id="main-content" className="upload-page">
      <header className="upload-heading">
        <p className="eyebrow">TẢI TÀI LIỆU LÊN</p>
        <h1>Thêm nguồn vào thư viện kiến thức.</h1>
        <p>
          DocuMind kiểm tra tệp, lưu metadata và chuẩn bị nội dung để AI trả lời
          có căn cứ.
        </p>
      </header>

      {createdDocument ? (
        <section className="upload-success">
          <span className="success-icon">
            <Check size={24} />
          </span>
          <div>
            <p className="eyebrow">TẢI LÊN HOÀN TẤT</p>
            <h2>{createdDocument.title}</h2>
            <p>
              Tệp đã được lưu. Hệ thống đang trích xuất văn bản và lập chỉ mục
              AI.
            </p>
            <div className="extraction-steps">
              <span className="done">
                <Check size={14} /> Đã kiểm tra tệp
              </span>
              <span className="done">
                <Check size={14} /> Đã lưu metadata
              </span>
              <span className="processing">
                <LoaderCircle className="spin" size={14} /> Đang trích xuất nội
                dung
              </span>
            </div>
            <div className="upload-success-actions">
              <Link href={ROUTES.library} className="primary-button">
                Mở thư viện của tôi
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                Tải tệp khác
              </button>
            </div>
          </div>
        </section>
      ) : (
        <form className="upload-workspace" onSubmit={submit}>
          <section className="upload-main">
            <div
              className={
                fileError
                  ? "upload-dropzone error"
                  : file
                    ? "upload-dropzone selected"
                    : "upload-dropzone"
              }
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                hidden
                accept={ACCEPTED_FILE_EXTENSIONS.map((item) => `.${item}`).join(
                  ",",
                )}
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <span className="upload-file-icon">
                    <FileText size={24} />
                  </span>
                  <div>
                    <strong>{file.name}</strong>
                    <p>{formatFileSize(file.size)} / Sẵn sàng tải lên</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setFile(undefined)}
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="upload-cloud">
                    <CloudUpload size={28} />
                  </span>
                  <strong>Thả tài liệu học tập vào đây</strong>
                  <p>PDF, DOCX, PPTX hoặc XLSX / Tối đa 20 MB</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => inputRef.current?.click()}
                  >
                    Chọn tệp
                  </button>
                </>
              )}
            </div>
            {fileError ? <p className="form-error">{fileError}</p> : null}

            <div className="upload-form-section">
              <div className="section-heading">
                <span>01</span>
                <div>
                  <strong>Thông tin tài liệu</strong>
                  <p>Metadata rõ ràng giúp việc truy xuất chính xác hơn.</p>
                </div>
              </div>
              <div className="upload-form-grid">
                <label className="full-field">
                  Tiêu đề tài liệu
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={200}
                    required
                  />
                </label>
                <label className="full-field">
                  Mô tả
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                  />
                </label>
                <label>
                  Môn học
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    required
                  >
                    <option value="">Chọn môn học</option>
                    <option>Khoa học máy tính</option>
                    <option>Trí tuệ nhân tạo</option>
                    <option>Nghiên cứu</option>
                    <option>Kinh doanh</option>
                  </select>
                </label>
                <label>
                  Danh mục
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    <option>Ghi chú bài giảng</option>
                    <option>Bài báo nghiên cứu</option>
                    <option>Phương pháp luận</option>
                    <option>Tài liệu tham khảo</option>
                  </select>
                </label>
                <label className="full-field">
                  Thẻ
                  <div className="tag-input">
                    <input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Nhập thẻ và nhấn Enter"
                    />
                    <button type="button" onClick={addTag}>
                      Thêm
                    </button>
                  </div>
                  {tags.length > 0 ? (
                    <span className="tag-list">
                      {tags.map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() =>
                            setTags((current) =>
                              current.filter((item) => item !== tag),
                            )
                          }
                        >
                          {tag}
                          <X size={12} />
                        </button>
                      ))}
                    </span>
                  ) : null}
                </label>
              </div>
            </div>
          </section>

          <aside className="upload-side">
            <div className="upload-form-section">
              <div className="section-heading">
                <span>02</span>
                <div>
                  <strong>Quyền hiển thị</strong>
                  <p>Chọn người có thể tìm thấy nguồn này.</p>
                </div>
              </div>
              <div className="visibility-options">
                <button
                  type="button"
                  className={visibility === "PRIVATE" ? "active" : undefined}
                  onClick={() => setVisibility("PRIVATE")}
                >
                  <Lock size={18} />
                  <span>
                    <strong>Riêng tư</strong>
                    <small>Chỉ bạn có thể truy cập tệp này</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={visibility === "PUBLIC" ? "active" : undefined}
                  onClick={() => setVisibility("PUBLIC")}
                >
                  <Sparkles size={18} />
                  <span>
                    <strong>Cộng đồng</strong>
                    <small>Chia sẻ dưới dạng nguồn học tập công khai</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="extraction-preview">
              <p className="eyebrow">CÁC BƯỚC TIẾP THEO</p>
              <ol>
                <li>
                  <span>1</span> Kiểm tra tệp và metadata
                </li>
                <li>
                  <span>2</span> Lưu tài liệu an toàn
                </li>
                <li>
                  <span>3</span> Trích xuất nội dung có thể đọc
                </li>
                <li>
                  <span>4</span> Chuẩn bị dữ liệu truy xuất cho AI
                </li>
              </ol>
            </div>

            {isUploading ? (
              <div className="upload-progress">
                <div>
                  <strong>Đang chuẩn bị tài liệu...</strong>
                  <span>{progress}%</span>
                </div>
                <span className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </span>
                <p>
                  {progress < 50
                    ? "Đang tải lên an toàn..."
                    : progress < 90
                      ? "Đang đọc nội dung nguồn..."
                      : "Đang hoàn tất metadata..."}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="upload-submit"
              disabled={
                !file ||
                Boolean(fileError) ||
                !title.trim() ||
                !subject ||
                !category ||
                isUploading
              }
            >
              {isUploading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <CloudUpload size={18} />
              )}
              {isUploading ? "Đang tải lên..." : "Tải lên và chuẩn bị cho AI"}
            </button>
          </aside>
        </form>
      )}
    </main>
  );
}
