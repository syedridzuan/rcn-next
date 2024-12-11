import { SPAM_WORDS } from "./spam-words"

/**
 * Configuration for spam detection
 */
interface SpamConfig {
  maxLinks: number
  maxRepeatedChars: number
  minLengthForCapsCheck: number
  maxSpamWords: number
}

const DEFAULT_CONFIG: SpamConfig = {
  maxLinks: 3,
  maxRepeatedChars: 10,
  minLengthForCapsCheck: 20,
  maxSpamWords: 2,
}

/**
 * More detailed spam check result with reason
 */
export interface SpamCheckResult {
  isSpam: boolean
  reason?: string
  details?: {
    spamWordsFound: string[]
    linkCount: number
    hasRepeatedChars: boolean
    isAllCaps: boolean
  }
}

/**
 * Enhanced spam checker that returns why content was marked as spam
 * Useful for logging and debugging
 */
export function checkSpamWithReason(
  content: string,
  config: Partial<SpamConfig> = {}
): SpamCheckResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const details = {
    spamWordsFound: [] as string[],
    linkCount: 0,
    hasRepeatedChars: false,
    isAllCaps: false,
  }

  // Check for links
  const linkPattern = /https?:\/\/[^\s]+/g
  const linkMatches = content.match(linkPattern) || []
  details.linkCount = linkMatches.length
  if (details.linkCount > finalConfig.maxLinks) {
    return {
      isSpam: true,
      reason: `Too many links (${details.linkCount} found, max ${finalConfig.maxLinks} allowed)`,
      details,
    }
  }

  // Check for repeated characters
  const repeatedCharsPattern = new RegExp(`(.)\\1{${finalConfig.maxRepeatedChars - 1},}`)
  details.hasRepeatedChars = repeatedCharsPattern.test(content)
  if (details.hasRepeatedChars) {
    return {
      isSpam: true,
      reason: `Contains excessive repeated characters (${finalConfig.maxRepeatedChars}+ in a row)`,
      details,
    }
  }

  // Check for all caps with minimum length
  if (content.length > finalConfig.minLengthForCapsCheck) {
    details.isAllCaps = content === content.toUpperCase()
    if (details.isAllCaps) {
      return {
        isSpam: true,
        reason: "Message is all uppercase (shouting)",
        details,
      }
    }
  }

  // Check for spam words
  const words = content.toLowerCase().split(/\s+/)
  const spamWordsFound = words.filter(word => 
    SPAM_WORDS.some(spamWord => 
      word.includes(spamWord.toLowerCase())
    )
  )
  details.spamWordsFound = spamWordsFound

  if (spamWordsFound.length > finalConfig.maxSpamWords) {
    return {
      isSpam: true,
      reason: `Contains too many spam words (${spamWordsFound.join(", ")})`,
      details,
    }
  }

  return { 
    isSpam: false,
    details,
  }
}

/**
 * Simple spam check that only returns boolean result
 */
export function checkSpam(content: string, config?: Partial<SpamConfig>): boolean {
  return checkSpamWithReason(content, config).isSpam
} 