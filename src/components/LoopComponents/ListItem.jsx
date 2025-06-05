// src/components/ListItem.jsx
import React from "react";
import Heading from "../Heading";

/**
 * A list item with an icon, colored icon background, heading, and description.
 */
export default function ListItem({ item, itemClass, collectionName, HasPage }) {
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
  return (
    <article className={`flex items-start space-x-[var(--spacing-md)] ${itemClass}`}>
      <div className={`flex-shrink-0 p-[var(--spacing-sm)] rounded-full`}>
          {item.data.icon && (
          // If icon is something that looks like a URL (starts with “/”, “http”, or ends in “.svg”/“.png”), render <img>.
          // Otherwise assume it’s an emoji/string and render it in a <span>.
          /^(\/|https?:\/\/).+|.+\.(svg|png|jpg|jpeg|webp)$/i.test(item.data.icon) ? (
            <img
              src={item.data.icon}
              alt=""
              className={`w-8 h-8 bg-[var(--color-accent)] rounded-full`}
            />
          ) : (
            <span
              className={`inline-flex items-center justify-center w-8 h-8 text-xl bg-[var(--color-accent)] text-bg rounded-full`}
              aria-hidden="true"
            >
              {item.data.icon}
            </span>
          )
        )}
        {!item.data.icon && (
          <div className={`w-8 h-8 bg-[var(--color-accent)] rounded-full`} />
        )}
        {!item.data.icon && (
          <div className={`w-8 h-8 bg-[var(--color-accent)] rounded-full`} />
        )}
      </div>
      <div>
        <Heading tagName={"h3"} className="h3 text-primary">
          {item.data.title}
        </Heading>
        <p className="mt-[var(--spacing-xs)] text-text text-sm lg:text-xl">
          {item.data.description || item.body}
        </p>
      </div>
    </article>
  );
}
