// src/components/Menu/HamburgerMenu/MenuItem.jsx
import React, { useState } from "react";
import ClientItemsTemplate from "@/components/ItemsTemplates/ClientItemsTemplate.jsx";
import Button from "@/components/Button/Button.jsx";
import {
  getMenuId,
  getMenuLink,
  getChildItems,
  hasMenuChildren,
} from "@/utils/menuUtils.js";

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
  onItemClick,
}) {
  const [open, setOpen] = useState(false);

  const thisId = getMenuId(item);
  const children = getChildItems(thisId, allItems);
  const hasKids = hasMenuChildren(item, allItems, hierarchical);

  return (
    <div className={`w-full ${itemClass}`}>
      {hasKids ? (
        <Button
          as="button"
          variant="link"
          tabIndex={0}
          onClick={() => setOpen((p) => !p)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((p) => !p);
            }
          }}
          className={`flex w-full items-center justify-between ${linkClass}`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <span>{item.data.title}</span>
          <span
            className={`transform transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </Button>
      ) : (
        <Button
          as="a"
          variant="link"
          href={getMenuLink(item, collectionName)}
          className={`flex w-full ${linkClass}`}
          onClick={onItemClick}
        >
          {item.data.title}
        </Button>
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
                submenu,
                checkboxId,
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
