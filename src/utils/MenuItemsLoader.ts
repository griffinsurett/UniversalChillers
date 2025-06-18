// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

import fs from 'fs/promises';
import path from 'path';

// Recursively find all JSON files under a directory (excluding menuItems.json and _meta.json)
async function scanJSON(dir: string): Promise<string[]> {
  let found: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      found.push(...await scanJSON(full));
    } else if (
      ent.isFile() &&
      ent.name.endsWith('.json') &&
      ent.name !== 'menuItems.json' &&
      !ent.name.startsWith('_meta')
    ) {
      found.push(full);
    }
  }
  return found;
}

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── 1) Clear & load primary menuItems.json ────────────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) PER-FILE addToMenu from MDX/MD ─────────────────────────────────
      {
        const mods = import.meta.glob<Record<string, any> & { frontmatter?: any }>(
          '../content/**/*.{mdx,md}',
          { eager: true }
        );
        for (const p in mods) {
          if (/\/_meta\.(mdx|md)$/.test(p)) continue;
          const mod  = mods[p]!;
          const data = mod.frontmatter;
          if (!data?.addToMenu) continue;

          // derive collection & slug
          const segs        = p.split('/');
          const fileWithExt = segs.pop()!;      // e.g. "seo.mdx"
          const collection  = segs.pop()!;      // e.g. "services"
          const slug        = fileWithExt.replace(/\.(mdx|md)$/, '');
          const fallback    = `/${collection}/${slug}`;

          const recs = Array.isArray(data) ? data : [data];
          for (const rec of recs) {
            const ins = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];
            for (const instr of ins) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallback;
              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({ 
                id,
                data: {
                  id,
                  title: instr.title || rec.title || capitalize(slug),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      // ── 3) PER-FILE addToMenu from JSON files ───────────────────────────────
      {
        const contentRoot = path.join(process.cwd(), 'src', 'content');
        const jsonFiles   = await scanJSON(contentRoot);

        for (const abs of jsonFiles) {
          let raw: any;
          try {
            raw = JSON.parse(await fs.readFile(abs, 'utf-8'));
          } catch {
            continue;
          }
          const recs = Array.isArray(raw) ? raw : [raw];
          const rel  = path.relative(contentRoot, abs).split(path.sep);
          const collection = rel.shift()!;
          const fileSlug   = rel.join('/').replace(/\.json$/, '');
          const fallback   = `/${collection}/${fileSlug}`;

          for (const rec of recs) {
            if (!rec.addToMenu) continue;
            const ins = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];
            for (const instr of ins) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallback;
              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || rec.title || capitalize(rec.id ?? fileSlug),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      // ── 4) COLLECTION-LEVEL addToMenu & itemsAddToMenu via getCollectionMeta ─
      {
        const allColls = getCollectionNames().filter(
          (c) => c !== 'menus' && c !== 'menuItems'
        );

        for (const coll of allColls) {
          // fetch your parsed _meta.* frontmatter
          const meta = getCollectionMeta(coll);
          const entries = await getCollection(coll);

          // 4a) collection-level addToMenu
          if (Array.isArray(meta.addToMenu)) {
            for (const instr of meta.addToMenu) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : `/${instr.link || coll}`;
              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || capitalize(coll),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }

          // 4b) itemsAddToMenu: look in BOTH top-level and defaultSection
          const itemsAdd =
            meta.itemsAddToMenu ??
            (meta.defaultSection as any)?.itemsAddToMenu;

          if (Array.isArray(itemsAdd)) {
            for (const entry of entries) {
              for (const instr of itemsAdd) {
                // allow per-entry parent override if requested
                const parent = instr.respectHierarchy
                  ? entry.data.parent ?? instr.parent
                  : instr.parent;

                const link = instr.link?.startsWith('/')
                  ? instr.link
                  : instr.link
                    ? `/${instr.link}`
                    : `/${coll}/${entry.slug}`;
                const id    = link.slice(1);
                const menus = Array.isArray(instr.menu)
                  ? instr.menu
                  : [instr.menu];

                store.set({
                  id,
                  data: {
                    id,
                    title: instr.title || entry.data.title || entry.slug,
                    link,
                    parent: parent ?? null,
                    ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                    openInNewTab: instr.openInNewTab ?? false,
                    menu: menus,
                  },
                });
              }
            }
          }
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}