// src/utils/ButtonVisibilityUtils.ts
import { capitalize } from "./ContentUtils";

/**
 * Determines if an individual content item should show its button.
 * For items, we simply check if the item’s frontmatter hasPage is not explicitly false.
 *
 * @param item - A content item with a frontmatter property "hasPage"
 * @returns true if the button should be shown, false otherwise.
 */
export function shouldShowItemButton(item: { data: { hasPage?: boolean } }): boolean {
  return item.data.hasPage !== false;
}

/**
 * Determines if a Section should display a "View All" button.
 * It mirrors the logic used for collection root routes.
 *
 * @param collectionName - The collection name (e.g., "services")
 * @param metaHasPage - The hasPage value from the collection’s meta (defaults to false if not set)
 * @param currentPath - The current URL pathname (e.g., Astro.url.pathname)
 * @param buttonOverride - Optional override object that may contain an explicit ifButton boolean
 * @returns true if the button should be shown, false otherwise.
 */
export function shouldShowSectionButton(
  collectionName: string,
  metaHasPage: boolean,
  currentPath: string,
  buttonOverride?: { ifButton?: boolean }
): boolean {
  const isCollectionRootPage =
    currentPath === `/${collectionName}` || currentPath === `/${collectionName}/`;

  // If a manual button override is provided, use it directly.
  if (buttonOverride && buttonOverride.ifButton !== undefined) {
    return buttonOverride.ifButton;
  }

  // Otherwise, show the button if the meta indicates a page exists
  // and the current route is not the collection root.
  return metaHasPage && !isCollectionRootPage;
}

/**
 * Generates a default button text based on the collection name.
 *
 * @param collectionName - The name of the collection
 * @returns A default "View All" button text.
 */
export function getDefaultButtonText(collectionName: string): string {
  return `View All ${capitalize(collectionName)}`;
}
