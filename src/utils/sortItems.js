// src/utils/sortItems.js

/**
 * Sort an array of content entries (by frontmatter order, title, slug, or date).
 *
 * @param {Array<any>} items
 * @param {string} sortBy         – one of "date" | "title" | "slug" | "id"
 * @param {"asc"|"desc"} sortOrder
 * @param {boolean} manualOrder   – if true, use item.data.order instead of sortBy
 * @returns {Array<any>}          – a new sorted array
 */
export function sortItems(items, sortBy = "id", sortOrder = "desc", manualOrder = false) {
  // Shallow copy so we don’t mutate original
  const arr = [...items];

  if (manualOrder) {
    return arr.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  }

  arr.sort((a, b) => {
    if (sortBy === "title") {
      const ta = String(a.data.title || a.slug).toLowerCase();
      const tb = String(b.data.title || b.slug).toLowerCase();
      return ta.localeCompare(tb);
    }
    if (sortBy === "slug" || sortBy === "id") {
      return String(a.slug).localeCompare(String(b.slug));
    }
    // Default: sort by date (pubDate, date, or generatedAt timestamp)
    const da = new Date(a.data.pubDate || a.data.date || a._generatedAt || 0).getTime();
    const db = new Date(b.data.pubDate || b.data.date || b._generatedAt || 0).getTime();
    return da - db;
  });

  if (sortOrder === "desc") {
    arr.reverse();
  }

  return arr;
}
