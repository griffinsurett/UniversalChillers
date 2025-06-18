// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { capitalize } from '@/utils/ContentUtils';

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // ── 1) Clear & load your base menuItems.json ──────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) PER-FILE addToMenu: MDX / MD / JSON entries ────────────────
      {
        const mods = import.meta.glob<
          Record<string, any> & { frontmatter?: any; default?: any }
        >('../content/**/*.{mdx,md,json}', { eager: true });

        for (const path in mods) {
          // skip any _meta.* files here
          if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

          const mod   = mods[path]!;
          const raw   = mod.frontmatter ?? mod.default;
          if (!raw) continue;

          // normalize single-object → array
          const records = Array.isArray(raw) ? raw : [raw];

          // derive collection & slug from path
          const parts           = path.split('/');
          const fileNameWithExt = parts.pop()!;
          const collection      = parts.pop()!;
          const fileSlug        = fileNameWithExt.replace(/\.(mdx|md|json)$/, '');
          const fallbackLink    = `/${collection}/${fileSlug}`;

          for (const rec of records) {
            if (!rec.addToMenu) continue;
            const instrs = Array.isArray(rec.addToMenu)
              ? rec.addToMenu
              : [rec.addToMenu];

            for (const instr of instrs) {
              const link = instr.link
                ? instr.link.startsWith('/')
                  ? instr.link
                  : `/${instr.link}`
                : fallbackLink;

              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || rec.title || capitalize(rec.id ?? fileSlug),
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

      // ── 3) COLLECTION‐LEVEL addToMenu & itemsAddToMenu from each _meta.* ──
      {
        // glob in all your collection meta files
        const metaMods = import.meta.glob<
          Record<string, any> & { frontmatter?: any; default?: any }
        >('../content/**/_meta.{mdx,md,json}', { eager: true });

        for (const path in metaMods) {
          const mod   = metaMods[path]!;
          const front = mod.frontmatter ?? mod.default;
          if (!front) continue;

          // derive collection name from the file path:
          // e.g. "../content/services/_meta.mdx" → "services"
          const parts     = path.split('/');
          const collIndex = parts.findIndex((p) => p === 'content') + 1;
          const collection = parts[collIndex];

          // 3a) collection‐level addToMenu
          if (Array.isArray(front.addToMenu)) {
            for (const instr of front.addToMenu) {
              const link = instr.link?.startsWith('/')
                ? instr.link
                : `/${instr.link || collection}`;
              const id    = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title: instr.title || capitalize(collection),
                  link,
                  parent: instr.parent ?? null,
                  ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }

          // 3b) itemsAddToMenu: loop through ALL entries in that collection
          if (Array.isArray(front.itemsAddToMenu)) {
            const entries = await getCollection(collection);

            for (const entry of entries) {
              const instrs = front.itemsAddToMenu;
              for (const instr of instrs) {
                // if respectHierarchy, use entry.data.parent if set
                const parent = instr.respectHierarchy
                  ? entry.data.parent ?? instr.parent
                  : instr.parent;

                const link = instr.link?.startsWith('/')
                  ? instr.link
                  : instr.link
                    ? `/${instr.link}`
                    : `/${collection}/${entry.slug}`;
                const id    = link.slice(1);
                const menus = Array.isArray(instr.menu)
                  ? instr.menu
                  : [instr.menu];

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