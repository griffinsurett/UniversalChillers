import React from "react";

export default function HamburgerMenuItem({ item, depth = 0, onClose }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={`py-2 pl-${depth * 4}`}>
      <div className="flex items-center justify-between">
        <a href={item.slug} className="text-lg text-gray-800" onClick={onClose}>
          {item.label}
        </a>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-600 focus:outline-none"
            aria-label="Toggle submenu"
          >
            <span
              className={`transform transition-transform duration-200 cursor-pointer ${
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
