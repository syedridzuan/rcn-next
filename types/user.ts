export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING: "PENDING",
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

export interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: UserStatus
  createdAt: Date
  updatedAt: Date
} 