// src/utils/MenuItemsLoader.ts

import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── 1) clear any previously loaded items
      store.clear();

      // ── 2) load the base JSON menu first (menuItems.json)
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 3) discover all other collections and inject “addToMenu” + “itemsAddToMenu”
      const allColls = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of allColls) {
        const meta = await getCollectionMeta(coll);

        // Debug: inspect what the meta parser actually picked up
        logger.info(`[menu-items-loader] ${coll}.addToMenu =`, meta.addToMenu);
        logger.info(`[menu-items-loader] ${coll}.itemsAddToMenu =`, meta.itemsAddToMenu);

        // ── 3a) collection-level `addToMenu`
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);

            // allow either `order` or fallback to `weight` (or zero)
            const baseOrder = typeof instr.order === 'number'
              ? instr.order
              : typeof instr.weight === 'number'
                ? instr.weight
                : 0;

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                order: baseOrder,
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              },
            });
          }
        }

        // fetch all entries in this collection
        const entries = await getCollection(coll);

        // ── 3b) bulk `itemsAddToMenu`
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, i) => {
              const entrySlug = entry.slug;
              const link = `/${coll}/${entrySlug}`;
              const id = `${coll}/${entrySlug}`;

              // if the entry itself has a parent and `respectHierarchy` is true, nest under that;
              // otherwise, use the `parent` from the instruction
              const parent = instr.respectHierarchy && entry.data.parent
                ? `${coll}/${entry.data.parent}`
                : instr.parent ?? null;

              // allow either `order` or fallback to `weight`, then offset by index
              const baseOrder = typeof instr.order === 'number'
                ? instr.order
                : typeof instr.weight === 'number'
                  ? instr.weight
                  : 0;

              const order = baseOrder + i;

              store.set({
                id,
                data: {
                  id,
                  title: entry.data.title || entrySlug,
                  link,
                  parent,
                  order,
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: instr.menu,
                },
              });
            });
          }
        }

        // ── 3c) per-entry `addToMenu` in each file’s frontmatter
        for (const entry of entries) {
          const list = (entry.data as any).addToMenu;
          if (Array.isArray(list)) {
            for (const instr of list) {
              const defaultLink = `/${coll}/${entry.slug}`;
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                  ? `/${instr.link}`
                  : defaultLink;
              const id = link.slice(1);

              // if someone specified an explicit `order` in the entry-level addToMenu,
              // respect it; otherwise fall back to `weight` or zero
              const order = typeof instr.order === 'number'
                ? instr.order
                : typeof instr.weight === 'number'
                  ? instr.weight
                  : 0;

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || entry.data.title || entry.slug,
                  link,
                  parent: instr.parent ?? null,
                  order,
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: instr.menu,
                },
              });
            }
          }
        }
      }

      logger.info(`[menu-items-loader] total items loaded: ${store.keys().length}`);
    },
  };
}
