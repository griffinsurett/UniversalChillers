// src/utils/MenuItemsLoader.ts
import { file, Loader } from "astro/loaders";
import { getCollection } from "astro:content";
import type { LoaderContext } from "astro/loaders";
import { getCollectionMeta } from "@/utils/FetchMeta";
import { capitalize } from "@/utils/ContentUtils";
import { getCollectionNames } from "@/utils/CollectionUtils";

export function MenuItemsLoader(): Loader {
  return {
    name: "menu-items-loader",
    async load(context: LoaderContext) {
      const { store, logger } = context; // 1) Clear & load your primary menuItems.json

      store.clear();
      await file("src/content/menuItems/menuItems.json").load(context); // 2) Eager-import all MDX, MD & JSON under src/content

      const mdxMods = import.meta.glob("../content/**/*.mdx", { eager: true });
      const mdMods = import.meta.glob("../content/**/*.md", { eager: true });
      const jsonMods = import.meta.glob("../content/**/*.json", {
        eager: true,
      });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods };

      for (const path in contentModules) {
        // skip any _meta.* files
        if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

        const mod = contentModules[path] as any; // MDX/MD frontmatter or JSON default export
        const raw = mod.frontmatter ?? mod.default;
        if (!raw) continue; // normalize to array of “records”

        const records = Array.isArray(raw) ? raw : [raw]; // derive collection & fallback slug from file path

        const segments = path.split("/");
        const fileNameWithExt = segments.pop()!;
        const collection = segments.pop()!;
        const fileSlug = fileNameWithExt.replace(/\.(mdx|md|json)$/, "");

        for (const rec of records) {
          if (!rec.addToMenu) continue;

          const instructions = Array.isArray(rec.addToMenu)
            ? rec.addToMenu
            : [rec.addToMenu];

          for (const instr of instructions) {
            // build link: explicit → absolute; else fallback /<collection>/<rec.id||fileSlug>
            const link = instr.link
              ? instr.link.startsWith("/")
                ? instr.link
                : `/${instr.link}`
              : `/${collection}/${rec.id ?? fileSlug}`;

            const id = link.slice(1);
            const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

            store.set({
              id,
              data: {
                id,
                title:
                  instr.title || rec.title || capitalize(rec.id ?? fileSlug),
                link,
                parent: instr.parent ?? null,
                ...(typeof instr.order === "number"
                  ? { order: instr.order }
                  : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }
      } // 3) Inject collection-level addToMenu & itemsAddToMenu from each _meta.*

      const dynamic = getCollectionNames().filter(
        (c) => c !== "menus" && c !== "menuItems"
      );
      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll); // 3a) collection-level addToMenu

        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const link = instr.link?.startsWith("/")
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
                ...(typeof instr.order === "number"
                  ? { order: instr.order }
                  : {}),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        } // 3b) per-file itemsAddToMenu

        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const existing = Array.isArray((entry.data as any).addToMenu)
              ? (entry.data as any).addToMenu
              : [];
            const combined = [...existing, ...meta.itemsAddToMenu];

            for (const instr of combined) {
              const link = instr.link?.startsWith("/")
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
                  ...(typeof instr.order === "number"
                    ? { order: instr.order }
                    : {}),
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
