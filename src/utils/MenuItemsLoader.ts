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

      // 1) Clear any existing items
      store.clear();

      // 2) Load static menuItems.json first
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) Discover all dynamic collections (excluding the menus themselves)
      const allColls = getCollectionNames();
      const dynamicColls = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamicColls) {
        // Fetch the collection's meta frontmatter
        const meta = await getCollectionMeta(coll);

        // Debug logging
        logger.info(`[menu-items-loader] ${coll}.addToMenu =`, meta.addToMenu);
        logger.info(`[menu-items-loader] ${coll}.itemsAddToMenu =`, meta.itemsAddToMenu);

        //
        // 3a) collection‐level addToMenu
        //
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);
            // use instr.order if defined, otherwise fall back to instr.weight or 0
            const base = typeof instr.order === 'number'
              ? instr.order
              : typeof instr.weight === 'number'
              ? instr.weight
              : 0;
            const order = base;

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                order,
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              },
            });
          }
        }

        //
        // 3b) bulk itemsAddToMenu — inject every entry in this collection
        //
        const entries = await getCollection(coll);
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, idx) => {
              const entrySlug = entry.slug;
              const link = `/${coll}/${entrySlug}`;
              const id = `${coll}/${entrySlug}`;
              const parent =
                instr.respectHierarchy && entry.data.parent
                  ? `${coll}/${entry.data.parent}`
                  : instr.parent ?? null;
              // pick order → instr.order, then instr.weight, then default 0
              const base = typeof instr.order === 'number'
                ? instr.order
                : typeof instr.weight === 'number'
                ? instr.weight
                : 0;
              const order = base + idx;

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

        //
        // 3c) per‐entry addToMenu — inject itemsAddToMenu on individual entries
        //
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
              // same fallback for order
              const order =
                typeof instr.order === 'number'
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
