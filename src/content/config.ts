// src/content/config.ts
import { defineCollection, reference, z } from "astro:content";

// Reusable schema for text content (heading or description)
export const textContentSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    class: z.string().optional(),
  })
]);

const sectionSchema = z.object({
  collection: z.string().optional(), // optional if not dynamic
  query: z.string().optional(),
  component: z.function().optional(),
  heading: textContentSchema.optional(),
  description: textContentSchema.optional(),
  button: z.object({
    text: z.string().optional(),
    class: z.string().optional(),
    link: z.string().optional(),
    ifButton: z.boolean().optional(), // determines if the button is rendered
  }).optional(),
  sectionClass: z.string().optional(),
  itemsClass: z.string().optional(),
  itemClass: z.string().optional(),
  contentClass: z.string().optional(),
});

export const QueryItemSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  slug: z.string().optional(),
  position: z.enum(["prepend", "append"]).optional(),
  parent: z.string().nullable().optional(),
  weight: z.number().optional(),
});

export const metaSchema = z.object({
  heading: textContentSchema.optional(),
  description: textContentSchema.optional(),
  hasPage: z.boolean().default(true),
  itemsHasPage: z.boolean().default(true),
  sections: z.array(sectionSchema).optional(),
  itemsSections: z.array(sectionSchema).optional(),
  addToQuery: z.array(QueryItemSchema).optional(),
  addItemsToQuery: z.array(QueryItemSchema).optional(),
});

const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    featuredImage: image().optional(),
    heading: textContentSchema.optional(),
    description: textContentSchema.optional(),
    hasPage: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
    addToQuery: z.array(QueryItemSchema).optional(),
    tags: z.array(z.string()).optional(),
  });

export const collections = {
  services: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        icon: z.string().optional(),
        parent: z.union([reference("services"), z.array(reference("services"))]).optional(),
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
  clients: defineCollection({
    schema: z.object({
      title: z.string(),
      description: textContentSchema.optional(),
      projects: z.union([reference("projects"), z.array(reference("projects"))]).optional(),
    }),
  }),
};
