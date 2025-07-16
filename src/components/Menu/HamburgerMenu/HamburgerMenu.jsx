// src/components/Menu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect, Suspense } from "react";
import Modal from "@/components/Modal.jsx";
import ClientItemsTemplate from "@/components/ItemsTemplates/ClientItemsTemplate.jsx";
import MobileMenuItem from "./MenuItem.jsx";
import { getRootItems } from "@/utils/menuUtils.js";
import { getItemKey } from "@/utils/getItemKey.js";
import { MenuProvider } from "./MenuContext.jsx";

export default function HamburgerMenu({
  checkboxId,
  allItems = [],
  shared,
  cfg = {},
}) {
  // console.log(`[HamburgerMenu:${checkboxId}] initializing`);

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

    function sync() {
      // console.log(
      //   `[HamburgerMenu:${checkboxId}] checkbox changed → open=${box.checked}`
      // );
      setOpen(box.checked);
    }
    box.addEventListener("change", sync);
    sync(); // sync initial
    return () => box.removeEventListener("change", sync);
  }, [checkboxId]);

  const closeMenu = () => {
    // console.log(`[HamburgerMenu:${checkboxId}] closeMenu() called`);
    setOpen(false);
    const box = document.getElementById(checkboxId);
    if (box) {
      box.checked = false;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  // bundle up our context value
  const menuContextValue = {
    open,
    toggleOpen: () => {
      console.log(
        `[HamburgerMenu:${checkboxId}] toggleOpen() called (was open=${open})`
      );
      const box = document.getElementById(checkboxId);
      if (box) box.checked = !box.checked;
      setOpen((b) => !b);
    },
    close: closeMenu,
  };

  return (
    <MenuProvider id={checkboxId} value={menuContextValue}>
      <Modal
        isOpen={open}
        className="w-full h-full flex flex-col items-center justify-center bg-bg text-bg"
        overlayClass="bg-bg bg-opacity-75"
        closeButton={true}
        closeButtonClass="absolute text-text top-4 right-4 p-2"
        onClose={closeMenu}
      >
        <nav
          aria-label="Mobile Menu"
          className="h-full flex flex-col text-center items-center justify-center"
        >
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <ClientItemsTemplate
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
              itemsClass={itemsClass}
              itemClass={menuItem.props.itemClass}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </Suspense>
        </nav>
      </Modal>
    </MenuProvider>
  );
}