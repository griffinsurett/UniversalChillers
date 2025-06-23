// src/components/Carousel.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { getItemKey } from "@/utils/getItemKey.js";

// Tailwind’s default breakpoints
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 };

// Resolve a number OR a responsive map like { base:1, sm:2, md:3, lg:4 }
function resolveSlidesToShow(config, width) {
  if (typeof config === "number") return config;
  let count = config.base ?? 1;
  Object.entries(config).forEach(([bp, val]) => {
    if (bp !== "base" && width >= (BREAKPOINTS[bp] || 0)) {
      count = val;
    }
  });
  return count;
}

export default function Carousel({
  items,
  slidesToScroll = 1,
  infinite = false,
  autoplay = false,
  autoplaySpeed = 3000,
  arrows = true,
  containerClass = "",
  itemClass = "",
  slidesToShow = 1,
  renderItem,
}) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(
    typeof slidesToShow === "number" ? slidesToShow : slidesToShow.base ?? 1
  );
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastScrollRef = useRef(0);
  const total = items.length;

  // 1️⃣ Responsive slide count
  useLayoutEffect(() => {
    if (typeof slidesToShow === "number") return;
    function update() {
      setVisibleCount(resolveSlidesToShow(slidesToShow, window.innerWidth));
    }
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, [slidesToShow]);

  // 2️⃣ Autoplay: use setTimeout so it resets on every index change
  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => {
      setIndex((i) => {
        const nxt = i + slidesToScroll;
        const max = total - visibleCount;
        if (infinite) return nxt % total;
        return Math.min(nxt, Math.max(max, 0));
      });
    }, autoplaySpeed);
    return () => clearTimeout(timer);
  // include index so any manual setIndex (arrows or drag) restarts the timer
  }, [autoplay, autoplaySpeed, slidesToScroll, infinite, total, visibleCount, index]);

  // 3️⃣ Track scroll position during drag and snap once on release
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDown = () => { isDraggingRef.current = true; };
    const onMove = () => {
      if (isDraggingRef.current) {
        lastScrollRef.current = el.scrollLeft;
      }
    };
    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const scrollLeft = lastScrollRef.current;
      const slides = Array.from(el.children);
      let closest = 0, minDiff = Infinity;
      slides.forEach((slide, i) => {
        const diff = Math.abs(slide.offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closest = i;
        }
      });
      setIndex(closest);
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp, { passive: true });

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // 4️⃣ Snap to the correct slide whenever `index` changes programmatically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const slide = el.children[index];
    if (slide) {
      el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
  }, [index]);

  const arrowStyles = "absolute top-1/2 transform -translate-y-1/2 z-10 p-2 text-xl";

  return (
    <div className="relative overflow-hidden">
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
                const max = infinite ? total - 1 : total - visibleCount;
                return infinite ? nxt % total : Math.min(nxt, Math.max(max, 0));
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
        {items.map((item) => {
          const key = getItemKey(item);
          const basis = `${100 / visibleCount}%`;
          return (
            <li
              key={key}
              className="flex-shrink-0 snap-start"
              style={{ flex: `0 0 ${basis}`, maxWidth: basis }}
            >
              {renderItem(item)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
