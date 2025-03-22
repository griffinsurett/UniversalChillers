// src/components/Menu/MobileNavMenu.jsx
import React from 'react';

function MobileMenuItem({ item, depth = 0, onClose }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={`py-2 pl-${depth * 4}`}>
      <div className="flex items-center justify-between">
        <a
          href={item.slug}
          className="text-lg text-gray-800"
          onClick={onClose}
        >
          {item.label}
        </a>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-600 focus:outline-none"
            aria-label="Toggle submenu"
          >
            <span
              className={`transform transition-transform duration-200 ${
                open ? 'rotate-180' : ''
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
            <MobileMenuItem
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

export default function MobileNavMenu({ items, hamburgerTransform = true }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Determine classes based on hamburgerTransform prop and menuOpen state.
  const topLineClasses = hamburgerTransform
    ? menuOpen
      ? 'rotate-45 translate-y-2'
      : '-translate-y-2'
    : '-translate-y-2';

  const middleLineClasses = hamburgerTransform
    ? menuOpen
      ? 'opacity-0'
      : 'opacity-100'
    : 'opacity-100';

  const bottomLineClasses = hamburgerTransform
    ? menuOpen
      ? '-rotate-45 -translate-y-2'
      : 'translate-y-2'
    : 'translate-y-2';

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center z-[99999]"
        aria-label="Toggle mobile menu"
      >
        <span
          className={`block absolute h-0.5 w-8 bg-current transform transition duration-300 ease-in-out ${topLineClasses}`}
        ></span>
        <span
          className={`block absolute h-0.5 w-8 bg-current transform transition duration-300 ease-in-out ${middleLineClasses}`}
        ></span>
        <span
          className={`block absolute h-0.5 w-8 bg-current transform transition duration-300 ease-in-out ${bottomLineClasses}`}
        ></span>
      </button>

      {/* Fullscreen overlay for the mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeMenu}
        >
          <nav
            className="bg-white rounded shadow-lg p-4 w-full h-full overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
          >
            <ul className="space-y-2">
              {items.map((item) => (
                <MobileMenuItem key={item.id} item={item} onClose={closeMenu} />
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
