// src/components/Button/ButtonVariants.js
import ArrowIcon from "@/assets/astro.svg";
import LogoIcon from "@/assets/univeral-chillers-icon.svg"

export const baseButtonClasses =
  "relative text-xl md:text-2xl button group";

const sharedIconDefaults = {
  icon:     ArrowIcon.src,     // ← unified prop
  hoverOnly: false,
};

const LogoIconDefaults = {
  icon:    LogoIcon.src,
  hoverOnly: false,
  className: "-mt-1 px-1",
}

export const ButtonVariants = {
  primary: {
    variantClasses:
      "bg-[var(--color-secondary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-secondary-accent)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
  },
  tertiary: {
    variantClasses:
      "bg-transparent text-[var(--color-bg)] border border-[var(--color-bg)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults, icon: null },
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { icon: ArrowIcon.src, hoverOnly: false, animateIcon: false },
  },
  link: {
    variantClasses: "hover:text-secondary",
    iconDefaults:   { ...LogoIconDefaults },
  },
  linkNoIcon: {
    variantClasses: "hover:text-secondary",
    iconDefaults:   { ...sharedIconDefaults, icon: null },
  },
};
