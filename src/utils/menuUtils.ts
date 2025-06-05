// src/utils/menuUtils.js
import { normalizeRef } from "@/utils/ContentUtils";

/**
 * Given a parentId string and a flat array of menu‐item entries,
 * returns only those entries whose `data.parent` matches parentId.
 */
export function getChildItems(parentId, allItems = []) {
  return allItems.filter(
    (item) =>
      item.data.parent && normalizeRef(item.data.parent) === parentId
  );
}
