// src/utils/QueryUtils.ts
import { getCollection, getEntry, getEntries } from 'astro:content';
import { normalizeRef, toArray } from './ContentUtils';

/**
 * getAllItems(collectionName)
 * - fetch ALL items in a collection
 */
export async function getAllItems(collectionName: string) {
  return await getCollection(collectionName);
}

/**
 * relatedItems(collectionName, currentEntryId)
 * - finds items referencing the 'currentEntryId' in their frontmatter
 */
export async function relatedItems(collectionName: string, currentEntryId: string) {
  const items = await getCollection(collectionName);
  // directRelated: any item whose fields reference `currentEntryId`
  const directRelated = items.filter((item) => {
    for (const key in item.data) {
      const value = item.data[key];
      // If it's a string or array referencing the ID, it's "related"
      if (typeof value === 'string' && normalizeRef(value) === currentEntryId) {
        return true;
      }
      if (Array.isArray(value) && value.map(normalizeRef).includes(currentEntryId)) {
        return true;
      }
    }
    return false;
  });
  return directRelated;
}

/**
 * parseRouteCollection(pathname)
 * - e.g. "/projects/business-landing" => { routeCollectionName: "projects", slug: "business-landing" }
 */
function parseRouteCollection(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return {
    routeCollectionName: segments[0] || '',
    slug: segments[segments.length - 1] || '',
  };
}

/**
 * queryItems(queryType, collectionName, pathname)
 * - The single "massive" function to handle all queries:
 *     1) parse route
 *     2) if "getAll", retrieve all items
 *     3) if "related", attempt direct references, or fallback to reverse lookup
 *     4) (future) other possible query types
 */
export async function queryItems(
  queryType: string, // or other
  collectionName: string,
  pathname: string
): Promise<any[]> {
  // 1) figure out the route collection & slug
  const { routeCollectionName, slug } = parseRouteCollection(pathname);

  // 2) handle queries
  if (queryType === 'getAll') {
    return await getAllItems(collectionName);
  }

  if (queryType === 'related') {
    // Attempt to load the "parent" entry for the route (services/my-service, projects/my-project, etc.)
    let parentEntry = null;
    try {
      parentEntry = await getEntry(routeCollectionName, slug);
    } catch (e) {
      // if not found, fallback to reverse
    }

    if (parentEntry) {
      // See if the parent directly references items in data[collectionName]
      const potentialRefs = parentEntry.data[collectionName];
      const refArray = toArray(potentialRefs);
      if (refArray.length > 0) {
        const resolved = await getEntries(refArray);
        if (resolved.length > 0) {
          return resolved;
        }
      }
      // otherwise do a reverse lookup
      return await relatedItems(collectionName, slug);
    } else {
      // If we can’t find the parent, just do a reverse lookup
      return await relatedItems(collectionName, slug);
    }
  }

  // 3) default fallback if no recognized query
  return [];
}