import React, { useState } from "react";
import { normalizeRef } from "@/utils/ContentUtils";
import { allMenuItems } from "../menu-data";

/**
 * Mobile <MenuItem>
 *   • shows children inline, collapsible with disclosure caret
 *   • styling is controlled entirely by props from Menu.astro
 */
export default function MobileMenuItem({
  item,
  itemClass     = "",
  linkClass     = "",
  hierarchical  = true,
  submenu       = null,     /* ignored on mobile, handled here */
}) {
  /* locate children in cached list  */
  const thisId   = item.data.id ?? normalizeRef(item.data.link);
  const children = allMenuItems.filter(
    (c) => c.data.parent && normalizeRef(c.data.parent) === thisId,
  );
  const hasKids  = hierarchical && children.length;

  const [open, setOpen] = useState(false);

  return (
    <li className={`w-full ${itemClass}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between ${linkClass}`}
      >
        <span>{item.data.title}</span>
        {hasKids && (
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>
            ▶
          </span>
        )}
      </button>

      {hasKids && open && (
        <ul className="ml-4 border-l border-gray-200">
          {children.map((child) => (
            <MobileMenuItem
              key={child.id}
              item={child}
              itemClass={itemClass}
              linkClass={linkClass}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
