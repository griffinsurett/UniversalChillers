// src/utils/buildHierarchy.ts
export function buildHierarchy(items: any[]): any[] {
    const lookup: Record<string, any> = {};
    const roots: any[] = [];
  
    // First, map each item by its slug and prepare an empty children array
    items.forEach(item => {
      lookup[item.slug] = { ...item, children: [] };
    });
  
    // Then, iterate over the items and nest them according to their "parent" field
    items.forEach(item => {
      // Assume that parent is either a string (the parent's slug) or an object with a slug property
      const parentRef = item.data.parent;
      if (parentRef) {
        const parentSlug = typeof parentRef === "string" ? parentRef : parentRef.slug;
        if (lookup[parentSlug]) {
          lookup[parentSlug].children.push(lookup[item.slug]);
        } else {
          // If parent not found in our lookup, treat this item as a root
          roots.push(lookup[item.slug]);
        }
      } else {
        // No parent means it's a root item
        roots.push(lookup[item.slug]);
      }
    });
  
    return roots;
  }
  