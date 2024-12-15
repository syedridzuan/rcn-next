import type { Guide } from './guide'

export interface GuideImage {
  id: string
  url: string
  alt: string | null
  description: string | null
  isPrimary: boolean
  guideId: string
  guide: Guide
  createdAt: Date
  updatedAt: Date
}
