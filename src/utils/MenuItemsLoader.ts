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

      // 1) Clear the store & load your static JSON
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) Find all dynamic collections
      const dynamic = getCollectionNames().filter(
        (c) => c !== 'menus' && c !== 'menuItems'
      );

      for (const coll of dynamic) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // ── 3a) Inject collection‐level addToMenu from _meta.mdx ──
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : `/${instr.link || coll}`;
            const id    = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title:       instr.title      || capitalize(coll),
                link,
                parent:      instr.parent     ?? null,
                ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu:        menus,
              },
            });
          }
        }

        // ── 3b) Inject per‐entry addToMenu (frontmatter) ──
        //     + any meta.itemsAddToMenu instructions too
        const fileLevel: any[] = Array.isArray(meta.itemsAddToMenu)
          ? meta.itemsAddToMenu
          : [];

        for (const entry of entries) {
          // read (but do NOT mutate!) the frontmatter array:
          const fm = Array.isArray((entry.data as any).addToMenu)
            ? (entry.data as any).addToMenu
            : [];

          // combine frontmatter + collection-level itemsAddToMenu
          const combined = [...fm, ...fileLevel];
          if (!combined.length) continue;

          console.log(`[menu-loader][${coll}/${entry.slug}] addToMenu:`, combined);

          for (const instr of combined) {
            const link = instr.link?.startsWith('/')
              ? instr.link
              : instr.link
                ? `/${instr.link}`
                : `/${coll}/${entry.slug}`;
            const id    = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title:       instr.title      || entry.data.title || entry.slug,
                link,
                parent:      instr.parent     ?? null,
                ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu:        menus,
              },
            });
          }
        }

        logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
      }
    },
  };
}
