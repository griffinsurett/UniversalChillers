// src/utils/MenuItemsLoader.ts
import { file, Loader } from 'astro/loaders';
import { getCollection } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { getCollectionMeta } from '@/utils/FetchMeta';
import { capitalize } from '@/utils/ContentUtils';
import { getCollectionNames } from '@/utils/CollectionUtils';

/**
 * Helper to apply addToMenu-like instructions
 */
function applyMenuInstructions(
  store: LoaderContext['store'],
  instructions: any[],
  defaultLink: () => string,
  defaultTitle: () => string
) {
  for (const instr of instructions) {
    const link = instr.link
      ? instr.link.startsWith('/')
        ? instr.link
        : `/${instr.link}`
      : defaultLink();
    const id = link.slice(1);
    const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

    store.set({
      id,
      data: {
        id,
        title: instr.title ?? defaultTitle(),
        link,
        parent: instr.parent ?? null,
        ...(typeof instr.order === 'number' ? { order: instr.order } : {}),
        openInNewTab: instr.openInNewTab ?? false,
        menu: menus,
      },
    });
  }
}

export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Load primary menuItems.json
      store.clear();
      await file('src/content/menuItems/menuItems.json').load(context);

      // 2) Eager-import all MDX, MD & JSON under src/content
      const mdxMods = import.meta.glob('../content/**/*.mdx', { eager: true });
      const mdMods = import.meta.glob('../content/**/*.md', { eager: true });
      const jsonMods = import.meta.glob('../content/**/*.json', { eager: true });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods };

      for (const path in contentModules) {
        if (/\/ _meta\.(mdx|md|json)$/.test(path)) continue;
        const mod = (contentModules[path] as any);
        const raw = mod.frontmatter ?? mod.default;
        if (!raw) continue;

        const records = Array.isArray(raw) ? raw : [raw];
        for (const rec of records) {
          if (!rec.addToMenu) continue;
          const instrs = Array.isArray(rec.addToMenu) ? rec.addToMenu : [rec.addToMenu];

          applyMenuInstructions(
            store,
            instrs,
            () => `/${path.split('/').slice(-2)[0]}/${rec.id ?? path.split('/').pop()!.replace(/\.(mdx|md|json)$/, '')}`,
            () => rec.title ?? capitalize(rec.id ?? '')
          );
        }
      }

      // 3) Collection-level and items-level meta instructions
      const dynamic = getCollectionNames().filter(c => c !== 'menus' && c !== 'menuItems');
      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3a) collection-level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          applyMenuInstructions(
            store,
            meta.addToMenu,
            () => `/${coll}`,
            () => capitalize(coll)
          );
        }

        // 3b) per-entry itemsAddToMenu
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            applyMenuInstructions(
              store,
              meta.itemsAddToMenu,
              () => `/${coll}/${entry.slug}`,
              () => entry.data.title ?? entry.slug
            );
          }
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}