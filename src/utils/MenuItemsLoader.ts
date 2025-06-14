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

      // 1) clear the existing store & load your static JSON
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) discover all dynamic collections
      const allColls = getCollectionNames();
      const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 2a) Inject meta.itemsAddToMenu into each entry’s addToMenu
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const raw = (entry.data as any).addToMenu;
            const original = raw
              ? Array.isArray(raw)
                ? raw
                : [raw]
              : [];
            entry.data.addToMenu = [
              ...original,
              ...meta.itemsAddToMenu,
            ];
          }
        }

        // ── 3a) Register collection-level addToMenu from _meta.mdx
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
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

        // ── 3b) Register per-file addToMenu from each entry’s frontmatter
        for (const entry of entries) {
          const raw = (entry.data as any).addToMenu;
          const list = raw
            ? Array.isArray(raw)
              ? raw
              : [raw]
            : [];

          // Optional: log to debug what’s coming through
          logger.debug(`[menu-items-loader] ${coll}/${entry.slug} addToMenu:`, list);

          for (const instr of list) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
              ? `/${instr.link}`
              : `/${coll}/${entry.slug}`;
            const id = link.slice(1);
            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

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

        logger.info(`[menu-items-loader] loaded ${store.keys().length} items so far`);
      }
    },
  };
}
