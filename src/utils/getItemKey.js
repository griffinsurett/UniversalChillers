// src/utils/getItemKey.js
/**
 * Pulls a stable identifier off `item`:
 *  • If `prefixKey` is provided, we look at `item[prefixKey]`,
 *    otherwise we look at `item` itself.
 *  • Return `.slug` if present, else `.id`.
 *  • If neither exists, returns empty string.
 *
 * @param {object} item
 * @param {string} [prefixKey]  — e.g. "data" if your slugs live at item.data.slug
 * @returns {string}
 */
export function getItemKey(item, prefixKey) {
  const target = prefixKey && typeof item[prefixKey] === "object"
    ? item[prefixKey]
    : item;

  if (!target) return "";

  return typeof target.slug === "string"
    ? target.slug
    : typeof target.id === "string"
      ? target.id
      : "";
}
