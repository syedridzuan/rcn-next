export interface Subscriber {
  id: string
  email: string
  isVerified: boolean
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
} 