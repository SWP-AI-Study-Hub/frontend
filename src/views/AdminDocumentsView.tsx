'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteDocument,
  getAdminDocuments,
  hideDocument,
  unhideDocument,
  type DocumentQuery,
  type DocumentListResponse,
} from '../api/admin.api'
import type { AdminDocument } from '../api/admin.mock'
import { useLanguage } from '../i18n/LanguageProvider'
import { localize } from '../i18n/localize'
import { formatFileSize } from '../api/documents.api'

const DEFAULT_QUERY: DocumentQuery = { page: 1, limit: 8 }

export function AdminDocumentsView() {
  const { locale, t } = useLanguage()
  const text = (vi: string, en: string) => localize(locale, vi, en)

  const [keyword, setKeyword] = useState('')
  const [visibility, setVisibility] = useState('')
  const [status, setStatus] = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<DocumentListResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Moderation state
  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null)
  const [moderationAction, setModerationAction] = useState<'HIDE' | 'DELETE' | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [isSubmitingAction, setIsSubmitingAction] = useState(false)

  const loadDocuments = useCallback(
    async (query: DocumentQuery = DEFAULT_QUERY) => {
      setError('')
      setIsLoading(true)
      try {
        const response = await getAdminDocuments(query)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'))
      } finally {
        setIsLoading(false)
      }
    },
    [t]
  )

  useEffect(() => {
    void loadDocuments({ ...DEFAULT_QUERY, page, keyword, visibility, status, aiStatus })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDocuments, page, visibility, status, aiStatus])

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    await loadDocuments({ page: 1, limit: DEFAULT_QUERY.limit, keyword, visibility, status, aiStatus })
  }

  const handleActionClick = (doc: AdminDocument, action: 'HIDE' | 'DELETE') => {
    setSelectedDoc(doc)
    setModerationAction(action)
    setModerationReason('')
  }

  const handleConfirmAction = async () => {
    if (!selectedDoc || !moderationAction) return
    setIsSubmitingAction(true)
    setError('')
    try {
      if (moderationAction === 'HIDE') {
        await hideDocument(selectedDoc.id, moderationReason)
      } else {
        await deleteDocument(selectedDoc.id)
      }
      setSelectedDoc(null)
      setModerationAction(null)
      // Reload current page
      await loadDocuments({ page, limit: DEFAULT_QUERY.limit, keyword, visibility, status, aiStatus })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsSubmitingAction(false)
    }
  }

  const handleUnhideDocument = async (id: string) => {
    setError('')
    setIsLoading(true)
    try {
      await unhideDocument(id)
      await loadDocuments({ page, limit: DEFAULT_QUERY.limit, keyword, visibility, status, aiStatus })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const getVisibilityBadgeClass = (vis: string) => {
    return vis === 'PUBLIC' ? 'status-pill success' : 'status-pill'
  }

  const getStatusBadgeClass = (st: string) => {
    if (st === 'ACTIVE') return 'status-pill success'
    if (st === 'HIDDEN') return 'status-pill hidden'
    return 'status-pill deleted'
  }

  const getAiStatusBadgeClass = (aiSt: string) => {
    if (aiSt === 'COMPLETED') return 'status-pill ai-completed'
    if (aiSt === 'PROCESSING' || aiSt === 'PENDING') return 'status-pill ai-processing'
    return 'status-pill ai-failed'
  }

  const items = data?.items ?? []
  const meta = data?.meta ?? {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  }

  return (
    <main className="page" id="main-content">
      <div className="page-header page-header--editorial">
        <div>
          <p className="eyebrow">{text('BẢNG ĐIỀU KHIỂN QUẢN TRỊ', 'ADMIN CONSOLE')}</p>
          <h1>{text('Kiểm duyệt tài liệu', 'Document Moderation')}</h1>
          <p>
            {text(
              'Xem xét tài liệu được đăng tải, ẩn các tài liệu vi phạm quy chế học tập hoặc xóa vĩnh viễn học liệu.',
              'Review uploaded documents, hide documents violating academic integrity, or permanently delete study materials.'
            )}
          </p>
        </div>
        <span className="page-number">03 / ADMIN</span>
      </div>

      {/* Toolbar filters */}
      <form className="toolbar" onSubmit={handleSearch}>
        <label className="search-box">
          <Search size={18} />
          <input
            name="documentSearch"
            aria-label={text('Tìm kiếm tiêu đề, tên tệp...', 'Search title, fileName...')}
            autoComplete="off"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={`${text('Tìm kiếm tiêu đề, tên tệp...', 'Search title, fileName...')}…`}
          />
        </label>

        <select
          name="visibilityFilter"
          aria-label={text('Chế độ hiển thị', 'Visibility')}
          value={visibility}
          onChange={(event) => {
            setVisibility(event.target.value)
            setPage(1)
          }}
        >
          <option value="">{text('Chế độ hiển thị', 'All visibilities')}</option>
          <option value="PUBLIC">{text('Công khai', 'PUBLIC')}</option>
          <option value="PRIVATE">{text('Riêng tư', 'PRIVATE')}</option>
        </select>

        <select
          name="statusFilter"
          aria-label={text('Trạng thái tài liệu', 'Status')}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">{text('Tất cả trạng thái', 'All statuses')}</option>
          <option value="ACTIVE">{text('Hoạt động', 'ACTIVE')}</option>
          <option value="HIDDEN">{text('Bị ẩn', 'HIDDEN')}</option>
          <option value="DELETED">{text('Đã xóa', 'DELETED')}</option>
        </select>

        <select
          name="aiStatusFilter"
          aria-label={text('Trạng thái Chỉ mục AI', 'AI status')}
          value={aiStatus}
          onChange={(event) => {
            setAiStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">{text('Trạng thái AI', 'All AI statuses')}</option>
          <option value="COMPLETED">{text('Sẵn sàng (COMPLETED)', 'COMPLETED')}</option>
          <option value="PROCESSING">{text('Đang xử lý (PROCESSING)', 'PROCESSING')}</option>
          <option value="PENDING">{text('Chờ xử lý (PENDING)', 'PENDING')}</option>
          <option value="FAILED">{text('Thất bại (FAILED)', 'FAILED')}</option>
        </select>

        <button className="secondary-button" type="submit" disabled={isLoading}>
          {isLoading ? t('common.searching') : t('common.search')}
        </button>
      </form>

      <section className="content-panel">
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? (
          <div className="loading-state">
            <span className="loading-line" />
            <p>{text('Đang tải danh sách tài liệu...', 'Loading documents...')}</p>
          </div>
        ) : null}
        {!isLoading && items.length === 0 ? (
          <div className="empty-state">
            <FileText size={28} />
            <p>{text('Không tìm thấy tài liệu phù hợp.', 'No matching documents found.')}</p>
          </div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{text('Tài liệu', 'Document')}</th>
                    <th>{text('Chủ đề / Phân loại', 'Subject / Category')}</th>
                    <th>{text('Người sở hữu', 'Owner')}</th>
                    <th>{text('Quyền', 'Visibility')}</th>
                    <th>{text('Trạng thái', 'Status')}</th>
                    <th>{text('Chỉ mục AI', 'AI Index')}</th>
                    <th>{text('Hành động', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ color: 'var(--muted)' }}>
                            {doc.fileType === 'XLSX' ? (
                              <FileSpreadsheet size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </span>
                          <div style={{ display: 'grid', lineHeight: 1.3 }}>
                            <strong style={{ fontSize: '0.86rem' }}>{doc.title}</strong>
                            <small style={{ color: 'var(--subtle)', fontSize: '0.72rem' }}>
                              {doc.fileName} ({formatFileSize(doc.fileSize)})
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', lineHeight: 1.3 }}>
                          <strong>{doc.subject}</strong>
                          <span style={{ color: 'var(--subtle)', fontSize: '0.74rem' }}>
                            {doc.category}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', lineHeight: 1.3 }}>
                          <strong>{doc.owner.fullName}</strong>
                          <span style={{ color: 'var(--subtle)', fontSize: '0.74rem' }}>
                            {doc.owner.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={getVisibilityBadgeClass(doc.visibility)}>
                          {doc.visibility}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                          <span className={getStatusBadgeClass(doc.status)}>
                            {doc.status}
                          </span>
                          {doc.status === 'HIDDEN' && doc.moderationReason ? (
                            <small
                              style={{
                                color: 'var(--danger)',
                                fontSize: '0.72rem',
                                maxWidth: '160px',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                              title={doc.moderationReason}
                            >
                              Lý do: {doc.moderationReason}
                            </small>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className={getAiStatusBadgeClass(doc.aiStatus)}>
                          {doc.aiStatus}
                        </span>
                      </td>
                      <td>
                        <div className="btn-action-row">
                          {doc.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              className="btn-icon-action btn-warn"
                              title={text('Ẩn tài liệu', 'Hide document')}
                              onClick={() => handleActionClick(doc, 'HIDE')}
                            >
                              <EyeOff size={15} />
                            </button>
                          ) : null}
                          {doc.status === 'HIDDEN' ? (
                            <button
                              type="button"
                              className="btn-icon-action"
                              title={text('Hiện tài liệu', 'Unhide document')}
                              onClick={() => void handleUnhideDocument(doc.id)}
                            >
                              <Eye size={15} />
                            </button>
                          ) : null}
                          {doc.status !== 'DELETED' ? (
                            <button
                              type="button"
                              className="btn-icon-action btn-danger"
                              title={text('Xóa vĩnh viễn', 'Permanently delete')}
                              onClick={() => handleActionClick(doc, 'DELETE')}
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 ? (
              <div className="pagination-wrap">
                <span className="pagination-info">
                  {text('Trang', 'Page')} {meta.page} {text('trên', 'of')} {meta.totalPages} (
                  {meta.totalItems} {text('tài liệu', 'documents')})
                </span>
                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!meta.hasPrevious}
                    onClick={() => handlePageChange(meta.page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      className={`pagination-btn ${meta.page === pNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pNum)}
                    >
                      {pNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!meta.hasNext}
                    onClick={() => handlePageChange(meta.page + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      {/* Moderation Confirmation Modal */}
      {selectedDoc && moderationAction ? (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <header className="admin-modal-header">
              <h3>
                {moderationAction === 'HIDE'
                  ? text('Xác nhận ẩn tài liệu', 'Confirm Hide Document')
                  : text('Xác nhận xóa tài liệu', 'Confirm Delete Document')}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setSelectedDoc(null)
                  setModerationAction(null)
                }}
              >
                <X size={18} />
              </button>
            </header>
            <div className="admin-modal-body">
              <p>
                {moderationAction === 'HIDE'
                  ? text(
                      `Bạn có chắc chắn muốn ẩn tài liệu "${selectedDoc.title}"? Tài liệu bị ẩn sẽ không hiển thị trên thư viện công cộng và kết quả tìm kiếm của sinh viên.`,
                      `Are you sure you want to hide "${selectedDoc.title}"? Hidden documents will not appear in the community library or students' searches.`
                    )
                  : text(
                      `Bạn có chắc chắn muốn xóa tài liệu "${selectedDoc.title}"? Hành động này không thể hoàn tác và toàn bộ dữ liệu chỉ mục sẽ bị xóa bỏ hoàn toàn.`,
                      `Are you sure you want to delete "${selectedDoc.title}"? This action is irreversible and all indexing data will be wiped out.`
                    )}
              </p>

              {moderationAction === 'HIDE' ? (
                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.45rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {text('Lý do kiểm duyệt (không bắt buộc)', 'Moderation reason (optional)')}
                  </label>
                  <textarea
                    value={moderationReason}
                    onChange={(event) => setModerationReason(event.target.value)}
                    placeholder={text(
                      'Ví dụ: Vi phạm bản quyền, Học liệu không phù hợp...',
                      'e.g. Copyright infringement, Out of scope study material...'
                    )}
                  />
                </div>
              ) : null}
            </div>
            <footer className="admin-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSelectedDoc(null)
                  setModerationAction(null)
                }}
                disabled={isSubmitingAction}
              >
                {text('Hủy bỏ', 'Cancel')}
              </button>
              <button
                type="button"
                className="primary-button"
                style={{
                  background: moderationAction === 'DELETE' ? 'var(--danger)' : 'var(--ink)',
                  borderColor: moderationAction === 'DELETE' ? 'var(--danger)' : 'var(--ink)',
                }}
                onClick={() => void handleConfirmAction()}
                disabled={isSubmitingAction}
              >
                {isSubmitingAction
                  ? text('Đang xử lý...', 'Processing...')
                  : text('Xác nhận', 'Confirm')}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </main>
  )
}
