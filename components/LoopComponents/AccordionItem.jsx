// src/components/LoopComponents/AccordionItem.jsx
import React, { useState } from "react";

export default function AccordionItem({
  item,
  itemClass = "",
  collectionName,
  HasPage,
}) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <article className={itemClass}>
      {/* Header: clicking toggles open/closed */}
      <div
        onClick={toggle}
        className="w-full flex justify-between items-center py-[var(--spacing-lg)] cursor-pointer select-none"
      >
        <span className="h6">{item.data.title || item.slug}</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Body: conditionally rendered */}
      <div
        className={`overflow-hidden transition-[max-height] duration-[var(--transition-fast)] ${
          open ? "max-h-96 py-[var(--spacing-sm)] px-[var(--spacing-lg)]" : "max-h-0"
        }`}
      >
        {item.data.description ?? item.body}
      </div>
    </article>
  );
}
