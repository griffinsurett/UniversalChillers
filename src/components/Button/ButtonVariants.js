// src/components/Button/ButtonVariants.js
import ArrowIcon from "@/assets/astro.svg";
import LogoIcon from "@/assets/univeral-chillers-icon.svg"
import "./buttons.css";

export const baseButtonClasses =
  "relative h4 button group";

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
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { icon: ArrowIcon.src, hoverOnly: false, animateIcon: false },
  },
  link: {
    variantClasses: "text-text hover:text-secondary h4",
    iconDefaults:   { ...LogoIconDefaults },
  },
  linkNoIcon: {
    variantClasses: "text-text hover:text-secondary h4",
    iconDefaults:   { ...sharedIconDefaults, icon: null },
  },
};
