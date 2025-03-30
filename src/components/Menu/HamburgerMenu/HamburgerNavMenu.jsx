import React from "react";
import HamburgerButton from "./HamburgerIcon.jsx";
import MobileMenuContainer from "./HamburgerMenuContainer.jsx";

export default function MobileNavMenu({ items, hamburgerTransform = true, breakpoint, menuItem, submenuItem, isHierarchical }) {
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
        menuItem={menuItem}
        submenuItem={submenuItem}
        isHierarchical={isHierarchical}
      />
    </>
  );
}
