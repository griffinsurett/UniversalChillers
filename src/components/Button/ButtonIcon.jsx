// src/components/Button/ButtonIcon.jsx
export default function ButtonIcon({
  icon,
  hoverOnly = false,
  animateIcon = false,
  position = "right",
  className = "",
}) {
  if (icon == null) return null;

  // hover/animation container (UNCHANGED)
  let hoverClasses = "";
  if (hoverOnly) {
    hoverClasses = animateIcon
      ? position === "right"
        ? "inline-flex w-0 overflow-hidden transform -translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:translate-x-0 group-hover:opacity-100"
        : "inline-flex w-0 overflow-hidden transform translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:translate-x-0 group-hover:opacity-100"
      : position === "right"
      ? "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:ml-2 group-hover:opacity-100"
      : "inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-auto group-hover:mr-2 group-hover:opacity-100";
  } else {
    hoverClasses = position === "right" ? "ml-2 inline-flex" : "inline-flex";
  }

  const containerClass = className
    ? `${className} ${hoverClasses}`.trim()
    : hoverClasses;

  // 1) React element / inline SVG
  if (typeof icon === "object" && (icon.$$typeof || typeof icon === "function")) {
    const Element = icon;
    return <span className={containerClass}><Element /></span>;
  }

  // 2) imported asset (object with .src) or URL string
  if (typeof icon === "object" && icon.src) {
    return (
      <span className={containerClass}>
        <img src={icon.src} alt="" className="h-4 w-auto" loading="lazy" />
      </span>
    );
  }
  if (typeof icon === "string") {
    // emoji or URL or raw SVG string
    const isUrl = icon.startsWith("http") || icon.startsWith("/");
    const isSvgText = icon.trim().startsWith("<svg");
    if (isUrl) {
      return (
        <span className={containerClass}>
          <img src={icon} alt="" className="h-4 w-auto" loading="lazy" />
        </span>
      );
    }
    if (isSvgText) {
      return (
        <span
          className={containerClass}
          // dangerously insert raw SVG
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    // fallback: render as text (emoji or glyph)
    return <span className={containerClass}>{icon}</span>;
  }

  return null;
}
