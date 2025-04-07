// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  isOpen,
  onClose,
  children,
  closeButton = true,
  closeButtonClass = "absolute top-0 right-0 m-[var(--spacing-sm)]", // New prop for custom close button styling
  overlayClass = 'bg-black bg-opacity-50',
  className = "bg-[var(--color-bg)] shadow-xl p-[var(--spacing-md)] rounded-[var(--radius-md)]",
  allowScroll = false,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, allowScroll]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[250] flex items-center justify-center ${overlayClass}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {closeButton && (
          <button onClick={onClose} className={closeButtonClass} aria-label="Close modal">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
