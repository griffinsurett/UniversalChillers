// src/components/LoopComponents/AccordionItem.jsx
import React from "react";

export default function AccordionItem({
  item,
  itemClass = "",
  collectionName,
  HasPage,
}) {
  // Unique ID for checkbox toggle
  const toggleId = `accordion-toggle-${item.slug}`;

  return (
    <li className={itemClass}>
      {/* Hidden checkbox */}
      <input
        type="checkbox"
        id={toggleId}
        className="peer hidden"
      />

      {/* Header */}
      <label
        htmlFor={toggleId}
        className="w-full flex justify-between items-center py-[var(--spacing-lg)] cursor-pointer select-none"
      >
        <span className="h6">{item.data.title || item.slug}</span>
        <span className="transform transition-transform peer-checked:rotate-180">
          ▼
        </span>
      </label>

      {/* Body */}
      <div className="max-h-0 overflow-hidden transition-max-height duration-[var(--transition-fast)] peer-checked:max-h-96 peer-checked:py-[var(--spacing-sm)] peer-checked:px-[var(--spacing-lg)]">
        {item.data.description ?? item.body}
      </div>
    </li>
  );
}
