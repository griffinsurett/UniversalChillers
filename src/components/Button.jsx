// src/components/Button.jsx
import DefaultIcon from "@/assets/astro.svg"; // Neutral default icon for the template (if needed)
import { getImage } from "astro:assets";

// Default base button classes for non-underline variants.
const baseButtonClasses =
  "rounded-none py-[var(--template-spacing-md)] px-[var(--template-spacing-2xl)] transform transition-all duration-300 ease-in-out";

// Consolidate variant defaults.
const buttonVariantDefaults = {
  primary: {
    variantClasses:
      "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]",
    buttonClasses: baseButtonClasses,
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: "",
  },
};

export default async function Button({
  as: ComponentProp,
  type = "button",
  onClick,
  children,
  className = "",
  href,
  variant, // "primary", "secondary", or "underline"
  disabled, // Explicit disabled prop
  ...props
}) {
  variant = variant || "primary";
  const { variantClasses, buttonClasses } =
    buttonVariantDefaults[variant] || buttonVariantDefaults.primary;
  
  // Determine disabled state: if no href is provided then treat it as disabled
  const computedDisabled = disabled !== undefined ? disabled : (!href);

  // Choose whether to render as <a> or <button>
  const ComponentFinal = computedDisabled ? "button" : ComponentProp || (href ? "a" : "button");
  
  // Prepare extra props
  const additionalProps = { ...props };
  if (ComponentFinal === "button") {
    additionalProps.disabled = computedDisabled;
  } else if (ComponentFinal === "a") {
    additionalProps.href = computedDisabled ? undefined : href;
    if (computedDisabled) {
      className += " pointer-events-none opacity-50";
    }
  }
  
  // Container default classes
  const containerDefaults = "relative inline-flex items-center group";

  const combinedClassNames =
    variant === "underline"
      ? `${className} ${variantClasses} transition-colors duration-300 ease-in-out ${containerDefaults} inline-flex items-center group`
      : `${className} ${variantClasses} ${buttonClasses} ${containerDefaults}`;

  return (
    <ComponentFinal
      {...(ComponentFinal === "button" ? { type } : { href: additionalProps.href })}
      onClick={computedDisabled ? undefined : onClick}
      className={combinedClassNames}
      {...(ComponentFinal === "button" ? additionalProps : {})}
    >
      {children}
    </ComponentFinal>
  );
}
