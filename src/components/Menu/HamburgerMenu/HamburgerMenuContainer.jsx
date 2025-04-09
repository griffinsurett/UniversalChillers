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
      // Control whether the close button is shown and allow custom styling via closeButtonClass.
      closeButton={hamburgerMenu?.closeButton ?? false}
      closeButtonClass={hamburgerMenu?.closeButtonClass || "absolute top-0 right-0 m-[var(--spacing-sm)]"}
    >
      <nav onClick={(e) => e.stopPropagation()} className="flex flex-col justify-center items-center">
        <ul className={`text-center ${listClass || ""}`}>
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
