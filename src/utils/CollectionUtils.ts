// src/utils/CollectionUtils.ts
// Centralized helper to retrieve all collection names without causing circular dependencies.

import { collections } from "@/content/config";

/**
 * Returns the list of all collection names defined in content/config.ts.
 */
export function getCollectionNames(): string[] {
  return Object.keys(collections);
}
