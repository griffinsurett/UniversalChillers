// src/components/Menu/MenuItem.jsx
import React from "react";
import SubMenu from "./SubMenu.jsx";

export default function MenuItem({ item, itemClass, listClass, maxDepth, currentDepth = 0 }) {
  return (
    <li className={itemClass} style={{ paddingLeft: `1rem` }}>
      <a href={item.slug}>
        {item.label}
        {item.children && item.children.length > 0 && currentDepth < maxDepth && (
          <span className="submenu-arrow" style={{ marginLeft: "0.5rem" }}>➤</span>
        )}
      </a>
      {item.children && item.children.length > 0 && currentDepth < maxDepth && (
        <SubMenu 
          items={item.children} 
          itemClass={itemClass} 
          listClass={listClass} 
          maxDepth={maxDepth} 
          currentDepth={currentDepth + 1} 
        />
      )}
    </li>
  );
}
