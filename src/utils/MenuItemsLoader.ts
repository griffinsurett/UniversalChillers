// src/utils/MenuItemsLoader.ts
import type { Loader, LoaderContext } from 'astro/loaders';
import { file } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { getCollection } from 'astro:content';
import { capitalize } from '@/utils/ContentUtils';

export function menuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load({ store, logger, config, parseData, generateDigest }) {
      // ── 1) start fresh
      store.clear();

      // ── 2) load your static JSON
      await file(`${config.root}/src/content/menuItems/menuItems.json`).load({ store, logger, config, parseData, generateDigest });

      // ── 3) inject your dynamic collections
      const dynamicCollections = ['services', 'projects', 'testimonials', 'faq', 'clients'];

      for (const coll of dynamicCollections) {
        const meta = await getCollectionMeta(coll);

        //— 3a) collection-level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link||coll}`;
            const id   = link.slice(1);
            const raw  = {
              id,
              title: instr.title || capitalize(coll),
              link,
              parent: instr.parent ?? null,
              order: instr.order ?? 0,             // ← use `order`, not `weight`
              openInNewTab: instr.openInNewTab ?? false,
              menu: instr.menu,
            };
            const data = await parseData({ id, data: raw });
            store.set(id, { id, data, digest: generateDigest(data) });
            logger.info(`menu‐items-loader → added ${id}`);
          }
        }

        //— 3b) per‐entry itemsAddToMenu
        const entries = await getCollection(coll);
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach(async (entry, i) => {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                  ? `/${instr.link}`
                  : `/${coll}/${entry.slug}`;
              const id    = link.slice(1);
              const raw   = {
                id,
                title: instr.title || entry.data.title || entry.slug,
                link,
                parent: instr.respectHierarchy && entry.data.parent
                  ? `${coll}/${entry.data.parent}`
                  : instr.parent ?? null,
                order: (instr.order ?? 0) + i,     // ← again, use `order`
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              };
              const data = await parseData({ id, data: raw });
              store.set(id, { id, data, digest: generateDigest(data) });
              logger.info(`menu‐items-loader → added ${id}`);
            });
          }
        }
      }

      logger.info(`[menu‐items-loader] total items: ${store.keys().length}`);
    },
  };
}
