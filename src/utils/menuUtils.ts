// src/utils/menuUtils.ts
import { getCollection } from "astro:content";
import { normalizeRef } from "./ContentUtils";

/**
 * getChildItems(parentLink: string) => Promise<Array<CollectionEntry>>
 *
 * - parentLink: e.g. "/about-us"  (whatever item.data.link was)
 * 
 * Returns all menuItems whose `data.parent` (normalized) equals the slug
 * derived from parentLink. Uses `normalizeRef()` to compare slugs.
 */
export async function getChildItems(parentLink: string) {
  // Derive the slug from the parentLink (e.g. "/services/web-design" => "web-design")
  const thisSlug = parentLink.split("/").filter(Boolean).pop() || "";
  const allMenuItems = await getCollection("menuItems");
  const normalizedThis = normalizeRef(thisSlug);

  // Filter by any entry whose data.parent, when normalized, matches `normalizedThis`
  return allMenuItems.filter((entry) => {
    if (!entry.data.parent) return false;
    return normalizeRef(entry.data.parent) === normalizedThis;
  });
}
