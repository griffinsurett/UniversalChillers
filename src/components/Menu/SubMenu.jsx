// src/components/Menu/SubMenu.jsx
import React from "react";
import MenuItem from "./MenuItem.jsx";

export default function SubMenu({ items, itemClass, listClass, maxDepth, currentDepth }) {
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <MenuItem 
          key={item.id} 
          item={item} 
          itemClass={itemClass} 
          listClass={listClass} 
          maxDepth={maxDepth}
          currentDepth={currentDepth}
        />
      ))}
    </ul>
  );
}
