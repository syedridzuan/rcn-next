export interface Subscriber {
  id: string
  email: string
  isVerified: boolean
  verificationToken: string | null
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}