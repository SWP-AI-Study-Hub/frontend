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

export async function getDashboardSummary(): Promise<mock.AdminDashboardSummary> {
  if (USE_MOCKS) {
    return mock.mockGetDashboardSummary()
  }
  const res = await apiRequest<{
    totalUsers: number
    totalDocuments: number
    totalPublicDocuments: number
    totalPrivateDocuments: number
    totalChats: number
    totalDownloads: number
  }>('/admin/dashboard/summary')

  return {
    totalUsers: res.totalUsers,
    totalDocuments: res.totalDocuments,
    publicDocuments: res.totalPublicDocuments,
    privateDocuments: res.totalPrivateDocuments,
    totalChats: res.totalChats,
    totalDownloads: res.totalDownloads,
  }
}

export async function getDashboardStatistics(): Promise<{
  bySubject: mock.SubjectStat[]
  byCategory: mock.CategoryStat[]
}> {
  if (USE_MOCKS) {
    return mock.mockGetDashboardStatistics()
  }
  const res = await apiRequest<{
    documents: {
      bySubject: { id: string; code: string; name: string; count: number }[]
      byCategory: { id: string; name: string; count: number }[]
    }
  }>('/admin/dashboard/statistics')

  return {
    bySubject: res.documents.bySubject.map((s) => ({
      subject: s.name,
      count: s.count,
    })),
    byCategory: res.documents.byCategory.map((c) => ({
      category: c.name,
      count: c.count,
    })),
  }
}

export async function getUploadStatistics(): Promise<mock.UploadStatItem[]> {
  if (USE_MOCKS) {
    return mock.mockGetUploadStatistics()
  }
  const res = await apiRequest<{
    data: mock.UploadStatItem[]
  }>('/admin/dashboard/upload-statistics')
  return res.data
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
