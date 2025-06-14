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

      // 1) clear out any previous items
      store.clear();

      // 2) load the static menuItems.json (Home, About Us, etc.)
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) find all other collections (except menus/menuItems)
      const allColls = getCollectionNames();
      const dynamicColls = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamicColls) {
        // 3a) fetch the parsed frontmatter for this collection (_meta.*)
        const meta = getCollectionMeta(coll);
        logger.info(`[menu-items-loader] "${coll}" meta:`, {
          addToMenu: meta.addToMenu,
          itemsAddToMenu: meta.itemsAddToMenu,
        });

        // ── Top‐level injection via addToMenu ──
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
            const id   = link.slice(1);
            const base = typeof instr.order === 'number'
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
                order: base,
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              },
            });
          }
        }

        // fetch all entries in this collection
        const entries = await getCollection(coll);

        // ── Bulk inject every page under this collection via itemsAddToMenu ──
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, idx) => {
              const entrySlug = entry.slug;
              const link      = `/${coll}/${entrySlug}`;
              const id        = `${coll}/${entrySlug}`;
              const parent    =
                instr.respectHierarchy && entry.data.parent
                  ? `${coll}/${entry.data.parent}`
                  : instr.parent ?? null;
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

        // ── Per-entry injection via each entry’s own addToMenu ──
        for (const entry of entries) {
          const list = Array.isArray((entry.data as any).addToMenu)
            ? (entry.data as any).addToMenu
            : [];
          for (const instr of list) {
            const defaultLink = `/${coll}/${entry.slug}`;
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
              ? `/${instr.link}`
              : defaultLink;
            const id = link.slice(1);
            const base = typeof instr.order === 'number'
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
                order: base,
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              },
            });
          }
        }
      }

      logger.info(`[menu-items-loader] total menu items loaded: ${store.keys().length}`);
    },
  };
}
