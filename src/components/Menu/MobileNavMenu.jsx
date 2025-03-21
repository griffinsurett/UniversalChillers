// MobileNavMenu.jsx
import React from 'react';
import Modal from '../Modal.jsx';

const MobileNavMenu = ({ items = [], closeButton = true }) => {
  const toggleId = "mobile-nav-toggle";

  // Render a simple nested list of links for the mobile menu.
  const renderMenuItems = (menuItems) => (
    <ul className="flex flex-col gap-4">
      {menuItems.map((item, index) => (
        <li key={`${item.id || item.slug}-${index}`}>
          <a
            href={item.slug}
            className="text-gray-800 hover:text-blue-600"
            onClick={() => {
              // Uncheck the trigger to close the modal when a link is clicked.
              const toggle = document.getElementById(toggleId);
              if (toggle) toggle.checked = false;
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
