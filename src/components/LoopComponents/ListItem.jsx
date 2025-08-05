// src/components/ListItem.jsx
import React from "react";
import Heading from "../Heading";
import Icon from "@/components/Icon/Icon";

/**
 * A list item with an icon, colored icon background, heading, and description.
 */
export default function ListItem({ item, itemClass, collectionName, HasPage }) {
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
  return (
    <article
      className={`flex items-start space-x-[var(--spacing-md)] py-6 load scale-up border-b border-gray-300 ${itemClass}`}
    >
        {item.data.icon && (
          <Icon
            icon={item.data.icon.src || item.data.icon} // Handle both object with .src and string
            className="w-auto h-25 mb-[var(--spacing-sm)]"
          />
        )}
      <div>
        <Heading tagName={"h3"} className="h3 text-secondary">
          {item.data.title}
        </Heading>
        <p className="m-0 text-text text-sm lg:text-xl">
          {item.data.description || item.body}
        </p>
      </div>
    </article>
  );
}
