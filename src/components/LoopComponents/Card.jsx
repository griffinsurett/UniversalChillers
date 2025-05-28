import Button from "../Button.jsx";

/**
 * Card component for rendering an individual item.
 * It uses the effective hasPage value (item's own value if defined,
 * otherwise the default provided via Section meta) to decide
 * whether to render the "View More" button.
 */
export default function Card({ item, collectionName, HasPage }) {
  const effectiveHasPage =
    item.data.hasPage !== undefined ? item.data.hasPage : HasPage;
  return (
    <article className="card p-[var(--spacing-sm)]">
      <h3 className="mb-[var(--spacing-sm)] text-[var(--color-text)]">{item.data.title}</h3>
      <p className="mb-[var(--spacing-sm)]">{item.data.description || item.body}</p>
      {effectiveHasPage && (
        <Button href={`/${collectionName}/${item.slug}`}>
          View More
        </Button>
      )}
    </article>
  );
}
