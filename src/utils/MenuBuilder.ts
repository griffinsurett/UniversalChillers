// src/utils/MenuBuilder.ts
import { getCollection, z } from "astro:content";
import { capitalize, normalizeRef } from "./ContentUtils";
import { getCollectionMeta } from "./FetchMeta";

import {
  AddToMenuFields,
  ItemsAddToMenuFields,
  MenuItemFields
} from "@/content/config";

/**
 * MENU BUILDER OVERVIEW
 *
 * 1. Fetch all static menuItems from `menuItems.json`.
 * 2. Read every collection’s _meta.mdx to gather:
 *      • one‑off “addToMenu” instructions  (each tied to a specific collection)
 *      • bulk “itemsAddToMenu” instructions (each tied to a specific collection)
 * 3. Expand bulk instructions: for each `itemsAddToMenu`, loop over all entries in that collection and create a menu item per entry.
 * 4. Expand one‑off instructions: auto‑fill `slug` = `"/<collectionName>"` and `title` = capitalized `<collectionName>` if either is missing.
 * 5. Combine (1) + (3) + (4) into one big flat list, then hand it off to `SiteMenu.astro`.
 */

// ─── STEP A: Get all static menu items from the “menuItems” collection ─────────

export async function getAllStaticMenuItems() {
  return await getCollection("menuItems");
}

// ─── STEP B: Gather one‑off and bulk instructions from each collection’s _meta.mdx ─

type OneOffRaw = z.infer<typeof AddToMenuFields>;
type BulkRaw   = z.infer<typeof ItemsAddToMenuFields>;

/** 
 * A single “addToMenu” instruction plus the collection it came from.
 * We attach `collectionName` so that we know where to default slug/title from.
 */
type OneOffWithContext = OneOffRaw & {
  collectionName: string;
};

/** 
 * A single “itemsAddToMenu” instruction plus the collection it came from.
 * We attach `collectionName` so that we know which entries to loop over.
 */
type BulkWithContext = BulkRaw & {
  collectionName: string;
};

async function gatherMenuInstructions(): Promise<{
  allOneOff: OneOffWithContext[];
  allBulk: BulkWithContext[];
}> {
  // We explicitly skip “menus” and “menuItems” themselves, since they aren’t injecting into any other menu.
  const contentCollections = [
    "services",
    "projects",
    "testimonials",
    "faq",
    "clients",
  ] as const;

  const allOneOff: OneOffWithContext[] = [];
  const allBulk:   BulkWithContext[]   = [];

  for (const collName of contentCollections) {
    let meta: any = {};
    try {
      meta = await getCollectionMeta(collName);
    } catch {
      meta = {};
    }

    // If this collection’s _meta.mdx has “addToMenu: [...]”
    if (meta.addToMenu) {
      (meta.addToMenu as OneOffRaw[]).forEach((rawInstr) => {
        // Attach the collectionName so we know how to default slug/title later
        allOneOff.push({ ...(rawInstr as OneOffRaw), collectionName: collName });
      });
    }

    // If this collection’s _meta.mdx has “itemsAddToMenu: [...]”
    if (meta.itemsAddToMenu) {
      (meta.itemsAddToMenu as BulkRaw[]).forEach((rawInstr) => {
        allBulk.push({ ...(rawInstr as BulkRaw), collectionName: collName });
      });
    }
  }

  return { allOneOff, allBulk };
}

// ─── STEP C: Expand every “itemsAddToMenu” (bulk) instruction into N menu‑item objects ─

/**
 * For each BulkWithContext:
 *   • Loop over every entry in that collection.
 *   • Build a menu item whose:
 *       – id   = <collectionName>/<entrySlug>
 *       – title = entry.data.title || entrySlug
 *       – slug  = `/${collectionName}/${entrySlug}`
 *       – parent = instr.parent ?? null
 *       – weight = instr.weight + indexWithinLoop
 *       – openInNewTab = instr.openInNewTab
 *       – menu  = instr.menu
 */
async function expandBulkInstr(allBulk: BulkWithContext[]) {
  const expanded: Array<{
    id: string;
    title: string;
    slug: string;
    parent: string | null;
    weight: number;
    openInNewTab: boolean;
    menu: string | string[];
  }> = [];

  for (const { collectionName, ...instr } of allBulk) {
    // Fetch every entry in that collection
    const entries = await getCollection(collectionName);
    entries.forEach((entry, idx) => {
      const eData: any = entry.data;
      const entrySlug = normalizeRef(entry.slug);         // e.g. "seo"
      const entryTitle = (eData.title as string) || entrySlug;

      expanded.push({
        id: `${collectionName}/${entrySlug}`,              // e.g. “services/seo”
        title: entryTitle,
        slug: `/${collectionName}/${entrySlug}`,
        parent: instr.parent ?? null,
        weight: (instr.weight ?? 0) + idx,
        openInNewTab: instr.openInNewTab ?? false,
        menu: instr.menu!,
      });
    });
  }

  return expanded;
}

// ─── STEP D: Expand every “addToMenu” (one‑off) instruction, auto‑filling slug+title if missing ─

/**
 * If you wrote inside `_meta.mdx`:
 *
 *   addToMenu:
 *     - menu: mainMenu
 *       parent: "services"
 *       weight: 4
 *
 * but omitted `slug` and/or `title`, we now auto‑fill:
 *   • slug  = `"/<collectionName>"`
 *   • title = Capitalize(<collectionName>)
 */
function expandOneOffInstr(allOneOff: OneOffWithContext[]) {
  return allOneOff.map((raw) => {
    // Parse/validate with Zod; this applies defaults to weight/openInNewTab
    const data = AddToMenuFields.parse(raw);

    // If slug is missing, default to the collection root ("/<collectionName>")
    let finalSlug = data.slug?.trim();
    if (!finalSlug) {
      finalSlug = `/${raw.collectionName}`;
    }

    // If user wrote "slug: 'services'" (without leading slash), ensure leading slash:
    if (!finalSlug.startsWith("/")) {
      finalSlug = `/${finalSlug}`;
    }

    // If title is missing, default to capitalized collection name:
    let finaltitle = data.title?.trim();
    if (!finaltitle) {
      finaltitle = capitalize(raw.collectionName);
    }

    // id = slug without any leading slash
    const finalId = finalSlug.replace(/^\/+/, "");

    return {
      id: finalId,
      title: finaltitle,
      slug: finalSlug,
      parent: data.parent ?? null,
      weight: data.weight!,
      openInNewTab: data.openInNewTab!,
      menu: data.menu!,
    };
  });
}

// ─── STEP E: Combine static + one‑off + bulk → one big array of raw menu items ──────

export async function buildAllMenuItems() {
  // 1) Static items from menuItems.json (Zod defaults already applied there):
  const staticEntries = await getAllStaticMenuItems();
  const staticRaw = staticEntries.map((entry) => {
    const d: any = entry.data;
    return {
      id: entry.slug,                  // unique ID (e.g. "home" or "about")
      title: d.title || entry.slug,    // fallback to slug if no title
      slug: d.slug || `/${entry.slug}`, // if data.slug omitted, default to "/<slug>"
      parent: d.parent ?? null,
      weight: d.weight!,
      openInNewTab: d.openInNewTab!,
      menu: d.menu!,                   // string or string[]
    };
  });

  // 2) Gather front‑matter instructions (one‑off + bulk), each tagged with collectionName
  const { allOneOff, allBulk } = await gatherMenuInstructions();

  // 3) Expand “addToMenu” instructions (one‑off), with automatic slug/title defaults
  const expandedOneOff = expandOneOffInstr(allOneOff);

  // 4) Expand “itemsAddToMenu” instructions (bulk)
  const expandedBulk = await expandBulkInstr(allBulk);

  // 5) Return a single combined array:
  return [...staticRaw, ...expandedOneOff, ...expandedBulk];
}
