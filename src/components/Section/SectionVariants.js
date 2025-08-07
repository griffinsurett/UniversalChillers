// src/components/Section/SectionVariants.js
import HeroBg from "@/assets/photo-of-chiller-workers.png";

/**
 * SectionVariants defines reusable layout and styling for different section types.
 * Use via <Section variant="<key>" ... /> to apply these defaults.
 */
const baseCTA = {
  descriptionClass: "load slide-up",
  sectionClass:
    "relative min-h-[60vh] lg:min-h-[80vh] flex items-center justify-center z-10 p-[var(--spacing-lg)] text-bg text-xl load slide-up",
  contentClass: "text-center",
  headingAreaClass:
    "flex flex-col items-center justify-center gap-[var(--spacing-md)] mx-auto w-full lg:w-2/3",
  buttonsSectionClass: "flex flex-col lg:flex-row gap-[var(--spacing-md)] justify-center items-center mt-[var(--spacing-sm)]",
    buttonsPlacement: "section-heading-area",
  childPlacement: "section-heading-area",
  childSlotClass: "order-first",
};

export const SectionVariants = {
  /**
   * Primary Hero variant – full-screen hero with background image, overlay, heading, description, and buttons.
   */
  primaryHero: {
    sectionClass:
      "relative min-h-[100vh] overflow-hidden flex items-center justify-center bg-cover bg-fixed bg-center z-10 md:p-[var(--spacing-lg)] text-bg text-xl",
    contentClass: "text-center space-y-[var(--spacing-md)]",
      buttonsSectionClass: "flex flex-col gap-[var(--spacing-md)] justify-center items-center mt-[var(--spacing-sm)]",
    topContentClass:
      "z-[999999] lg:top-0 lg:left-auto lg:right-[-100px] lg:translate-x-0 lg:translate-y-0 bg-primary/70 circle lg:absolute",
    headingAreaClass:
      "flex flex-col items-center justify-center gap-[var(--spacing-md)] lg:-mb-[var(--spacing-xl)]",
    buttonsPlacement: "section-heading-area",
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "bg-cover bg-center xl:bg-fixed w-screen",
      },
    },
  },
  /**
   * Secondary Hero variant – simple centered section with background and title.
   */
  secondaryHero: {
    sectionClass: "flex items-center justify-center min-h-[45vh] lg:min-h-[60vh]",
    contentClass: "container mx-auto text-center p-0 m-0",
    buttonsSectionClass: "hidden",
    headingAreaClass: "w-8/10 lg:w-6/10 mx-auto text-center text-bg -mb-[var(--spacing-xl)]",
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "filter brightness-50 bg-cover bg-center xl:bg-fixed",
      },
      overlayClass: "bg-primary opacity-50",
    },
  },

  serviceHero: {
    sectionClass:
      "flex items-center justify-center min-h-[50vh] lg:min-h-[75vh]",
    contentClass: "container mx-auto text-center space-y-[var(--spacing-lg)] py-9",
    buttonsSectionClass: "hidden",
    headingAreaClass: "w-8/10 lg:w-6/10 mx-auto text-center text-bg",
  },

  circle: {
    sectionClass:
      "relative min-h-[100vh] overflow-hidden flex items-center justify-center bg-cover bg-fixed bg-center z-10 md:p-[var(--spacing-lg)] text-bg text-xl",
    contentClass: "text-center space-y-[var(--spacing-md)]",
    buttonsSectionClass: "flex flex-col gap-[var(--spacing-md)] justify-center items-center",
descriptionPlacement: "section-heading-area",
    buttonsPlacement:     "section-heading-area",
        topContentClass:
      "z-[999999] bg-accent/70 circle flex flex-col items-center justify-center",
    headingAreaClass:
      "flex flex-col items-center justify-center gap-[var(--spacing-md)] lg:-mb-[var(--spacing-xl)]",
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "bg-cover bg-center xl:bg-fixed w-screen",
      },
    },
  },

  primary: {
    sectionClass:
      "text-center min-h-[100vh] py-[var(--spacing-xl)] bg-gradient-to-br from-blue-50 to-white lg:min-h-[80vh] flex items-center justify-center",
    contentClass: "z-[9999] w-9/10 lg:w-2/3",
    childPlacement: "section-heading-area",
    buttonsPlacement: "section-heading-area",
    buttonsSectionClass: "mt-[var(--spacing-sm)]",
    headingAreaClass:
      "flex flex-col gap-[var(--spacing-md)] items-center justify-center",
  },
  secondary: {
    descriptionClass: "load slide-right",
    sectionClass:
      "flex overflow-hidden flex-col items-center justify-center section-sm py-[var(--spacing-xl)] lg:py-[var(--spacing-lg)] bg-gradient-to-br from-blue-50 to-white",
    contentClass: "flex flex-col items-center justify-center mx-auto w-9/10",
    itemsClass:
      "flex flex-col md:flex-row items-start justify-center gap-[var(--spacing-xl)]",
    headingAreaClass:
      "flex flex-col md:flex-row items-center justify-center gap-[var(--spacing-sm)] lg:gap-[var(--spacing-lg)] mb-[var(--spacing-xl)]",
  },
  tertiary: {
    sectionClass:
      "overflow-x-hidden py-[var(--spacing-xl)] py-6 bg-gradient-to-br from-blue-50 to-white",
    contentClass:
      "flex flex-col lg:flex-row justify-center w-9/10 lg:w-8/10 mx-auto lg:gap-[var(--spacing-xl)]",
    itemsClass: "lg:sticky lg:top-10 my-8",
    topContentClass: "w-full lg:w-3/5",
    bottomContentClass:
      "flex flex-col-reverse w-full lg:w-2/5 gap-[var(--spacing-md)]",
    itemPlacement: "top-content-section",
    descriptionPlacement: "bottom-content-section",
    descriptionClass: "load fade-in",
    imageColPlacement: "bottom-content-section",
    imageColClass: "w-full h-auto",
    childPlacement: "bottom-content-section",
  },
  cta: {
    ...baseCTA,
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "bg-cover bg-center xl:bg-fixed",
      },
      overlayClass: "bg-primary/80",
    },
  },
  ctaForService: {
    ...baseCTA,
  },
};
