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

  if (queryType === "getAll" || queryType === `getAll${collectionName}`) {
    return await getAllItems(collectionName);
  }

  if (queryType === "related" || queryType === `related${collectionName}`) {
    // Check if we're on a collection root (e.g. "/services")
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) {
      const parentCollectionName = segments[0];

      // 1. Gather direct references from each parent's frontmatter:
      const parentItems = await getCollection(parentCollectionName);
      let directRefs: any[] = [];
      parentItems.forEach((item) => {
        // For a given target collection (e.g. "testimonials"), 
        // try to read a field with that key from the parent.
        const refs = toArray(item.data[collectionName] || []);
        directRefs.push(...refs);
      });
      const resolvedDirect = directRefs.length > 0 ? await getEntries(directRefs) : [];

      // 2. Gather reverse relationships from the target collection:
      const targetItems = await getCollection(collectionName);
      const parentSlugs = parentItems.map(item => normalizeRef(item.slug));
      const reverseMatches = targetItems.filter(item => {
        // Assume reverse relation field uses the parent's collection name.
        const field = toArray(item.data[parentCollectionName] || []);
        return field.some(ref => parentSlugs.includes(normalizeRef(ref)));
      });

      // 3. Combine direct and reverse results:
      let combined = [...resolvedDirect, ...reverseMatches];
      
      // 4. If no results yet, perform an indirect lookup across intermediate collections:
      if (combined.length === 0) {
        let indirectRelated: any[] = [];
        // Loop through all collections except the parent and target collections.
        const intermediateCollectionNames = Object.keys(collections).filter(
          (c) => c !== parentCollectionName && c !== collectionName
        );
        for (const interColl of intermediateCollectionNames) {
          const intermediateItems = await getCollection(interColl);
          // Find intermediate items that reference any parent item
          const relatedIntermediate = intermediateItems.filter(item => {
            for (const key in item.data) {
              const value = toArray(item.data[key]);
              if (value.map(normalizeRef).some(ref => parentSlugs.includes(ref))) {
                return true;
              }
            }
            return false;
          });
          // For each intermediate item, if it has a field for the target collection, resolve it.
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

      // Deduplicate the combined array based on a unique key (e.g., slug)
      const unique = combined.reduce((acc, item) => {
        if (!acc.some(existing => existing.slug === item.slug)) {
          acc.push(item);
        }
        return acc;
      }, []);
      return unique;
    }

    // Fallback for individual (non-root) pages remains unchanged:
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
    // Indirect lookup for individual pages:
    let indirectRelated: any[] = [];
    if (parentEntry) {
      const intermediateCollectionNames = Object.keys(collections).filter(
        (c) => c !== routeCollectionName && c !== collectionName
      );
      for (const interColl of intermediateCollectionNames) {
        const intermediateItems = await getCollection(interColl);
        const relatedIntermediate = intermediateItems.filter(item => {
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
      if (!acc.some(existing => existing.slug === item.slug)) {
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

  return [];
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