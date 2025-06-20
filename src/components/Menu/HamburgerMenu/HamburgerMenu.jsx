// src/components/Menu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect, Suspense } from "react";
import Modal from "@/components/Modal.jsx";
import ClientItemsTemplate from "@/components/ItemsTemplates/ClientItemsTemplate.jsx";
import MobileMenuItem from "./MenuItem.jsx";
import { getRootItems } from "@/utils/menuUtils.js";
import { getItemKey } from "@/utils/getItemKey.js";

export default function HamburgerMenu({
  checkboxId,
  allItems = [],
  shared,
  cfg = {},
}) {
  const { itemsClass = "", menuItem = {} } = cfg;
  const finalMenuItemComponent = menuItem.component || MobileMenuItem;
  const sortBy = shared.sortBy;
  const sortOrder = shared.sortOrder;

  // Only true top-levels
  const roots = getRootItems(allItems);

  // sync open state with checkbox
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const box = document.getElementById(checkboxId);
    if (!box) return;
    const sync = () => setOpen(box.checked);
    box.addEventListener("change", sync);
    return () => box.removeEventListener("change", sync);
  }, [checkboxId]);

  const closeMenu = () => {
    setOpen(false);
    const box = document.getElementById(checkboxId);
    if (box) {
      box.checked = false;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <Modal
      isOpen={open}
      className="w-full h-full flex flex-col items-center justify-center bg-primary text-bg"
      overlayClass="bg-black bg-opacity-75"
      closeButton={true}
      closeButtonClass="absolute top-4 right-4 p-2"
      onClose={closeMenu}
    >
      <nav
        aria-label="Mobile Menu"
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <ClientItemsTemplate
            // key={menuItem.id || menuItem.slug}
            key={getItemKey(menuItem)}
            items={roots}
            collectionName={shared.collection}
            HasPage={shared.HasPage}
            ItemComponent={{
              component: finalMenuItemComponent,
              props: {
                ...menuItem.props,
                allItems,
                checkboxId,
                collectionName: shared.collection,
                onItemClick: closeMenu,
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
