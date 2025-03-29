import React from "react";

export default function HamburgerMenuItem({ item, depth = 0, onClose, breakpoint, menuItemClass, submenuClass, isHierarchical, menuItemComponent }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = isHierarchical && item.children && item.children.length > 0;
  
  // Determine the RenderComponent for recursive rendering.
  const RenderComponent = menuItemComponent ? menuItemComponent : HamburgerMenuItem;

  const handleContainerClick = (e) => {
    if (hasChildren && !e.target.closest('a') && !e.target.closest('button')) {
      setOpen((prev) => !prev);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`py-2 pl-${depth * 4} ${menuItemClass}`}>
      <div
        onClick={handleContainerClick}
        className={`flex items-center justify-between ${hasChildren ? "cursor-pointer" : ""}`}
      >
        <a href={item.slug} className="text-lg text-gray-800" onClick={onClose}>
          {item.label}
        </a>
        {hasChildren && (
          <button
            onClick={handleArrowClick}
            className="text-gray-600 focus:outline-none"
            aria-label="Toggle submenu"
          >
            <span className={`inline-block transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="ml-4 mt-2">
          {item.children.map((child) => (
            <RenderComponent
              key={child.id}
              item={child}
              depth={depth + 1}
              onClose={onClose}
              breakpoint={breakpoint}
              menuItemClass={menuItemClass}
              submenuClass={submenuClass}
              isHierarchical={isHierarchical}
              menuItemComponent={menuItemComponent}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
