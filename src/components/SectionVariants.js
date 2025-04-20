// src/components/SectionVariants.js

/**
 * SectionVariants
 *
 * Define a “variant” for each content collection so that
 * <Section variant="services" …> will pull in these defaults.
 * Any props you pass directly to <Section> will be appended
 * (not overwritten) on top of these.
 */
export const SectionVariants = {
  // ─────────── Benefits ───────────
  benefits: {
    sectionClass: "flex justify-center items-center text-left section-sm",
    contentClass:
      "flex justify-between items-start py-[var(--spacing-2xl)] flex-col-reverse md:flex-row-reverse gap-[var(--spacing-xl)] lg:gap-[var(--spacing-2xl)]",
    itemsClass:
      "flex flex-col items-start justify-start gap-[var(--spacing-md)]",
    itemClass: "",
    buttonsSectionClass: "",
    headingAreaClass: "flex flex-col",
    backgroundMedia: undefined,
    topContentClass: "flex flex-col gap-[var(--spacing-md)]",
    itemPlacement: "top-content-section",
    slotPlacement: "",
    childSlotClass: "lg:sticky lg:top-0",
  },

  // ─────────── FAQ ───────────
  faq: {
    sectionClass: "section-sm w-full flex justify-center items-center",
    contentClass: "flex justify-between flex-col xl:flex-row",
    itemsClass: "flex flex-col gap-[var(--spacing-lg)]",
    itemClass: "",
    buttonsSectionClass: "hidden",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "xl:mr-[var(--spacing-2xl)] lg:sticky lg:top-0",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },

  // ─────────── Testimonials ───────────
  testimonials: {
    sectionClass:
      "section-main flex justify-center items-center w-full text-center bg-primary text-bg px-[var(--spacing-xl)]",
    contentClass:
      "container flex flex-wrap flex-col justify-center items-center w-full py-[var(--spacing-2xl)] px-[var(--spacing-lg)]",
    itemsClass:
      "flex flex-wrap md:flex-nowrap justify-center items-stretch gap-[var(--spacing-xl)] my-[var(--spacing-lg)] md:my-[var(--spacing-2xl)]",
    itemClass: "",
    buttonsSectionClass: "",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },

  // ─────────── Gallery ───────────
  gallery: {
    sectionClass:
      "section-main flex justify-center items-center text-center bg-bg px-[var(--spacing-xl)]",
    contentClass:
      "container flex flex-col justify-center w-full py-[var(--spacing-xl)] px-[var(--spacing-lg)]",
    itemsClass:
      "flex flex-wrap justify-between items-stretch gap-[var(--spacing-xl)] my-[var(--spacing-lg)] md:my-[var(--spacing-2xl)]",
    itemClass: "",
    buttonsSectionClass: "hidden",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },

  // ─────────── Mission & Vision ───────────
  missionVision: {
    sectionClass:
      "section-md flex justify-center items-center text-center px-[var(--spacing-xl)] bg-accent text-bg",
    contentClass:
      "container flex flex-col justify-center w-full py-[var(--spacing-xl)] px-[var(--spacing-lg)]",
    itemsClass:
      "flex items-center gap-[var(--spacing-xl)] py-[var(--spacing-xl)] flex-col xl:flex-row",
    itemClass: "",
    buttonsSectionClass: "",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },

  // ─────────── Service Areas ───────────
  serviceAreas: {
    sectionClass:
      "section-lg flex justify-center items-center text-center bg-accent text-bg lg:px-[var(--spacing-lg)]",
    contentClass: "",
    itemsClass:
      "w-full flex flex-wrap justify-center items-stretch gap-[var(--spacing-md)] my-[var(--spacing-lg)] md:my-[var(--spacing-2xl)]",
    itemClass: "",
    buttonsSectionClass: "hidden",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },

  // ─────────── Services ───────────
  services: {
    sectionClass:
      "section-main flex justify-center items-center text-center bg-bg px-[var(--spacing-xl)]",
    contentClass:
      "container flex flex-wrap flex-col justify-center w-full py-[var(--spacing-xl)] px-[var(--spacing-lg)]",
    itemsClass:
      "flex flex-wrap justify-center items-stretch gap-[var(--spacing-xl)] my-[var(--spacing-lg)] md:my-[var(--spacing-2xl)]",
    itemClass: "",
    buttonsSectionClass: "",
    headingAreaClass: "",
    backgroundMedia: undefined,
    topContentClass: "",
    itemPlacement: "",
    slotPlacement: "",
    childSlotClass: "",
  },
};
