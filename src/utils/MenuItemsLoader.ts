// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';

export function menuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // Clear any existing entries
      store.clear();

      // Load static menuItems.json (preserves each item's `order`)
      await file('src/content/menuItems/menuItems.json').load(context);

      // Discover dynamic collections to auto-add
      const cfg = await import('../content/config');
      const allColls: string[] = Object.keys(cfg.collections);
      const dynamicCollections = allColls.filter(c => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamicCollections) {
        const meta = await getCollectionMeta(coll);

        // Collection-level addToMenu instructions
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
            const id = link.slice(1);
            const order = instr.order ?? 0;

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

        // Bulk itemsAddToMenu: place each entry in menu
        const entries = await getCollection(coll);
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, index) => {
              const entrySlug = entry.slug;
              const link = `/${coll}/${entrySlug}`;
              const id = `${coll}/${entrySlug}`;
              const parent = instr.respectHierarchy && entry.data.parent
                ? `${coll}/${entry.data.parent}`
                : instr.parent ?? null;
              const baseOrder = instr.order ?? 0;

              store.set({
                id,
                data: {
                  id,
                  title: entry.data.title || entrySlug,
                  link,
                  parent,
                  order: baseOrder + index,
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: instr.menu,
                },
              });
            });
          }
        }

        // Per-entry addToMenu directives
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
              const order = instr.order ?? 0;

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
