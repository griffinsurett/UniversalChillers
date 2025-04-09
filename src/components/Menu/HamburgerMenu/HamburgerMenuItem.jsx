// src/components/Menu/HamburgerMenu/HamburgerMenuItem.jsx
import React from "react";
import { hasSubMenuItems, getEffectiveMenuItemClass } from "@/utils/MenuUtils";

export default function HamburgerMenuItem({ item, depth = 0, onClose, breakpoint, menuItem, submenuItem, isHierarchical }) {
  const [open, setOpen] = React.useState(false);
  const hasSub = hasSubMenuItems(item, isHierarchical);

  // Use the new utility function to determine the effective class.
  const containerClass = getEffectiveMenuItemClass(depth, menuItem, submenuItem);

  // For children, check for submenu override first.
  const RenderComponent =
    submenuItem && submenuItem.component
      ? submenuItem.component
      : (menuItem && menuItem.component ? menuItem.component : HamburgerMenuItem);

  const handleContainerClick = (e) => {
    // Toggle open state only if clicking outside a link or button.
    if (hasSub && !e.target.closest("a") && !e.target.closest("button")) {
      setOpen((prev) => !prev);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`py-[var(--spacing-sm)] ${containerClass}`}>
      <div onClick={handleContainerClick} className="flex justify-center items-center cursor-pointer">
        <a href={item.slug} onClick={onClose} className="block">
          {item.label}
        </a>
        {hasSub && (
          <button onClick={handleArrowClick} className="focus:outline-none m-[var(--spacing-sm)]" aria-label="Toggle submenu">
            <span className="inline-block transform transition-transform duration-200">
              {submenuItem && submenuItem.submenuArrow ? submenuItem.submenuArrow : "▼"}
            </span>
          </button>
        )}
      </div>
      {hasSub && open && (
        <ul className="text-center">
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
