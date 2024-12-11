import { hash as bcryptHash, compare } from "bcryptjs"

export async function hash(password: string): Promise<string> {
  return bcryptHash(password, 12)
}

export async function verify(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
} 