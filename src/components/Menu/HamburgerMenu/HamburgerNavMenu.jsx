import React from "react";
import HamburgerButton from "./HamburgerButton.jsx";
import MobileMenuContainer from "./HamburgerMenuContainer.jsx";

export default function MobileNavMenu({ items, hamburgerTransform = true }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Toggle the state when the checkbox changes
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
      <MobileMenuContainer items={items} isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}
