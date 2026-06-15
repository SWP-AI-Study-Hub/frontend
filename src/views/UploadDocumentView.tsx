'use client'

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  CloudUpload,
  FileText,
  LoaderCircle,
  Lock,
  Sparkles,
  X,
} from 'lucide-react'
import {
  ACCEPTED_FILE_EXTENSIONS,
  createDemoDocument,
  formatFileSize,
  validateDocumentFile,
} from '../api/documents.api'
import type { DocumentVisibility, LibraryDocument } from '../types/document'

export function UploadDocumentView() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const [fileError, setFileError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<DocumentVisibility>('PRIVATE')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [createdDocument, setCreatedDocument] = useState<LibraryDocument>()

  function selectFile(nextFile?: File) {
    if (!nextFile) return
    const error = validateDocumentFile(nextFile)
    setFileError(error ?? '')
    if (error) return
    setFile(nextFile)
    if (!title) {
      setTitle(nextFile.name.replace(/\.[^.]+$/, '').replaceAll('-', ' '))
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0])
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    selectFile(event.dataTransfer.files[0])
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (!tag || tags.includes(tag) || tags.length >= 10) return
    setTags((current) => [...current, tag])
    setTagInput('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file || fileError || !title.trim() || !subject || !category) return

    setIsUploading(true)
    setProgress(18)
    await new Promise((resolve) => setTimeout(resolve, 350))
    setProgress(48)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setProgress(76)
    await new Promise((resolve) => setTimeout(resolve, 450))
    const document = createDemoDocument({
      title: title.trim(),
      description: description.trim(),
      subject,
      category,
      tags,
      visibility,
      file,
    })
    setProgress(100)
    setCreatedDocument(document)
    setIsUploading(false)
  }

  return (
    <main id="main-content" className="upload-page">
      <header className="upload-heading">
        <p className="eyebrow">UPLOAD DOCUMENT</p>
        <h1>Add a source to your knowledge library.</h1>
        <p>DocuMind validates the file, stores its metadata, then prepares the content for grounded AI answers.</p>
      </header>

      {createdDocument ? (
        <section className="upload-success">
          <span className="success-icon">
            <Check size={24} />
          </span>
          <div>
            <p className="eyebrow">UPLOAD COMPLETE</p>
            <h2>{createdDocument.title}</h2>
            <p>The file is saved. Text extraction and AI indexing are now processing.</p>
            <div className="extraction-steps">
              <span className="done"><Check size={14} /> File validated</span>
              <span className="done"><Check size={14} /> Metadata saved</span>
              <span className="processing"><LoaderCircle className="spin" size={14} /> Extracting content</span>
            </div>
            <div className="upload-success-actions">
              <Link href="/library" className="primary-button">Open My Library</Link>
              <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
                Upload another
              </button>
            </div>
          </div>
        </section>
      ) : (
        <form className="upload-workspace" onSubmit={submit}>
          <section className="upload-main">
            <div
              className={fileError ? 'upload-dropzone error' : file ? 'upload-dropzone selected' : 'upload-dropzone'}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                hidden
                accept={ACCEPTED_FILE_EXTENSIONS.map((item) => `.${item}`).join(',')}
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <span className="upload-file-icon"><FileText size={24} /></span>
                  <div>
                    <strong>{file.name}</strong>
                    <p>{formatFileSize(file.size)} / Ready to upload</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setFile(undefined)}>
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="upload-cloud"><CloudUpload size={28} /></span>
                  <strong>Drop your study document here</strong>
                  <p>PDF, DOCX, PPTX, or XLSX / Maximum 20 MB</p>
                  <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>
                    Choose file
                  </button>
                </>
              )}
            </div>
            {fileError ? <p className="form-error">{fileError}</p> : null}

            <div className="upload-form-section">
              <div className="section-heading">
                <span>01</span>
                <div>
                  <strong>Document details</strong>
                  <p>Clear metadata makes retrieval more reliable.</p>
                </div>
              </div>
              <div className="upload-form-grid">
                <label className="full-field">
                  Document title
                  <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
                </label>
                <label className="full-field">
                  Description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
                </label>
                <label>
                  Subject
                  <select value={subject} onChange={(event) => setSubject(event.target.value)} required>
                    <option value="">Select subject</option>
                    <option>Computer Science</option>
                    <option>Artificial Intelligence</option>
                    <option>Research</option>
                    <option>Business</option>
                  </select>
                </label>
                <label>
                  Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                    <option value="">Select category</option>
                    <option>Lecture Notes</option>
                    <option>Research Paper</option>
                    <option>Methodology</option>
                    <option>Reference</option>
                  </select>
                </label>
                <label className="full-field">
                  Tags
                  <div className="tag-input">
                    <input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Type a tag and press Enter"
                    />
                    <button type="button" onClick={addTag}>Add</button>
                  </div>
                  {tags.length > 0 ? (
                    <span className="tag-list">
                      {tags.map((tag) => (
                        <button type="button" key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))}>
                          {tag}<X size={12} />
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
                  <strong>Visibility</strong>
                  <p>Choose who can discover this source.</p>
                </div>
              </div>
              <div className="visibility-options">
                <button type="button" className={visibility === 'PRIVATE' ? 'active' : undefined} onClick={() => setVisibility('PRIVATE')}>
                  <Lock size={18} />
                  <span><strong>Private</strong><small>Only you can access this file</small></span>
                </button>
                <button type="button" className={visibility === 'PUBLIC' ? 'active' : undefined} onClick={() => setVisibility('PUBLIC')}>
                  <Sparkles size={18} />
                  <span><strong>Community</strong><small>Share it as a public study source</small></span>
                </button>
              </div>
            </div>

            <div className="extraction-preview">
              <p className="eyebrow">WHAT HAPPENS NEXT</p>
              <ol>
                <li><span>1</span> Validate file and metadata</li>
                <li><span>2</span> Store document securely</li>
                <li><span>3</span> Extract readable content</li>
                <li><span>4</span> Prepare grounded AI retrieval</li>
              </ol>
            </div>

            {isUploading ? (
              <div className="upload-progress">
                <div><strong>Preparing your document...</strong><span>{progress}%</span></div>
                <span className="progress-track"><span style={{ width: `${progress}%` }} /></span>
                <p>{progress < 50 ? 'Uploading securely...' : progress < 90 ? 'Reading source content...' : 'Finalizing metadata...'}</p>
              </div>
            ) : null}

            <button
              type="submit"
              className="upload-submit"
              disabled={!file || Boolean(fileError) || !title.trim() || !subject || !category || isUploading}
            >
              {isUploading ? <LoaderCircle className="spin" size={18} /> : <CloudUpload size={18} />}
              {isUploading ? 'Uploading...' : 'Upload and prepare for AI'}
            </button>
          </aside>
        </form>
      )}
    </main>
  )
}
