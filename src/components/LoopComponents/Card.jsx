import Button from "../Button.jsx";

/**
 * Card component for rendering an individual item.
 * It uses the effective hasPage value (item's own value if defined,
 * otherwise the default provided via Section meta) to decide
 * whether to render the "View More" button.
 */
export default function Card({ item, collectionName, defaultHasPage }) {
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : defaultHasPage;
  return (
    <li className="card">
      <h3>{item.data.title}</h3>
      <p>{item.data.description || item.body}</p>
      {effectiveHasPage && (
        <Button href={`/${collectionName}/${item.slug}`}>View More</Button>
      )}
    </li>
  );
}

