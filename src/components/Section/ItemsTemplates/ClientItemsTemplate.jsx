// src/components/Section/ItemsTemplates/ClientItemsTemplate.jsx
import React, { lazy, Suspense, useMemo } from "react";
import Carousel from "./Carousel";
import { resolveCSRComponent } from "@/utils/resolveItemComponent.js";
import { sortItems } from "@/utils/sortItems.js";

export default function ClientItemsTemplate({
  items = [],
  sortBy,
  sortOrder,
  manualOrder,
  ItemComponent = "Card",
  itemsClass = "",
  itemClass = "",
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
  // 1. Sort via shared helper (wrapped in useMemo so it only recalculates when dependencies change)
  const sorted = useMemo(
    () => sortItems(items, sortBy, sortOrder, manualOrder),
    [items, sortBy, sortOrder, manualOrder]
  );

  // 2. Resolve componentKey + props
  const { componentKey, componentProps } = resolveCSRComponent(ItemComponent);

  // 3. Lazy‑load the React component from LoopComponents/<componentKey>.jsx
  const modules = import.meta.glob("../../LoopComponents/*.jsx");
  const Comp = useMemo(() => {
    const jsxPath = `../../LoopComponents/${componentKey}.jsx`;
    if (modules[jsxPath]) {
      return lazy(modules[jsxPath]);
    }
    const fallbackPath = "../../LoopComponents/Card.jsx";
    if (modules[fallbackPath]) {
      return lazy(modules[fallbackPath]);
    }
    return null;
  }, [componentKey]);

  if (!Comp) {
    return null; // nothing to render if component wasn’t found
  }

  // 4. Render either a carousel or a static <ul>
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
              {...componentProps}
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
                {...componentProps}
              />
            </li>
          ))}
        </ul>
      )}
    </Suspense>
  );
}
