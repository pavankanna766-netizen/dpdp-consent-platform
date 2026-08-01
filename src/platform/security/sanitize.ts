/**
 * Strip all HTML tags from input, returning plain text only.
 * Use for user-submitted text fields (names, descriptions, identifiers).
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize HTML using an allowlist approach. 
 * Only allows safe formatting tags, strips everything else.
 * Use for rich-text content like policy HTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  const ALLOWED_TAGS = new Set([
    'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'table', 'thead',
    'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'span', 'div',
    'dl', 'dt', 'dd', 'hr', 'sub', 'sup', 'small'
  ]);
  
  const ALLOWED_ATTRS = new Set(['href', 'class', 'id', 'colspan', 'rowspan']);
  
  // Remove script tags and their content entirely
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove event handlers (onerror, onclick, onload, etc.)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  // Remove javascript: and data: URLs
  cleaned = cleaned.replace(/(?:href|src|action)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi, '');
  // Strip disallowed tags but keep content
  cleaned = cleaned.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const tagLower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(tagLower)) return '';
    // For allowed tags, strip disallowed attributes
    if (match.startsWith('</')) return `</${tagLower}>`;
    const attrMatch = match.match(/\s+([a-z][a-z0-9-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi);
    const safeAttrs = (attrMatch || [])
      .filter(attr => {
        const name = attr.trim().split(/\s*=/)[0].trim().toLowerCase();
        return ALLOWED_ATTRS.has(name);
      })
      .join(' ');
    return `<${tagLower}${safeAttrs ? ' ' + safeAttrs : ''}>`;
  });
  
  return cleaned;
}

/**
 * Encode special characters for safe output in HTML context.
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize a string for safe use in SQL-like contexts.
 * Strips characters that could be used for injection.
 */
export function sanitizeIdentifier(input: string): string {
  if (!input) return "";
  return input.replace(/[^\w\s@.\-+]/g, '').trim();
}
