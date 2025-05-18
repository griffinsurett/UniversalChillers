// src/components/ClientItemsTemplate.jsx
import { componentMapping } from "@/utils/ComponentMapping";

export default function ClientItemsTemplate({
  items = [],
  sortBy = "date",        // "date" | "title" | "slug"
  sortOrder = "desc",     // "asc" | "desc"
  manualOrder = false,    // if true, sort by data.order only
  componentKey = "Card",
  itemClass = "",
  itemsClass = "",
  collectionName,
  HasPage,
}) {
  // ─── Apply sorting on client side ───
  let sorted = [...items];
  if (manualOrder) {
    sorted.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  } else {
    if (sortBy === "title") {
      sorted.sort((a, b) =>
        String(a.data.title || a.slug).localeCompare(String(b.data.title || b.slug))
      );
    } else if (sortBy === "slug" || sortBy === "id") {
      sorted.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
    } else {
      sorted.sort((a, b) => {
        const da = new Date(a.data.pubDate || a.data.date || 0);
        const db = new Date(b.data.pubDate || b.data.date || 0);
        return da.getTime() - db.getTime();
      });
    }
    if (sortOrder === "desc") sorted.reverse();
  }
  const renderItems = sorted;

  const Comp = componentMapping[componentKey] || componentMapping.Card;
  return (
    <ul className={itemsClass}>
      {renderItems.map((item) => (
        <Comp
          key={item.slug}
          item={item}
          itemClass={itemClass}
          collectionName={collectionName}
          HasPage={HasPage}
        />
      ))}
    </ul>
  );
}
