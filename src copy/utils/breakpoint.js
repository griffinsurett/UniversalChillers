// Tailwind’s default min-width breakpoints + media-query helpers
export const breakpointMap = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function maxWidth(bp) {
  const px = breakpointMap[bp];
  if (px == null) throw new Error(`Unknown breakpoint: '${bp}'`);
  return `(max-width: ${px - 1}px)`;
}

export function minWidth(bp) {
  const px = breakpointMap[bp];
  if (px == null) throw new Error(`Unknown breakpoint: '${bp}'`);
  return `(min-width: ${px}px)`;
}

/** One source-of-truth for show/hide classes */
export const breakpointClasses = {
  sm:   { desktop: "hidden sm:flex",   mobile: "flex sm:hidden"   },
  md:   { desktop: "hidden md:flex",   mobile: "flex md:hidden"   },
  lg:   { desktop: "hidden lg:flex",   mobile: "flex lg:hidden"   },
  xl:   { desktop: "hidden xl:flex",   mobile: "flex xl:hidden"   },
  '2xl':{ desktop: "hidden 2xl:flex", mobile: "flex 2xl:hidden" },
};
