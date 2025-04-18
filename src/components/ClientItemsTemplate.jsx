// src/components/ClientItemsTemplate.jsx
import React from "react";

export default function ClientItemsTemplate({
  items = [],
  ItemComponent,
  itemsClass = "",
  itemClass = "",
  collectionName,
  HasPage,
}) {
  // 1️⃣ Sanity check
  if (!ItemComponent) {
    console.error("ClientItemsTemplate: missing ItemComponent");
    return null;
  }

  // 2️⃣ Support both <MyComp /> and { component: MyComp, props }
  const isObj =
    typeof ItemComponent === "object" && ItemComponent !== null;
  const Comp = isObj ? ItemComponent.component : ItemComponent;

  if (!Comp) {
    console.error("ClientItemsTemplate: invalid component:", ItemComponent);
    return null;
  }

  // 3️⃣ Per-item props helper
  const getProps = (item) => {
    if (!isObj) return {};
    const p = ItemComponent.props;
    return typeof p === "function" ? p(item) : p || {};
  };

  return (
    <ul className={itemsClass}>
      {items.map((item) => (
        <Comp
          key={item.slug}
          item={item}
          itemClass={itemClass}
          collectionName={collectionName}
          HasPage={HasPage}
          {...getProps(item)}
        />
      ))}
    </ul>
  );
}
