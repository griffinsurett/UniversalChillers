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

      // 1) clear the store and load static menuItems.json
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) gather dynamic collections
      const allColls = getCollectionNames();
      const dynamic = allColls.filter(c => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 3a) per-file addToMenu (frontmatter on individual entries) ──
        for (const entry of entries) {
          const addList = Array.isArray(entry.data.addToMenu)
            ? entry.data.addToMenu
            : [];

          for (const instr of addList) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
                ? `/${instr.link}`
                : `/${coll}/${entry.slug}`;
            const id = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
            const parent = instr.parent ?? null;
            const order = typeof instr.order === 'number' ? instr.order : entry.data.order;

            store.set({
              id,
              data: {
                id,
                title: instr.title || entry.data.title || entry.slug,
                link,
                parent,
                ...(order !== undefined ? { order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // ── 3b) itemsAddToMenu (bulk injection under a parent) ──
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            for (const entry of entries) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                  ? `/${instr.link}`
                  : `/${coll}/${entry.slug}`;
              const id = link.slice(1);
              const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
              const parent = instr.parent ?? coll;
              const order = entry.data.order;

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || entry.data.title || entry.slug,
                  link,
                  parent,
                  ...(order !== undefined ? { order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }

        // ── 3c) addToMenu at collection‐level (for the root item) ──
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
            const parent = instr.parent ?? null;
            const order = instr.order;

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent,
                ...(order !== undefined ? { order } : {}),
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
