// src/utils/ContentUtils.ts
export function normalizeRef(ref: any): string {
    if (typeof ref === 'string') {
      return ref.trim().replace(/,$/, '');
    } else if (typeof ref === 'object' && ref !== null) {
      if (ref.slug) {
        return ref.slug.trim().replace(/,$/, '');
      }
      if (ref.id) {
        return ref.id.trim().replace(/,$/, '');
      }
    }
    return '';
  }

  // NEW HELPER: normalizePath
// Removes trailing slashes (except for the root "/") to ensure consistent comparisons.
export function normalizePath(path: string): string {
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
}
  
  export function toArray(refOrArray: any): any[] {
    if (!refOrArray) return [];
    return Array.isArray(refOrArray) ? refOrArray : [refOrArray];
  }
  
  // NEW HELPER FOR CAPITALIZATION
  export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  