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
  iconProps = {},      // ← grouped icon props
  showIcon = true,
  ...props
}) {
  const { variantClasses, buttonClasses, iconDefaults } =
    ButtonVariants[variant] || ButtonVariants.primary;

  // Merge defaults → overrides
  const {
    icon: defaultIcon,
    hoverOnly: defaultHover,
    animateIcon: defaultAnimate,
    position: defaultPosition = "right",
    className: defaultIconClass = ""
  } = iconDefaults;

  const {
    icon: overrideIcon,
    hoverOnly: overrideHover,
    animateIcon: overrideAnimate,
    position: overridePosition,
    className: overrideIconClass
  } = iconProps;

  const finalIcon        = overrideIcon      ?? defaultIcon;
  const finalHoverOnly   = overrideHover     ?? defaultHover;
  const finalAnimateIcon = overrideAnimate   ?? defaultAnimate;
  const finalPosition    = overridePosition  ?? defaultPosition;
  const finalIconClass   = overrideIconClass ?? defaultIconClass;

  let combinedClasses = [className, variantClasses, buttonClasses]
    .filter(Boolean)
    .join(" ");

  const isDisabled = disabled ?? false;
  const Tag = isDisabled
    ? "button"
    : ComponentProp || (href ? "a" : "button");

  const extra = { ...props };
  if (Tag === "button") {
    extra.disabled = isDisabled;
  } else {
    extra.href = isDisabled ? undefined : href;
    if (isDisabled) combinedClasses += " pointer-events-none opacity-50";
  }

  return (
    <Tag
      {...(Tag === "button" ? { type } : {})}
      onClick={isDisabled ? undefined : onClick}
      className={combinedClasses}
      {...extra}
    >
      {showIcon && finalPosition === "left" && (
        <ButtonIcon
          icon={finalIcon}
          hoverOnly={finalHoverOnly}
          animateIcon={finalAnimateIcon}
          position="left"
          className={finalIconClass}
        />
      )}

      {children}

      {showIcon && finalPosition === "right" && (
        <ButtonIcon
          icon={finalIcon}
          hoverOnly={finalHoverOnly}
          animateIcon={finalAnimateIcon}
          position="right"
          className={finalIconClass}
        />
      )}
    </Tag>
  );
}
