// src/components/Button.jsx

export default function Button({
  as: ComponentProp,
  type = "button",
  onClick,
  children,
  classname = "",
  href,
  variant, // "primary", "secondary", or "underline"
  ...props
}) {
  // Render as an <a> tag if href is provided, otherwise as a <button>
  const Component = ComponentProp ?? (href ? "a" : "button");

  // Default variant to "primary" if not set
  variant = variant || "primary";

  // Set minimal styling based on the variant
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]";
  } else if (variant === "secondary") {
    variantClasses = "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)]";
  } else if (variant === "underline") {
    variantClasses = "underline text-[var(--color-primary)] hover:text-[var(--color-secondary)]";
  }

  // Merge custom classname with our variant classes
  const combinedClassNames = `${classname} ${variantClasses}`;

  return (
    <Component
      {...(Component === "button" ? { type } : {})}
      {...(Component === "a" ? { href } : {})}
      onClick={onClick}
      className={combinedClassNames}
      {...props}
    >
      {children}
    </Component>
  );
}
