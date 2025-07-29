// src/components/Section/SectionVariants.js
import HeroBg from "@/assets/hero-bg.jpg";

/**
 * SectionVariants defines reusable layout and styling for different section types.
 * Use via <Section variant="<key>" ... /> to apply these defaults.
 */
export const SectionVariants = {
  /**
   * Primary Hero variant – full-screen hero with background image, overlay, heading, description, and buttons.
   */
  primaryHero: {
    sectionClass: 
      "min-h-[90vh] flex items-center justify-center " +
      "bg-cover bg-fixed bg-center z-10 md:p-[var(--spacing-lg)] text-bg text-xl",
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "bg-cover bg-center xl:bg-fixed",
      },
    },
    contentClass: "relative z-20 text-center space-y-[var(--spacing-md)]",
    buttonsSectionClass: "mt-[var(--spacing-xl)] flex flex-wrap gap-[var(--spacing-md)] justify-center",
  },

  /**
   * Secondary Hero variant – simple centered section with background and title.
   */
  secondaryHero: {
    sectionClass: "flex items-center justify-center",
    contentClass: "container mx-auto text-center space-y-[var(--spacing-md)]",
    backgroundMedia: {
      image: {
        src: HeroBg,
        imageClass: "filter brightness-50 bg-cover bg-center xl:bg-fixed",
      },
      overlayClass: "bg-text opacity-50",
    },
  },
};
