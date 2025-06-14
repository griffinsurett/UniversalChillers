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

      // 1) Clear existing and load static JSON menus
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) Find all dynamic collections except menus and menuItems
      const allColls = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of allColls) {
        // Fetch collection-level meta and all entries
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        //
        // A) COLLECTION-LEVEL addToMenu from meta
        //
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link ?? coll}`;
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
                ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        //
        // B) BULK itemsAddToMenu: inject every entry under the given parent
        //
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

            for (const entry of entries) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                  ? `/${instr.link}`
                  : `/${coll}/${entry.slug}`;
              const id = link.slice(1);

              store.set({
                id,
                data: {
                  id,
                  title: instr.title ?? entry.data.title ?? entry.slug,
                  link,
                  parent: instr.respectHierarchy && entry.data.parent
                    ? entry.data.parent
                    : instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }

        //
        // C) PER-FILE addToMenu frontmatter on each entry, without overwriting bulk
        //
        for (const entry of entries) {
          const list = Array.isArray(entry.data.addToMenu)
            ? entry.data.addToMenu
            : [];
          for (const instr of list) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
                ? `/${instr.link}`
                : `/${coll}/${entry.slug}`;
            const id = link.slice(1);

            // If we already injected this ID via itemsAddToMenu, skip it
            if (store.has(id)) {
              continue;
            }

            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title: instr.title ?? entry.data.title ?? entry.slug,
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

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
