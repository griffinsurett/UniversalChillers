// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

import fs from 'fs/promises';
import path from 'path';

// Recursively scan `dir` for all `.json` files
async function scanJSON(dir: string): Promise<string[]> {
  let results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await scanJSON(full));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.json') &&
      entry.name !== 'menuItems.json' &&
      !entry.name.startsWith('_meta')
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

      // ── 1) Clear previous store & load your base menuItems.json ─────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) PER-FILE addToMenu from MDX & MD ──────────────────────────────
      {
        const mods = import.meta.glob<
          Record<string, any> & { frontmatter?: any }
        >('../content/**/*.{mdx,md}', { eager: true });

        for (const p in mods) {
          if (/\/_meta\.(mdx|md)$/.test(p)) continue;

          const mod = mods[p]!;
          const data = mod.frontmatter;
          if (!data?.addToMenu) continue;

          // derive collection & slug from file path
          const seg = p.split('/');
          const fileName = seg.pop()!; // e.g. "seo.mdx"
          const collection = seg.pop()!; // e.g. "services"
          const slug = fileName.replace(/\.(mdx|md)$/, '');
          const fallbackLink = `/${collection}/${slug}`;

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
                : fallbackLink;
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

      // ── 3) PER-FILE addToMenu from ANY JSON ───────────────────────────────
      {
        // `src/content` absolute path
        const contentRoot = path.join(process.cwd(), 'src', 'content');
        const jsonFiles = await scanJSON(contentRoot);

        for (const absPath of jsonFiles) {
          let raw: any;
          try {
            raw = JSON.parse(await fs.readFile(absPath, 'utf-8'));
          } catch {
            continue;
          }
          const recs = Array.isArray(raw) ? raw : [raw];
          // derive collection & slug from relative path
          const rel = path.relative(contentRoot, absPath);
          const parts = rel.split(path.sep);
          const collection = parts.shift()!;
          const fileSlug = parts.join('/').replace(/\.json$/, '');
          const fallbackLink = `/${collection}/${fileSlug}`;

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
                : fallbackLink;
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

      // ── 4) COLLECTION-LEVEL addToMenu & itemsAddToMenu via meta ───────────
      {
        const collections = getCollectionNames().filter(
          (c) => c !== 'menus' && c !== 'menuItems'
        );
        for (const coll of collections) {
          // fetch the parsed frontmatter from _meta.*
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
                  ...(typeof instr.order === 'number'
                    ? { order: instr.order }
                    : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }

          // 4b) itemsAddToMenu → inject every entry in this collection
          if (Array.isArray(meta.itemsAddToMenu)) {
            for (const entry of entries) {
              for (const instr of meta.itemsAddToMenu) {
                // allow per-entry parent override if respectHierarchy
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
                    title:
                      instr.title || entry.data.title || entry.slug,
                    link,
                    parent: parent ?? null,
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