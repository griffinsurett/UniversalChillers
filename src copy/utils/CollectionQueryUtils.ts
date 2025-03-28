import { getCollection, getEntry, getEntries } from "astro:content";
import { normalizeRef, toArray } from "./ContentUtils";
import { collections } from "@/content/config";
/**
 * getParentItem(collectionName, currentSlug)
 * Retrieves the parent item (if any) for the current item.
 */
export async function getParentItem(
  collectionName: string,
  currentSlug: string
) {
  try {
    const currentItem = await getEntry(collectionName, currentSlug);
    if (!currentItem || !currentItem.data.parent) return null;
    const parentRef = currentItem.data.parent;
    // Normalize both the parent's reference and use it directly
    const parentSlug = normalizeRef(parentRef);
    return await getEntry(collectionName, parentSlug);
  } catch (error) {
    return null;
  }
}

/**
 * getChildrenItems(collectionName, currentSlug)
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
 * queryItems(queryType, collectionName, pathname)
 * Main function to handle different types of queries.
 * Supported types: getAll, related, parent, children, sibling.
 */
export async function queryItems(
  queryType: string,
  collectionName: string,
  pathname: string
): Promise<any[]> {
  const { routeCollectionName, slug } = parseRouteCollection(pathname);

  // Standard "getAll" query.
  if (queryType === "getAll" || queryType === `getAll${collectionName}`) {
    return await getAllItems(collectionName);
  }

  // "related" query handling.
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
              if (value.map(normalizeRef).some((ref) => parentSlugs.includes(ref))) {
                return true;
              }
            }
            return false;
          });
          for (const intermediate of relatedIntermediate) {
            if (intermediate.data && intermediate.data[collectionName]) {
              const potentialIndirectRefs = toArray(intermediate.data[collectionName]);
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
            const potentialIndirectRefs = toArray(intermediate.data[collectionName]);
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

  if (queryType === "parent" || queryType === `parent${collectionName}`) {
    const parent = await getParentItem(collectionName, slug);
    return parent ? [parent] : [];
  }

  if (queryType === "children" || queryType === `children${collectionName}`) {
    return await getChildrenItems(collectionName, slug);
  }

  if (queryType === "sibling" || queryType === `sibling${collectionName}`) {
    return await getSiblingItems(collectionName, slug);
  }

  // Tag query branch:
  // If none of the above keywords match, treat queryType as a tag.
  const items = await getCollection(collectionName);
  const filteredItems = items.filter((item) => {
    const tags = item.data.tags || [];
    return (
      Array.isArray(tags) &&
      tags.map((t: string) => t.toLowerCase()).includes(queryType.toLowerCase())
    );
  });
  return filteredItems;
}

// Helper: parseRouteCollection
function parseRouteCollection(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return {
    routeCollectionName: segments[0] || "",
    slug: segments[segments.length - 1] || "",
  };
}

export async function getAllItems(collectionName: string) {
  return await getCollection(collectionName);
}

/**
 * relatedItems(collectionName, currentEntryId)
 * Finds items that reference the given currentEntryId in their frontmatter.
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
