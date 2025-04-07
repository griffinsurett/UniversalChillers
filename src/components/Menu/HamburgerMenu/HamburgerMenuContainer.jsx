import React from "react";
import Modal from "../../Modal.jsx";
import HamburgerMenuItem from "./HamburgerMenuItem.jsx";

export default function HamburgerMenuContainer({
  items,
  isOpen,
  onClose,
  breakpoint,
  menuItem,
  submenuItem,
  isHierarchical,
  listClass,
  hamburgerMenu
}) {
  // Determine the RenderComponent for main mobile menu items.
  const RenderComponent = menuItem && menuItem.component ? menuItem.component : HamburgerMenuItem;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // Use hamburgerMenu.menuOverlay if provided; otherwise default to bg-black bg-opacity-50.
      overlayClass={hamburgerMenu?.menuOverlay || "bg-black bg-opacity-50"}
      // Append hamburgerMenu.menuBackground classes to the modal container.
      className={`bg-bg ${hamburgerMenu?.menuBackground || ""} rounded shadow-lg p-4 w-full h-full overflow-auto`}
      closeButton={false}
    >
      <nav onClick={(e) => e.stopPropagation()}>
        <ul className={`space-y-2 ${listClass || ""}`}>
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
