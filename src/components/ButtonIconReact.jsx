// src/components/ButtonIconReact.jsx
import React from "react";
import DefaultIconURL from "@/assets/astro.svg"; // this bundles as a plain URL

export default function ButtonIconReact({
  element,       // optional: a React node or string (e.g. "▼")
  className = "",
  ...props
}) {
  // If they passed a custom React element, render it directly.
  if (React.isValidElement(element)) {
    return <span className={className} {...props}>{element}</span>;
  }

  // If it's a string, render a <span> for it.
  if (typeof element === "string") {
    return <span className={className} {...props}>{element}</span>;
  }

  // Fallback to an <img> using the Astro asset URL.
  return (
    <img
      src={DefaultIconURL}
      alt=""
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}
