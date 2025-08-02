import Button from "@/components/Button/Button";
import { getItemKey } from "@/utils/getItemKey";
import Icon from "@/components/Icon/Icon";
import Heading from "../Heading";
import BtnArrow from "@/assets/BtnArrow.svg";

/**
 * Card component for rendering an individual item.
 * It uses the effective hasPage value (item's own value if defined,
 * otherwise the default provided via Section meta) to decide
 * whether to render the "View More" button.
 */
export default function Rectangle({ item, itemClass, collectionName, HasPage }) {
  console.log(item.data.icon, "item.data.icon in Card.jsx");
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
  return (
    <article className={`shadow-2xl p-8 load scale-up ${itemClass}`}>
       <Icon
         icon={BtnArrow} // Handle both object with .src and string
         className="w-6 h-6"
       />
      <Heading tagName="h3" className="text-[var(--color-text)]">{item.data.title}</Heading>
      <p className="m-0">{item.data.description || item.body}</p>
      {effectiveHasPage && (
        <Button href={`/${collectionName}/${getItemKey(item)}`}>
          View More Card
        </Button>
      )}
    </article>
  );
}
