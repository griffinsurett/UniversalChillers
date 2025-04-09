// src/utils/MenuUtils.ts

/**
 * getEffectiveMenuItemClass
 *
 * Returns the appropriate class string for a menu item based on its depth:
 * - For primary items (depth 0), it returns menuItem.class (if defined).
 * - For submenu items (depth > 0), it returns submenuItem.class (if defined), or an empty string.
 *
 * @param depth - The nesting depth of the menu item.
 * @param menuItem - The main menu item settings.
 * @param submenuItem - The submenu item settings.
 * @returns The effective CSS class.
 */
export function getEffectiveMenuItemClass(
  depth: number,
  menuItem: any,
  submenuItem: any
): string {
  if (depth > 0) {
    return submenuItem && submenuItem.class ? submenuItem.class : "";
  } else {
    return menuItem && menuItem.class ? menuItem.class : "";
  }
}

export function hasSubMenuItems(item: any, isHierarchical: boolean = true): boolean {
    return isHierarchical && Array.isArray(item.children) && item.children.length > 0;
  }
  