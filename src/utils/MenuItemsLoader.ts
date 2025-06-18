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

      // 1) Clear and load the base menuItems.json
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) PER-FILE addToMenu from MDX/MD/JSON content files
      {
        const modules = import.meta.glob<
          Record<string, any> & { frontmatter?: any; default?: any }
        >('../content/**/*.{mdx,md,json}', { eager: true });

        for (const path in modules) {
          // Skip any _meta.* files
          if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

          const mod = (modules[path] as any);
          const data = mod.frontmatter ?? mod.default;
          if (!data || !data.addToMenu) continue;

          // Normalize multiple vs single
          const records = Array.isArray(data) ? data : [data];

          // Derive collection & slug from file path
          const parts           = path.split('/');
          const fileNameWithExt = parts.pop()!;
          const collection      = parts.pop()!;
          const slug            = fileNameWithExt.replace(/\.(mdx|md|json)$/, '');
          const fallbackLink    = `/${collection}/${slug}`;

          for (const rec of records) {
            const items = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];

            for (const instr of items) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallbackLink;
              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || rec.title || capitalize(rec.id ?? slug),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      // 3) COLLECTION-LEVEL addToMenu + itemsAddToMenu via getCollectionMeta
      {
        const allCollections = getCollectionNames().filter(
          (c) => c !== 'menus' && c !== 'menuItems'
        );

        for (const coll of allCollections) {
          // Meta frontmatter parsed by FetchMeta
          const meta = getCollectionMeta(coll);
          const entries = await getCollection(coll);

          // 3a) collection-level `addToMenu`
          if (Array.isArray(meta.addToMenu)) {
            for (const instr of meta.addToMenu) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : `/${instr.link || coll}`;
              const id    = link.slice(1);
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

          // 3b) per-file `itemsAddToMenu`
          if (Array.isArray(meta.itemsAddToMenu)) {
            for (const entry of entries) {
              for (const instr of meta.itemsAddToMenu) {
                // If respecting hierarchy, let frontmatter parent override
                const parent = instr.respectHierarchy
                  ? entry.data.parent ?? instr.parent
                  : instr.parent;

                const link = instr.link?.startsWith('/')
                  ? instr.link
                  : instr.link
                    ? `/${instr.link}`
                    : `/${coll}/${entry.slug}`;
                const id    = link.slice(1);
                const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

                store.set({
                  id,
                  data: {
                    id,
                    title: instr.title || entry.data.title || entry.slug,
                    link,
                    parent: parent ?? null,
                    ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                    openInNewTab: instr.openInNewTab ?? false,
                    menu: menus,
                  },
                });
              }
            }
          }
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}