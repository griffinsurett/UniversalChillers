// src/components/Button/ButtonIcon.jsx
import Icon from "../Icon/Icon";

export default function ButtonIcon({
  icon,
  hoverOnly = false,
  animateIcon = false,
  position = "right",
  className = "", // This will be applied to the Icon component
  containerClass = "", // This will be applied to the container span
}) {
  if (icon == null) return null;

  // hover/animation container
  let hoverClasses = "";
  if (hoverOnly) {
    hoverClasses = animateIcon
      ? position === "right"
        ? "inline-flex w-0 overflow-hidden transform -translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:group-hover:translate-x-0 group-hover:opacity-100"
        : "inline-flex w-0 overflow-hidden transform translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:translate-x-0 group-hover:opacity-100"
      : position === "right"
      ? "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:group-hover:opacity-100"
      : "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:opacity-100";
  } else {
    hoverClasses = position === "right" ? "inline-flex" : "inline-flex";
  }

  // Combine containerClass prop with hover classes
  const finalContainerClass = containerClass
    ? `${containerClass} ${hoverClasses}`.trim()
    : hoverClasses;

  // Default icon classes combined with custom className
  const finalIconClass = className
    ? `${className} h-auto w-10 logo-class`.trim()
    : "h-auto w-5 logo-class";

  return (
    <span className={finalContainerClass}>
      <Icon icon={icon} className={finalIconClass} />
    </span>
  );
}
