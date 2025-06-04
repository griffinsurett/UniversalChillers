import React, { useState, useEffect, Suspense } from "react";
import Modal from "@/components/Modal.jsx";
import ClientItemsTemplate from "@/components/Section/ItemsTemplates/ClientItemsTemplate.jsx";

/**
 * Props
 *   checkboxId – id of the controlling checkbox
 *   items      – Readonly<MenuItemEntry[]>
 *   shared     – { collection, query, sortOrder, HasPage }
 *   cfg        – { itemsClass, menuItem }
 */
export default function HamburgerMenu({ checkboxId, items, shared, cfg }) {
  /* keep local open state in sync with the checkbox */
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const box = document.getElementById(checkboxId);
    if (!box) return;
    const sync = () => setOpen(box.checked);
    box.addEventListener("change", sync);
    return () => box.removeEventListener("change", sync);
  }, [checkboxId]);

  /* root-level items (no parent) */
  const roots = items.filter((i) => !i.data.parent);

  return (
    <Modal
      isOpen={open}
      onClose={() => (document.getElementById(checkboxId).checked = false)}
      className="bg-white"
    >
      <nav aria-label="Mobile">
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <ClientItemsTemplate
            items={roots}
            collectionName={shared.collection}
            HasPage={shared.HasPage}
            ItemComponent={cfg.menuItem}
            itemsClass={cfg.itemsClass}
            itemClass="" /* li wrapper is inside ClientItemsTemplate */
          />
        </Suspense>
      </nav>
    </Modal>
  );
}
