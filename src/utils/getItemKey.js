/**
 * Pulls a stable identifier off `item`:
 *  • Return `item.slug` if present, else `item.id`.
 *  • If neither exists, returns empty string.
 *
 * @param {object} item
 * @returns {string}
 */
export function getItemKey(item) {
  if (!item) return "";
  if (typeof item.slug === "string" && item.slug) return item.slug;
  if (typeof item.id   === "string" && item.id)   return item.id;
  return "";
}

