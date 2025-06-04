import { getCollection, type CollectionEntry } from "astro:content";

/** Narrowed entry type for IDE IntelliSense */
export interface MenuItemEntry extends CollectionEntry<"menuItems"> {}

/** Cached, read-only list of menu items (single fetch per build) */
export const allMenuItems: Readonly<Array<MenuItemEntry>> =
  (await getCollection("menuItems")) as Readonly<Array<MenuItemEntry>>;
