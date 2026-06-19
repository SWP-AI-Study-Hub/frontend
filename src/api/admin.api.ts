import { apiRequest } from '../lib/http'
import * as mock from './admin.mock'

export type DocumentQuery = {
  page?: number
  limit?: number
  keyword?: string
  visibility?: string
  status?: string
  aiStatus?: string
}

export type DocumentListResponse = {
  items: mock.AdminDocument[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

function toQueryString(query: Record<string, unknown>) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })
  const text = params.toString()
  return text ? `?${text}` : ''
}

// ----------------------------------------------------
// Dashboard Service Functions
// ----------------------------------------------------

export function getDashboardSummary(): Promise<mock.AdminDashboardSummary> {
  if (USE_MOCKS) {
    return mock.mockGetDashboardSummary()
  }
  return apiRequest<mock.AdminDashboardSummary>('/admin/dashboard/summary')
}

export function getDashboardStatistics(): Promise<{
  bySubject: mock.SubjectStat[]
  byCategory: mock.CategoryStat[]
}> {
  if (USE_MOCKS) {
    return mock.mockGetDashboardStatistics()
  }
  return apiRequest<{
    bySubject: mock.SubjectStat[]
    byCategory: mock.CategoryStat[]
  }>('/admin/dashboard/statistics')
}

export function getUploadStatistics(): Promise<mock.UploadStatItem[]> {
  if (USE_MOCKS) {
    return mock.mockGetUploadStatistics()
  }
  return apiRequest<mock.UploadStatItem[]>('/admin/dashboard/upload-statistics')
}

// ----------------------------------------------------
// Document Moderation Service Functions
// ----------------------------------------------------

export function getAdminDocuments(query: DocumentQuery = {}): Promise<DocumentListResponse> {
  if (USE_MOCKS) {
    return mock.mockGetAdminDocuments(query)
  }
  return apiRequest<DocumentListResponse>(`/admin/documents${toQueryString(query)}`)
}

export function hideDocument(id: string, reason?: string): Promise<mock.AdminDocument> {
  if (USE_MOCKS) {
    return mock.mockHideDocument(id, reason)
  }
  return apiRequest<mock.AdminDocument>(`/admin/documents/${id}/hide`, {
    method: 'PUT',
    body: { hidden: true, reason: reason || 'Violation of academic integrity.' },
  })
}

export function unhideDocument(id: string): Promise<mock.AdminDocument> {
  if (USE_MOCKS) {
    return mock.mockUnhideDocument(id)
  }
  return apiRequest<mock.AdminDocument>(`/admin/documents/${id}/hide`, {
    method: 'PUT',
    body: { hidden: false },
  })
}

export function deleteDocument(id: string): Promise<mock.AdminDocument> {
  if (USE_MOCKS) {
    return mock.mockDeleteDocument(id)
  }
  return apiRequest<mock.AdminDocument>(`/admin/documents/${id}`, {
    method: 'DELETE',
  })
}
