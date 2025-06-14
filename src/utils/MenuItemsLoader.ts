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

      // 1) clear everything and load your static JSON
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) figure out which content collections to inject
      const allColls = getCollectionNames();
      const dynamic = allColls.filter((c) => c !== 'menus' && c !== 'menuItems');

      // 3) for each collection, merge ALL addToMenu sources
      for (const coll of dynamic) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3a) collection-level addToMenu (always top-level entries, e.g. /services)
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id    = link.replace(/^\//, '');
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
        }

        // 3b) now for each entry, gather **all** addToMenu instructions:
        for (const entry of entries) {
          // • file-level frontmatter:
          const fileList = Array.isArray((entry.data as any).addToMenu)
            ? (entry.data as any).addToMenu
            : [];

          // • meta-level bulk itemsAddToMenu:
          const bulkList = Array.isArray(meta.itemsAddToMenu)
            ? meta.itemsAddToMenu
            : [];

          // combine them
          const instructions = [...fileList, ...bulkList];

          // 3c) emit one store.set per instruction
          for (const instr of instructions) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
                ? `/${instr.link}`
                : `/${coll}/${entry.slug}`;
            const id = link.replace(/^\//, '');
            const menus = Array.isArray(instr.menu)
              ? instr.menu
              : [instr.menu];

            // If the meta-block used respectHierarchy:true without parent,
            // you probably intended to nest under the collection’s root
            const parent = instr.parent
              ?? (instr.respectHierarchy ? coll : null);

            store.set({
              id,
              data: {
                id,
                title: instr.title || entry.data.title || entry.slug,
                link,
                parent,
                ...(typeof instr.order === 'number'
                  ? { order: instr.order }
                  : entry.data.order
                    ? { order: entry.data.order }
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
