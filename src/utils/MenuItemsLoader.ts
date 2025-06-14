// src/utils/MenuItemsLoader.ts
import type { Loader, LoaderContext } from 'astro/loaders';
import { getCollection } from 'astro:content';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

// 1) import your menuItems.json via ESM
import staticMenuItems from '../content/menuItems/menuItems.json';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── Clear out any prior state ────────────────────────────────────────────
      store.clear();

      // ── 1. Seed store with static JSON entries ───────────────────────────────
      for (const item of staticMenuItems) {
        store.set({
          id: item.id,
          data: item
        });
      }

      // ── 2. Discover all other content collections ─────────────────────────────
      const allColls = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of allColls) {
        const meta = await getCollectionMeta(coll);

        // 2a) collection‐level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);
            const order = typeof instr.order === 'number' ? instr.order : 0;

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                order,
                openInNewTab: instr.openInNewTab ?? false,
                menu: instr.menu,
              },
            });
          }
        }

        // 2b) bulk itemsAddToMenu (your “add items to menu” meta)
        const entries = await getCollection(coll);
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            entries.forEach((entry, i) => {
              const entrySlug = entry.slug;
              const link = `/${coll}/${entrySlug}`;
              const id = `${coll}/${entrySlug}`;
              const parent = (instr.respectHierarchy && entry.data.parent)
                ? `${coll}/${entry.data.parent}`
                : instr.parent ?? null;
              const baseOrder = typeof instr.order === 'number' ? instr.order : 0;
              const order = baseOrder + i;

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

        // 2c) per‐entry addToMenu (if you ever want to add menu items from
        //     individual frontmatter in your MDX files)
        for (const entry of entries) {
          const list = (entry.data as any).addToMenu;
          if (Array.isArray(list)) {
            for (const instr of list) {
              const defaultLink = `/${coll}/${entry.slug}`;
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                ? `/${instr.link}`
                : defaultLink;
              const id = link.slice(1);
              const order = typeof instr.order === 'number' ? instr.order : 0;

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
      }

      logger.info(`[menu-items-loader] total items: ${store.keys().length}`);
    },
  };
}
