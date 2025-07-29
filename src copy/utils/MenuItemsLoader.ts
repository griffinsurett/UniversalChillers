// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize, normalizeRef } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Clear & load primary menuItems.json
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) Eager-import all content modules
      const mdxMods = import.meta.glob('../content/**/*.mdx', { eager: true });
      const mdMods = import.meta.glob('../content/**/*.md', { eager: true });
      const jsonMods = import.meta.glob('../content/**/*.json', { eager: true });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods } as Record<string, any>;

      // 2a) per-file addToMenu
      for (const path in contentModules) {
        if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;
        const mod = contentModules[path];
        const raw = mod.frontmatter ?? mod.default;
        if (!raw) continue;

        const records = Array.isArray(raw) ? raw : [raw];
        const segs = path.split('/');
        const fileName = segs.pop()!;
        const coll = segs.pop()!;
        const fileSlug = fileName.replace(/\.(mdx|md|json)$/, '');

        for (const rec of records) {
          if (!rec.addToMenu) continue;
          const instrs = Array.isArray(rec.addToMenu) ? rec.addToMenu : [rec.addToMenu];

          for (const instr of instrs) {
            const link = instr.link
              ? instr.link.startsWith('/')
                ? instr.link
                : `/${instr.link}`
              : `/${coll}/${rec.id ?? fileSlug}`;
            // use custom id if provided, else derive from link
            const id = instr.id ?? link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title: instr.title || rec.title || capitalize(rec.id ?? fileSlug),
                link,
                parent: instr.parent ?? null,
                ...(typeof instr.order === 'number' && { order: instr.order }),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }
      }

      // 3) collection-level addToMenu & itemsAddToMenu
      const dynamic = getCollectionNames().filter(c => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);

        // 3a) meta.addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            // respect custom id if present
            const id = instr.id ?? link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title: instr.title || capitalize(coll),
                link,
                parent: instr.parent ?? null,
                ...(typeof instr.order === 'number' && { order: instr.order }),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // 3b) meta.itemsAddToMenu
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const path in contentModules) {
            if (!path.includes(`../content/${coll}/`)) continue;
            if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

            const mod = contentModules[path];
            const raw = mod.frontmatter ?? {};
            const segs = path.split(`../content/${coll}/`)[1].split('/');
            const fileName = segs.pop()!;
            const nested = segs; // subfolders
            const fileSlug = fileName.replace(/\.(mdx|md|json)$/, '');
            const routeParts = [coll, ...nested, fileSlug];
            const defaultLink = `/${routeParts.join('/')}`;

            for (const instr of meta.itemsAddToMenu) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : instr.link
                  ? `/${instr.link}`
                  : defaultLink;
              const id = instr.id ?? link.slice(1);
              const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

              // Determine parent: frontmatter overrides when respectHierarchy
              let parent = null;
              if (instr.respectHierarchy && raw.parent) {
                const parentSlug = normalizeRef(raw.parent);
                parent = { id: `${coll}/${parentSlug}`, collection: 'menuItems' };
              } else {
                const parentId = instr.parent?.id;
                const parentCol = instr.parent?.collection;
                parent = parentId
                  ? { id: parentId, collection: parentCol }
                  : null;
              }
              store.set({
                id,
                data: {
                  id,
                  title: instr.title || raw.title || fileSlug,
                  link,
                  parent,
                  ...(typeof instr.order === 'number' && { order: instr.order }),
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
