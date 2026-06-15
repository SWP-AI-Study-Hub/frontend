import type { CommunityDocument } from '../types/community'

export const communityDocuments: CommunityDocument[] = [
  {
    id: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
    title: 'Distributed Systems Field Notes',
    description:
      'Ghi chú cô đọng về đồng thuận, sao chép, mô hình lỗi và các đánh đổi trong thiết kế hệ thống.',
    subject: 'Khoa học máy tính',
    category: 'Hệ thống',
    fileType: 'PDF',
    pages: 42,
    owner: 'Minh Anh',
    savedCount: 128,
    updatedAt: '2 ngày trước',
    accent: 'blue',
  },
  {
    id: '16f32b32-68da-43bf-86a3-c9ad003a8a39',
    title: 'Research Methods Handbook',
    description:
      'Hướng dẫn có cấu trúc về câu hỏi nghiên cứu, tổng quan tài liệu, lấy mẫu và chất lượng bằng chứng.',
    subject: 'Nghiên cứu',
    category: 'Phương pháp luận',
    fileType: 'DOCX',
    pages: 68,
    owner: 'Ngoc Ha',
    savedCount: 94,
    updatedAt: '5 ngày trước',
    accent: 'amber',
  },
  {
    id: '26ce9f92-23ad-4bba-b197-9196fb0c5ad6',
    title: 'Applied Machine Learning Review',
    description:
      'Giải thích bằng ví dụ về lựa chọn mô hình, chỉ số đánh giá, rò rỉ dữ liệu và kiểm tra triển khai.',
    subject: 'Trí tuệ nhân tạo',
    category: 'Học máy',
    fileType: 'PPTX',
    pages: 31,
    owner: 'Quang Pham',
    savedCount: 203,
    updatedAt: '1 tuần trước',
    accent: 'green',
  },
  {
    id: 'bc5df6ac-1334-4a6e-8acd-4d822985b481',
    title: 'Academic Writing Patterns',
    description:
      'Các cấu trúc có thể tái sử dụng cho lập luận, đoạn tổng hợp, trích dẫn và văn phong kỹ thuật rõ ràng.',
    subject: 'Ngôn ngữ',
    category: 'Viết học thuật',
    fileType: 'PDF',
    pages: 27,
    owner: 'Linh Tran',
    savedCount: 76,
    updatedAt: '1 tuần trước',
    accent: 'rose',
  },
  {
    id: '9433ffbd-2fed-40b3-a7a3-16ef4153503e',
    title: 'Database Indexing Explained',
    description:
      'B-tree, chỉ mục kết hợp, kế hoạch truy vấn và các lỗi hiệu năng thường gặp trong cơ sở dữ liệu quan hệ.',
    subject: 'Khoa học máy tính',
    category: 'Cơ sở dữ liệu',
    fileType: 'PDF',
    pages: 35,
    owner: 'Bao Nguyen',
    savedCount: 167,
    updatedAt: '2 tuần trước',
    accent: 'blue',
  },
  {
    id: '132b3ce6-62bd-4a43-ad69-a119752ed09c',
    title: 'Product Discovery Workshop',
    description:
      'Câu hỏi phỏng vấn, bản đồ cơ hội, kiểm thử giả định và mẫu hội thảo cho đội ngũ sản phẩm.',
    subject: 'Kinh doanh',
    category: 'Sản phẩm',
    fileType: 'XLSX',
    pages: 18,
    owner: 'Thao Le',
    savedCount: 51,
    updatedAt: '3 tuần trước',
    accent: 'green',
  },
]

const SAVED_KEY = 'documind.savedCommunityDocuments'

export function getSavedCommunityDocumentIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function toggleSavedCommunityDocument(id: string): string[] {
  const current = new Set(getSavedCommunityDocumentIds())
  if (current.has(id)) {
    current.delete(id)
  } else {
    current.add(id)
  }
  const saved = [...current]
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  return saved
}
