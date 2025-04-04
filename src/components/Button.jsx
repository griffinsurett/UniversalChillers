// src/components/Button.jsx
import DefaultIcon from "@/assets/astro.svg"; // Neutral default icon for the template

// Default base button classes for non-underline variants.
const baseButtonClasses =
  "rounded-none py-[var(--template-spacing-md)] px-[var(--template-spacing-2xl)] transform transition-all duration-300 ease-in-out";

// Consolidate variant defaults here.
const buttonVariantDefaults = {
  primary: {
    variantClasses:
      "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: {
      hoverOnly: false,
      animateIcon: false,
    },
  },
  secondary: {
    variantClasses:
      "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]",
    buttonClasses: baseButtonClasses,
    iconDefaults: {
      hoverOnly: false,
      animateIcon: false,
    },
  },
  underline: {
    variantClasses:
      "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]",
    buttonClasses: "", // Override default button classes for underline.
    iconDefaults: {
      className: "hidden",
      hoverOnly: false,
      animateIcon: false,
    },
  },
};

export default function Button({
  as: ComponentProp,
  type = "button",
  onClick,
  children,
  className = "",
  href,
  variant, // "primary", "secondary", or "underline"
  iconProps = {}, // Consolidated icon properties
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
    element, // Custom icon element (e.g., an <img /> or emoji)
    position = "right", // "left" or "right"
    className: iconCustomClass = "hidden", // Additional class for the icon container
    hoverOnly, // from mergedIconProps
    animateIcon, // from mergedIconProps (if needed later)
  } = mergedIconProps;

  // Use provided icon element or default to the neutral DefaultIcon.
  const finalIcon =
    element !== undefined ? element : (
      <img src={DefaultIcon.src} alt="Icon" className="h-4 w-4" />
    );

  // Determine icon container classes.
  let iconContainerClasses = "";
  if (hoverOnly) {
    if (animateIcon) {
      iconContainerClasses =
        position === "right"
          ? "inline-flex w-0 overflow-hidden transform -translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:translate-x-0 group-hover:opacity-100"
          : "inline-flex w-0 overflow-hidden transform translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:translate-x-0 group-hover:opacity-100";
    } else {
      iconContainerClasses =
        position === "right"
          ? "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:opacity-100"
          : "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:opacity-100";
    }
  } else {
    iconContainerClasses =
      position === "right" ? "ml-2 inline-flex" : "mr-2 inline-flex";
  }

  // If the merged icon props specify a class that contains "hidden", then just use that.
  const finalIconContainerClass = iconCustomClass.includes("hidden")
    ? iconCustomClass
    : `${iconCustomClass} ${iconContainerClasses}`.trim();

  // Ensure the button container is positioned relatively so that any inline icon behavior works.
  const containerDefaults = "relative inline-flex items-center group";

  // Combine classes from the variant defaults with any custom classes.
  const combinedClassNames =
    variant === "underline"
      ? `${className} ${variantClasses} transition-colors duration-300 ease-in-out ${containerDefaults} inline-flex items-center group`
      : `${className} ${variantClasses} ${buttonClasses} ${containerDefaults}`;

  // Determine the component to render.
  const ComponentFinal = ComponentProp ?? (href ? "a" : "button");

  return (
    <ComponentFinal
      {...(ComponentFinal === "button" ? { type } : {})}
      {...(ComponentFinal === "a" ? { href } : {})}
      onClick={onClick}
      className={combinedClassNames}
      {...props}
    >
      {children}
      {finalIcon && position === "right" && (
        <span className={finalIconContainerClass}>
          {finalIcon}
        </span>
      )}
      {finalIcon && position === "left" && (
        <span className={finalIconContainerClass}>
          {finalIcon}
        </span>
      )}
    </ComponentFinal>
  );
}