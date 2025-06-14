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

      // 1) Clear everything out
      store.clear();

      // 2) Load your static JSON first (preserves `order`)
      await file('src/content/menuItems/menuItems.json').load(context);

      // 3) Now walk every other collection and apply addToMenu + itemsAddToMenu
      const allColls = getCollectionNames();
      const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 3a) Collection-level addToMenu ───────────────────────────
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                order: typeof instr.order === 'number' ? instr.order : 0,
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // ── 3b) Bulk itemsAddToMenu ───────────────────────────────────
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const instr of meta.itemsAddToMenu) {
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];
            const parentInstr = instr.parent ?? null;

            entries.forEach((entry, i) => {
              const slug = entry.slug;
              const link = `/${coll}/${slug}`;
              const id = `${coll}/${slug}`;
              const title = entry.data.title || slug;

              // respectHierarchy → use the entry’s own parent frontmatter
              const parent =
                instr.respectHierarchy && entry.data.parent
                  ? `${coll}/${entry.data.parent}`
                  : parentInstr;

              // if you set `order:` in your frontmatter use that, otherwise use the index
              const order =
                typeof entry.data.order === 'number' ? entry.data.order : i;

              store.set({
                id,
                data: {
                  id,
                  title,
                  link,
                  parent,
                  order,
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            });
          }
        }

        // ── 3c) Per-entry addToMenu (frontmatter on individual files) ──
        for (const entry of entries) {
          const list = (entry.data as any).addToMenu;
          if (Array.isArray(list)) {
            const defaultLink = `/${coll}/${entry.slug}`;
            for (const instr of list) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                ? `/${instr.link}`
                : defaultLink;
              const id = link.slice(1);
              const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title:
                    instr.title ||
                    entry.data.title ||
                    entry.slug,
                  link,
                  parent: instr.parent ?? null,
                  order:
                    typeof instr.order === 'number'
                      ? instr.order
                      : 0,
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
