// src/components/Button/ButtonIcon.jsx
import React from "react";

export default function ButtonIcon({
  showIcon,
  element,
  src,
  hoverOnly,
  animateIcon,
  position,
  iconCustomClass = ""
}) {
  if (!showIcon) return null;

  let iconContainerClasses = "";
  if (hoverOnly) {
    iconContainerClasses = animateIcon
      ? position === "right"
        ? "inline-flex w-0 overflow-hidden transform -translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:translate-x-0 group-hover:opacity-100"
        : "inline-flex w-0 overflow-hidden transform translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:translate-x-0 group-hover:opacity-100"
      : position === "right"
      ? "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:opacity-100"
      : "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:opacity-100";
  } else {
    iconContainerClasses = position === "right" ? "ml-2 inline-flex" : "inline-flex";
  }

  const containerClass =
    iconCustomClass.includes("hidden")
      ? iconCustomClass
      : `${iconCustomClass} ${iconContainerClasses}`.trim();

  // Inline element override
  if (element) {
    const CustomIcon = typeof element === "function" ? element : () => element;
    return (
      <span className={containerClass}>
        <CustomIcon />
      </span>
    );
  }

  // Explicit src override (static fallback)
  if (src) {
    return (
      <span className={containerClass}>
        <img src={src} alt="" className="h-4 w-auto" loading="lazy" />
      </span>
    );
  }

  // Neither supplied
  return null;
}
