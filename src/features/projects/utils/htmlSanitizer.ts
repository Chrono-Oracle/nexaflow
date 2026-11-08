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
