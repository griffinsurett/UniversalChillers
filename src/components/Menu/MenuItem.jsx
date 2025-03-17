// src/components/MenuItem.jsx
import React from "react";

export default function MenuItem({ item, itemClass, listClass, maxDepth }) {
  // Internal recursive helper function that tracks depth without exposing it as a prop.
  const renderItem = (item, currentDepth) => {
    return (
      <li className={itemClass} style={{ paddingLeft: `${1}rem` }}>
        <a href={item.slug}>
          {item.label}
          {item.children && item.children.length > 0 && currentDepth < maxDepth && (
            <span className="submenu-arrow" style={{ marginLeft: "0.5rem" }}>➤</span>
          )}
        </a>
        {item.children && item.children.length > 0 && currentDepth < maxDepth && (
          <ul className={listClass}>
            {item.children.map((child) => renderItem(child, currentDepth + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Start recursion at depth 0
  return renderItem(item, 0);
}
