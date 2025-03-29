import React from "react";
import Modal from "../../Modal.jsx";
import HamburgerMenuItem from "./HamburgerMenuItem.jsx";

export default function MobileMenuContainer({ items, isOpen, onClose, breakpoint, menuItemClass, submenuClass, isHierarchical, menuItemComponent }) {
  // Determine the RenderComponent for hamburger menu items.
  const RenderComponent = menuItemComponent ? menuItemComponent : HamburgerMenuItem;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      overlayClass="bg-black bg-opacity-50"
      className="bg-white rounded shadow-lg p-4 w-full h-full overflow-auto"
      closeButton={false}
    >
      <nav onClick={(e) => e.stopPropagation()}>
        <ul className="space-y-2">
          {items.map((item) => (
            <RenderComponent 
              key={item.id} 
              item={item} 
              onClose={onClose}
              breakpoint={breakpoint}
              menuItemClass={menuItemClass}
              submenuClass={submenuClass}
              isHierarchical={isHierarchical}
              menuItemComponent={menuItemComponent}
            />
          ))}
        </ul>
      </nav>
    </Modal>
  );
}
