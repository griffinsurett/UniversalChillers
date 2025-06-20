// src/components/ButtonVariants.js
import DefaultIcon from "@/assets/astro.svg";

export const baseButtonClasses =
  "relative inline-flex items-center group rounded-none py-[var(--template-spacing-md)] px-[var(--template-spacing-2xl)] transition-colors duration-300 ease-in-out uppercase font-bold";

const sharedIconDefaults = {
  hoverOnly: true,
  animateIcon: true,
  element: null,
  src: null,
};

export const ButtonVariants = {
  primary: {
    variantClasses:
      "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: {
      ...sharedIconDefaults,
      src: DefaultIcon,
    },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: {
      ...sharedIconDefaults,
      src: DefaultIcon,
    },
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: {
      hoverOnly: false,
      animateIcon: false,
      element: null,
      src: DefaultIcon,
    },
  },
  link: {
    variantClasses: "text-text hover:text-secondary",
  },
};
