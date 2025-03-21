import React, { useEffect } from 'react';
import Modal from '../Modal.jsx';

const MobileNavMenu = ({ items = [], closeButton = true, hamburgerTransform = false }) => {
  const toggleId = "mobile-nav-toggle";

  // Attach hamburger transform behavior if enabled.
  useEffect(() => {
    if (!hamburgerTransform) return;
    const toggle = document.getElementById(toggleId);
    const label = document.querySelector(`label[for="${toggleId}"]`);
    if (!toggle || !label) return;
    
    // Target the SVG lines using their classes.
    const topLine = label.querySelector('.top-line');
    const middleLine = label.querySelector('.middle-line');
    const bottomLine = label.querySelector('.bottom-line');

    const transformHamburger = (isOpen) => {
      if (isOpen) {
        topLine && topLine.classList.add('transform', 'rotate-45', 'translate-y-2');
        middleLine && middleLine.classList.add('opacity-0');
        bottomLine && bottomLine.classList.add('transform', '-rotate-45', '-translate-y-2');
      } else {
        topLine && topLine.classList.remove('rotate-45', 'translate-y-2');
        middleLine && middleLine.classList.remove('opacity-0');
        bottomLine && bottomLine.classList.remove('-rotate-45', '-translate-y-2');
      }
    };

    // Ensure initial state is the default hamburger.
    transformHamburger(false);

    const changeHandler = (e) => {
      transformHamburger(e.target.checked);
    };

    toggle.addEventListener('change', changeHandler);
    return () => {
      toggle.removeEventListener('change', changeHandler);
    };
  }, [hamburgerTransform, toggleId]);

  // Render a simple nested list of links for the mobile menu.
  const renderMenuItems = (menuItems) => (
    <ul className="flex flex-col gap-4">
      {menuItems.map((item, index) => (
        <li key={`${item.id || item.slug}-${index}`}>
          <a
            href={item.slug}
            className="text-gray-800 hover:text-blue-600"
            onClick={() => {
              const toggle = document.getElementById(toggleId);
              if (toggle) {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            {item.label}
          </a>
          {item.children && item.children.length > 0 && (
            <ul className="ml-4 flex flex-col gap-2">
              {renderMenuItems(item.children)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <Modal
      triggerId={toggleId}
      openTrigger="change"
      closeButton={closeButton}
      className="w-full h-1/2 bg-white"
      overlayClass="bg-transparent"
    >
      <nav>
        {renderMenuItems(items)}
      </nav>
    </Modal>
  );
};

export default MobileNavMenu;

