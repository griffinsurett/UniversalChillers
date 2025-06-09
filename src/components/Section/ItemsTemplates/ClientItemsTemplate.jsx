// ClientItemsTemplate.jsx
import React, { Suspense, useMemo } from "react";
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
    enabled: false,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  },
}) {
  /* 1. Sort once unless deps change */
  const sorted = useMemo(
    () => sortItems(items, sortBy, sortOrder, manualOrder),
    [items, sortBy, sortOrder, manualOrder],
  );

  /* 2. Get a ready-made React.lazy component + extra props */
  const { LazyComponent: Comp, componentProps } = useMemo(
    () => resolveCSRComponent(ItemComponent),
    [ItemComponent],
  );

  if (!Comp) return null;

  /* 3. Render either carousel or plain list */
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
              key={item.slug || item.id}
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
            <li className="contents" key={item.slug || item.id}>
              <Comp
                key={item.slug}
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