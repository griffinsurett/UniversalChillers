// src/content/config.ts
import { file } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import type { LoaderContext } from "astro/loaders";
import { getCollection } from "astro:content";
import { getCollectionMeta } from "../utils/FetchMeta";
import { capitalize } from "../utils/ContentUtils";
import { MenuItemsLoader } from "../utils/MenuItemsLoader";  // ← use a relative path here!
import { getCollectionNames } from "../utils/CollectionUtils";

export const headingSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    class: z.string().optional(),
    tagName: z.string().optional(),
  }),
  z.array(
    z.union([
      z.string(),
      z.object({
        text: z.string(),
        class: z.string().optional(),
        tagName: z.string().optional(),
      }),
    ])
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

const BaseMenuFields = {
  parent: z.union([reference("menuItems"), z.array(reference("menuItems"))]).optional(),
  weight: z.number().optional().default(0),
  openInNewTab: z.boolean().default(false),
};

export const MenuItemFields = z.object({
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
});

export const MenuSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: descriptionSchema.optional(),
});

const AddToMenuFields = z.object({
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
});

const ItemsAddToMenuFields = z.object({
  menu: z.union([reference("menus"), z.array(reference("menus"))]).optional(),
  ...BaseMenuFields,
  respectHierarchy: z.boolean().optional().default(false),
});

export const metaSchema = z.object({
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
  layout: z.string().optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  defaultSection: z
    .object({
      collection: z.string().optional(),
      query: z.string().optional(),
      manualOrder: z.boolean().optional(),
      sortBy: z.enum(["date", "title", "slug", "id"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      client: z.enum(["load", "idle", "visible"]).optional(),
      slider: z
        .object({
          enabled: z.boolean(),
          autoplay: z.boolean().optional(),
          autoplaySpeed: z.number().optional(),
          infinite: z.boolean().optional(),
          slidesToShow: z.number().optional(),
          slidesToScroll: z.number().optional(),
          arrows: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  sections: z.array(z.any()).optional(),
  itemsSections: z.array(z.any()).optional(),
  addToMenu: z.array(AddToMenuFields).optional(),
  itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
});

const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    ...CommonFields,
    featuredImage: image().optional(),
    slug: z.string().optional(),
    hasPage: z.boolean().optional(),
    addToMenu: z.array(AddToMenuFields).optional(),
  });

export const collections = {
  menus: defineCollection({
    loader: file("src/content/menus/menus.json"),
    schema: MenuSchema,
  }),

  menuItems: defineCollection({
    loader: MenuItemsLoader(),        // ← your custom loader now will run in *build*
    schema: MenuItemFields,
  }),

  services: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        icon: z.string().optional(),
        parent: z.union([reference("services"), z.array(reference("services"))]).optional(),
        itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
        addToMenu: z.array(AddToMenuFields).optional(),
      }),
  }),

  projects: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        beforeImage: image().optional(),
        afterImage: image().optional(),
        services: z.union([reference("services"), z.array(reference("services"))]).optional(),
        testimonials: z.union([reference("testimonials"), z.array(reference("testimonials"))]).optional(),
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
        projects: z.union([reference("projects"), z.array(reference("projects"))]).optional(),
      }),
  }),
};
