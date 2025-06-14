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

      // ── 1) clear + load your static JSON menus ────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) find every "real" collection (excluding menus & menuItems) ──
      const allColls = getCollectionNames();
      const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 3) build one flat list of "injections" ─────────────────────
        const injections: Array<{
          title?: string;
          link?: string;
          parent?: string | null;
          order?: number;
          openInNewTab?: boolean;
          menu: string | string[];
        }> = [];

        // 3a) any explicit meta.addToMenu
        if (Array.isArray(meta.addToMenu)) {
          injections.push(...meta.addToMenu);
        }

        // 3b) for each itemsAddToMenu -> one injection PER entry
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            for (const entry of entries) {
              injections.push({
                // propagate everything from the instruction...
                ...instr,
                // but override the link to point at this entry
                link: `/${coll}/${entry.slug}`,
                // default title to entry title if none provided
                title: instr.title ?? entry.data.title ?? entry.slug,
                // default order from entry.data.order if not provided
                order: instr.order ?? entry.data.order,
              });
            }
          }
        }

        // ── 4) one pass: materialize every injection ────────────
        for (const instr of injections) {
          const link = instr.link?.startsWith('/') ? instr.link! : `/${instr.link}`;
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

        logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
      }
    },
  };
}
