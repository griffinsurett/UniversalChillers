// src/components/ItemsTemplate.jsx
import React from "react";
import Card from "./Card.jsx";
import { queryItems } from "@/utils/QueryUtils";

/**
 * ItemsTemplate
 *
 * Props:
 *  - collection: (optional) if provided, the query will use it (along with the query prop)
 *  - query: (optional) the query type (e.g., "getAll", "related")
 *  - items: (optional) a static array of items. If not provided and collection & query exist,
 *           the items will be fetched dynamically.
 *  - ItemComponent: (optional) component to render each item (defaults to Card)
 *  - itemClass: (optional) classes for the <ul> container
 *  - pathname: (optional) the current URL pathname (e.g., Astro.url.pathname), required for dynamic queries
 *  - ...props: any additional props to be applied to the <ul>
 *
 * This component is defined as an async function so that it can await queryItems on the server.
 */
export default async function ItemsTemplate({
  collection,
  query,
  items: initialItems,
  ItemComponent,
  itemClass,
  pathname = "",
  ...props
}) {
  let items = initialItems || [];
  if (!initialItems && collection && query) {
    items = await queryItems(query, collection, pathname);
  }

  const RenderComponent = ItemComponent || Card;
  return items && items.length > 0 ? (
    <ul className={itemClass} {...props}>
      {items.map((item) => (
        <li key={item.slug}>
          <RenderComponent item={item} collectionName={collection} />
        </li>
      ))}
    </ul>
  ) : (
    <p>No items found.</p>
  );
}
