import type { AiChatResponse, Citation } from '../types/chat'

const documentCitation: Citation = {
  sourceNumber: 1,
  documentId: '79c555d8-b4ce-4d98-9f93-15f2fe1c9813',
  title: 'Distributed Systems Field Notes',
  snippet:
    'Giao thức đồng thuận đánh đổi thêm chi phí phối hợp để đạt được một thứ tự chuyển trạng thái thống nhất.',
  relevanceScore: 0.94,
}

export function demoDocumentAnswer(question: string): AiChatResponse {
  return {
    answer: `Tài liệu phân tích "${question}" dựa trên ba ý chính: giả định lỗi rõ ràng, trạng thái được sao chép và mô hình nhất quán phù hợp với tải công việc. Tài liệu khuyến nghị xác định các lỗi có thể chấp nhận trước khi chọn chiến lược phối hợp.`,
    sessionId: crypto.randomUUID(),
    messageId: crypto.randomUUID(),
    suggestedPrompts: [
      'So sánh tính nhất quán mạnh và nhất quán cuối cùng',
      'Giải thích các mô hình lỗi chính',
      'Tạo năm câu hỏi ôn tập',
    ],
    sources: [documentCitation],
  }
}

export function demoLibraryAnswer(question: string): AiChatResponse {
  return {
    answer: `Trong thư viện của bạn, câu trả lời phù hợp nhất cho "${question}" kết hợp ghi chú hệ thống với cẩm nang nghiên cứu: xác định chính xác nhận định, nêu rõ các giả định rồi so sánh bằng chứng từ những nguồn độc lập trước khi kết luận.`,
    sessionId: crypto.randomUUID(),
    messageId: crypto.randomUUID(),
    suggestedPrompts: [
      'Chuyển nội dung này thành kế hoạch học tập',
      'Chỉ ra điểm khác biệt giữa các nguồn',
      'Tạo bản tóm tắt ngắn gọn',
    ],
    sources: [
      documentCitation,
      {
        sourceNumber: 2,
        documentId: '16f32b32-68da-43bf-86a3-c9ad003a8a39',
        title: 'Research Methods Handbook',
        snippet:
          'Đối chiếu tam giác tăng độ tin cậy bằng cách so sánh bằng chứng thu thập từ nhiều phương pháp hoặc nguồn khác nhau.',
        relevanceScore: 0.88,
      },
      {
        sourceNumber: 3,
        documentId: '9433ffbd-2fed-40b3-a7a3-16ef4153503e',
        title: 'Database Indexing Explained',
        snippet:
          'Kế hoạch truy vấn cần được kiểm tra theo mẫu truy cập thực tế thay vì chỉ tối ưu dựa trên trực giác.',
        relevanceScore: 0.76,
      },
    ],
  }
}
