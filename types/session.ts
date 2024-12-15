import type { User } from './user'

export interface Session {
  id: string
  sessionToken: string
  userId: string
  user: User
  expires: Date
}