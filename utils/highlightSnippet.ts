// utils/highlightSnippet.ts
/**
 * Highlights the first occurrence of `query` in `text` by wrapping it in <mark>.
 * Additionally, extracts a snippet around the match so we don’t display the entire text if it’s very long.
 *
 * @param text   - The text to highlight
 * @param query  - The user’s search keyword
 * @param maxLen - The maximum length of the snippet to display
 * @returns HTML string with <mark> around the matching term, or the plain text if no match found.
 */
export function highlightSnippet(
  text: string,
  query: string,
  maxLen = 100
): string {
  if (!text || !query) return text;

  const safeQuery = escapeRegExp(query); // We'll define escapeRegExp below
  // Build a case-insensitive regex
  const regex = new RegExp(safeQuery, "i");
  const match = text.search(regex);

  if (match === -1) {
    // no match found => return text as-is (or you could forcibly truncate)
    return text.length > maxLen ? text.slice(0, maxLen - 3) + "..." : text;
  }

  // We found a match. Let’s figure out the snippet boundaries:
  // e.g., ~30 chars before the match, ~70 total length (configurable)
  const snippetHalf = Math.floor(maxLen / 2);
  const start = Math.max(0, match - snippetHalf);
  const end = Math.min(text.length, match + snippetHalf);

  let snippet = text.slice(start, end);

  // If we trimmed from the front, add leading "..."
  if (start > 0) {
    snippet = "..." + snippet;
  }
  // If we trimmed from the end, add trailing "..."
  if (end < text.length) {
    snippet = snippet + "...";
  }

  // Now highlight the first occurrence within the snippet
  // We do another search because we might have a different index within snippet
  const matchInSnippet = snippet.search(regex);
  if (matchInSnippet !== -1) {
    // We highlight only the first match
    const before = snippet.slice(0, matchInSnippet);
    const matchedText = snippet.slice(
      matchInSnippet,
      matchInSnippet + query.length
    );
    const after = snippet.slice(matchInSnippet + query.length);

    // Wrap the matched text in <mark>
    snippet = `${before}<mark>${matchedText}</mark>${after}`;
  }

  return snippet;
}

/**
 * Safely escapes user’s query for use in a regex
 */
function escapeRegExp(str: string): string {
  // For example, “hello.*(world)” => “hello\.\*\(world\)”
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
