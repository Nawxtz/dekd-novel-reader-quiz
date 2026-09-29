/**
 * Input sanitization and security utility functions.
 */

// Strip control characters, directional overrides (e.g. U+202E), and normalize unicode
export function normalizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    // Remove control characters (C0, C1) and bidi overrides
    .replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E]/g, "")
    .trim();
}

// Escape special regex characters to prevent ReDoS when constructing dynamic RegExp
export function sanitizeSearchRegex(query: string): string {
  if (typeof query !== "string") return "";
  return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validate URL: only allow https: protocol or relative / paths
export function isValidHttpsUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true; // relative path
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Strip HTML tags to prevent XSS in text fields
export function stripHtmlTags(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>?/gm, "").trim();
}

// Sanitize user text (normalizes unicode, removes control chars and HTML tags)
export function sanitizeUserText(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  const cleaned = normalizeString(stripHtmlTags(input));
  return cleaned.slice(0, maxLength);
}

// Comprehensive check for safe image and navigation URLs
export function isSafeUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();

  // Block protocol-relative URLs that could load external scripts
  if (trimmed.startsWith("//")) return false;

  // Allow safe relative paths
  if (trimmed.startsWith("/")) return true;

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// Fast 32-bit FNV-1a checksum for verifying export data integrity
export function computeChecksum(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Guard against prototype pollution in parsed JSON payloads
export function hasPrototypePollution(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;

  const stack = [data];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    for (const key of Object.getOwnPropertyNames(current)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return true;
      }
      const val = (current as Record<string, unknown>)[key];
      if (val && typeof val === "object") {
        stack.push(val);
      }
    }
  }
  return false;
}


