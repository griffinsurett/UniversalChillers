// src/utils/CollectionQueryUtils.ts

import { getCollection, getEntry, getEntries } from "astro:content";
import { normalizeRef, toArray } from "./ContentUtils";
import { collections } from "@/content/config";

/**
 * queryItems(queryType, collectionName, pathname)
 *
 * Supports the following query formats:
 *   • "getAll" or `getAll${collectionName}`
 *   • "related" or `related${collectionName}`       → existing related logic
 *   • "parent" or `parent${collectionName}`
 *   • "children" or `children${collectionName}`
 *   • "sibling" or `sibling${collectionName}`
 *   • "relatedType:<TargetCollection>"
 *   • "relatedItem:<TargetCollection>:<TargetSlug>"
 *   • fallback: treat queryType as a tag in frontmatter
 */
export async function queryItems(
  queryType: string,
  collectionName: string,
  pathname: string
): Promise<any[]> {
  // Parse the current route to extract collection and slug if needed:
  const { routeCollectionName, slug } = parseRouteCollection(pathname);

  // ────────────────────────────────────────────────────────────────────────
  // 1) "getAll" ────────────────────────────────────────────────────────────
  if (queryType === "getAll" || queryType === `getAll${collectionName}`) {
    return await getAllItems(collectionName);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 2) "relatedType:<TargetCollection>" ──────────────────────────────────
  //    Return all items in `collectionName` that reference ANY item in <TargetCollection>.
  //    e.g. "relatedType:menus" finds all `menuItems` whose frontmatter references any `menus` slug.
  if (queryType.startsWith("relatedType:")) {
    const parts = queryType.split(":"); // ["relatedType", "<TargetCollection>"]
    if (parts.length !== 2) {
      throw new Error(
        `Invalid relatedType syntax. Use "relatedType:<TargetCollection>", got "${queryType}".`
      );
    }
    const targetCollection = parts[1];

    // 2a) Gather all slugs from <TargetCollection>
    const targetItems = await getCollection(targetCollection);
    const targetSlugs = targetItems.map((item) => normalizeRef(item.slug));

    // 2b) Filter current collection by any frontmatter field referencing any targetSlug
    const items = await getCollection(collectionName);
    return items.filter((item) => {
      for (const key in item.data) {
        const value = toArray(item.data[key]);
        if (value.map(normalizeRef).some((ref) => targetSlugs.includes(ref))) {
          return true;
        }
      }
      return false;
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 3) "relatedItem:<TargetCollection>:<TargetSlug>" ───────────────────────
  //    Return all items in `collectionName` that reference exactly <TargetSlug> inside <TargetCollection>.
  //    e.g. "relatedItem:menus:mainMenu" finds all `menuItems` whose frontmatter references "mainMenu".
  if (queryType.startsWith("relatedItem:")) {
    const parts = queryType.split(":"); // ["relatedItem", "<TargetCollection>", "<TargetSlug>"]
    if (parts.length !== 3) {
      throw new Error(
        `Invalid relatedItem syntax. Use "relatedItem:<TargetCollection>:<TargetSlug>", got "${queryType}".`
      );
    }
    const targetCollection = parts[1];
    const targetSlug = parts[2];
    const normalizedTarget = normalizeRef(targetSlug);

    // Filter current collection by any frontmatter field that references exactly normalizedTarget
    const items = await getCollection(collectionName);
    return items.filter((item) => {
      for (const key in item.data) {
        const value = toArray(item.data[key]);
        if (value.map(normalizeRef).includes(normalizedTarget)) {
          return true;
        }
      }
      return false;
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4) Existing "related" branch ──────────────────────────────────────────
  if (queryType === "related" || queryType === `related${collectionName}`) {
    // Check if we're on a collection root (e.g. "/services")
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) {
      const parentCollectionName = segments[0];

      // 1. Gather direct references from each parent's frontmatter:
      const parentItems = await getCollection(parentCollectionName);
      let directRefs: any[] = [];
      parentItems.forEach((item) => {
        const refs = toArray(item.data[collectionName] || []);
        directRefs.push(...refs);
      });
      const resolvedDirect =
        directRefs.length > 0 ? await getEntries(directRefs) : [];

      // 2. Gather reverse relationships from the target collection:
      const targetItems = await getCollection(collectionName);
      const parentSlugs = parentItems.map((item) => normalizeRef(item.slug));
      const reverseMatches = targetItems.filter((item) => {
        const field = toArray(item.data[parentCollectionName] || []);
        return field.some((ref) => parentSlugs.includes(normalizeRef(ref)));
      });

      // 3. Combine direct and reverse results:
      let combined = [...resolvedDirect, ...reverseMatches];

      // 4. If no results yet, perform an indirect lookup:
      if (combined.length === 0) {
        let indirectRelated: any[] = [];
        const intermediateCollectionNames = Object.keys(collections).filter(
          (c) => c !== parentCollectionName && c !== collectionName
        );
        for (const interColl of intermediateCollectionNames) {
          const intermediateItems = await getCollection(interColl);
          const relatedIntermediate = intermediateItems.filter((item) => {
            for (const key in item.data) {
              const value = toArray(item.data[key]);
              if (
                value
                  .map(normalizeRef)
                  .some((ref) => parentSlugs.includes(ref))
              ) {
                return true;
              }
            }
            return false;
          });
          for (const intermediate of relatedIntermediate) {
            if (intermediate.data && intermediate.data[collectionName]) {
              const potentialIndirectRefs = toArray(
                intermediate.data[collectionName]
              );
              const resolvedIndirect = await getEntries(potentialIndirectRefs);
              if (resolvedIndirect.length > 0) {
                indirectRelated.push(...resolvedIndirect);
              }
            }
          }
        }
        combined = [...combined, ...indirectRelated];
      }

      // Deduplicate results.
      const unique = combined.reduce((acc, item) => {
        if (!acc.some((existing) => existing.slug === item.slug)) {
          acc.push(item);
        }
        return acc;
      }, []);
      return unique;
    }

    // Fallback for individual pages.
    let parentEntry = null;
    try {
      parentEntry = await getEntry(routeCollectionName, slug);
    } catch (e) {
      // fallback to reverse lookup if needed
    }
    if (parentEntry) {
      const potentialRefs = parentEntry.data[collectionName];
      const refArray = toArray(potentialRefs);
      if (refArray.length > 0) {
        const resolved = await getEntries(refArray);
        if (resolved.length > 0) return resolved;
      }
    }
    const directRelated = await relatedItems(collectionName, slug);
    if (directRelated.length > 0) {
      return directRelated;
    }
    let indirectRelated: any[] = [];
    if (parentEntry) {
      const intermediateCollectionNames = Object.keys(collections).filter(
        (c) => c !== routeCollectionName && c !== collectionName
      );
      for (const interColl of intermediateCollectionNames) {
        const intermediateItems = await getCollection(interColl);
        const relatedIntermediate = intermediateItems.filter((item) => {
          for (const key in item.data) {
            const value = toArray(item.data[key]);
            if (value.map(normalizeRef).includes(slug)) return true;
          }
          return false;
        });
        for (const intermediate of relatedIntermediate) {
          if (intermediate.data && intermediate.data[collectionName]) {
            const potentialIndirectRefs = toArray(
              intermediate.data[collectionName]
            );
            const resolvedIndirect = await getEntries(potentialIndirectRefs);
            if (resolvedIndirect.length > 0) {
              indirectRelated.push(...resolvedIndirect);
            }
          }
        }
      }
    }
    const uniqueIndirect = indirectRelated.reduce((acc, item) => {
      if (!acc.some((existing) => existing.slug === item.slug)) {
        acc.push(item);
      }
      return acc;
    }, []);
    return uniqueIndirect;
  }

  // ────────────────────────────────────────────────────────────────────────
  // 5) "parent" ────────────────────────────────────────────────────────────
  if (queryType === "parent" || queryType === `parent${collectionName}`) {
    const parent = await getParentItem(collectionName, slug);
    return parent ? [parent] : [];
  }

  // ────────────────────────────────────────────────────────────────────────
  // 6) "children" ──────────────────────────────────────────────────────────
  if (queryType === "children" || queryType === `children${collectionName}`) {
    return await getChildrenItems(collectionName, slug);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 7) "sibling" ────────────────────────────────────────────────────────────
  if (queryType === "sibling" || queryType === `sibling${collectionName}`) {
    return await getSiblingItems(collectionName, slug);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 8) Tag‐based fallback ───────────────────────────────────────────────────
  //    Treat queryType as a tag if no other branch matched.
  const items = await getCollection(collectionName);
  const filteredItems = items.filter((item) => {
    const tags = item.data.tags || [];
    return (
      Array.isArray(tags) &&
      tags
        .map((t: string) => t.toLowerCase())
        .includes(queryType.toLowerCase())
    );
  });
  return filteredItems;
}


/**
 * getParentItem(collectionName, currentSlug)
 * ─────────────────────────────────────────────────────────────────────────
 * Retrieves the parent item (if any) for the current item in the same collection.
 */
export async function getParentItem(
  collectionName: string,
  currentSlug: string
) {
  try {
    const currentItem = await getEntry(collectionName, currentSlug);
    if (!currentItem || !currentItem.data.parent) return null;
    const parentRef = currentItem.data.parent;
    const parentSlug = normalizeRef(parentRef);
    return await getEntry(collectionName, parentSlug);
  } catch (error) {
    return null;
  }
}

/**
 * getChildrenItems(collectionName, currentSlug)
 * ─────────────────────────────────────────────────────────────────────────
 * Retrieves all items whose normalized parent reference matches the normalized current item's slug.
 */
export async function getChildrenItems(
  collectionName: string,
  currentSlug: string
) {
  const items = await getCollection(collectionName);
  const normalizedCurrentSlug = normalizeRef(currentSlug);
  return items.filter((item) => {
    if (!item.data.parent) return false;
    const parentSlug = normalizeRef(item.data.parent);
    return parentSlug === normalizedCurrentSlug;
  });
}

/**
 * getSiblingItems(collectionName, currentSlug)
 * ─────────────────────────────────────────────────────────────────────────
 * Retrieves sibling items that share the same normalized parent as the current item.
 */
export async function getSiblingItems(
  collectionName: string,
  currentSlug: string
) {
  const currentItem = await getEntry(collectionName, currentSlug);
  if (!currentItem) return [];
  const normalizedCurrentSlug = normalizeRef(currentSlug);
  const parentRef = currentItem.data.parent;
  const items = await getCollection(collectionName);

  if (parentRef) {
    const normalizedParent = normalizeRef(parentRef);
    return items.filter((item) => {
      if (normalizeRef(item.slug) === normalizedCurrentSlug) return false;
      if (!item.data.parent) return false;
      return normalizeRef(item.data.parent) === normalizedParent;
    });
  } else {
    // If no parent, siblings are those with no parent (excluding itself)
    return items.filter(
      (item) =>
        normalizeRef(item.slug) !== normalizedCurrentSlug && !item.data.parent
    );
  }
}

/**
 * parseRouteCollection(pathname)
 * ─────────────────────────────────────────────────────────────────────────
 * Splits the pathname (e.g. "/services/seo") into:
 *   • routeCollectionName = "services"
 *   • slug                = "seo"
 */
function parseRouteCollection(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return {
    routeCollectionName: segments[0] || "",
    slug: segments[segments.length - 1] || "",
  };
}

/**
 * getAllItems(collectionName)
 * ─────────────────────────────────────────────────────────────────────────
 * Returns every entry in the given collection.
 */
export async function getAllItems(collectionName: string) {
  return await getCollection(collectionName);
}

/**
 * relatedItems(collectionName, currentEntryId)
 * ─────────────────────────────────────────────────────────────────────────
 * Finds items in `collectionName` that reference `currentEntryId` in their frontmatter.
 */
export async function relatedItems(
  collectionName: string,
  currentEntryId: string
) {
  const items = await getCollection(collectionName);
  return items.filter((item) => {
    for (const key in item.data) {
      const value = item.data[key];
      if (typeof value === "string" && normalizeRef(value) === currentEntryId)
        return true;
      if (
        Array.isArray(value) &&
        value.map(normalizeRef).includes(currentEntryId)
      )
        return true;
    }
    return false;
  });
}
