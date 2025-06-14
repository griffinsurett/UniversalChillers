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
       // 1) clear the store & load your static JSON
       store.clear();
       await file('src/content/menuItems/menuItems.json').load(context);

       // 2) discover all of your dynamic collections
       const allColls = getCollectionNames();
       const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

       for (const coll of dynamic) {
         const meta    = await getCollectionMeta(coll);
         const entries = await getCollection(coll);

       // ── INJECT meta.itemsAddToMenu AS per-file addToMenu on every entry ──
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

         // ── 3a) collection-level “addToMenu” (exactly as before) ──
         if (Array.isArray(meta.addToMenu)) {
           for (const instr of meta.addToMenu) {
             const link = instr.link?.startsWith('/')
               ? instr.link
               : `/${instr.link || coll}`;
             const id    = link.slice(1);
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

       function normalizeMenuValue(m: string | { id: string; [k: string]: any }) {
  return typeof m === 'string' ? m : m.id;
}

// ── 3b) per-file “addToMenu” ──
for (const entry of entries) {
  const raw = (entry.data as any).addToMenu;
  const list = raw
    ? Array.isArray(raw)
      ? raw
      : [raw]
    : [];

  if (!list.length) continue;

  for (const instr of list) {
    // build your link+id the same as before…
    const link = instr.link?.startsWith('/')
      ? instr.link
      : instr.link
      ? `/${instr.link}`
      : `/${coll}/${entry.slug}`;
    const id = link.slice(1);

    // 🚀 NEW: always map references → string IDs
    const menus = Array.isArray(instr.menu)
      ? instr.menu.map(normalizeMenuValue)
      : [normalizeMenuValue(instr.menu)];

    store.set({
      id,
      data: {
        id,
        title: instr.title || entry.data.title || entry.slug,
        link,
        parent: instr.parent ?? null,
        ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
        openInNewTab: instr.openInNewTab ?? false,
        menu: menus,
      },
    });
  }
}

         logger.info(
           `[menu-items-loader] loaded ${store.keys().length} items`
         );
       }
     },
   };
 }
