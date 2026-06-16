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
import { useLanguage } from "../i18n/LanguageProvider";
import { localize } from "../i18n/localize";
import { ROUTES } from "../lib/routes";

export function UploadDocumentView() {
  const { locale } = useLanguage();
  const text = (vi: string, en: string) => localize(locale, vi, en);
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
    const error = validateDocumentFile(nextFile, locale);
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
        <p className="eyebrow">{text("TẢI TÀI LIỆU LÊN", "UPLOAD DOCUMENT")}</p>
        <h1>{text("Thêm nguồn vào thư viện kiến thức.", "Add a source to your knowledge library.")}</h1>
        <p>
          {text(
            "DocuMind kiểm tra tệp, lưu metadata và chuẩn bị nội dung để AI trả lời có căn cứ.",
            "DocuMind validates the file, stores its metadata, then prepares the content for grounded AI answers.",
          )}
        </p>
      </header>

      {createdDocument ? (
        <section className="upload-success">
          <span className="success-icon">
            <Check size={24} />
          </span>
          <div>
            <p className="eyebrow">{text("TẢI LÊN HOÀN TẤT", "UPLOAD COMPLETE")}</p>
            <h2>{createdDocument.title}</h2>
            <p>
              {text(
                "Tệp đã được lưu. Hệ thống đang trích xuất văn bản và lập chỉ mục AI.",
                "The file is saved. Text extraction and AI indexing are now processing.",
              )}
            </p>
            <div className="extraction-steps">
              <span className="done">
                <Check size={14} /> {text("Đã kiểm tra tệp", "File validated")}
              </span>
              <span className="done">
                <Check size={14} /> {text("Đã lưu metadata", "Metadata saved")}
              </span>
              <span className="processing">
                <LoaderCircle className="spin" size={14} /> {text("Đang trích xuất nội dung", "Extracting content")}
              </span>
            </div>
            <div className="upload-success-actions">
              <Link href={ROUTES.library} className="primary-button">
                {text("Mở thư viện của tôi", "Open my library")}
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                {text("Tải tệp khác", "Upload another")}
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
                    <p>{formatFileSize(file.size)} / {text("Sẵn sàng tải lên", "Ready to upload")}</p>
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
                  <strong>{text("Thả tài liệu học tập vào đây", "Drop your study document here")}</strong>
                  <p>{text("PDF, DOCX, PPTX hoặc XLSX / Tối đa 20 MB", "PDF, DOCX, PPTX, or XLSX / Maximum 20 MB")}</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => inputRef.current?.click()}
                  >
                    {text("Chọn tệp", "Choose file")}
                  </button>
                </>
              )}
            </div>
            {fileError ? <p className="form-error">{fileError}</p> : null}

            <div className="upload-form-section">
              <div className="section-heading">
                <span>01</span>
                <div>
                  <strong>{text("Thông tin tài liệu", "Document details")}</strong>
                  <p>{text("Metadata rõ ràng giúp việc truy xuất chính xác hơn.", "Clear metadata makes retrieval more reliable.")}</p>
                </div>
              </div>
              <div className="upload-form-grid">
                <label className="full-field">
                  {text("Tiêu đề tài liệu", "Document title")}
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={200}
                    required
                  />
                </label>
                <label className="full-field">
                  {text("Mô tả", "Description")}
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                  />
                </label>
                <label>
                  {text("Môn học", "Subject")}
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    required
                  >
                    <option value="">{text("Chọn môn học", "Select subject")}</option>
                    <option value="Computer Science">{text("Khoa học máy tính", "Computer Science")}</option>
                    <option value="Artificial Intelligence">{text("Trí tuệ nhân tạo", "Artificial Intelligence")}</option>
                    <option value="Research">{text("Nghiên cứu", "Research")}</option>
                    <option value="Business">{text("Kinh doanh", "Business")}</option>
                  </select>
                </label>
                <label>
                  {text("Danh mục", "Category")}
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    <option value="">{text("Chọn danh mục", "Select category")}</option>
                    <option value="Lecture Notes">{text("Ghi chú bài giảng", "Lecture Notes")}</option>
                    <option value="Research Paper">{text("Bài báo nghiên cứu", "Research Paper")}</option>
                    <option value="Methodology">{text("Phương pháp luận", "Methodology")}</option>
                    <option value="Reference">{text("Tài liệu tham khảo", "Reference")}</option>
                  </select>
                </label>
                <label className="full-field">
                  {text("Thẻ", "Tags")}
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
                      placeholder={text("Nhập thẻ và nhấn Enter", "Type a tag and press Enter")}
                    />
                    <button type="button" onClick={addTag}>
                      {text("Thêm", "Add")}
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
                  <strong>{text("Quyền hiển thị", "Visibility")}</strong>
                  <p>{text("Chọn người có thể tìm thấy nguồn này.", "Choose who can discover this source.")}</p>
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
                    <strong>{text("Riêng tư", "Private")}</strong>
                    <small>{text("Chỉ bạn có thể truy cập tệp này", "Only you can access this file")}</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={visibility === "PUBLIC" ? "active" : undefined}
                  onClick={() => setVisibility("PUBLIC")}
                >
                  <Sparkles size={18} />
                  <span>
                    <strong>{text("Cộng đồng", "Community")}</strong>
                    <small>{text("Chia sẻ dưới dạng nguồn học tập công khai", "Share it as a public study source")}</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="extraction-preview">
              <p className="eyebrow">{text("CÁC BƯỚC TIẾP THEO", "WHAT HAPPENS NEXT")}</p>
              <ol>
                <li>
                  <span>1</span> {text("Kiểm tra tệp và metadata", "Validate file and metadata")}
                </li>
                <li>
                  <span>2</span> {text("Lưu tài liệu an toàn", "Store document securely")}
                </li>
                <li>
                  <span>3</span> {text("Trích xuất nội dung có thể đọc", "Extract readable content")}
                </li>
                <li>
                  <span>4</span> {text("Chuẩn bị dữ liệu truy xuất cho AI", "Prepare grounded AI retrieval")}
                </li>
              </ol>
            </div>

            {isUploading ? (
              <div className="upload-progress">
                <div>
                  <strong>{text("Đang chuẩn bị tài liệu...", "Preparing your document...")}</strong>
                  <span>{progress}%</span>
                </div>
                <span className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </span>
                <p>
                  {progress < 50
                    ? text("Đang tải lên an toàn...", "Uploading securely...")
                    : progress < 90
                      ? text("Đang đọc nội dung nguồn...", "Reading source content...")
                      : text("Đang hoàn tất metadata...", "Finalizing metadata...")}
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
              {isUploading
                ? text("Đang tải lên...", "Uploading...")
                : text("Tải lên và chuẩn bị cho AI", "Upload and prepare for AI")}
            </button>
          </aside>
        </form>
      )}
    </main>
  );
}
