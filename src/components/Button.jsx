// src/components/Button.jsx
import ButtonIcon from "./ButtonIcon";

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
  link: {
    // Used for menu links: neutral text, on hover primary
    variantClasses: "text-text hover:text-primary",
    buttonClasses: "",
  },
};

export default async function Button({
  as: ComponentProp,
  type = "button",
  onClick,
  disabled, // New prop to manually disable a button.
  children,
  className = "",
  href,
  variant, // "primary", "secondary", or "underline"
  iconProps = {}, // Consolidated icon properties.
  showIcon = false, // Controls whether an icon is rendered.
  ...props
}) {
  // Default the variant to "primary" if not provided.
  variant = variant || "primary";

  // Pull in the variant defaults.
  const { variantClasses, buttonClasses, iconDefaults } =
    buttonVariantDefaults[variant] || buttonVariantDefaults.primary;

  // Merge the variant's icon defaults with any custom iconProps.
  const mergedIconProps = { ...iconDefaults, ...iconProps };
  const {
    element,               // The actual icon element (e.g., an inline SVG, image, etc.)
    position = "right",    // "left" or "right"
    className: iconCustomClass = "", // Additional class for the icon container.
    hoverOnly,
    animateIcon,
  } = mergedIconProps;

  // Ensure the button container is positioned correctly.
  const containerDefaults = "relative inline-flex items-center group";

  // Build overall class names.
  let combinedClassNames =
    variant === "underline"
      ? `${className} ${variantClasses} transition-colors duration-300 ease-in-out ${containerDefaults} inline-flex items-center group`
      : `${className} ${variantClasses} ${buttonClasses} ${containerDefaults}`;

  // Determine disabled state.
  // If the disabled prop is passed, or if no href is provided (implying hasPage is false), then disable.
const computedDisabled = disabled ?? false;
  // Force disabled rendering as a <button> (i.e. not as an anchor).
  const ComponentFinal =
    computedDisabled
      ? "button"
      : ComponentProp || (href ? "a" : "button");

  // Prepare additional props.
  const additionalProps = { ...props };
  if (ComponentFinal === "button") {
    additionalProps.disabled = computedDisabled;
  } else if (ComponentFinal === "a") {
    // When rendering as an anchor, if disabled then remove href and add disabled styling.
    additionalProps.href = computedDisabled ? undefined : href;
    if (computedDisabled) {
      combinedClassNames += " pointer-events-none opacity-50";
    }
  }

  return (
    <ComponentFinal
      {...(ComponentFinal === "button" ? { type } : { href: additionalProps.href })}
      onClick={computedDisabled ? undefined : onClick}
      className={combinedClassNames}
      {...(ComponentFinal === "button" ? additionalProps : {})}
    >
      {showIcon && position === "left" && (
        <ButtonIcon
          showIcon={showIcon}
          element={element}
          hoverOnly={hoverOnly}
          animateIcon={animateIcon}
          position={position}
          iconCustomClass={iconCustomClass}
        />
      )}
      {children}
      {showIcon && position === "right" && (
        <ButtonIcon
          showIcon={showIcon}
          element={element}
          hoverOnly={hoverOnly}
          animateIcon={animateIcon}
          position={position}
          iconCustomClass={iconCustomClass}
        />
      )}
    </ComponentFinal>
  );
}