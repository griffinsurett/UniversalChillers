// src/components/Menu/HamburgerMenu/HamburgerIcon.jsx
import React, { useState, useEffect } from "react";

export default function HamburgerIcon({
  hamburgerTransform,
  checkboxId,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hamburgerTransform) return;
    const box = document.getElementById(checkboxId);
    if (!box) return;
    const sync = () => setOpen(box.checked);
    box.addEventListener("change", sync);
    sync();
    return () => box.removeEventListener("change", sync);
  }, [hamburgerTransform, checkboxId]);

  return (
    <div className="relative w-6 h-6 z-[999999]">
      <span
        className={[
          "absolute left-0 block h-0.5 w-full bg-current transition-transform duration-300",
          open && hamburgerTransform
            ? "top-1/2 rotate-45"
            : "top-1/4",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 block h-0.5 w-full bg-current transition-opacity duration-300",
          open && hamburgerTransform
            ? "opacity-0"
            : "top-1/2",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 block h-0.5 w-full bg-current transition-transform duration-300",
          open && hamburgerTransform
            ? "top-1/2 -rotate-45"
            : "top-3/4",
        ].join(" ")}
      />
    </div>
  );
}
