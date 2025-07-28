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
          {/* Inline dropdown panel */}
    {open && (
      <div className="
        fixed inset-x-0 top-16
          w-screen                  
          bg-white
          border-b border-gray-200  
          shadow-md
          z-50
      ">
        <nav aria-label="Mobile Menu" className="flex flex-col p-2">
          <Suspense fallback={null}>
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
              itemsClass="flex flex-col space-y-2"
              itemClass={menuItem.props.itemClass}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </Suspense>
        </nav>
      </div>
    )}
    </MenuProvider>
  );
}