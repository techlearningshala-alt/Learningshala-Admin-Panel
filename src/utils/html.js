/**
 * HTML / rich-text helpers for admin UI (previews, table cells).
 */

/**
 * Convert an HTML string to a single line of plain text.
 * Decodes entities in the browser; uses a tag-stripping fallback when `document` is unavailable (SSR).
 *
 * @param {string | null | undefined} html
 * @returns {string}
 */
export function htmlToPlainText(html) {
  if (html == null || html === "") return "";
  if (typeof html !== "string") return String(html).trim();
  if (typeof document !== "undefined") {
    try {
      const el = document.createElement("div");
      el.innerHTML = html;
      return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
    } catch {
      /* fall through */
    }
  }
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate plain text for list previews.
 *
 * @param {string} text
 * @param {number} maxLength
 * @param {string} [ellipsis]
 * @returns {string}
 */
export function truncatePlainText(text, maxLength, ellipsis = "…") {
  if (!text || maxLength < 1) return text || "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}${ellipsis}`;
}
