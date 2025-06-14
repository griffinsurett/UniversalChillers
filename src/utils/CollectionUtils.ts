// src/utils/CollectionUtils.ts
// Centralized helper to retrieve all collection names without causing circular dependencies.

/**
 * Returns the list of all collection names by scanning content folders via Vite's glob.
 * Uses import.meta.glob, which is static-analyzed at build time and works both Dev & Prod.
 */
export function getCollectionNames(): string[] {
  // Glob all meta files in content directories
  const metaModules = import.meta.glob('../content/*/_meta.*', { eager: true });
  // Extract the directory name between 'content/' and the '/_meta'
  return Object.keys(metaModules).map((filePath) => {
    // filePath example: '/src/content/services/_meta.mdx'
    const segments = filePath.split('/');
    const contentIndex = segments.findIndex((seg) => seg === 'content');
    return segments[contentIndex + 1];
  });
}
