// src/components/icons/PhoneIcon.jsx
import React from "react";

export default function PhoneIcon({
  className = "h-auto w-5",
  fill = "currentColor",
  width,
  height,
  stroke,
  style,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill={fill}
      width={width}
      height={height}
      stroke={stroke}
      style={style}
      {...props}
    >
      <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.09-.21 11.72 11.72 0 0 0 3.66 1.17 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 1.17 3.66 1 1 0 0 1-.21 1.09l-2.2 2.2z" />
    </svg>
  );
}
