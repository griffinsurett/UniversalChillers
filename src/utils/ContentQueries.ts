// src/utils/ContentQueries.ts
import { z } from "zod";
import { capitalize } from "./ContentUtils";
import { getCollection } from "astro:content";
import { QueryItemSchema, type QueryItem, collections } from "@/content/config";

export interface QueryItemTree extends QueryItem {
  slug: any;
  children?: QueryItemTree[];
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, "");
}

function findQueryItem(tree: QueryItemTree[], id: string): QueryItemTree | null {
  for (const item of tree) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findQueryItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * findQueryItemBySlug
 * 
 * Enhanced so that it matches either the entire normalized slug (e.g. "services/seo")
 * OR the final segment (e.g. "seo").
 */
function findQueryItemBySlug(tree: QueryItemTree[], parentSlug: string): QueryItemTree | null {
  const normalizedParent = normalizeSlug(parentSlug);
  for (const item of tree) {
    if (item.slug) {
      const normalizedSlug = normalizeSlug(item.slug);

      // 1) Direct match on the entire normalized slug
      if (normalizedSlug === normalizedParent) return item;

      // 2) Or match on the final segment
      const segments = normalizedSlug.split("/");
      const finalSegment = segments[segments.length - 1];
      if (finalSegment === normalizedParent) return item;
    }
    if (item.children) {
      const found = findQueryItemBySlug(item.children, parentSlug);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Attempts to insert an item into the tree.
 * Returns true if the item was inserted (or if it doesn't require a parent),
 * false if its parent was not found yet.
 */
function tryInsertItem(tree: QueryItemTree[], item: QueryItemTree): boolean {
  if (item.parent) {
    let parentItem = findQueryItem(tree, item.parent) || findQueryItemBySlug(tree, item.parent);
    if (parentItem) {
      parentItem.children = parentItem.children || [];
      if (item.position === "prepend") {
        parentItem.children.unshift(item);
      } else {
        parentItem.children.push(item);
      }
      return true;
    } else {
      // Parent not found in this pass
      return false;
    }
  } else {
    // No parent => insert at root
    if (item.position === "prepend") {
      tree.unshift(item);
    } else {
      tree.push(item);
    }
    return true;
  }
}

/**
 * Iteratively builds a tree from a flat list of dynamic query items.
 * Items that can't be inserted because their parent hasn't been processed yet are retried.
 */
function buildDynamicTree(flatItems: QueryItem[]): QueryItemTree[] {
  // First, parse items and assign default labels plus an empty children array.
  const items: QueryItemTree[] = flatItems.map((rawItem) => {
    const item = QueryItemSchema.parse(rawItem);
    const finalLabel =
      item.label || (item.slug ? capitalize(normalizeSlug(item.slug)) : capitalize(item.id));
    return { ...item, label: finalLabel, children: [] };
  });

  // Build a lookup table keyed by item.id (or use item.slug if preferable)
  const lookup: Record<string, QueryItemTree> = {};
  items.forEach((item) => {
    lookup[item.id] = item;
  });

  // Initialize the tree array.
  const tree: QueryItemTree[] = [];

  // Iterate over all items.
  items.forEach((item) => {
    if (item.parent) {
      // Try to find the parent from our lookup (or via slug matching).
      const parentItem = lookup[item.parent] || findQueryItemBySlug(tree, item.parent);
      if (parentItem) {
        parentItem.children.push(item);
      } else {
        // If a parent is explicitly set but not found, optionally log a warning.
        // For now, insert it as a root so it doesn't get dropped.
        tree.push(item);
      }
    } else {
      // If no parent is specified, insert as root.
      tree.push(item);
    }
  });

  return tree;
}

/**
 * addToQuery
 *
 * Merges new query items into an existing tree.
 */
export function addToQuery(existingQuery: QueryItemTree[], newItems: QueryItem[]): QueryItemTree[] {
  const flatItems = [...existingQuery, ...newItems];
  return buildDynamicTree(flatItems);
}

/**
 * buildContentQueries
 *
 * Merges dynamic query items (from _meta.json and MDX items) into static base queries.
 */
export async function buildContentQueries(
  baseQueries: { [key: string]: QueryItemTree[] }
): Promise<{ [key: string]: QueryItemTree[] }> {
  const dynamicQueries = await gatherDynamicQueries();
  for (const key in dynamicQueries) {
    const base = baseQueries[key] || [];
    const flatDynamic = dynamicQueries[key];
    baseQueries[key] = buildDynamicTree([...base, ...flatDynamic]);
  }
  return baseQueries;
}

/**
 * gatherDynamicQueries
 *
 * Gathers a flat list of query items from each collection's _meta.json and MDX items.
 * If an item has no slug, we auto-assign one. If it has no label, we also auto-assign it.
 */
export async function gatherDynamicQueries(): Promise<{ [key: string]: QueryItem[] }> {
  const dynamicQueries: { [key: string]: QueryItem[] } = {};
  const collectionsList = Object.keys(collections);
  
  for (const collName of collectionsList) {
    // Try to load meta from MDX, then MD, then JSON
    let meta = {};
    try {
      const mdxModule = await import(`../content/${collName}/_meta.mdx`);
      meta = mdxModule.frontmatter ?? {};
    } catch (e1) {
      try {
        const mdModule = await import(`../content/${collName}/_meta.md`);
        meta = mdModule.frontmatter ?? {};
      } catch (e2) {
        try {
          const jsonModule = await import(`../content/${collName}/_meta.json`);
          meta = jsonModule.default ?? {};
        } catch (e3) {
          meta = {};
        }
      }
    }
    
    // Process existing addToQuery entries from meta
    if (meta && meta.addToQuery) {
      meta.addToQuery.forEach((item: QueryItem) => {
        if (!item.slug) {
          item.slug = `/${collName}`;
        }
        if (!item.label) {
          item.label = capitalize(normalizeSlug(item.slug));
        }
        const queryId = item.id;
        if (!dynamicQueries[queryId]) dynamicQueries[queryId] = [];
        dynamicQueries[queryId].push(item);
      });
    }
    
    // Process each content entry's addToQuery
    const items = await getCollection(collName);
    items.forEach((item) => {
      if ("addToQuery" in item.data && item.data.addToQuery) {
        item.data.addToQuery.forEach((q: QueryItem) => {
          const queryId = q.id;
          if (!dynamicQueries[queryId]) dynamicQueries[queryId] = [];
          if (!q.slug) {
            q.slug = `/${collName}/${item.slug}`;
          }
          if (!q.label) {
            const prefix = `/${collName}/`;
            if (q.slug.startsWith(prefix)) {
              q.label = capitalize(q.slug.slice(prefix.length));
            } else {
              q.label = capitalize(normalizeSlug(q.slug));
            }
          }
          dynamicQueries[queryId].push(q);
        });
      }
    });
    
    // Process addItemsToQuery: for each defined entry, iterate over all collection items
    if (meta && meta.addItemsToQuery) {
      meta.addItemsToQuery.forEach((item: QueryItem) => {
        const queryId = item.id;
        if (!dynamicQueries[queryId]) dynamicQueries[queryId] = [];
        // For every content item in the collection, add a new query entry
        items.forEach((contentItem) => {
          const newQuery: QueryItem = {
            ...item,
            slug: `/${collName}/${contentItem.slug}`,
            label: contentItem.data.title || contentItem.slug || "Item",
          };
          dynamicQueries[queryId].push(newQuery);
        });
      });
    }
  }
  
  return dynamicQueries;
}