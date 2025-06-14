// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Clear any existing items
      store.clear();

      // 2) Load the static menuItems.json first
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) Find all user collections (except menus/menuItems)
      const allColls = getCollectionNames();
      const dynamicColls = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamicColls) {
        // ── Attempt to load frontmatter from src/content/<coll>/_meta.mdx ──
        let metaFm: any = {};
        try {
          const mdx = await file(`src/content/${coll}/_meta.mdx`).load(context);
          metaFm = mdx.frontmatter ?? {};
          logger.info(`[menu-items-loader] frontmatter for "${coll}":`, metaFm);
        } catch {
          // no _meta.mdx, or not a meta file – that's fine
        }

        const addToMenu       = Array.isArray(metaFm.addToMenu)       ? metaFm.addToMenu       : [];
        const itemsAddToMenu  = Array.isArray(metaFm.itemsAddToMenu)  ? metaFm.itemsAddToMenu  : [];

        //
        // 3a) collection-level addToMenu
        //
        for (const instr of addToMenu) {
          const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
          const id   = link.slice(1);
          // pick either instr.order or instr.weight (or default 0)
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

        //
        // 3b) bulk itemsAddToMenu — inject every page under this collection
        //
        const entries = await getCollection(coll);
        for (const instr of itemsAddToMenu) {
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

        //
        // 3c) per-entry addToMenu — inject only the pages that specify it
        //
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

      logger.info(`[menu-items-loader] total menu items loaded: ${store.keys().length}`);
    },
  };
}
