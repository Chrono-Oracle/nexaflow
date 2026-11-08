/**
 * Utility functions for cleaning and sanitizing rich text HTML.
 * Strips empty trailing tags (<p><br></p>, <div><br></div>, <br>, &nbsp;, etc.)
 * so that editor artifacts don't create unwanted vertical whitespace.
 */

export function cleanTrailingEmptyHtml(html: string): string {
  if (!html) return '';
  let prev = '';
  let curr = html.trim();
  const emptyTagRegex =
    /<(p|div|h[1-6]|li|span|strong|em|b|i|s|u|ol|ul)[^>]*>(\s*<br\s*\/?>|&nbsp;|\s)*<\/\1>/gi;
  const trailingRegex = /(<br\s*\/?>|&nbsp;|\s)+$/gi;

  while (curr !== prev) {
    prev = curr;
    curr = curr.replace(emptyTagRegex, '').trim();
    curr = curr.replace(trailingRegex, '').trim();
    curr = curr
      .replace(
        /(<(p|div|h[1-6]|li|span|strong|em|b|i|s|u|ol|ul)[^>]*>(\s*<br\s*\/?>|&nbsp;|\s)*<\/\2>\s*)+$/gi,
        ''
      )
      .trim();
  }
  return curr;
}

/**
 * Strips HTML tags and decodes common HTML entities to return clean plain text.
 * Suitable for card, table, list, and tooltip previews.
 */
export function stripHtmlToPlainText(htmlOrText?: string): string {
  if (!htmlOrText) return '';
  return htmlOrText
    // Replace block-level closing tags and line breaks with spaces so words do not merge
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr|table|ul|ol)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    // Strip all HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    // Collapse multiple whitespace characters into a single space
    .replace(/\s+/g, ' ')
    .trim();
}
