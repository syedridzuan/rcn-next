/**
 * List of common spam words and patterns
 * These are just examples - you should customize based on your needs
 */
export const SPAM_WORDS = [
  // Common spam indicators
  "viagra",
  "cialis",
  "casino",
  "lottery",
  "prize",
  "winner",
  "free money",
  "make money fast",
  "earn money online",
  "work from home",
  
  // Suspicious marketing terms
  "buy now",
  "click here",
  "limited time",
  "act now",
  "best price",
  "discount",
  "cheap",
  
  // Suspicious URLs and domains
  ".ru",
  ".cn",
  "bit.ly",
  "goo.gl",
  
  // Common scam phrases
  "nigerian prince",
  "inheritance",
  "bank transfer",
  "western union",
  "wire transfer",
  
  // Aggressive marketing
  "guaranteed",
  "satisfaction guaranteed",
  "risk free",
  "no risk",
  "100% free",
  
  // Suspicious characters
  "₿", // Bitcoin symbol
  "💰",
  "💵",
  "🤑",
] as const

/**
 * Utility type for spam word literals
 */
export type SpamWord = typeof SPAM_WORDS[number]

/**
 * Check if a word is in our spam list
 */
export function isSpamWord(word: string): word is SpamWord {
  return SPAM_WORDS.includes(word.toLowerCase() as SpamWord)
} 