import React from "react";

export default function HamburgerButton({ isOpen, onClick, hamburgerTransform = true }) {
  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer w-8 h-8 z-[99999]"
      aria-label="Toggle mobile menu"
    >
      {hamburgerTransform ? (
        <>
          {/* Top line: Positioned at 25% when closed, moves to center & rotates 45° when open */}
          <span
            className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
              isOpen ? "top-1/2 rotate-45" : "top-1/4"
            }`}
          ></span>
          {/* Middle line: Always centered but fades out when open */}
          <span
            className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-0" : "top-1/2"
            }`}
          ></span>
          {/* Bottom line: Positioned at 75% when closed, moves to center & rotates -45° when open */}
          <span
            className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
              isOpen ? "top-1/2 -rotate-45" : "top-3/4"
            }`}
          ></span>
        </>
      ) : (
        <>
          <span className="absolute block h-0.5 w-6 bg-current top-1/4"></span>
          <span className="absolute block h-0.5 w-6 bg-current top-1/2"></span>
          <span className="absolute block h-0.5 w-6 bg-current top-3/4"></span>
        </>
      )}
    </button>
  );
}
