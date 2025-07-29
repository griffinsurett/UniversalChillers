// src/components/Menu/HamburgerMenu/HamburgerIcon.jsx
import React, { useState, useEffect } from "react";

// 🌟 Class‐name constants you can adjust in one place:
const SIZE_CLASS         = "w-6 h-6";              
const Z_INDEX_CLASS      = "z-[999999]";          
const BAR_BASE_CLASSES   = "absolute left-0 block bg-current transition duration-300 origin-center";
const BAR_HEIGHT_CLASS   = "h-0.5";                
const TOP_DEFAULT_POS    = "top-1/4";              
const MID_DEFAULT_POS    = "top-1/2";              
const BOTTOM_DEFAULT_POS = "top-3/4";              
const OPEN_POS_CLASS     = "top-1/2";              
const ROTATE_PLUS_45     = "rotate-45";            
const ROTATE_NEG_45      = "-rotate-45";           
const OPACITY_FULL       = "opacity-100";          
const OPACITY_NONE       = "opacity-0";            

export default function HamburgerIcon({
  hamburgerTransform,
  checkboxId,
  className = "cursor-pointer",
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

  // Build each bar’s final className from the constants
  const topBarClasses = [
    BAR_BASE_CLASSES,
    BAR_HEIGHT_CLASS,
    SIZE_CLASS.replace("h-6", ""), // remove container height
    open && hamburgerTransform ? `${OPEN_POS_CLASS} ${ROTATE_PLUS_45}` : TOP_DEFAULT_POS
  ].join(" ");

  const middleBarClasses = [
    BAR_BASE_CLASSES,
    BAR_HEIGHT_CLASS,
    SIZE_CLASS.replace("h-6", ""),
    MID_DEFAULT_POS,
    open && hamburgerTransform ? OPACITY_NONE : OPACITY_FULL
  ].join(" ");

  const bottomBarClasses = [
    BAR_BASE_CLASSES,
    BAR_HEIGHT_CLASS,
    SIZE_CLASS.replace("h-6", ""),
    open && hamburgerTransform
      ? `${OPEN_POS_CLASS} ${ROTATE_NEG_45}`
      : BOTTOM_DEFAULT_POS
  ].join(" ");

  return (
    <div className={`relative ${SIZE_CLASS} ${Z_INDEX_CLASS} ${className}`}>
      <span className={topBarClasses} />
      <span className={middleBarClasses} />
      <span className={bottomBarClasses} />
    </div>
  );
}
