// Modak.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function Modal({
  triggerId,             // id of the external element that triggers the modal
  openTrigger = 'click', // 'click' (default) or 'hover'
  children,
  onOpen,
  onClose,
  width = "75%",
  closeButton = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);

  const handleOpen = () => {
    setIsOpen(true);
    if (onOpen) onOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) {
      console.warn(`Trigger element with id "${triggerId}" not found.`);
      return;
    }

    if (openTrigger === 'click') {
      const clickHandler = handleOpen;
      triggerElement.addEventListener('click', clickHandler);
      return () => {
        triggerElement.removeEventListener('click', clickHandler);
      };
    } else if (openTrigger === 'hover') {
      // For hover mode, open modal on mouseenter and close it on mouseleave of the trigger.
      const mouseEnterHandler = handleOpen;
      const mouseLeaveHandler = handleClose;
      triggerElement.addEventListener('mouseenter', mouseEnterHandler);
      triggerElement.addEventListener('mouseleave', mouseLeaveHandler);
      return () => {
        triggerElement.removeEventListener('mouseenter', mouseEnterHandler);
        triggerElement.removeEventListener('mouseleave', mouseLeaveHandler);
      };
    }
  }, [triggerId, openTrigger]);

  // In hover mode, if the user moves into the modal container, immediately close it.
  const modalHoverHandler = openTrigger === 'hover' ? handleClose : undefined;

  return (
    <>
      {isOpen && (
        // Backdrop: clicking it always closes the modal.
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            className="relative bg-white shadow-xl p-6"
            style={{ width }}
            onClick={(e) => e.stopPropagation()}
            {...(openTrigger === 'hover' ? { onMouseEnter: modalHoverHandler } : {})}
          >
            {closeButton && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-xl"
                aria-label="Close modal"
              >
                &times;
              </button>
            )}
            {children}
          </div>
        </div>
      )}
    </>
  );
}