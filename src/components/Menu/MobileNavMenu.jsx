// src/components/Menu/MobileNavMenu.jsx
import React from 'react';
import Modal from '../Modal.jsx';

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

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative w-8 h-8 z-[99999]"
        aria-label="Toggle mobile menu"
      >
        {hamburgerTransform ? (
          <>
            {/* Top line: Positioned at 25% when closed, moves to center & rotates 45° when open */}
            <span
              className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                menuOpen ? 'top-1/2 rotate-45' : 'top-1/4'
              }`}
            ></span>
            {/* Middle line: Always centered but fades out when open */}
            <span
              className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                menuOpen ? 'opacity-0' : 'top-1/2'
              }`}
            ></span>
            {/* Bottom line: Positioned at 75% when closed, moves to center & rotates -45° when open */}
            <span
              className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                menuOpen ? 'top-1/2 -rotate-45' : 'top-3/4'
              }`}
            ></span>
          </>
        ) : (
          <>
            <span className="absolute block h-0.5 w-6 bg-current top-1/4"></span>
            <span className="absolute block h-0.5 w-6 bg-current top-1/2"></span>
            <span className="absolute block h-0.5 w-6 bg-current top-3/4"></span>
          </>
        )}
      </button>

      {/* Mobile menu rendered via the Modal component */}
      <Modal
        isOpen={menuOpen}
        onClose={closeMenu}
        overlayClass="bg-black bg-opacity-50"
        className="bg-white rounded shadow-lg p-4 w-full h-full overflow-auto"
        closeButton={false}
      >
        <nav onClick={(e) => e.stopPropagation()}>
          <ul className="space-y-2">
            {items.map((item) => (
              <MobileMenuItem key={item.id} item={item} onClose={closeMenu} />
            ))}
          </ul>
        </nav>
      </Modal>
    </>
  );
}
