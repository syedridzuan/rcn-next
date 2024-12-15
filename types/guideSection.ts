
import type { Guide } from './guide'

export interface GuideSection {
  id: string
  title: string
  content: string
  guideId: string
  guide: Guide
  createdAt: Date
  updatedAt: Date
}
