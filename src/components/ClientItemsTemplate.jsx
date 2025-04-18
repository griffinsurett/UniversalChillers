// ClientItemsTemplate.jsx
import { componentMapping } from "@/utils/ComponentMapping";

export default function ClientItemsTemplate({
  items = [], componentKey = "Card",
  itemClass="", itemsClass="", collectionName, HasPage
}) {
  const Comp = componentMapping[componentKey] || componentMapping.Card;
  return (
    <ul className={itemsClass}>
      {items.map(item => (
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
