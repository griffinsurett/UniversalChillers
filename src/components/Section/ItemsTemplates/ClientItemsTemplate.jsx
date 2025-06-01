// src/components/ClientItemsTemplate.jsx
import React, { lazy, Suspense, useMemo } from "react";
import Carousel from "./Carousel";

export default function ClientItemsTemplate({
  items = [],
  sortBy = "date",
  sortOrder = "desc",
  manualOrder = false,
  componentKey = "Card",
  itemClass = "",
  itemsClass = "",
  collectionName,
  HasPage,
  slider = {
    enabled: true,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  },
}) {
  // ─── Sort items ───
  const sorted = [...items];
  if (manualOrder) {
    sorted.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  } else {
    // placeholder for other sort logic
    sorted.sort(() => 0);
    if (sortOrder === "desc") sorted.reverse();
  }

  // ─── Dynamic import of the correct component ───
  // ONLY glob .jsx files (no .astro):
  //
  // From this file’s location (src/components/ClientItemsTemplate.jsx),
  // we need to reach src/components/LoopComponents/*.jsx
  const modules = import.meta.glob("../../LoopComponents/*.jsx");

  const Comp = useMemo(() => {
    // Build the relative path for the requested React component:
    // e.g. if componentKey = "ListItem", jsxPath = "../../LoopComponents/ListItem.jsx"
    const jsxPath = `../../LoopComponents/${componentKey}.jsx`;

    // If that file actually exists, lazy-load it.
    if (modules[jsxPath]) {
      return lazy(modules[jsxPath]);
    }

    // OPTIONAL: fallback to Card.jsx if you want a default:
    const fallbackPath = "../../LoopComponents/Card.jsx";
    if (modules[fallbackPath]) {
      return lazy(modules[fallbackPath]);
    }

    // If there’s no .jsx matching componentKey (and no fallback), render nothing:
    return null;
  }, [componentKey]);

  // If we didn’t find a valid React component, bail out (render nothing client-side)
  if (!Comp) {
    return null;
  }

  // ─── Render ───
  return (
    <Suspense fallback={<div>Loading…</div>}>
      {slider.enabled ? (
        <Carousel
          items={sorted}
          slidesToShow={slider.slidesToShow}
          slidesToScroll={slider.slidesToScroll}
          infinite={slider.infinite}
          autoplay={slider.autoplay}
          autoplaySpeed={slider.autoplaySpeed}
          arrows={slider.arrows}
          containerClass={itemsClass}
          itemClass={itemClass}
          renderItem={(item) => (
            <Comp
              key={item.slug}
              item={item}
              collectionName={collectionName}
              HasPage={HasPage}
            />
          )}
        />
      ) : (
        <ul className={itemsClass}>
          {sorted.map((item) => (
            <li className="contents" key={item.slug}>
              <Comp
                item={item}
                collectionName={collectionName}
                HasPage={HasPage}
              />
            </li>
          ))}
        </ul>
      )}
    </Suspense>
  );
}
