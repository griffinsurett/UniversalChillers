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

      // 1) clear the store
      store.clear();

      // 2) load your static JSON file (preserves `order` from menuItems.json)
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) discover all other content collections without circular deps
      const allColls = getCollectionNames();
      const dynamicCollections = allColls.filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of dynamicCollections) {
        // 3a) collection-level addToMenu
        const meta = await getCollectionMeta(coll);
        
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);
            const order = instr.order;

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

        // 3b) bulk itemsAddToMenu
        const entries = await getCollection(coll);
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, i) => {
              const entrySlug = entry.slug;
              const link = `/${coll}/${entrySlug}`;
              const id = `${coll}/${entrySlug}`;
              const parent =
                instr.respectHierarchy && entry.data.parent
                  ? `${coll}/${entry.data.parent}`
                  : instr.parent ?? null;
              const order = instr.order + i;

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

        // 3c) per-entry addToMenu
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
              const order = instr.order;

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

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
