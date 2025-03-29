export function hasSubMenuItems(item: any, isHierarchical: boolean = true): boolean {
    return isHierarchical && Array.isArray(item.children) && item.children.length > 0;
  }
  