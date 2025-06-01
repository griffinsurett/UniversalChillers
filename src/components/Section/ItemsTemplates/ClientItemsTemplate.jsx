// src/components/Section/ItemsTemplates/ClientItemsTemplate.jsx
import React, { useMemo, lazy, Suspense } from "react";
import Carousel from "./Carousel";

/**
 * ClientItemsTemplate
 *
 * Props:
 *  - items: array of items to render
 *  - componentKey: string name of the component (e.g. "ListItem" or "AccordionItem")
 *  - itemClass, itemsClass, collectionName, HasPage, slider: as before
 *
 * This version will:
 *  1) Only glob “*.jsx” from src/components/LoopComponents/
 *  2) Check if the requested componentKey.jsx actually exists in that glob
 *  3) If it does, lazy-load it; otherwise, render nothing client-side
 *     (letting Astro’s server-side ItemsTemplate handle any .astro fallback).
 */
const modules = import.meta.glob("../../components/LoopComponents/*.jsx");

export default function ClientItemsTemplate({
  items = [],
  componentKey,
  itemClass = "",
  itemsClass = "",
  collectionName,
  HasPage,
  slider = {
    enabled: false,
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  },
}) {
  // Attempt to lazy-load “componentKey.jsx” from LoopComponents/
  const Comp = useMemo(() => {
    // Build the exact import path we expect
    const jsxPath = `../../components/LoopComponents/${componentKey}.jsx`;
    if (modules[jsxPath]) {
      return lazy(modules[jsxPath]);
    }
    // If no matching .jsx file, return null (so we skip client rendering)
    return null;
  }, [componentKey]);

  // If we couldn’t find a .jsx for componentKey, render nothing on the client.
  // The parent <ItemsTemplate> (in .astro) will already have rendered its fallback
  // or the server‐side version (e.g. MenuItem.astro) for “componentKey” that isn’t .jsx.
  if (!Comp) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading…</div>}>
      {slider.enabled ? (
        <Carousel
          items={items}
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
          {items.map((item) => (
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
