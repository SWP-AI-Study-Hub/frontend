export type CommunityDocument = {
  id: string
  title: string
  description: string
  subject: string
  category: string
  fileType: string
  pages: number
  owner: string
  savedCount: number
  updatedAt: string
  accent: 'amber' | 'blue' | 'green' | 'rose'
}
