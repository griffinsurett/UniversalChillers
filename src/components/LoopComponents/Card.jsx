import Button from "@/components/Button/Button";
import { getItemKey } from "@/utils/getItemKey";
import Icon from "@/components/Icon/Icon";

/**
 * Card component for rendering an individual item.
 * It uses the effective hasPage value (item's own value if defined,
 * otherwise the default provided via Section meta) to decide
 * whether to render the "View More" button.
 */
export default function Card({ item, itemClass, collectionName, HasPage }) {
  console.log(item.data.icon, "item.data.icon in Card.jsx");
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
  return (
    <article className={`card p-[var(--spacing-sm)] ${itemClass}`}>
       {item.data.icon && (
       <Icon
         icon={item.data.icon.src || item.data.icon} // Handle both object with .src and string
         className="w-6 h-6 mb-[var(--spacing-sm)]"
       />
     )}
      <h3 className="mb-[var(--spacing-sm)] text-[var(--color-text)]">{item.data.title}</h3>
      <p className="mb-[var(--spacing-sm)]">{item.data.description || item.body}</p>
      {effectiveHasPage && (
        <Button href={`/${collectionName}/${getItemKey(item)}`}>
          View More Card
        </Button>
      )}
    </article>
  );
}
