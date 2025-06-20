// src/utils/CurrentEntry.ts
import type { AstroGlobal } from 'astro';
import { getItemKey } from '@/utils/getItemKey.js';

/**
 * Derive the current entry’s stable key (slug or id). Falls back to the
 * last path segment if no entry object is provided.
 */
export function getCurrentEntryId(Astro: AstroGlobal): string {
  // 1️⃣ If we have an `entry` prop, use our helper to extract slug|id
  if (Astro.props?.entry) {
    const key = getItemKey(Astro.props.entry);
    if (key) return key;
  }

  // 2️⃣ Otherwise, fall back to the URL’s last segment
  const segs = Astro.url.pathname.split('/').filter(Boolean);
  return segs[segs.length - 1] || '';
}
