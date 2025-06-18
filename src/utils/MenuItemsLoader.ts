// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionNames } from '@/utils/CollectionUtils';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── 1) Clear & load static menuItems.json ───────────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) Per-file addToMenu (MDX, MD, JSON) ────────────────────────────
      {
        const mods = import.meta.glob<
          Record<string, any> & { frontmatter?: any; default?: any }
        >('../content/**/*.{mdx,md,json}', { eager: true });

        for (const path in mods) {
          if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

          const mod = mods[path]!;
          const raw = mod.frontmatter ?? mod.default;
          if (!raw) continue;

          const items = Array.isArray(raw) ? raw : [raw];
          const parts = path.split('/');
          const fileName = parts.pop()!.replace(/\.(mdx|md|json)$/, '');
          const collection = parts.pop()!;
          const fallbackLink = `/${collection}/${fileName}`;

          for (const rec of items) {
            if (!rec.addToMenu) continue;
            const instrs = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];

            for (const instr of instrs) {
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
                  title: instr.title || rec.title || capitalize(rec.id ?? fileName),
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

      // ── 3) Collection-level addToMenu + itemsAddToMenu from each _meta.* ───
      {
        const allColls = getCollectionNames().filter(
          (c) => c !== 'menus' && c !== 'menuItems'
        );

        for (const coll of allColls) {
          const meta = getCollectionMeta(coll);
          const entries = await getCollection(coll);

          // 3a) collection-level addToMenu
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

          // 3b) itemsAddToMenu (select-all) with hierarchy
          if (Array.isArray(meta.itemsAddToMenu)) {
            for (const entry of entries) {
              for (const instr of meta.itemsAddToMenu) {
                // if respectHierarchy, use entry.data.parent, else override
                const parent = instr.respectHierarchy
                  ? entry.data.parent ?? instr.parent
                  : instr.parent ?? null;

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
                    parent,
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