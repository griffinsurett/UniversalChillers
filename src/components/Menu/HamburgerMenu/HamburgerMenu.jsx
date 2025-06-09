// src/components/Menu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect, Suspense } from "react";
import Modal from "@/components/Modal.jsx";
import ClientItemsTemplate from "@/components/Section/ItemsTemplates/ClientItemsTemplate.jsx";
import MobileMenuItem from "./MenuItem.jsx";

export default function HamburgerMenu({
  checkboxId,
  allItems = [],     // now is just the flat list of “mainMenu” items
  shared,
  cfg = {},
}) {
  const { itemsClass = "", menuItem = {} } = cfg;
  const finalMenuItemComponent = menuItem.component || MobileMenuItem;
  const sortBy = shared.sortBy ?? undefined;
  const sortOrder = shared.sortOrder ?? undefined;

  const finalMenuItemProps = {
    itemClass:
      menuItem.props?.itemClass ||
      "p-[var(--spacing-sm)] text-base text-primary",
    linkClass: menuItem.props?.linkClass || "w-full text-left",
    hierarchical: menuItem.props?.hierarchical ?? true,
    submenu: {
      component: menuItem.props?.submenu?.component || MobileMenuItem,
      itemsClass:
        menuItem.props?.submenu?.itemsClass || "ml-4 border-l border-gray-200",
      subMenuItem: {
        component:
          menuItem.props?.submenu?.subMenuItem?.component || MobileMenuItem,
        props: {
          itemClass:
            menuItem.props?.submenu?.subMenuItem?.props?.itemClass ||
            "p-[var(--spacing-sm)] text-sm text-primary",
          linkClass:
            menuItem.props?.submenu?.subMenuItem?.props?.linkClass ||
            "w-full text-left",
          hierarchical:
            menuItem.props?.submenu?.subMenuItem?.props?.hierarchical ?? true,
          subMenuItem: null,
        },
      },
    },
  };

  const [open, setOpen] = useState(false);
  useEffect(() => {
    const box = document.getElementById(checkboxId);
    if (!box) return;
    const sync = () => setOpen(box.checked);
    box.addEventListener("change", sync);
    return () => box.removeEventListener("change", sync);
  }, [checkboxId]);

  // Only show true top‐levels (those without `data.parent`)
  const roots = allItems.filter((i) => !i.data.parent);

  return (
    <Modal
      isOpen={open}
      className="w-full h-full flex flex-col items-center justify-center bg-white"
      overlayClass="bg-black bg-opacity-75"
      closeButton={true}
      closeButtonClass="absolute top-4 right-4 p-2 text-gray-700 hover:text-black"
      onClose={() => {
        // close the modal
        setOpen(false);
        // also uncheck the toggle so the hamburger icon resets
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
          checkbox.checked = false;
          // dispatch a change so our HamburgerIcon sees it
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }}}
    >
      <nav
        aria-label="Mobile Menu"
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <ClientItemsTemplate
            key={menuItem.id || menuItem.slug }
            items={roots}
            collectionName={shared.collection}
            HasPage={shared.HasPage}
            ItemComponent={{
              component: finalMenuItemComponent,
              props: {
                ...finalMenuItemProps,
                allItems,   // entire flat “mainMenu” array
                checkboxId,
              },
            }}
            itemsClass="flex flex-col items-center space-y-6 text-lg"
            itemClass=""
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </Suspense>
      </nav>
    </Modal>
  );
}
