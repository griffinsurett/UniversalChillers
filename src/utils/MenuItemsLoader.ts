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
    async load({ store, logger }: LoaderContext) {
      // 1) Clear existing and load static menuItems.json
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(arguments[0]);

      // 2) All collections except menus/menuItems
      const dynamic = getCollectionNames().filter(c => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);
        const injections: Array<{ title: string; link: string; parent: string | null; order?: number; openInNewTab: boolean; menu: string[] }> = [];

        // 3) Collection-level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/') ? instr.link : `/${instr.link || coll}`;
            injections.push({
              title:       instr.title || capitalize(coll),
              link,
              parent:      instr.parent ?? null,
              order:       typeof instr.order === 'number' ? instr.order : undefined,
              openInNewTab: instr.openInNewTab ?? false,
              menu:        Array.isArray(instr.menu) ? instr.menu : [instr.menu],
            });
          }
        }

        // 4) Entry-level addToMenu
        for (const entry of entries) {
          const list = Array.isArray((entry.data as any).addToMenu) ? (entry.data as any).addToMenu : [];
          if (!list.length) continue;
          for (const instr of list) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
                ? `/${instr.link}`
                : `/${coll}/${entry.slug}`;
            injections.push({
              title:       instr.title || entry.data.title || entry.slug,
              link,
              parent:      instr.parent ?? null,
              order:       typeof instr.order === 'number' ? instr.order : undefined,
              openInNewTab: instr.openInNewTab ?? false,
              menu:        Array.isArray(instr.menu) ? instr.menu : [instr.menu],
            });
          }
        }

        // 5) Inject all collected items
        for (const item of injections) {
          const id = item.link.slice(1);
          store.set({
            id,
            data: {
              id,
              title:       item.title,
              link:        item.link,
              parent:      item.parent,
              ...(item.order !== undefined ? { order: item.order } : {}),
              openInNewTab: item.openInNewTab,
              menu:        item.menu,
            },
          });
        }

        logger.info(`[menu-items-loader] loaded ${store.keys().length} items (from ${coll})`);
      }
    },
  };
}
