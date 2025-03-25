// src/content/config.ts
import { defineCollection, reference, z } from "astro:content";

// Isolated Heading Schema – allows a string, an object, or an array of these.
export const headingSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    class: z.string().optional(),
    tagName: z.string().optional(), // e.g. "h2", "h3"
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

// Isolated Description Schema – allows either a string or an object (no arrays)
export const descriptionSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    class: z.string().optional(),
  }),
]);

const buttonSchema = z.object({
  text: z.string().optional(),
  class: z.string().optional(),
  link: z.string().optional(),
});

// Updated sectionSchema using the isolated heading and description schemas.
const sectionSchema = z.object({
  collection: z.string().optional(), // optional if not dynamic
  query: z.string().optional(),
  component: z.function().optional(),
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
  buttons: z.array(buttonSchema).optional(),
  buttonsSectionClass: z.string().optional(), // now a plain string
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
  respectHierarchy: z.boolean().default(false),
});

export const metaSchema = z.object({
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
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
    heading: headingSchema.optional(),
    description: descriptionSchema.optional(),
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
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        projects: z.union([reference("projects"), z.array(reference("projects"))]).optional(),
      }),
  }),  
};
