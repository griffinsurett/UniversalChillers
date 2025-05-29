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
  // Vite will statically include every file under ./LoopComponents
const modules = import.meta.glob("../../LoopComponents/*.{jsx,astro}");
  const Comp = useMemo(() => {
const jsxPath = `../../LoopComponents/${componentKey}.jsx`;
    if (modules[jsxPath]) {
      return lazy(modules[jsxPath]);
    }
const astroPath = `../../LoopComponents/${componentKey}.astro`;
    if (modules[astroPath]) {
      return lazy(modules[astroPath]);
    }
    // fallback to Card
    return lazy(modules["./LoopComponents/Card.jsx"]);
  }, [componentKey]);

  // ─── Render ───
  const content = slider.enabled ? (
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
      <li className="contents">
        <Comp
          item={item}
          collectionName={collectionName}
          HasPage={HasPage}
        />
      </li>
      ))}
    </ul>
  );

  return <Suspense fallback={<div>Loading…</div>}>{content}</Suspense>;
}
