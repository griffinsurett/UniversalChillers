import React, { useState } from 'react';
import Modal from '../Modal.jsx';

// Component for each mobile menu item with optional submenu toggling.
const MobileMenuItem = ({ item, toggleId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle submenu open/closed.
  const handleToggle = (e) => {
    e.preventDefault(); // Prevent the link navigation.
    setIsOpen(!isOpen);
  };

  return (
    <li>
      <div className="flex items-center justify-between">
        <a
          href={item.slug}
          className="text-gray-800 hover:text-blue-600"
          onClick={(e) => {
            // If the item has a submenu, prevent navigation.
            if (item.children && item.children.length > 0) {
              e.preventDefault();
            } else {
              // Close the modal for items without children.
              const toggle = document.getElementById(toggleId);
              if (toggle) {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
        >
          {item.label}
        </a>
        {item.children && item.children.length > 0 && (
          <button onClick={handleToggle} className="text-gray-800 ml-2">
            {isOpen ? "▲" : "▼"}
          </button>
        )}
      </div>
      {item.children && item.children.length > 0 && isOpen && (
        <ul className="ml-4 flex flex-col gap-2">
          {item.children.map((child, index) => (
            <MobileMenuItem key={`${child.id || child.slug}-${index}`} item={child} toggleId={toggleId} />
          ))}
        </ul>
      )}
    </li>
  );
};

const MobileNavMenu = ({ items = [], closeButton = true }) => {
  const toggleId = "mobile-nav-toggle";

  // Render the menu recursively using MobileMenuItem.
  const renderMenuItems = (menuItems) => (
    <ul className="flex flex-col gap-4">
      {menuItems.map((item, index) => (
        <MobileMenuItem key={`${item.id || item.slug}-${index}`} item={item} toggleId={toggleId} />
      ))}
    </ul>
  );

  return (
    <Modal
      triggerId={toggleId}
      openTrigger="change"
      closeButton={closeButton}
      className="w-full h-full bg-white"
      overlayClass="bg-transparent"
    >
      <nav>
        {renderMenuItems(items)}
      </nav>
    </Modal>
  );
};

export default MobileNavMenu;
