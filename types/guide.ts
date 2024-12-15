import type { Tag } from './tag'
import type { User } from './user'
import type { GuideSection } from './guideSection'
import type { GuideImage } from './guideImage'
import type { GuideComment } from './guideComment'

export interface Guide {
  id: string
  title: string
  slug: string
  content: string | null
  tags: Tag[]
  authorId: string | null
  author: User | null
  sections: GuideSection[]
  images: GuideImage[]
  comments: GuideComment[]
  createdAt: Date
  updatedAt: Date
}