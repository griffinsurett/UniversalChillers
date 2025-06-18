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

      // ── 1) Clear store & load static JSON ───────────────────────────────
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // ── 2) Eager‐load all MDX entries’ frontmatter to pick up per-file addToMenu ──
      const mdxModules = import.meta.glob('../content/**/*.mdx', { eager: true });
      for (const path in mdxModules) {
        // Skip any _meta.mdx files
        if (path.endsWith('_meta.mdx')) continue;
        const mod = (mdxModules[path] as any);
        const front = mod.frontmatter;
        if (!front?.addToMenu) continue;

        const list = Array.isArray(front.addToMenu)
          ? front.addToMenu
          : [front.addToMenu];

        // Derive URL path from file path: ../content/<collection>/<slug>.mdx
        const parts = path.split('/');
        const fileName = parts.pop()!.replace(/\.mdx$/, '');
        const collection = parts.pop()!;
        const defaultLink = `/${collection}/${fileName}`;

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
              title: instr.title || front.title || capitalize(fileName),
              link,
              parent: instr.parent ?? null,
              ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
              openInNewTab: instr.openInNewTab ?? false,
              menu: menus,
            },
          });
        }
      }

      // ── 3) Inject collection‐level addToMenu & itemsAddToMenu from each _meta.mdx ──
      const dynamic = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3a) collection‐level addToMenu
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
                ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // 3b) per‐file itemsAddToMenu (merge into each entry)
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            // start with any real frontmatter addToMenu already on entry.data
            const perFile = Array.isArray((entry.data as any).addToMenu)
              ? (entry.data as any).addToMenu
              : [];
            const combined = [...perFile, ...meta.itemsAddToMenu];

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
                  title:
                    instr.title || entry.data.title || entry.slug,
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

        logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
      }
    },
  };
}