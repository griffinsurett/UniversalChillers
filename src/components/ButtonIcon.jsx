// src/components/ButtonIcon.jsx
import React from "react";
import { getImage } from "astro:assets";
import DefaultIcon from "@/assets/astro.svg";

export default async function ButtonIcon({
  showIcon,
  element,              // Custom icon element/component.
  hoverOnly,            // Boolean: whether icon animation is hover-only.
  animateIcon,          // Boolean: whether to animate the icon.
  position,             // "left" or "right"
  iconCustomClass = "", // Additional custom classes.
}) {
  // If no icon should be shown, return null.
  if (!showIcon) return null;

  // Compute container classes based on hover/animation settings.
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
      position === "right" ? "ml-2 inline-flex" : "inline-flex";
  }

  const finalIconContainerClass = iconCustomClass.includes("hidden")
    ? iconCustomClass
    : `${iconCustomClass} ${iconContainerClasses}`.trim();

  // If a custom icon element is provided, handle that synchronously.
  if (element) {
    let customIcon = null;
    if (React.isValidElement(element)) {
      customIcon = element;
    } else if (typeof element === "function") {
      customIcon = React.createElement(element);
    } else if (typeof element === "string") {
      // Assume it's an image or SVG file path.
      customIcon = (
        <img src={element} alt="Icon" className="h-4 w-auto" loading="lazy" />
      );
    }
    return <span className={finalIconContainerClass}>{customIcon}</span>;
  }

  // Otherwise, use the default icon with image optimization.
  const optimizedDefaultIcon = await getImage(
    { src: DefaultIcon },
    {
      format: "webp",
      quality: 5,
      width: 20,      // Adjust width as needed.
      sizes: "16px",  // Intended display size.
    }
  );
  const defaultIconElem = (
    <img
      src={optimizedDefaultIcon?.src}
      alt="Icon"
      className="h-4 w-10"
      loading="lazy"
    />
  );
  return <span className={finalIconContainerClass}>{defaultIconElem}</span>;
}
