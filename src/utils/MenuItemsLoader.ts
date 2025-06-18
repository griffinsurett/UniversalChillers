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

      // 1) Clear & load your base menuItems.json
      store.clear();
      await file("src/content/menuItems/menuItems.json").load(context);

      // 2) Build a unified list of [instr, context] tuples
      type Tuple = {
        instr: MenuInstr;
        // fallbackLink = where this menu item should point if no instr.link
        fallbackLink: string;
        // fallbackTitle = what to call it if instr.title is missing
        fallbackTitle: string;
        // entryParent = original entry.parent (for respectHierarchy)
        entryParent?: string;
      };
      const allTuples: Tuple[] = [];

      // 2a) — file-level addToMenu
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
        const fileName = segments.pop()!;
        const coll = segments.pop()!;
        const slug = fileName.replace(/\.(mdx|md|json)$/, "");

        for (const rec of records) {
          if (!rec.addToMenu) continue;
          const instrs: MenuInstr[] = Array.isArray(rec.addToMenu)
            ? rec.addToMenu
            : [rec.addToMenu];

          for (const instr of instrs) {
            const fallbackLink = `/${coll}/${rec.id ?? slug}`;
            const fallbackTitle =
              rec.title ?? capitalize(rec.id ?? slug);
            allTuples.push({
              instr,
              fallbackLink,
              fallbackTitle,
              entryParent: rec.parent,
            });
          }
        }
      }

      // 2b) — meta-level addToMenu & itemsAddToMenu
      const dynamic = getCollectionNames().filter(
        (c) => c !== "menus" && c !== "menuItems"
      );
      for (const coll of dynamic) {
        const meta = await getCollectionMeta(coll);
        const entries = await getCollection(coll);

        // — collection-level addToMenu
        if (Array.isArray(meta.addToMenu)) {
          for (const instr of meta.addToMenu) {
            const fallbackLink = `/${coll}`;
            const fallbackTitle = capitalize(coll);
            allTuples.push({ instr, fallbackLink, fallbackTitle });
          }
        }

        // — itemsAddToMenu: push one tuple per entry *per* instr
        if (Array.isArray(meta.itemsAddToMenu)) {
          for (const entry of entries) {
            const slug = entry.slug;
            const title = entry.data.title ?? capitalize(slug);
            const parent = entry.data.parent as string | undefined;
            for (const instr of meta.itemsAddToMenu) {
              const fallbackLink = `/${coll}/${slug}`;
              allTuples.push({
                instr,
                fallbackLink,
                fallbackTitle: title,
                entryParent: parent,
              });
            }
          }
        }
      }

      // 3) Apply every tuple exactly as we do for file-level addToMenu
      function applyInstr(
        instr: MenuInstr,
        fallbackLink: string,
        fallbackTitle: string,
        entryParent?: string
      ) {
        const link = instr.link
          ? instr.link.startsWith("/")
            ? instr.link
            : `/${instr.link}`
          : fallbackLink;

        const id = link.slice(1);
        const menus = Array.isArray(instr.menu)
          ? instr.menu
          : [instr.menu];

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
