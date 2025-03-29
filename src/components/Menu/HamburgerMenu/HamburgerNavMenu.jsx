import React from "react";
import HamburgerButton from "./HamburgerIcon.jsx";
import MobileMenuContainer from "./HamburgerMenuContainer.jsx";

export default function MobileNavMenu({ items, hamburgerTransform = true, breakpoint, menuItemClass, submenuClass, isHierarchical, menuItemComponent }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setMenuOpen(false);
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  return (
    <>
      <HamburgerButton
        isOpen={menuOpen}
        onChange={toggleMenu}
        hamburgerTransform={hamburgerTransform}
      />
      <MobileMenuContainer 
        items={items} 
        isOpen={menuOpen} 
        onClose={closeMenu}
        breakpoint={breakpoint}
        menuItemClass={menuItemClass}
        submenuClass={submenuClass}
        isHierarchical={isHierarchical}
        menuItemComponent={menuItemComponent}
      />
    </>
  );
}
