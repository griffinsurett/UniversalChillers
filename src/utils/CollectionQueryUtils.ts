import { getCollection, getEntry, getEntries } from "astro:content";
import { normalizeRef, toArray } from "./ContentUtils";
import { collections } from "../content/config";

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
    let parentEntry = null;
    try {
      parentEntry = await getEntry(routeCollectionName, slug);
    } catch (e) {
      // fallback to reverse lookup if needed
    }
    // First, try to use an explicit direct relationship defined on the current entry.
    if (parentEntry) {
      const potentialRefs = parentEntry.data[collectionName];
      const refArray = toArray(potentialRefs);
      if (refArray.length > 0) {
        const resolved = await getEntries(refArray);
        if (resolved.length > 0) return resolved;
      }
    }
    // Next, try the current direct lookup method.
    const directRelated = await relatedItems(collectionName, slug);
    if (directRelated.length > 0) {
      return directRelated;
    }
    // If no direct relationships are found, try an indirect (chain) lookup.
    let indirectRelated: any[] = [];
    if (parentEntry) {
      // Iterate over all intermediate collections (exclude the current route and target collection)
      const intermediateCollectionNames = Object.keys(collections).filter(
        (c) => c !== routeCollectionName && c !== collectionName
      );
      for (const interColl of intermediateCollectionNames) {
        // Fetch all items in the intermediate collection.
        const intermediateItems = await getCollection(interColl);
        // Find items that are related to the current item (i.e. at least one field references our slug).
        const relatedIntermediate = intermediateItems.filter(item => {
          for (const key in item.data) {
            const value = item.data[key];
            const arr = toArray(value);
            if (arr.map(normalizeRef).includes(slug)) return true;
          }
          return false;
        });
        // For each such intermediate item, check if it has a direct relationship with the target collection.
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
    // Remove duplicates based on a unique field (e.g., slug).
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

/**
 * parseRouteCollection(pathname)
 * Parses the pathname to extract the collection and slug.
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
 * Fetches all items in a collection.
 */
export async function getAllItems(collectionName: string) {
  return await getCollection(collectionName);
}

/**
 * relatedItems(collectionName, currentEntryId)
 * - Finds items that reference the given currentEntryId in their frontmatter.
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