import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  if (typeof window === 'undefined') return html; // Skip DOMPurify on server to avoid SSR errors
  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });
  } catch (err) {
    console.error("Sanitize error:", err);
    return "";
  }
}
