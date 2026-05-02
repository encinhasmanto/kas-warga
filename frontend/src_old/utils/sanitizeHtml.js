import DOMPurify from "dompurify";

export function sanitizeHtml(html) {
  if (!html) return "";
  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });
  } catch (err) {
    console.error("Sanitize error:", err);
    return "";
  }
}
