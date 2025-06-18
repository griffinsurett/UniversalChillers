// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

import fs from 'fs/promises';
import path from 'path';

/** Recursively find all .json files under a directory (skipping menuItems.json and _meta.json) */
async function scanJSON(dir: string): Promise<string[]> {
  let results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results = results.concat(await scanJSON(full));
    } else if (
      e.isFile() &&
      e.name.endsWith('.json') &&
      e.name !== 'menuItems.json' &&
      !e.name.startsWith('_meta')
    ) {
      results.push(full);
    }
  }
  return results;
}

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── 1) Clear & load base menuItems.json ─────────────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) Per-file addToMenu from MDX/MD ────────────────────────────────
      {
        const mdFiles = import.meta.glob<
          { frontmatter?: any }
        >('../content/**/*.{mdx,md}', { eager: true });

        for (const p in mdFiles) {
          // skip _meta files
          if (/\/_meta\.(mdx|md)$/.test(p)) continue;

          const mod  = mdFiles[p]!;
          const data = mod.frontmatter;
          if (!data?.addToMenu) continue;

          // derive collection + slug
          const parts = p.split('/');
          const filename = parts.pop()!;      // e.g. "seo.mdx"
          const collection = parts.pop()!;    // e.g. "services"
          const slug = filename.replace(/\.(mdx|md)$/, '');
          const fallback = `/${collection}/${slug}`;

          const recs = Array.isArray(data) ? data : [data];
          for (const rec of recs) {
            const items = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];
            for (const instr of items) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallback;
              const id = link.slice(1);
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
                  ...(typeof instr.order === 'number'
                    ? { order: instr.order }
                    : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      // ── 3) Per-file addToMenu from standalone JSON ─────────────────────────
      {
        const contentDir = path.join(process.cwd(), 'src', 'content');
        const jsonPaths = await scanJSON(contentDir);

        for (const abs of jsonPaths) {
          let raw: any;
          try {
            raw = JSON.parse(await fs.readFile(abs, 'utf8'));
          } catch {
            continue;
          }
          const recs = Array.isArray(raw) ? raw : [raw];
          // derive collection + slug
          const rel = path.relative(contentDir, abs).replace(/\\/g, '/');  
          const [collection, ...rest] = rel.split('/');
          const slugPart = rest.join('/').replace(/\.json$/, '');
          const fallback = `/${collection}/${slugPart}`;

          for (const rec of recs) {
            if (!rec.addToMenu) continue;
            const items = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];
            for (const instr of items) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallback;
              const id = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title:
                    instr.title || rec.title || capitalize(rec.id ?? slugPart),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number'
                    ? { order: instr.order }
                    : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      // ── 4) Collection-level addToMenu & itemsAddToMenu via getCollectionMeta ─
      {
        const cols = getCollectionNames().filter(
          (c) => c !== 'menus' && c !== 'menuItems'
        );

        for (const coll of cols) {
          const meta = getCollectionMeta(coll);
          const entries = await getCollection(coll);

          // 4a) collection-level addToMenu
          if (Array.isArray(meta.addToMenu)) {
            for (const instr of meta.addToMenu) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : `/${instr.link || coll}`;
              const id = link.slice(1);
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
                  ...(typeof instr.order === 'number'
                    ? { order: instr.order }
                    : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }

          // 4b) itemsAddToMenu – inject every entry, preserving hierarchy
          if (Array.isArray(meta.itemsAddToMenu)) {
            for (const entry of entries) {
              for (const instr of meta.itemsAddToMenu) {
                // Always preserve the entry’s own parent if present
                const parent = entry.data.parent ?? instr.parent ?? null;

                const link = instr.link?.startsWith('/')
                  ? instr.link
                  : instr.link
                    ? `/${instr.link}`
                    : `/${coll}/${entry.slug}`;
                const id = link.slice(1);
                const menus = Array.isArray(instr.menu)
                  ? instr.menu
                  : [instr.menu];

                store.set({
                  id,
                  data: {
                    id,
                    title:
                      instr.title || entry.data.title || entry.slug,
                    link,
                    parent,
                    ...(typeof instr.order === 'number'
                      ? { order: instr.order }
                      : {}),
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