import React, { Suspense, lazy } from "react";

// Lazy load the Hamburger Menu Container and Hamburger Button
const HamburgerMenuContainer = lazy(() => import("./HamburgerMenuContainer.jsx"));
const HamburgerButton = lazy(() => import("./HamburgerIcon.jsx"));

export default function HamburgerNavMenu({
  items,
  hamburgerTransform = true,
  breakpoint,
  menuItem,
  submenuItem,
  isHierarchical
}) {
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
      <Suspense fallback={<div>Loading Menu...</div>}>
        <HamburgerButton
          isOpen={menuOpen}
          onChange={toggleMenu}
          hamburgerTransform={hamburgerTransform}
        />
        <HamburgerMenuContainer 
          items={items} 
          isOpen={menuOpen} 
          onClose={closeMenu}
          breakpoint={breakpoint}
          menuItem={menuItem}
          submenuItem={submenuItem}
          isHierarchical={isHierarchical}
        />
      </Suspense>
    </>
  );
}
