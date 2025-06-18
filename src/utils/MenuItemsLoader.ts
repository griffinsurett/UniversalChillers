// src/utils/MenuItemsLoader.ts
import { file, Loader } from "astro/loaders";
import { getCollection } from "astro:content";
import type { LoaderContext } from "astro/loaders";
import { getCollectionMeta } from "@/utils/FetchMeta";
import { capitalize } from "@/utils/ContentUtils";
import { getCollectionNames } from "@/utils/CollectionUtils";

type MenuInstr = {
  menu: string | string[];
  link?: string;
  title?: string;
  parent?: string;
  order?: number;
  openInNewTab?: boolean;
};

export function MenuItemsLoader(): Loader {
  return {
    name: "menu-items-loader",
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // Helper to normalize & store a single instruction
      function applyInstr(
        instr: MenuInstr,
        fallbackId: string,
        fallbackTitle: string
      ) {
        // build the link
        const link = instr.link
          ? instr.link.startsWith("/")
            ? instr.link
            : `/${instr.link}`
          : fallbackId;

        const id = link.slice(1);
        const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

        store.set({
          id,
          data: {
            id,
            title: instr.title ?? fallbackTitle,
            link,
            parent: instr.parent ?? null,
            ...(typeof instr.order === "number" ? { order: instr.order } : {}),
            openInNewTab: instr.openInNewTab ?? false,
            menu: menus,
          },
        });
      }

      // 1) Clear & load base menuItems.json
      store.clear();
      await file("src/content/menuItems/menuItems.json").load(context);

      // 2) Eager-import all MDX/MD/JSON under content
      const mdxMods = import.meta.glob("../content/**/*.mdx", { eager: true });
      const mdMods = import.meta.glob("../content/**/*.md", { eager: true });
      const jsonMods = import.meta.glob("../content/**/*.json", {
        eager: true,
      });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods };

      for (const path in contentModules) {
        if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;

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
          const instrs: MenuInstr[] = Array.isArray(rec.addToMenu)
            ? rec.addToMenu
            : [rec.addToMenu];

          for (const instr of instrs) {
            const fallbackId = `/${collection}/${rec.id ?? fileSlug}`;
            const fallbackTitle = rec.title ?? capitalize(rec.id ?? fileSlug);
            applyInstr(instr, fallbackId, fallbackTitle);
          }
        }
      }

      // 3) Now handle meta.addToMenu and meta.itemsAddToMenu
      const dynamic = getCollectionNames().filter(
        (c) => c !== "menus" && c !== "menuItems"
      );
      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // 3a) collection-level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const fallbackId = `/${coll}`;
            const fallbackTitle = capitalize(coll);
            applyInstr(instr, fallbackId, fallbackTitle);
          }
        }

        // 3b) itemsAddToMenu: run that same logic for *every* entry
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const instrs = meta.itemsAddToMenu as MenuInstr[];
            for (const instr of instrs) {
              const fallbackId = `/${coll}/${entry.slug}`;
              const fallbackTitle =
                entry.data.title ?? capitalize(entry.slug);
              applyInstr(instr, fallbackId, fallbackTitle);
            }
          }
        }
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
