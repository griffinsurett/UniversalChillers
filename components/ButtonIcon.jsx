// src/components/ButtonIcon.jsx
import React from "react";
import { getImage } from "astro:assets";

export default async function ButtonIcon({
  showIcon,
  element,
  src,
  hoverOnly,
  animateIcon,
  position,
  iconCustomClass = ""
}) {
  if (!showIcon) return null;

  // Build container classes for hover/animation
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

  const containerClass = iconCustomClass.includes("hidden")
    ? iconCustomClass
    : `${iconCustomClass} ${iconContainerClasses}`.trim();

  // 1) Inline SVG/component override?
  if (element) {
    const CustomIcon = typeof element === "function" ? element : () => element;
    return (
      <span className={containerClass}>
        <CustomIcon />
      </span>
    );
  }

  // 2) Explicit src override?
  if (src) {
    const optimized = await getImage(
      { src },
      { format: "webp", quality: 50, width: 20, sizes: "16px" }
    );
    return (
      <span className={containerClass}>
        <img src={optimized.src} alt="" className="h-4 w-auto" loading="lazy" />
      </span>
    );
  }

  // 3) Neither supplied ⇢ render nothing
  return null;
}
