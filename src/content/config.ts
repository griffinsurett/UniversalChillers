// src/content/config.ts
import { defineCollection, reference, z } from "astro:content";

const sectionSchema = z.object({
  collection: z.string(),
  query: z.string(),
  component: z.function().optional(),
});

export const metaSchema = z.object({
  description: z.string().optional(),
  hasPage: z.boolean().default(true),      
  itemsHasPage: z.boolean().default(true), 
  sections: z.array(sectionSchema).optional(),
  itemsSections: z.array(sectionSchema).optional(),
});

// Base schema for each item (MDX)
const baseSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    featuredImage: image().optional(),
    description: z.string().optional(),
    hasPage: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
  });

export const collections = {
  services: defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        icon: z.string().optional(),
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
      description: z.string().optional(),
      projects: z.union([reference("projects"), z.array(reference("projects"))]).optional(),
    }),
  }),
};
