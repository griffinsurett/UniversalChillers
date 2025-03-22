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
  const modalTriggerId = 'mobile-menu-toggle';

  // Determine transformation classes based on hamburgerTransform prop.
  const topLineTransform = hamburgerTransform
    ? 'peer-checked:translate-y-3 peer-checked:rotate-45'
    : '';
  const middleLineTransform = hamburgerTransform
    ? 'peer-checked:opacity-0'
    : '';
  const bottomLineTransform = hamburgerTransform
    ? 'peer-checked:-translate-y-3 peer-checked:-rotate-45'
    : '';

  return (
    <>
      {/* Hidden checkbox trigger */}
      <input type="checkbox" id={modalTriggerId} className="hidden peer" />
      
      {/* Hamburger icon label with transform using peer-checked classes */}
      <label
        htmlFor={modalTriggerId}
        className="block md:hidden cursor-pointer relative z-[99999]"
      >
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            className={`transition-transform duration-300 origin-center ${topLineTransform}`}
            x1="4"
            y1="6"
            x2="20"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            className={`transition-opacity duration-300 ${middleLineTransform}`}
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            className={`transition-transform duration-300 origin-center ${bottomLineTransform}`}
            x1="4"
            y1="18"
            x2="20"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </label>

      {/* Modal component for the mobile menu */}
      <Modal
        triggerId={modalTriggerId}
        openTrigger="change"
        closeButton={false}
        overlayClass="bg-transparent"
        className="w-full h-full"
      >
        <nav
          className="bg-white rounded shadow-lg p-4 w-full h-full overflow-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
        >
          <ul className="space-y-2">
            {items.map((item) => (
              <MobileMenuItem
                key={item.id}
                item={item}
                onClose={() => {
                  // Close the menu by unchecking the checkbox
                  const checkbox = document.getElementById(modalTriggerId);
                  if (checkbox) checkbox.checked = false;
                }}
              />
            ))}
          </ul>
        </nav>
      </Modal>
    </>
  );
}
