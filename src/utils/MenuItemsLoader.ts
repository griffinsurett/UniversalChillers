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
  respectHierarchy?: boolean;
};

export function MenuItemsLoader(): Loader {
  return {
    name: "menu-items-loader",
    async load(context: LoaderContext) {
      const { store, logger } = context;
      logger.info("→ Starting menu-items-loader (env: " + process.env.NODE_ENV + ")");

      // 1) Clear & load base menuItems.json
      store.clear();
      await file("src/content/menuItems/menuItems.json").load(context);

      // 2) Gather ALL instructions into one array
      type Tuple = {
        instr: MenuInstr;
        fallbackLink: string;
        fallbackTitle: string;
        entryParent?: string;
      };
      const allTuples: Tuple[] = [];

      // 2a) file-level addToMenu
      const mdxMods = import.meta.glob("../content/**/*.mdx", { eager: true });
      const mdMods  = import.meta.glob("../content/**/*.md",  { eager: true });
      const jsonMods= import.meta.glob("../content/**/*.json",{ eager: true });
      const contentModules = { ...mdxMods, ...mdMods, ...jsonMods };

      for (const path in contentModules) {
        if (/\/_meta\.(mdx|md|json)$/.test(path)) continue;
        const mod = (contentModules[path] as any);
        const raw = mod.frontmatter ?? mod.default;
        if (!raw) continue;

        const records = Array.isArray(raw) ? raw : [raw];
        const segments = path.split("/");
        const fileName  = segments.pop()!;
        const coll      = segments.pop()!;
        const slug      = fileName.replace(/\.(mdx|md|json)$/, "");

        for (const rec of records) {
          if (!rec.addToMenu) continue;
          const instrs: MenuInstr[] = Array.isArray(rec.addToMenu)
            ? rec.addToMenu
            : [rec.addToMenu];

          for (const instr of instrs) {
            allTuples.push({
              instr,
              fallbackLink: `/${coll}/${rec.id ?? slug}`,
              fallbackTitle: rec.title ?? capitalize(rec.id ?? slug),
              entryParent: rec.parent,
            });
          }
        }
      }

      // 2b) meta-level addToMenu + itemsAddToMenu
      const dynamic = getCollectionNames().filter(c => c !== "menus" && c !== "menuItems");
      for (const coll of dynamic) {
        const meta    = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // collection-level
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu as MenuInstr[]) {
            allTuples.push({
              instr,
              fallbackLink: `/${coll}`,
              fallbackTitle: capitalize(coll),
            });
          }
        }

        // per-entry
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const slug   = entry.slug;
            const title  = entry.data.title ?? capitalize(slug);
            const parent = entry.data.parent as string|undefined;

            for (const instr of meta.itemsAddToMenu as MenuInstr[]) {
              allTuples.push({
                instr,
                fallbackLink: `/${coll}/${slug}`,
                fallbackTitle: title,
                entryParent: parent,
              });
            }
          }
        }
      }

      // ** debug **
      logger.info(`[menu-items-loader] total tuples: ${allTuples.length}`);

      // 3) apply them *exactly* like file-level addToMenu
      function applyInstr(
        instr: MenuInstr,
        fallbackLink: string,
        fallbackTitle: string,
        entryParent?: string
      ) {
        const link = instr.link?.startsWith("/")
          ? instr.link
          : instr.link
            ? `/${instr.link}`
            : fallbackLink;

        const id = link.slice(1);
        const menus = Array.isArray(instr.menu) ? instr.menu : [instr.menu];

        store.set({
          id,
          data: {
            id,
            title: instr.title ?? fallbackTitle,
            link,
            parent:
              instr.respectHierarchy && entryParent
                ? entryParent
                : instr.parent ?? null,
            ...(typeof instr.order === "number" ? { order: instr.order } : {}),
            openInNewTab: instr.openInNewTab ?? false,
            menu: menus,
          },
        });
      }

      for (const { instr, fallbackLink, fallbackTitle, entryParent } of allTuples) {
        applyInstr(instr, fallbackLink, fallbackTitle, entryParent);
      }

      logger.info(`[menu-items-loader] loaded ${store.keys().length} items`);
    },
  };
}
