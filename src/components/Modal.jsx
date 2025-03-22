// src/components/Modal.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function Modal({
  isOpen: controlledIsOpen, // if provided, the modal becomes controlled
  onClose,
  children,
  closeButton = true,
  overlayClass = 'bg-black bg-opacity-50', // default overlay styling
  className = "bg-white shadow-xl", // default modal container styling
  allowScroll = false,   // if false, prevent scrolling behind the modal
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const modalRef = useRef(null);

  const handleClose = () => {
    if (onClose) onClose();
    if (!isControlled) {
      setInternalIsOpen(false);
    }
  };

  // Prevent background scrolling when modal is open.
  useEffect(() => {
    if (isOpen && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, allowScroll]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`relative ${className}`}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        {closeButton && (
          <button
            onClick={handleClose}
            className="absolute top-0 right-0"
            aria-label="Close modal"
          >
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="24" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
