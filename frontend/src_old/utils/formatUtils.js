/**
 * Shared formatting and utility functions
 * Extracted from AdminDashboard, ResidentDashboard, HistoryView, BulletinView
 * to eliminate code duplication across 4+ components.
 */

/**
 * Format a number with Indonesian locale separators (e.g. 1.500.000)
 * @param {number} val
 * @returns {string}
 */
export function formatNumber(val) {
  if (!val && val !== 0) return "0";
  return new Intl.NumberFormat("id-ID").format(val);
}

/**
 * Format an ISO date string to a short locale display
 * @param {string} isoString
 * @param {Object} options - Intl.DateTimeFormat options override
 * @returns {string}
 */
export function formatDate(isoString, options = null) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString(
    "en-GB",
    options || {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

/**
 * Format an ISO date string with time (used by AdminDashboard)
 * @param {string} isoString
 * @returns {string}
 */
export function formatDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Detect file type from a URL (image, video, pdf, unknown, none)
 * @param {string} url
 * @returns {'image'|'video'|'pdf'|'unknown'|'none'}
 */
export function getFileType(url) {
  if (!url) return "none";
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower))
    return "image";
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return "video";
  if (/\.pdf(\?|$)/i.test(lower)) return "pdf";
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  )
    return "video";
  if (lower.includes("/storage/") && !lower.includes(".pdf")) return "image";
  return "unknown";
}

/**
 * Month name constants
 */
export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
