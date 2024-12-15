import type { Guide } from './guide'
import type { User } from './user'

export interface GuideComment {
  id: string
  content: string
  guideId: string
  guide: Guide
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
}