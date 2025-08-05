// src/components/Button/ButtonVariants.js
import BtnArrow from "@/assets/BtnArrow.svg";
import LogoIcon from "@/assets/univeral-chillers-icon.svg"

export const baseButtonClasses =
  "relative text-xl md:text-2xl button group";

const sharedIconDefaults = {
  icon:     BtnArrow.src,     // ← unified prop
  hoverOnly: false,
};

const LogoIconDefaults = {
  icon:    LogoIcon.src,
  hoverOnly: false,
  className: "-mt-2 px-1 h-7 w-7",
}

export const ButtonVariants = {
  primary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] transition-all hover:scale-105",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] transition-all hover:scale-105",
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
    iconDefaults:  { icon: BtnArrow.src, hoverOnly: false, animateIcon: false },
  },
  link: {
    variantClasses: "text-text hover:text-secondary",
    iconDefaults:   { ...LogoIconDefaults },
  },
  linkNoIcon: {
    variantClasses: "text-text hover:text-secondary",
    iconDefaults:   { ...sharedIconDefaults, icon: null },
  },
  none: {
    variantClasses: "text-text hover:text-secondary",
    iconDefaults:   { ...sharedIconDefaults, icon: null },
  },
};
