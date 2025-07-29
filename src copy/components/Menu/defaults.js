// src/components/Menu/defaults.js
import MenuItem from "./MenuItem.astro";
import Submenu  from "./Submenu.astro";
import MobileMenuItem from "./HamburgerMenu/MenuItem.jsx";

export const desktopDefaults = {
  itemsClass: "flex gap-[var(--spacing-md)]",
  itemClass: "",
  menuItem: {
    component: MenuItem,
    props: {
      itemClass: "",
      linkClass: "",
      activeClass: "",
      hierarchical: false,
      submenu: {
        component: Submenu,
        itemsClass: "",
        subMenuItem: {
          component: MenuItem,
          props: {
            itemClass: "",
            linkClass: "",
            hierarchical: true,
            subMenuItem: null,
          },
        },
      },
    },
  },
};

export const mobileDefaults = {
  itemsClass: "",
  itemClass: "",
  menuItem: {
    component: MobileMenuItem,
    props: {
      itemClass: "",
      linkClass: "",
      activeClass: "",
      hierarchical: true,
      submenu: {
        component: MobileMenuItem,
        itemsClass: "",
        subMenuItem: {
          component: MobileMenuItem,
          props: {
            itemClass: "",
            linkClass: "",
            hierarchical: true,
            subMenuItem: null,
          },
        },
      },
    },
  },
  shared: {},
  cfg: {},
  checkboxId: "hamburger-menu-toggle",
  hamburgerIconClass: "",
  hamburgerTransform: false,
};
