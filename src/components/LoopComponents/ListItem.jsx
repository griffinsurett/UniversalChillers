// src/components/ListItem.jsx
import React from 'react';
import Heading from '../Heading';

/**
 * A list item with an icon, colored icon background, heading, and description.
 */
export default function ListItem({ item, collectionName, HasPage }) {
        const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
    return (
        <div className={`flex items-start space-x-[var(--spacing-md)]`}>
        <div className={`flex-shrink-0 p-[var(--spacing-sm)] rounded-full`}>
          {item.data.icon && (
            <img
              src={item.data.icon}
              alt="Icon"
              className={`w-8 h-8 bg-[var(--color-accent)] rounded-full`}
            />
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
      </div>
      );
};