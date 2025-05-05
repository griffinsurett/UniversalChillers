import React, { useState } from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function SampleModalTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    {/* server button */}
    <Button link='/sample'>Button</Button>
      <div className="p-[var(--spacing-lg)]">
        <Button
          onClick={() => setIsOpen(true)}
          variant="primary"
        >
          Open Test Modal
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // you can customize overlayClass, className, etc. here:
        overlayClass="bg-black bg-opacity-50"
        closeButtonClass="absolute top-2 right-2 text-[var(--color-bg)]"
      >
        <div className="p-[var(--spacing-lg)] bg-[var(--color-bg)] rounded-md">
          <h2 className="h2 mb-[var(--spacing-md)]">Hello from Modal</h2>
          <p>This content was rendered client‑side in a React island.</p>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="mt-[var(--spacing-md)]"
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
