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

      // ── 1) Clear & load static menuItems.json ───────────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) Eager-import ALL content files under src/content ──────────────
      //    • .mdx & .md  → mod.frontmatter
      //    • .json       → mod.default
      const contentModules = import.meta.glob<
        Record<string, any> & { frontmatter?: any; default?: any }
      >('../content/**/*.{mdx,md,json}', { eager: true });

      for (const path in contentModules) {
        // skip any _meta files
        if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

        const mod = contentModules[path]!;
        // frontmatter for MDX/MD, default export for JSON
        const front = mod.frontmatter ?? mod.default;
        if (!front?.addToMenu) continue;

        const instructions = Array.isArray(front.addToMenu)
          ? front.addToMenu
          : [front.addToMenu];

        // derive collection & slug from path: ../content/<collection>/<slug>.<ext>
        const segments = path.split('/');
        const filenameWithExt = segments.pop()!;
        const collection = segments.pop()!;
        const slug = filenameWithExt.replace(/\.(mdx|md|json)$/, '');
        const fallbackLink = `/${collection}/${slug}`;

        for (const instr of instructions) {
          const link = instr.link?.startsWith('/')
            ? instr.link
            : instr.link
              ? `/${instr.link}`
              : fallbackLink;
          const id = link.slice(1);
          const menus = Array.isArray(instr.menu)
            ? instr.menu
            : [instr.menu];

          store.set({
            id,
            data: {
              id,
              title: instr.title || front.title || capitalize(slug),
              link,
              parent: instr.parent ?? null,
              ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
              openInNewTab: instr.openInNewTab ?? false,
              menu: menus,
            },
          });
        }
      }

      // ── 3) Now inject your collection-level & itemsAddToMenu from each _meta.* ────
      const dynamic = getCollectionNames().filter(c => c !== 'menus' && c !== 'menuItems');

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3a) collection-level addToMenu
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

        // 3b) per-file itemsAddToMenu (merges into every entry)
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const existing = Array.isArray((entry.data as any).addToMenu)
              ? (entry.data as any).addToMenu
              : [];
            const combined = [...existing, ...meta.itemsAddToMenu];

            for (const instr of combined) {
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
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}