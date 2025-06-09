// src/components/Button/Button.jsx
import ButtonIcon from "./ButtonIcon";
import { ButtonVariants } from "./ButtonVariants.js";

export default function Button({
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
  const { variantClasses, buttonClasses, iconDefaults } =
    ButtonVariants[variant] || ButtonVariants.primary;

  // Merge defaults ⇢ overrides
  const merged = { ...iconDefaults, ...iconProps };
  const {
    element,
    src,
    position = "right",
    className: iconCustomClass = "",
    hoverOnly,
    animateIcon,
  } = merged;

  let combinedClasses = [className, variantClasses, buttonClasses]
    .filter(Boolean)
    .join(" ");

  const computedDisabled = disabled ?? false;
  const ComponentFinal = computedDisabled
    ? "button"
    : ComponentProp || (href ? "a" : "button");

  const additionalProps = { ...props };
  if (ComponentFinal === "button") {
    additionalProps.disabled = computedDisabled;
  } else {
    additionalProps.href = computedDisabled ? undefined : href;
    if (computedDisabled) combinedClasses += " pointer-events-none opacity-50";
  }

  return (
    <ComponentFinal
      {...(ComponentFinal === "button" ? { type } : { href: additionalProps.href })}
      onClick={computedDisabled ? undefined : onClick}
      className={combinedClasses}
      {...(ComponentFinal === "button" ? additionalProps : {})}
    >
      {showIcon && position === "left" && (
        <ButtonIcon
          showIcon={showIcon}
          element={element}
          src={src}
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
          src={src}
          hoverOnly={hoverOnly}
          animateIcon={animateIcon}
          position={position}
          iconCustomClass={iconCustomClass}
        />
      )}
    </ComponentFinal>
  );
}