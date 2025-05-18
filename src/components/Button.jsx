// src/components/Button.jsx
import ButtonIcon from "./ButtonIcon";
import { ButtonVariants } from "./ButtonVariants.js";

export default async function Button({
  as: ComponentProp,
  type = "button",
  onClick,
  disabled,
  children,
  className = "",
  href,
  variant = "primary",
  iconProps = {},
  showIcon = true,
  ...props
}) {
  // 1) Pull in styling from variants
  const { variantClasses, buttonClasses, iconDefaults } =
    ButtonVariants[variant] || ButtonVariants.primary;

  // 2) Merge icon defaults
  const mergedIconProps = { ...iconDefaults, ...iconProps };
  const {
    element,
    position = "right",
    className: iconCustomClass = "",
    hoverOnly,
    animateIcon,
  } = mergedIconProps;

  // 3) Build full class string
  let combinedClasses = [
    className,
    variantClasses,
    buttonClasses
  ].filter(Boolean).join(" ");

  // 4) Disabled logic
  const computedDisabled = disabled ?? false;
  const ComponentFinal = computedDisabled
    ? "button"
    : ComponentProp || (href ? "a" : "button");

  const additionalProps = { ...props };
  if (ComponentFinal === "button") {
    additionalProps.disabled = computedDisabled;
  } else {
    additionalProps.href = computedDisabled ? undefined : href;
    if (computedDisabled) {
      combinedClasses += " pointer-events-none opacity-50";
    }
  }

  // 5) Render
  return (
    <ComponentFinal
      {...(ComponentFinal === "button"
        ? { type }
        : { href: additionalProps.href })}
      onClick={computedDisabled ? undefined : onClick}
      className={combinedClasses}
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
