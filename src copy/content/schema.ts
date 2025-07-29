// src/content/schema.ts
import { z, reference } from "astro:content";

/* ─── Shared Primitives ───────────────────────────────────────────────── */

// 1️⃣ Heading variants
const SingleTextHeading = z.object({
  text: z.string(),
  class: z.string().optional(),
  tagName: z.string().optional(),
});
export const BeforeAfterHeading = SingleTextHeading.extend({
  before: z.string().optional(),
  after: z.string().optional(),
  beforeClass: z.string().optional(),
  textClass: z.string().optional(),
  afterClass: z.string().optional(),
});
export const headingSchema = z.union([
  z.string(),
  BeforeAfterHeading,
  SingleTextHeading,
  z.array(
    z.union([z.string(), BeforeAfterHeading, SingleTextHeading])
  ),
]);

// 2️⃣ Description
export const descriptionSchema = z.union([
  z.string(),
  z.object({ text: z.string(), class: z.string().optional() }),
]);

// 3️⃣ Common frontmatter fields
export const CommonFields = {
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
};
export const CommonFieldsPlusSlug = {
  ...CommonFields,
  link: z.string().optional(),
};
export const CommonFieldsPlusId = {
  ...CommonFields,
  id: z.string().optional(),
};

// 4️⃣ Menu‐specific fields
export const BaseMenuFields = {
  parent: z
    .union([reference("menuItems"), z.array(reference("menuItems"))])
    .optional(),
  openInNewTab: z.boolean().default(false),
};
export const MenuReferenceField = {
  menu: z
    .union([reference("menus"), z.array(reference("menus"))])
    .optional(),
};

// 5️⃣ Button
export const buttonSchema = z.object({
  text: z.string().optional(),
  class: z.string().optional(),
  link: z.string().optional(),
  variant: z.enum(["primary", "secondary", "underline"]).optional(),
});

// 6️⃣ Responsive number for sliders
export const responsiveNumber = z.union([
  z.number(),
  z.object({
    base: z.number(),
    sm: z.number().optional(),
    md: z.number().optional(),
    lg: z.number().optional(),
    xl: z.number().optional(),
  }),
]);

/* ─── Collection‐agnostic Zod Schemas ───────────────────────────────── */

// Menu items loader schema
export const MenuItemFields = z.object({
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
  menu: z
    .union([reference("menus"), z.array(reference("menus"))])
    .optional(),
});

// Menus.json
export const MenuSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: descriptionSchema.optional(),
});

// addToMenu / itemsAddToMenu
export const AddToMenuFields = z.object({
  ...MenuReferenceField,
  ...CommonFieldsPlusSlug,
  ...BaseMenuFields,
});
export const ItemsAddToMenuFields = z.object({
  ...MenuReferenceField,
  ...BaseMenuFields,
  respectHierarchy: z.boolean().optional().default(true),
});

// Section schema used in _meta.mdx
export const sectionSchema = z.object({
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
    dots: z.boolean().optional(),
    dotContainerClass: z.string().optional(),
    dotClass: z.string().optional(),
    dotActiveClass: z.string().optional(),
  }).optional(),
});

// Top‐level meta schema for _meta.mdx
export const metaSchema = z.object({
  heading: headingSchema.optional(),
  description: descriptionSchema.optional(),
  layout: z.string().optional(),
  itemsLayout: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  robots: z.string().optional(),
  ogType: z.string().optional(),
  hasPage: z.boolean().default(false),
  itemsHasPage: z.boolean().default(false),
  defaultSection: sectionSchema.optional(),
  sections: z.array(sectionSchema).optional(),
  itemsSections: z.array(sectionSchema).optional(),
  addToMenu: z.array(AddToMenuFields).optional(),
  itemsAddToMenu: z.array(ItemsAddToMenuFields).optional(),
});

// Base content schema for every other collection
export const baseSchema = ({ image }: { image: Function }) =>
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
