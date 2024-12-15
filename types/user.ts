
import { Role, UserStatus } from '@prisma/client'
import type { Recipe } from './recipe'
import type { Comment } from './comment'
import type { Guide } from './guide'
import type { GuideComment } from './guideComment'
import type { Review } from './review'
import type { SavedRecipe } from './savedRecipe'
import type { Account } from './account'
import type { Session } from './session'

export interface User {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  password: string | null
  image: string | null
  role: Role | null
  status: UserStatus | null
  recipes: Recipe[]
  comments: Comment[]
  guides: Guide[]
  guideComments: GuideComment[]
  reviews: Review[]
  savedRecipes: SavedRecipe[]
  accounts: Account[]
  sessions: Session[]
  createdAt: Date
  updatedAt: Date
}