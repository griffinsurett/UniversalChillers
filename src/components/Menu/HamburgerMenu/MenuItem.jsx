// src/components/Menu/HamburgerMenu/MenuItem.jsx
import React, { useState } from "react";
import { getChildItems } from "@/utils/menuUtils.js";
import ClientItemsTemplate from "@/components/ItemsTemplates/ClientItemsTemplate.jsx";
import Button from "@/components/Button/Button.jsx";
import { getItemKey } from "@/utils/getItemKey.js";

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

  // 1) Compute this item’s ID (stable identifier)
  const thisId = getItemKey(item);

  // 2) DRY’d‐out: find direct children using our helper
  const children = getChildItems(thisId, allItems);
  const hasKids = hierarchical && children.length > 0;

  return (
    <div className={`w-full ${itemClass}`}>
      {hasKids ? (
        // ── REPLACE plain <button> WITH <Button as="button"> ──
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
        // ── LEAF NODE: still using <Button as="a"> ──
        <Button
          as="a"
          variant="link"
          href={
            // if you’ve explicitly set data.link, use that…
            item.data.link
              ? // otherwise build `/collection/slug-or-id`
                item.data.link
              : `/${collectionName}/${thisId}`
          }
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
