// src/utils/menuUtils.js
import { normalizeRef } from "@/utils/ContentUtils";

/**
 * Given a parentId string (which may be either "foo" or "collection/foo")
 * and a flat array of items (Astro entries or loader‐items),
 * return only those whose `data.parent` matches that parent.
 */
export function getChildItems(parentId, allItems = []) {
  const normParent = normalizeRef(parentId);

  return allItems.filter((item) => {
    const p = item.data.parent;
    if (!p) return false;
    // if it’s an object‐style parent: { id, collection }
    if (typeof p === "object" && p.id) {
      return normalizeRef(p.id) === normParent;
    }
    // else plain string parent (just a slug)
    return normalizeRef(p) === normParent;
  });
}
