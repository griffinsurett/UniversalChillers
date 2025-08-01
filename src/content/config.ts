// src/content/config.ts
import { z, defineCollection, reference } from "astro:content";
import { file } from "astro/loaders";
import { MenuItemsLoader } from "@/utils/MenuItemsLoader";

// import all shared Zod schemas from our new schema.ts
import {
  MenuItemFields,
  MenuSchema,
  baseSchema
} from "./schema";

/**
 * Define your collections just as before.
 * Only collection‐specific extensions (e.g. beforeImage/afterImage) remain here.
 */
export const collections = {
    // __ contact.json ────────────────────────────────────────
  contact: defineCollection({
    loader: file("src/content/contact/contact.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        linkPrefix: z.string().optional(),
      }),
  }),

  // socialMedia.json ────────────────────────────────
  socialMedia: defineCollection({
    loader: file("src/content/socialMedia/socialMedia.json"),
    schema: ({ image }) => baseSchema({ image }).extend({
      link: z.string().optional(),
    }),
  }),

  // ── menus.json ─────────────────────────────────────────
  menus: defineCollection({
    loader: file("src/content/menus/menus.json"),
    schema: MenuSchema,
  }),

  // ── menuItems.json ─────────────────────────────────────
  menuItems: defineCollection({
    loader: MenuItemsLoader(),
    schema: MenuItemFields,
  }),

  // ── other collections ──────────────────────────────────
  services: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        icon: z.string().optional(),
        parent: z
          .union([reference("services"), z.array(reference("services"))])
          .optional(),
      }),
  }),

    // ── other collections ──────────────────────────────────
  whatWeDo: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
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

  brands: defineCollection({
    schema: ({ image }) => baseSchema({ image }),
  }),

  faq: defineCollection({
    schema: ({ image }) => baseSchema({ image }),
  }),

  serviceAreas: defineCollection({
    loader: file("src/content/serviceAreas/serviceAreas.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        tags: z.array(z.string()).optional(),
      }),
  }),
  whyChooseUs: defineCollection({
    loader: file("src/content/whyChooseUs/whyChooseUs.json"),
    schema: ({ image }) => baseSchema({ image }),
  }),
};
