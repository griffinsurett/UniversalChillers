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

      // 1) Clear and load your static menus
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) For each of your real collections…
      const all = getCollectionNames().filter((c) => c !== 'menus' && c !== 'menuItems');
      for (const coll of all) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3) First, handle any collection‐level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
            const id   = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
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

        // 4) Now, for each entry, build a single array of “menu instructions”
        for (const entry of entries) {
          const instructions: Array<Record<string, any>> = [];

          // 4a) Any per-file `addToMenu` from its front-matter
          if (Array.isArray((entry.data as any).addToMenu)) {
            for (const f of (entry.data as any).addToMenu) {
              instructions.push({
                ...f,
                // default the link/title/order back to the entry if not supplied
                link:         f.link ?? `/${coll}/${entry.slug}`,
                title:        f.title ?? entry.data.title ?? entry.slug,
                order:        f.order  ?? entry.data.order,
                openInNewTab: f.openInNewTab,
              });
            }
          }

          // 4b) Any `itemsAddToMenu` from the collection‐meta
          if (Array.isArray(meta.itemsAddToMenu)) {
            for (const m of meta.itemsAddToMenu) {
              instructions.push({
                ...m,
                link:         m.link ?? `/${coll}/${entry.slug}`,
                title:        entry.data.title ?? entry.slug,
                order:        entry.data.order,
                openInNewTab: m.openInNewTab,
              });
            }
          }

          // 5) Finally, write _all_ of those out
          for (const instr of instructions) {
            const link = instr.link.startsWith('/') ? instr.link : `/${instr.link}`;
            const id   = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
            store.set({
              id,
              data: {
                id,
                title: instr.title,
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
