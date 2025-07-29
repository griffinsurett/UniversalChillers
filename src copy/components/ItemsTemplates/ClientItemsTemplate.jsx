// ClientItemsTemplate.jsx
import React, { Suspense, useMemo } from "react";
import Carousel from "./Carousel";
import { resolveCSRComponent } from "@/utils/resolveItemComponent.js";
import { sortItems } from "@/utils/sortItems.js";
import { getItemKey } from "@/utils/getItemKey.js";

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
  const sorted = useMemo(
    () => sortItems(items, sortBy, sortOrder, manualOrder),
    [items, sortBy, sortOrder, manualOrder]
  );

  // console.log("🛠️ slider in ClientItemsTemplate:", slider);

  const { LazyComponent: Comp, componentProps } = useMemo(
    () => resolveCSRComponent(ItemComponent),
    [ItemComponent]
  );

  if (!Comp) return null;

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
          dots={slider.dots}
          dotContainerClass={slider.dotContainerClass}
          dotClass={slider.dotClass}
          dotActiveClass={slider.dotActiveClass}
          itemsClass={itemsClass}
          itemClass={itemClass}
          renderItem={(item) => (
            <Comp
              key={getItemKey(item)}
              className={itemClass}
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
            <li className="contents" key={getItemKey(item)}>
              <Comp
                key={getItemKey(item)}
                className={itemClass}
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
