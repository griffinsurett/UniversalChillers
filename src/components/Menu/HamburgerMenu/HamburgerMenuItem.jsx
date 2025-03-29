import React from "react";
import { hasSubMenuItems } from "@/utils/MenuUtils";

export default function HamburgerMenuItem({ item, depth = 0, onClose, breakpoint, menuItem, submenuItem, isHierarchical }) {
  const [open, setOpen] = React.useState(false);
  const hasSub = hasSubMenuItems(item, isHierarchical);
  
  const mainClass = menuItem && menuItem.class ? menuItem.class : "";
  
  // For children, use submenuItem if provided; otherwise fallback.
  const RenderComponent = submenuItem && submenuItem.component 
    ? submenuItem.component 
    : (menuItem && menuItem.component ? menuItem.component : HamburgerMenuItem);

  const handleContainerClick = (e) => {
    if (hasSub && !e.target.closest('a') && !e.target.closest('button')) {
      setOpen((prev) => !prev);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`py-2 pl-${depth * 4} ${mainClass}`}>
      <div onClick={handleContainerClick} className={`flex items-center justify-between ${hasSub ? "cursor-pointer" : ""}`}>
        <a href={item.slug} onClick={onClose}>
          {item.label}
        </a>
        {hasSub && (
          <button onClick={handleArrowClick} className="focus:outline-none" aria-label="Toggle submenu">
            <span className={`inline-block transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
        )}
      </div>
      {hasSub && open && (
        <ul className="ml-4 mt-2">
          {item.children.map((child) => (
            <RenderComponent
              key={child.id}
              item={child}
              depth={depth + 1}
              onClose={onClose}
              breakpoint={breakpoint}
              menuItem={menuItem}
              submenuItem={submenuItem}
              isHierarchical={isHierarchical}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
