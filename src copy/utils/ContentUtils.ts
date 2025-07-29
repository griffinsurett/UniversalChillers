// src/utils/ContentUtils.ts
import { getItemKey } from "@/utils/getItemKey.js";

export function getCanonicalSlug(entry: any): string {
  const key = getItemKey(entry);
  if (!key) {
    throw new Error("Missing both slug and id for entry");
  }
  return key;
}

/**
 * Normalize any reference (string or object) to its bare ID/slug.
 */
export function normalizeRef(ref: any): string {
  if (typeof ref === "string") {
    return ref.trim().replace(/,$/, "");
  }

  if (ref && typeof ref === "object") {
    // centralize slug/id lookup
    const key = getItemKey(ref);
    return key.trim().replace(/,$/, "");
  }

  return "";
}

  export function normalizePath(path: string): string {
    // If the path is just "/", leave it as is.
    if (path === "/") return "/";
    // Remove any trailing slashes
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
  
  // NEW HELPER FOR UPPERCASE
export function uppercase(str: string): string {
  if (!str) return '';
  return str.toUpperCase();
}

// NEW HELPER: formatPhoneNumber
// Formats a phone number into the form "123-456-7890"
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}
