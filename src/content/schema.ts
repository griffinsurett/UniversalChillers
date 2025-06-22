// src/content/schema.ts
import { z, reference } from "astro:content";

/** ── Heading Types ───────────────────────────────────────────────────── */
export const SingleTextHeading = z.object({
  text:    z.string(),
  class:   z.string().optional(),
  tagName: z.string().optional(),
});

export const BeforeAfterHeading = SingleTextHeading.extend({
  before:      z.string().optional(),
  after:       z.string().optional(),
  beforeClass: z.string().optional(),
  textClass:   z.string().optional(),
  afterClass:  z.string().optional(),
});

export const headingSchema = z.union([
  z.string(),
  BeforeAfterHeading,
  SingleTextHeading,
  z.array(z.union([z.string(), BeforeAfterHeading, SingleTextHeading])),
]);

/** ── Description ────────────────────────────────────────────────────── */
export const descriptionSchema = z.union([
  z.string(),
  z.object({ text: z.string(), class: z.string().optional() }),
]);

/** ── Common Fields Helpers ──────────────────────────────────────────── */
export const CommonFields = {
  id:          z.string().optional(),
  title:       z.string().optional(),
  description: z.string().optional(),
  order:       z.number().optional(),
};

export const CommonFieldsPlusSlug = {
  ...CommonFields,
  link: z.string().optional(),
};

/** ── Menu Schemas ───────────────────────────────────────────────────── */
export const MenuItemFields = z.object({
  ...CommonFieldsPlusSlug,
  parent:      z
    .union([reference("menuItems"), z.array(reference("menuItems"))])
    .optional(),
  openInNewTab: z.boolean().default(false),
  menu:        z
    .union([reference("menus"), z.array(reference("menus"))])
    .optional(),
});

export const MenuSchema = z.object({
  id:          z.string().optional(),
  title:       z.string(),
  description: descriptionSchema.optional(),
});

/** ── “Add To Menu” Schemas ──────────────────────────────────────────── */
export const AddToMenuFields = z.object({
  menu:         z.union([reference("menus"), z.array(reference("menus"))]).optional(),
  ...CommonFieldsPlusSlug,
  parent:       z
    .union([reference("menuItems"), z.array(reference("menuItems"))])
    .optional(),
  openInNewTab: z.boolean().default(false),
});

export const ItemsAddToMenuFields = AddToMenuFields.extend({
  respectHierarchy: z.boolean().optional().default(true),
});

/** ── Button + Section Schemas ───────────────────────────────────────── */
export const buttonSchema = z.object({
  text:    z.string().optional(),
  class:   z.string().optional(),
  link:    z.string().optional(),
  variant: z.enum(["primary", "secondary", "underline"]).optional(),
});

export const sectionSchema = z.object({
  collection:       z.string().optional(),
  query:            z.string().optional(),
  variant:          z.string().optional(),
  component:        z.union([z.string(), z.function()]).optional(),
  heading:          headingSchema.optional(),
  description:      descriptionSchema.optional(),
  descriptionClass: z.string().optional(),
  buttons:          z.array(buttonSchema).optional(),
  buttonsSectionClass: z.string().optional(),
  sectionClass:        z.string().optional(),
  itemsClass:          z.string().optional(),
  itemClass:           z.string().optional(),
  contentClass:        z.string().optional(),
  headingAreaClass:    z.string().optional(),
  topContentClass:     z.string().optional(),
  itemPlacement:       z.union([z.string(), z.array(z.string())]).optional(),
  childPlacement:      z.union([z.string(), z.array(z.string())]).optional(),
  buttonsPlacement:    z.union([z.string(), z.array(z.string())]).optional(),
  childSlotClass:      z.string().optional(),
  manualOrder:         z.boolean().optional(),
  sortBy:              z.enum(["date", "title", "slug", "id"]).optional(),
  sortOrder:           z.enum(["asc", "desc"]).optional(),
  client:              z.enum(["load", "idle", "visible"]).optional(),
  slider: z
    .object({
      enabled:        z.boolean(),
      hideScrollbar:  z.boolean().optional(),
      autoplay:       z.boolean().optional(),
      autoplaySpeed:  z.number().optional(),
      infinite:       z.boolean().optional(),
      slidesToShow:   z.number().optional(),
      slidesToScroll: z.number().optional(),
      arrows:         z.boolean().optional(),
    })
    .optional(),
});

/** ── Meta Schema for `_meta.*` files ─────────────────────────────────── */
export const metaSchema = z.object({
  heading:        headingSchema.optional(),
  description:    descriptionSchema.optional(),
  layout:         z.string().optional(),
  itemsLayout:    z.string().optional(),
  keywords:       z.array(z.string()).optional(),
  robots:         z.string().optional(),
  ogType:         z.string().optional(),
  hasPage:        z.boolean().default(true),
  itemsHasPage:   z.boolean().default(true),
  defaultSection: sectionSchema.optional(),
  sections:       z.array(sectionSchema).optional(),
  itemsSections:  z.array(sectionSchema).optional(),
  addToMenu:      z.array(AddToMenuFields).optional(),
  itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
});

/** ── Base Schema Factory ────────────────────────────────────────────── */
export function baseSchema(opts: { image: () => any }) {
  return z
    .object({
      ...CommonFields,
      featuredImage: opts.image().optional(),
      heading:       headingSchema.optional(),
      layout:        z.string().optional(),
      keywords:      z.array(z.string()).optional(),
      robots:        z.string().optional(),
      ogType:        z.string().optional(),
      hasPage:       z.boolean().optional(),
      sections:      z.array(sectionSchema).optional(),
      addToMenu:     z.array(AddToMenuFields).optional(),
      tags:          z.array(z.string()).optional(),
      icon:          opts.image().optional(),
      heroMedia: z
        .object({ image: opts.image().optional(), video: z.string().optional() })
        .optional(),
    });
}
