// src/utils/MenuBuilder.server.ts
import { getCollection } from "astro:content";
import { normalizeRef, capitalize } from "./ContentUtils";
import { getCollectionMeta } from "./FetchMeta";
import type { ItemsAddToMenuFields } from "@/content/config";

import {
  AddToMenuFields,
  ItemsAddToMenuFields,
  MenuItemFields
} from "@/content/config";

/**
 * MENU BUILDER OVERVIEW
 *
 * 1. Fetch all static menuItems from `menuItems.json`.
 * 2. Read every content collection’s _meta.mdx to gather:
 *      • one‐off “addToMenu” instructions  (each tied to a specific collection entry)
 *      • bulk “itemsAddToMenu” instructions (each tied to a specific collection)
 * 3. Expand bulk instructions: for each `itemsAddToMenu`, loop over all entries in that collection.
 *     - Honor `respectHierarchy` if requested.
 * 4. Expand one‐off instructions: auto-fill `slug` = `"/<collectionName>"` and `title` = capitalize(`<collectionName>`) if missing.
 * 5. Combine (1) + (3) + (4) into one flat array of menu‐items, then hand it off to `SiteMenu.astro` (or wherever you render it).
 */

// ─── STEP A: Get all static menu items from the “menuItems” collection ─────────
export async function getAllStaticMenuItems() {
  return await getCollection("menuItems");
}

// ─── STEP B: Gather one‐off and bulk instructions from each collection’s _meta.mdx ─
type OneOffRaw = z.infer<typeof AddToMenuFields>;
type BulkRaw   = z.infer<typeof ItemsAddToMenuFields>;

/**
 * A single “addToMenu” instruction plus the collection it came from.
 * We attach `collectionName` so that we know how to default slug/title from.
 */
type OneOffWithContext = OneOffRaw & {
  collectionName: string;
};

/**
 * A single “itemsAddToMenu” instruction plus the collection it came from.
 * We attach `collectionName` so that we know which entries to loop over,
 * and `respectHierarchy` so we can optionally preserve parent–child structure.
 */
type BulkWithContext = BulkRaw & {
  collectionName: string;
  respectHierarchy: boolean;
};

async function gatherMenuInstructions(): Promise<{
  allOneOff: OneOffWithContext[];
  allBulk: BulkWithContext[];
}> {
  // Skip “menus” and “menuItems” themselves (they aren’t injecting into any other menu).
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

    // If this collection’s _meta.mdx has “addToMenu: […]”
    if (meta.addToMenu) {
      (meta.addToMenu as OneOffRaw[]).forEach((rawInstr) => {
        allOneOff.push({
          ...(rawInstr as OneOffRaw),
          collectionName: collName,
        });
      });
    }

    // If this collection’s _meta.mdx has “itemsAddToMenu: […]”
    if (meta.itemsAddToMenu) {
      (meta.itemsAddToMenu as BulkRaw[]).forEach((rawInstr) => {
        // Zod‐validate to pick up defaults (especially respectHierarchy)
        const parsed = ItemsAddToMenuFields.parse(rawInstr);
        allBulk.push({
          ...parsed,
          collectionName: collName,
          respectHierarchy: parsed.respectHierarchy,
        });
      });
    }
  }

  return { allOneOff, allBulk };
}

// ─── STEP C: Expand every “itemsAddToMenu” (bulk) instruction into N menu‐item objects ─
/**
 * For each BulkWithContext:
 *   • Loop over every entry in that collection.
 *   • Build a menu‐item whose:
 *       – id   = <collectionName>/<entrySlug>
 *       – title = entry.data.title || entrySlug
 *       – slug  = `/<collectionName>/<entrySlug>`
 *       – parent = either
 *             • (if respectHierarchy = true and entry.data.parent exists)
 *                  “<collectionName>/<entry.data.parent>”
 *             • else if respectHierarchy = true and no entry.data.parent,
 *                  use instr.parent
 *             • else (respectHierarchy = false),
 *                  always use instr.parent
 *       – weight = instr.weight + indexWithinLoop
 *       – openInNewTab = instr.openInNewTab
 *       – menu  = instr.menu
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

  for (const { collectionName, respectHierarchy, ...instr } of allBulk) {
    // Fetch every entry in that collection
    const entries = await getCollection(collectionName);

    entries.forEach((entry, idx) => {
      const eData: any = entry.data;
      const entrySlug = normalizeRef(entry.slug);         // e.g. "seo"
      const entryTitle = (eData.title as string) || entrySlug;

      // Build the new menu‐item’s id/slug:
      const newMenuId = `${collectionName}/${entrySlug}`;   // e.g. “services/seo”
      const newMenuSlug = `/${collectionName}/${entrySlug}`; // e.g. “/services/seo”

      // DETERMINE PARENT depending on respectHierarchy
      let finalParent: string | null = null;

      if (respectHierarchy) {
        // If this entry has its own frontmatter.parent, point to that sibling in the menu.
        if (eData.parent) {
          const origParentSlug = normalizeRef(eData.parent);
          finalParent = `${collectionName}/${origParentSlug}`;
        }
        // Otherwise, if the bulk instruction had a “parent” key, use that for top‐level entries.
        else if (instr.parent) {
          finalParent = instr.parent;
        }
        // else: leave as null (top‐level under no one)
      } else {
        // ignore the collection’s built‐in parent tree; always use the instruction’s parent
        finalParent = instr.parent ?? null;
      }

      expanded.push({
        id: newMenuId,
        title: entryTitle,
        slug: newMenuSlug,
        parent: finalParent,
        weight: (instr.weight ?? 0) + idx,
        openInNewTab: instr.openInNewTab ?? false,
        menu: instr.menu!,
      });
    });
  }

  return expanded;
}

// ─── STEP D: Expand every “addToMenu” (one‐off) instruction (auto-fill slug/title if missing) ─
/**
 * If you wrote inside `_meta.mdx`:
 *
 *   addToMenu:
 *     - menu: mainMenu
 *       parent: "services"
 *       weight: 4
 *
 * but omitted `slug` and/or `title`, we now auto-fill:
 *   • slug  = `"/<collectionName>"`
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

    // Ensure leading slash
    if (!finalSlug.startsWith("/")) {
      finalSlug = `/${finalSlug}`;
    }

    // If title is missing, default to capitalized collection name:
    let finalTitle = data.title?.trim();
    if (!finalTitle) {
      finalTitle = capitalize(raw.collectionName);
    }

    // id = slug without any leading slash
    const finalId = finalSlug.replace(/^\/+/, "");

    return {
      id: finalId,
      title: finalTitle,
      slug: finalSlug,
      parent: data.parent ?? null,
      weight: data.weight!,
      openInNewTab: data.openInNewTab!,
      menu: data.menu!,
    };
  });
}

// ─── STEP E: Combine static + one‐off + bulk → one big array of raw menu items ─────────
export async function buildAllMenuItems() {
  // 1) Static items from menuItems.json (Zod defaults already applied there):
  const staticEntries = await getAllStaticMenuItems();
  const staticRaw = staticEntries.map((entry) => {
    const d: any = entry.data;
    return {
      id: entry.slug,                   // e.g. "home"
      title: d.title || entry.slug,     // fallback to slug if no title
      slug: d.slug || `/${entry.slug}`,  // e.g. "/home"
      parent: d.parent ?? null,
      weight: d.weight!,
      openInNewTab: d.openInNewTab!,
      menu: d.menu!,                    // string or string[]
    };
  });

  // 2) Gather all front-matter instructions (one-off + bulk)
  const { allOneOff, allBulk } = await gatherMenuInstructions();

  // 3) Expand “addToMenu” instructions (one-off)
  const expandedOneOff = expandOneOffInstr(allOneOff);

  // 4) Expand “itemsAddToMenu” instructions (bulk)
  const expandedBulk = await expandBulkInstr(allBulk);

  // 5) Return a single combined array:
  return [...staticRaw, ...expandedOneOff, ...expandedBulk];
}
