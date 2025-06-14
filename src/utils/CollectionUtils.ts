// src/utils/CollectionUtils.ts
// Centralized helper to retrieve all collection names without causing circular dependencies.

// src/utils/CollectionUtils.ts
// Centralized helper to retrieve all collection names without causing circular dependencies.

/**
 * Returns the list of all collection names defined in content/config.ts.
 * Imports config dynamically to avoid circular dependencies at build time.
 */
export async function getCollectionNames(): Promise<string[]> {
  const cfg = await import('../content/config');
  return Object.keys(cfg.collections);
}
