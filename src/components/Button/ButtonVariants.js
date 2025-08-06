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

const PhoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.09-.21 11.72 11.72 0 0 0 3.66 1.17 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 1.17 3.66 1 1 0 0 1-.21 1.09l-2.2 2.2z" /></svg>`;


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
  accent: {
    variantClasses:
      "bg-accent text-[var(--color-bg)] hover:bg-[var(--color-accent-secondary)] transition-all hover:scale-105",
    buttonClasses: baseButtonClasses,
    iconDefaults:  { ...sharedIconDefaults },
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
  phone: {
    variantClasses: "text-bg hover:scale-105 flex items-center justify-center transition-all duration-300 ease-in-out",
    iconDefaults: {
      icon: PhoneIcon,
      position: "left",
      className: "w-10 h-10", // Larger icon for mobile
      containerClass: "",
    },
  },
};
