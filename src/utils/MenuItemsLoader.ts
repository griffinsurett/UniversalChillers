// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection }    from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta }  from '@/utils/FetchMeta';
import { capitalize }         from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Wipe & load static footer/mainMenu
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) Find all real collections (skip the menus themselves)
      const allColls = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of allColls) {
        // 2a) Grab meta (for addToMenu / itemsAddToMenu)…
        const meta    = await getCollectionMeta(coll);
        // 2b) …and fetch every entry in that collection
        const entries = await getCollection(coll);

        //
        // ── A) COLLECTION-LEVEL addToMenu from the _meta.mdx ────────────
        //
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link  = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link ?? coll}`;
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

        //
        // ── B) BULK itemsAddToMenu: “add every entry under /services” ────
        //
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

            for (const entry of entries) {
              // by default link back to its own slug if none provided
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
                  // allow you to override per-item title, else fall back
                  title: instr.title ?? entry.data.title ?? entry.slug,
                  link,
                  // if you wanted true hierarchy you could respect entry.data.parent
                  parent: instr.respectHierarchy && entry.data.parent
                    ? entry.data.parent
                    : instr.parent ?? null,
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

        //
        // ── C) PER-FILE addToMenu front-matter on each entry ──────────────
        //
        for (const entry of entries) {
          const list = Array.isArray(entry.data.addToMenu)
            ? entry.data.addToMenu
            : [];
          for (const instr of list) {
            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

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
      }

      logger.info(
        `[menu-items-loader] loaded ${store.keys().length} items`
      );
    },
  };
}
