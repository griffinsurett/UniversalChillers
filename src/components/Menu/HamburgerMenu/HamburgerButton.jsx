import React from "react";

export default function HamburgerButton({ isOpen, onChange, hamburgerTransform = true }) {
  return (
    <div className="relative cursor-pointer w-8 h-8 z-[99999]">
      {/* The hidden checkbox controlling the state */}
      <input
        type="checkbox"
        id="hamburger-toggle"
        className="hidden"
        checked={isOpen}
        onChange={onChange}
      />
      {/* The label acts as the visible toggle */}
      <label htmlFor="hamburger-toggle" className="block w-8 h-8">
        {hamburgerTransform ? (
          <>
            <span
              className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                isOpen ? "top-1/2 rotate-45" : "top-1/4"
              }`}
            ></span>
            <span
              className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                isOpen ? "opacity-0" : "top-1/2"
              }`}
            ></span>
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
      </label>
    </div>
  );
}
