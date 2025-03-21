import React, { useState, useEffect, useRef } from 'react';

export default function Modal({
  triggerId,             // id of the external element that triggers the modal
  openTrigger = 'click', // 'click' (default), 'hover', or 'change'
  children,
  onOpen,
  onClose,
  closeButton = true,
  overlayClass,          // Optional overlay class; if not provided, defaults to black overlay
  className = "bg-white shadow-xl p-6", // Modal container styling
  allowScroll = false,   // If false, prevent scrolling of the page behind the modal
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
    // Uncheck the trigger if it's a checkbox to allow reopening
    const triggerElement = document.getElementById(triggerId);
    if (triggerElement && triggerElement.type === "checkbox") {
      triggerElement.checked = false;
    }
  };

  useEffect(() => {
    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) {
      console.warn(`Trigger element with id "${triggerId}" not found.`);
      return;
    }

    if (openTrigger === 'change') {
      // Listen for the 'change' event on the trigger (checkbox)
      const changeHandler = (e) => {
        if (e.target.checked) {
          handleOpen();
        } else {
          handleClose();
        }
      };
      triggerElement.addEventListener('change', changeHandler);
      return () => {
        triggerElement.removeEventListener('change', changeHandler);
      };
    } else if (openTrigger === 'click') {
      const clickHandler = handleOpen;
      triggerElement.addEventListener('click', clickHandler);
      return () => {
        triggerElement.removeEventListener('click', clickHandler);
      };
    } else if (openTrigger === 'hover') {
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

  // Prevent scrolling on the background when the modal is open and allowScroll is false.
  useEffect(() => {
    if (isOpen && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, allowScroll]);

  // For hover mode, immediately close if mouse enters the modal container.
  const modalHoverHandler = openTrigger === 'hover' ? handleClose : undefined;

  return (
    <>
      {isOpen && (
        // Backdrop: clicking it always closes the modal.
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass || 'bg-black bg-opacity-50'}`}
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            className={`relative ${className}`}
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
