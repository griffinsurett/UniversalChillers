// src/utils/CollectionQueryUtils.ts
import { getCollection, getEntry, getEntries } from "astro:content";
import { normalizeRef, toArray } from "./ContentUtils";
import { collections } from "@/content/config";
import { getItemKey } from "./getItemKey";

/**
 * queryItems(queryType, collectionName, pathname)
 *
 * Supports the following query formats:
 *   • "getAll" or `getAll${collectionName}`
 *   • "related" or `related${collectionName}`
 *   • "parent" or `parent${collectionName}`
 *   • "children" or `children${collectionName}`
 *   • "sibling" or `sibling${collectionName}`
 *   • "relatedType:<TargetCollection>"
 *   • "relatedItem:<TargetCollection>:<TargetSlug>"
 *   • "parentItem:<Collection>:<Slug>"
 *   • "childrenItem:<Collection>:<Slug>"
 *   • "siblingItem:<Collection>:<Slug>"
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
  // 0a) "parentItem:<Collection>:<Slug>" ──────────────────────────────────
  if (queryType.startsWith("parentItem:")) {
    const parts = queryType.split(":"); // ["parentItem","Collection","Slug"]
    if (parts.length !== 3) {
      throw new Error(
        `Invalid parentItem syntax. Use "parentItem:<Collection>:<Slug>", got "${queryType}".`
      );
    }
    const coll = parts[1];
    const targetSlug = parts[2];
    const parent = await getParentItem(coll, targetSlug);
    return parent ? [parent] : [];
  }

  // ────────────────────────────────────────────────────────────────────────
  // 0b) "childrenItem:<Collection>:<Slug>" ────────────────────────────────
  if (queryType.startsWith("childrenItem:")) {
    const parts = queryType.split(":"); // ["childrenItem","Collection","Slug"]
    if (parts.length !== 3) {
      throw new Error(
        `Invalid childrenItem syntax. Use "childrenItem:<Collection>:<Slug>", got "${queryType}".`
      );
    }
    const coll = parts[1];
    const targetSlug = parts[2];
    return await getChildrenItems(coll, targetSlug);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 0c) "siblingItem:<Collection>:<Slug>" ─────────────────────────────────
  if (queryType.startsWith("siblingItem:")) {
    const parts = queryType.split(":"); // ["siblingItem","Collection","Slug"]
    if (parts.length !== 3) {
      throw new Error(
        `Invalid siblingItem syntax. Use "siblingItem:<Collection>:<Slug>", got "${queryType}".`
      );
    }
    const coll = parts[1];
    const targetSlug = parts[2];
    return await getSiblingItems(coll, targetSlug);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 1) "getAll" ────────────────────────────────────────────────────────────
  if (queryType === "getAll" || queryType === `getAll${collectionName}`) {
    return await getAllItems(collectionName);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 2) "relatedType:<TargetCollection>" ──────────────────────────────────
  if (queryType.startsWith("relatedType:")) {
    const parts = queryType.split(":"); // ["relatedType","TargetCollection"]
    if (parts.length !== 2) {
      throw new Error(
        `Invalid relatedType syntax. Use "relatedType:<TargetCollection>", got "${queryType}".`
      );
    }
    const targetCollection = parts[1];
    const targetItems = await getCollection(targetCollection);
    const targetSlugs = targetItems.map((item) => normalizeRef(item.slug));

    const items = await getCollection(collectionName);
    return items.filter((item) =>
      Object.values(item.data)
        .flatMap(toArray)
        .map(normalizeRef)
        .some((ref) => targetSlugs.includes(ref))
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // 0d) "roots" or "roots{Collection}" ────────────────────────────────────
  if (queryType === "roots" || queryType === `roots${collectionName}`) {
    const all = await getCollection(collectionName);
    return all.filter((item) => !item.data.parent);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 3) "relatedItem:<TargetCollection>:<TargetSlug>" ───────────────────────
  if (queryType.startsWith("relatedItem:")) {
    const parts = queryType.split(":"); // ["relatedItem","TargetCollection","TargetSlug"]
    if (parts.length !== 3) {
      throw new Error(
        `Invalid relatedItem syntax. Use "relatedItem:<TargetCollection>:<TargetSlug>", got "${queryType}".`
      );
    }
    const targetCollection = parts[1];
    const targetSlug = parts[2];
    const normalizedTarget = normalizeRef(targetSlug);

    const items = await getCollection(collectionName);
    return items.filter((item) =>
      Object.values(item.data)
        .flatMap(toArray)
        .map(normalizeRef)
        .includes(normalizedTarget)
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4) Existing "related" branch ──────────────────────────────────────────
  if (queryType === "related" || queryType === `related${collectionName}`) {
    const segments = pathname.split("/").filter(Boolean);

    // Collection root (`/services`)
    if (segments.length === 1) {
      const parentCollectionName = segments[0];

      // 4a) direct frontmatter refs
      const parentItems = await getCollection(parentCollectionName);
      let directRefs: any[] = [];
      parentItems.forEach((item) => {
        directRefs.push(...toArray(item.data[collectionName]));
      });
      const resolvedDirect =
        directRefs.length > 0 ? await getEntries(directRefs) : [];

      // 4b) reverse refs
      const targetItems = await getCollection(collectionName);
      const parentSlugs = parentItems.map((i) => normalizeRef(i.slug));
      const reverseMatches = targetItems.filter((item) =>
        toArray(item.data[parentCollectionName])
          .map(normalizeRef)
          .some((ref) => parentSlugs.includes(ref))
      );

      let combined = [...resolvedDirect, ...reverseMatches];

      // 4c) indirect via other collections
      if (combined.length === 0) {
        for (const interColl of Object.keys(collections)) {
          if (
            interColl === parentCollectionName ||
            interColl === collectionName
          )
            continue;
          const intermediates = await getCollection(interColl);
          const relatedIntermediate = intermediates.filter((item) =>
            Object.values(item.data)
              .flatMap(toArray)
              .map(normalizeRef)
              .some((ref) => parentSlugs.includes(ref))
          );
          for (const intermediate of relatedIntermediate) {
            const refs = toArray(intermediate.data[collectionName]);
            if (refs.length) {
              const resolved = await getEntries(refs);
              combined.push(...resolved);
            }
          }
        }
      }

      // dedupe
      return Array.from(
        combined
          .reduce((map, it) => map.set(getItemKey(it), it), new Map())
          .values()
      );
    }

    // Individual page (`/services/roof-repair`)
    let parentEntry = null;
    try {
      parentEntry = await getEntry(routeCollectionName, slug);
    } catch {}
    if (parentEntry) {
      const refs = toArray(parentEntry.data[collectionName]);
      if (refs.length) {
        const resolved = await getEntries(refs);
        if (resolved.length) return resolved;
      }
    }

    const directRelated = await relatedItems(collectionName, slug);
    if (directRelated.length) return directRelated;

    // indirect fallback
    let indirectRelated: any[] = [];
    if (parentEntry) {
      for (const interColl of Object.keys(collections)) {
        if (interColl === routeCollectionName || interColl === collectionName)
          continue;
        const intermediates = await getCollection(interColl);
        const relatedIntermediate = intermediates.filter((item) =>
          Object.values(item.data)
            .flatMap(toArray)
            .map(normalizeRef)
            .includes(slug)
        );
        for (const intermediate of relatedIntermediate) {
          const refs = toArray(intermediate.data[collectionName]);
          if (refs.length) {
            const resolved = await getEntries(refs);
            indirectRelated.push(...resolved);
          }
        }
      }
    }

    return Array.from(
      indirectRelated
        .reduce((map, it) => map.set(it.slug, it), new Map())
        .values()
    );
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
  const items = await getCollection(collectionName);
  return items.filter((item) => {
    const tags = item.data.tags || [];
    return (
      Array.isArray(tags) &&
      tags.map((t: string) => t.toLowerCase()).includes(queryType.toLowerCase())
    );
  });
}

/**
 * getParentItem(collectionName, currentSlug)
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
    const parentKey = normalizeRef(parentRef);
    const parentEntry = await getEntry(collectionName, parentKey);
    return parentEntry;
  } catch {
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
  const key = currentSlug; // already a slug/id
  return items.filter((item) => {
    const parent = item.data.parent;
    if (!parent) return false;
    // normalizeRef(parent) still handles strings/objects
    return normalizeRef(parent) === key;
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
  const currentKey = currentSlug;
  const currentItem = await getEntry(collectionName, currentKey);
  if (!currentItem) return [];
  const items = await getCollection(collectionName);
  const parentRef = currentItem.data.parent;
  if (parentRef) {
    const normalizedParent = normalizeRef(parentRef);
    return items.filter((item) => {
      // drop self
      if (getItemKey(item) === currentKey) return false;
      // must have same parent
      return normalizeRef(item.data.parent) === normalizedParent;
    });
  } else {
    // top‐level siblings: no parent, exclude itself
    return items.filter(
      (item) => getItemKey(item) !== currentKey && !item.data.parent
    );
  }
}

/**
 * relatedItems(collectionName, currentEntryId)
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

/**
 * getAllItems(collectionName)
 * Returns every entry in the given collection.
 */
export async function getAllItems(collectionName: string) {
  return await getCollection(collectionName);
}

/**
 * parseRouteCollection(pathname)
 * Splits the pathname (e.g. "/services/seo") into collectionName + slug.
 */
function parseRouteCollection(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return {
    routeCollectionName: segments[0] || "",
    slug: segments[segments.length - 1] || "",
  };
}
