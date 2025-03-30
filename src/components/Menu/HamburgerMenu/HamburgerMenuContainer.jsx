import React from "react";
import Modal from "../../Modal.jsx";
import HamburgerMenuItem from "./HamburgerMenuItem.jsx";

export default function MobileMenuContainer({ items, isOpen, onClose, breakpoint, menuItem, submenuItem, isHierarchical }) {
  // Determine the RenderComponent for main mobile menu items.
  const RenderComponent = menuItem && menuItem.component ? menuItem.component : HamburgerMenuItem;
  
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
              menuItem={menuItem}
              submenuItem={submenuItem}
              isHierarchical={isHierarchical}
            />
          ))}
        </ul>
      </nav>
    </Modal>
  );
}
