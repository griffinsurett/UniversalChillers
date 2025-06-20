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
  const link = getMenuLink(item, collectionName);

  return (
    <div className={`menu-item w-full ${itemClass}`}>
      <div className={`flex w-full items-center justify-between ${linkClass}`}>
        {/* Title always navigates */}
        <Button
          as="a"
          variant="link"
          href={link}
          className="flex-1 text-left"
          onClick={onItemClick}
        >
          {item.data.title}
        </Button>

        {/* Only show a toggle arrow if there are children */}
        {hasKids && (
          <Button
            as="button"
            variant="link"
            tabIndex={0}
            onClick={() => setOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((prev) => !prev);
              }
            }}
            className="ml-2 p-1"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <span
              className={`submenu-arrow`}
              aria-hidden="true"
            >
              ▼
            </span>
          </Button>
        )}
      </div>

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
                onItemClick,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
