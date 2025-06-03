import React, { useMemo, lazy, Suspense } from "react";
import Carousel from "./Carousel";
import { sortItems } from "@/utils/sortItems.js";

export default function ClientItemsTemplate({
  items,
  sortBy,
  sortOrder,
  manualOrder,
  alreadySorted = false,
  ItemComponent: { componentKey, componentProps },
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
  const sorted = useMemo(() => {
    return alreadySorted
      ? items
      : sortItems(items, sortBy, sortOrder, manualOrder);
  }, [items, sortBy, sortOrder, manualOrder, alreadySorted]);

  // 2. Resolve React component via lazy-loading
  const modules = import.meta.glob("../../LoopComponents/*.jsx");
  const Comp = useMemo(() => {
    const jsxPath = `../../LoopComponents/${componentKey}.jsx`;
    if (modules[jsxPath]) {
      return lazy(modules[jsxPath]);
    }
    const fallbackPath = "../../LoopComponents/Card.jsx";
    return lazy(modules[fallbackPath]);
  }, [componentKey]);

  if (!Comp) {
    return null;
  }

  console.log(alreadySorted, items, sorted);

  // 3. Render either a Carousel or a static <ul>
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
