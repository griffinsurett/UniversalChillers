// This React component renders the submenu as a list of MenuItems (it can reuse your Astro version or a React version).
import React from "react";
import MenuItem from "./MenuItem.jsx"; // You can reuse the React version if desired

export default function SubMenu({ items, itemClass, listClass, maxDepth, currentDepth }) {
  return (
    <ul className={listClass}>
      {items.map((child) => (
        <MenuItem
          key={child.id}
          item={child}
          itemClass={itemClass}
          listClass={listClass}
          maxDepth={maxDepth}
          currentDepth={currentDepth}
        />
      ))}
    </ul>
  );
}
