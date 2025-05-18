// src/components/ButtonVariants.js

// Shared base classes: container, spacing, typography, and transitions
export const baseButtonClasses =
  "relative inline-flex items-center group rounded-none py-[var(--template-spacing-md)] px-[var(--template-spacing-2xl)] transition-colors duration-300 ease-in-out";

export const ButtonVariants = {
  primary: {
    variantClasses:
      "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: { hoverOnly: true, animateIcon: true },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: { hoverOnly: true, animateIcon: true },
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: { hoverOnly: false, animateIcon: false },
  },
  link: {
    variantClasses: "text-text hover:text-primary",
    buttonClasses: baseButtonClasses,
    iconDefaults: { hoverOnly: true, animateIcon: true },
  },
};
