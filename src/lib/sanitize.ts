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
