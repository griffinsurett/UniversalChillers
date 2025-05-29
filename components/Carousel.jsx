// src/components/Carousel.jsx
import React, { useState, useRef, useEffect } from "react";

export default function Carousel({
  items,
  slidesToScroll = 1,
  infinite = false,
  autoplay = false,
  autoplaySpeed = 3000,
  arrows = true,
  containerClass = "",
  itemClass = "",
  renderItem,
}) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const total = items.length;

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const nxt = i + slidesToScroll;
        const max = total - 1;
        return infinite ? nxt % total : Math.min(nxt, max);
      });
    }, autoplaySpeed);
    return () => clearInterval(id);
  }, [autoplay, autoplaySpeed, slidesToScroll, infinite, total]);

  // snap to slide
  useEffect(() => {
    if (!containerRef.current) return;
    const slideEls = containerRef.current.children;
    const slide = slideEls[index];
    if (!slide) return;
    containerRef.current.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
  }, [index]);

  const arrowStyles = "absolute top-1/2 transform -translate-y-1/2 z-10 p-2 text-xl";

  return (
    <div className="relative w-full overflow-hidden">
      {arrows && (
        <>
          <button
            className={`${arrowStyles} left-0`}
            onClick={() => setIndex((i) => Math.max(i - slidesToScroll, 0))}
          >
            ‹
          </button>
          <button
            className={`${arrowStyles} right-0`}
            onClick={() =>
              setIndex((i) => {
                const nxt = i + slidesToScroll;
                const max = total - 1;
                return infinite ? nxt % total : Math.min(nxt, max);
              })
            }
          >
            ›
          </button>
        </>
      )}

      <ul
        ref={containerRef}
        className={`
          flex flex-row flex-nowrap
          w-full m-0 p-0
          overflow-x-auto overflow-y-hidden
          snap-x snap-mandatory hide-scrollbar
          ${containerClass}
        `}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <li
            key={item.slug}
            className={`block ${itemClass}`}
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}