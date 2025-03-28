import React from "react";

export default function HamburgerMenuItem({ item, depth = 0, onClose }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Toggle the submenu if click is outside a link or button, but only if there are sub-items.
  const handleContainerClick = (e) => {
    if (hasChildren && !e.target.closest('a') && !e.target.closest('button')) {
      setOpen((prev) => !prev);
    }
  };

  // Specific handler for clicking on the arrow, stopping propagation.
  const handleArrowClick = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`py-2 pl-${depth * 4}`}>
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
            <span
              className={`inline-block transform transition-transform duration-200 cursor-pointer ${
                open ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="ml-4 mt-2">
          {item.children.map((child) => (
            <HamburgerMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onClose={onClose}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
