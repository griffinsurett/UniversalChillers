// src/components/BeforeAfterSlider.jsx
import React, { useRef, useState, useEffect } from 'react';

const BandAabelClass = "absolute bg-primary text-bg uppercase py-[var(--spacing-xs)] px-[var(--spacing-sm)] rounded select-none"

export default function BeforeAfterSlider({ item, className = '' }) {
  // 1️⃣ pull out just the URLs
  const beforeSrc = item.data.beforeImage?.src;
  const afterSrc  = item.data.afterImage?.src;
  const altText   = item.data.title || item.slug || 'project-image';

  // 2️⃣ if either image is missing, bail
  if (!beforeSrc || !afterSrc) {
    return null;
  }

  // 3️⃣ dividerPct → 0..1
  const [dividerPct, setDividerPct] = useState(0.5);

  // 4️⃣ refs for measuring/tracking drag
  const containerRef = useRef(null);
  const isDragging  = useRef(false);

  // 5️⃣ clamp helper
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // 6️⃣ convert a clientX → 0..1 inside container
  const onPointerMove = (clientX) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clamp(clientX - rect.left, 0, rect.width);
    setDividerPct(x / rect.width);
  };

  const handleMouseMove = (e) => onPointerMove(e.clientX);
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      onPointerMove(e.touches[0].clientX);
    }
  };
  const handleMouseUp    = () => (isDragging.current = false);
  const handleTouchEnd   = () => (isDragging.current = false);
  const handleMouseDown  = () => (isDragging.current = true);
  const handleTouchStart = (e) => {
    e.preventDefault();
    isDragging.current = true;
  };

  // 7️⃣ add/remove listeners to track dragging
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <article
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden ${className} h-64 lg:h-[55vh]`}
    >
      {/* ── AFTER IMAGE (underneath, clipped on left) ── */}
      <img
        src={afterSrc}
        alt={`After: ${altText}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          clipPath: `inset(0 0 0 ${dividerPct * 100}%)`,
        }}
        loading="lazy"
      />

      {/* ── BEFORE IMAGE (on top, clipped on right) ── */}
      <img
        src={beforeSrc}
        alt={`Before: ${altText}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          clipPath: `inset(0 ${(1 - dividerPct) * 100}% 0 0)`,
        }}
        loading="lazy"
      />

      {/* ── “Before” Label ── */}
      <div className={`top-4 left-4 filter brightness-60 contrast-150 ${BandAabelClass}`}>
        Before
      </div>

      {/* ── “After” Label ── */}
      <div className={`top-4 right-4 ${BandAabelClass}`}>
        After
      </div>

      {/* ── DRAG HANDLE ── */}
      <div
        className="absolute top-1/2 flex items-center justify-center"
        style={{
          left:      `${dividerPct * 100}%`,
          transform: 'translate(-50%, -50%)',
          cursor:    'ew-resize',
          zIndex:    10,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="bg-primary w-12 h-12 rounded-sm flex items-center justify-center shadow-lg select-none">
          {/* Left chevron SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>

          {/* Right chevron SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  );
}
