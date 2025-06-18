// src/utils/MenuItemsLoader.ts
import { file, Loader } from "astro/loaders";
import type { LoaderContext } from "astro/loaders";
import { getCollectionMeta } from "@/utils/FetchMeta";
import { capitalize } from "@/utils/ContentUtils";
import { getCollectionNames } from "@/utils/CollectionUtils";

export function MenuItemsLoader(): Loader {
  return {
    name: "menu-items-loader",
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // 1) Clear & load your primary menuItems.json
      store.clear();
      await file("src/content/menuItems/menuItems.json").load(context);

      // 2) Eager-import all MDX, MD & JSON under src/content
      const mdxMods = import.meta.glob("../content/**/*.mdx", { eager: true });
      const mdMods = import.meta.glob("../content/**/*.md", { eager: true });
      const jsonMods = import.meta.glob("../content/**/*.json", { eager: true });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods };

      // 2a) per-file addToMenu (works in dev + build)
      for (const path in contentModules) {
        if (/\/\/_meta\.(mdx|md|json)$/.test(path)) continue;

        const mod = contentModules[path] as any;
        const raw = mod.frontmatter ?? mod.default;
        if (!raw) continue;

        const records = Array.isArray(raw) ? raw : [raw];
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
                  instr.title ||
                  rec.title ||
                  capitalize(rec.id ?? fileSlug),
                link,
                parent: instr.parent ?? null,
                ...(typeof instr.order === "number" && { order: instr.order }),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }
      }

      // 3) collection-level addToMenu & itemsAddToMenu from each _meta.*
      const dynamic = getCollectionNames().filter(
        (c) => c !== "menus" && c !== "menuItems"
      );

      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);

        // 3a) collection-level addToMenu
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
                ...(typeof instr.order === "number" && { order: instr.order }),
                openInNewTab: instr.openInNewTab ?? false,
                menu: menus,
              },
            });
          }
        }

        // 3b) per-file itemsAddToMenu (with respectHierarchy)
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const path in contentModules) {
            if (!path.includes(`../content/${coll}/`)) continue;
            if (/\/\/_meta\.(mdx|md|json)$/.test(path)) continue;

            const mod = contentModules[path] as any;
            const fm = mod.frontmatter ?? {};

            const segments = path.split("/");
            const fileNameWithExt = segments.pop()!;
            const fileSlug = fileNameWithExt.replace(/\.(mdx|md|json)$/, "");

            for (const instr of meta.itemsAddToMenu!) {
              // build link
              const link = instr.link?.startsWith("/")
                ? instr.link
                : instr.link
                ? `/${instr.link}`
                : `/${coll}/${fileSlug}`;

              // determine parentId, prefixing collection if needed
              let parentId: string | null = null;
              if (instr.respectHierarchy && fm.parent) {
                if (fm.parent.startsWith("/")) {
                  parentId = fm.parent.slice(1);
                } else if (fm.parent.includes("/")) {
                  parentId = fm.parent;
                } else {
                  parentId = `${coll}/${fm.parent}`;
                }
              } else {
                parentId = instr.parent ?? null;
              }

              const id = link.slice(1);
              const menus = Array.isArray(instr.menu)
                ? instr.menu
                : [instr.menu];

              store.set({
                id,
                data: {
                  id,
                  title:
                    instr.title ||
                    (fm.title as string) ||
                    capitalize(fileSlug),
                  link,
                  parent: parentId,
                  ...(typeof instr.order === "number" && { order: instr.order }),
                  openInNewTab: instr.openInNewTab ?? false,
                  menu: menus,
                },
              });
            }
          }
        }
      }

      logger.info(
        `[menu-items-loader] loaded ${store.keys().length} items`
      );
    },
  };
}
