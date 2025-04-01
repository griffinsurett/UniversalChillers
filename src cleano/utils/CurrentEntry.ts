// src/utils/CurrentEntry.ts
import type { AstroGlobal } from 'astro';

/**
 * getCurrentEntryId(Astro: AstroGlobal): string
 *
 * This tries to derive the "slug" or unique ID for the current page.
 * 1. If Astro.props.collection.slug is available, we use that.
 * 2. Otherwise, we parse the URL pathname to get the final segment.
 *    e.g. "/projects/business-landing" => "business-landing"
 */
export function getCurrentEntryId(Astro: AstroGlobal): string {
  if (Astro.props && Astro.props.collection && Astro.props.collection.slug) {
    return Astro.props.collection.slug;
  }
  const segments = Astro.url.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}
