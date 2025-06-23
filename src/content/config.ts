// src/content/config.ts
import { file } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { MenuItemsLoader } from "@/utils/MenuItemsLoader";

// 1️⃣ Define your two “object” shapes once:
const SingleTextHeading = z.object({
  text: z.string(),
  class: z.string().optional(),
  tagName: z.string().optional(),
});

const BeforeAfterHeading = SingleTextHeading.extend({
  before: z.string().optional(),
  after: z.string().optional(),
  beforeClass: z.string().optional(),
  textClass: z.string().optional(),
  afterClass: z.string().optional(),
});

// 2️⃣ Build your union by re-using those:
export const headingSchema = z.union([
  z.string(), // plain string
  BeforeAfterHeading, // the rich before/text/after object
  SingleTextHeading, // the legacy text-only object
  z.array(
    // an array of any of the above
    z.union([z.string(), BeforeAfterHeading, SingleTextHeading])
  ),
]);

export const descriptionSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    class: z.string().optional(),
  }),
]);

const CommonFields = {
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
};

const CommonFieldsPlusSlug = {
  ...CommonFields,
  link: z.string().optional(),
};

const CommonFieldsPlusId = {
  ...CommonFields,
  id: z.string().optional(),
};

/**
 * MenuItemFields:
 *   - Each menu item may optionally reference a parent menuItem (by its ID),
 *     and must know which menu(s) it belongs to (via `menu: reference("menus")`).
 */

const BaseMenuFields = {
  parent: z
    .union([reference("menuItems"), z.array(reference("menuItems"))])
    .optional(),
  openInNewTab: z.boolean().default(false),
};

// A “menu” field that points to one (or more) menu IDs. Used only in injections.
// Not used inside the `menuItems` collection itself.
const MenuReferenceField = {
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
};

/**
 * Each record in “menuItems.json” must match this schema.
 *   - id: string          (unique ID for this menuItem)
 *   - label?: string
 *   - slug?: string
 *   - parent?: string | string[] (ID(s) of another menuItem)
 *   - openInNewTab: bool   (default: false)
 *   - menu?: string | string[]  (ID(s) of menus it lives in)
 */
export const MenuItemFields = z.object({
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
});

/**
 * A minimal schema for each menu (stored in menus.json).
 *   - id: string   (unique ID for this menu, e.g. “mainMenu”)
 *   - title: string
 *   - description?: string
 */
export const MenuSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: descriptionSchema.optional(),
});

// When a collection’s _meta.mdx declares “addToMenu: […]”,
// each object must match this:
export const AddToMenuFields = z.object({
  ...MenuReferenceField,
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
});

// When a collection’s _meta.mdx declares “itemsAddToMenu: […]”,
// each object must match this:
export const ItemsAddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  // NEW: if true, preserve the collection’s own parent–child structure
  respectHierarchy: z.boolean().optional().default(true),
});

const buttonSchema = z.object({
  text: z.string().optional(),
  class: z.string().optional(),
  link: z.string().optional(),
  variant: z.enum(["primary", "secondary", "underline"]).optional(),
});

// Define a “responsive number” type once:
const responsiveNumber = z.union([
  z.number(),
  z.object({
    base: z.number(),        // required “base” breakpoint
    sm:   z.number().optional(),
    md:   z.number().optional(),
    lg:   z.number().optional(),
    xl:   z.number().optional(),
  }),
]);

const sectionSchema = z.object({
  collection: z.string().optional(),
  query: z.string().optional(),
  variant: z.string().optional(),
  component: z.union([z.function(), z.string()]).optional(),
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
  descriptionClass: z.string().optional(),
  buttons: z.array(buttonSchema).optional(),
  buttonsSectionClass: z.string().optional(),
  sectionClass: z.string().optional(),
  itemsClass: z.string().optional(),
  itemClass: z.string().optional(),
  contentClass: z.string().optional(),
  headingAreaClass: z.string().optional(),
  topContentClass: z.string().optional(),
  itemPlacement: z.union([z.string(), z.array(z.string())]).optional(),
  childPlacement: z.union([z.string(), z.array(z.string())]).optional(),
  buttonsPlacement: z.union([z.string(), z.array(z.string())]).optional(),
  childSlotClass: z.string().optional(),
  manualOrder: z.boolean().optional(),
  sortBy: z.enum(["date", "title", "slug", "id"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  client: z.enum(["load", "idle", "visible"]).optional(),
  slider: z
    .object({
      enabled: z.boolean(),
      hideScrollbar: z.boolean().optional(),
      autoplay: z.boolean().optional(),
      autoplaySpeed: z.number().optional(),
      infinite: z.boolean().optional(),
      slidesToShow: responsiveNumber.optional(),
      slidesToScroll: z.number().optional(),
      arrows: z.boolean().optional(),
    })
    .optional(),
});

// The top‐level “metaSchema” that each collection’s _meta.mdx is validated against.
export const metaSchema = z.object({
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
  layout: z.string().optional(),
  itemsLayout: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  robots: z.string().optional(),
  ogType: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  defaultSection: sectionSchema.optional(),
  sections: z.array(sectionSchema).optional(),
  itemsSections: z.array(sectionSchema).optional(),
  addToMenu: z.array(AddToMenuFields).optional(),
  itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
});

const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    ...CommonFields,
    featuredImage: image().optional(),
    heading: headingSchema.optional(),
    layout: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    robots: z.string().optional(),
    ogType: z.string().optional(),
    hasPage: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
    addToMenu: z.array(AddToMenuFields).optional(),
    tags: z.array(z.string()).optional(),
    icon: image().optional(),
    heroMedia: z
      .object({
        image: image().optional(),
        video: z.string().optional(),
      })
      .optional(),
  });

export const collections = {
  // ── menus.json (flat list of menus) ──
  menus: defineCollection({
    loader: file("src/content/menus/menus.json"),
    schema: MenuSchema,
  }),

  // ── menuItems.json (flat list of all menu items) ──
  menuItems: defineCollection({
    loader: MenuItemsLoader(),
    schema: MenuItemFields,
  }),

  // ── All the other collections remain unchanged, with “addToMenu” / “itemsAddToMenu” support:
  services: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        icon: z.string().optional(),
        parent: z
          .union([reference("services"), z.array(reference("services"))])
          .optional(),
      }),
  }),
  projects: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        beforeImage: image().optional(),
        afterImage: image().optional(),
        services: z
          .union([reference("services"), z.array(reference("services"))])
          .optional(),
        testimonials: z
          .union([
            reference("testimonials"),
            z.array(reference("testimonials")),
          ])
          .optional(),
      }),
  }),
  testimonials: defineCollection({
    schema: ({ image }) => baseSchema({ image }),
  }),
  faq: defineCollection({
    schema: ({ image }) => baseSchema({ image }),
  }),
  clients: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        projects: z
          .union([reference("projects"), z.array(reference("projects"))])
          .optional(),
      }),
  }),
  serviceAreas: defineCollection({
    loader: file("src/content/serviceAreas/serviceAreas.json"), // file-loaded collection
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        tags: z.array(z.string()).optional(),
      }),
  }),
};
