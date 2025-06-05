// src/components/Menu/HamburgerMenu/MenuItem.jsx

import React, { useState } from "react";
import { getChildItems } from "@/utils/menuUtils.js";
import { sortItems } from "@/utils/sortItems.js"; 
import ClientItemsTemplate from "@/components/Section/ItemsTemplates/ClientItemsTemplate.jsx";

export default function MobileMenuItem({
  item,
  allItems = [],
  itemClass = "",
  linkClass = "",
  hierarchical = true,
  submenu = null,
  checkboxId,
  collectionName,
  HasPage,
}) {
  const [open, setOpen] = useState(false);

  // 1) Compute this item’s ID (stable identifier)
  const thisId = item.data.id ?? item.data.link.replace(/^\//, "");

  // 2) DRY’d‐out: find direct children using our helper
  const children = getChildItems(thisId, allItems);
  const hasKids = hierarchical && children.length > 0;

  return (
    <div className={`w-full ${itemClass}`}>
      {hasKids ? (
        <button
          tabIndex={0}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((prev) => !prev);
            }
          }}
          className={`flex w-full items-center justify-between ${linkClass}`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <span>{item.data.title}</span>
          <span
            className={`transform transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
            aria-hidden="true"
          >
            ▶
          </span>
        </button>
      ) : (
        <a
          tabIndex={0}
          href={item.data.link}
          className={`flex w-full items-center justify-start ${linkClass}`}
          onClick={() => {
            // Uncheck the checkbox so the modal closes:
            const box = document.getElementById(checkboxId);
            if (box) box.checked = false;
          }}
        >
          <span>{item.data.title}</span>
        </a>
      )}

      {hasKids && open && (
        <div className="ml-4 border-l border-gray-200">
          <ClientItemsTemplate
            items={children}
            collectionName={collectionName}
            HasPage={HasPage}
            itemsClass="flex flex-col space-y-2"
            itemClass=""
            role="menu"
            ItemComponent={{
              component: MobileMenuItem,
              props: {
                allItems,
                itemClass: submenu.subMenuItem.props.itemClass,
                linkClass: submenu.subMenuItem.props.linkClass,
                hierarchical: submenu.subMenuItem.props.hierarchical,
                submenu: submenu,
                checkboxId: checkboxId,
                collectionName,
                HasPage,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
