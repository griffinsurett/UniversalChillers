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
      // 2) load your static JSON (mainMenu & footerMenu)
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) add dynamic collections
      const allColls = getCollectionNames();
      const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 3a) collection-level “addToMenu” ───────────────────────────
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
            const id = link.slice(1);
            // normalize into array
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                // keep instr.order here if you like, or omit to let default sort apply
                ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // ── 3b) bulk “itemsAddToMenu” ───────────────────────────────────
        if (Array.isArray(meta.itemsAddToMenu)) {
    for (const entry of entries) {
      entry.data.addToMenu = [
        // keep any real per-file addToMenu
        ...(Array.isArray(entry.data.addToMenu) ? entry.data.addToMenu : []),
        // then shove in each itemsAddToMenu instruction
        ...meta.itemsAddToMenu,
      ];
    }
  }

        // ── 3c) per-file “addToMenu” ────────────────────────────────────
           for (const entry of entries) {
     // collect any per-file instructions
     const fileList = Array.isArray((entry.data as any).addToMenu)
       ? (entry.data as any).addToMenu
       : [];
     // collect any bulk instructions from meta
     const bulkList = Array.isArray(meta.itemsAddToMenu)
       ? meta.itemsAddToMenu
       : [];
     // combine them into one list, and then feed each into the store
     for (const instr of [...fileList, ...bulkList]) {
       const link = instr.link?.startsWith('/')
         ? instr.link
         : instr.link
         ? `/${instr.link}`
         : `/${coll}/${entry.slug}`;
       const id     = link.slice(1);
       const parent = instr.parent ?? null;
       const menus  = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
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

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
