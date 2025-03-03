import Button from "./Button.jsx";

// Example: Card.jsx (React)
export default function Card({ item, collectionName }) {
    return (
      <div className="card">
        <h3>{item.data.title}</h3>
        <p>{item.data.description || item.body}</p>
        {/* maybe a link button */}
        <Button href={`/${collectionName}/${item.slug}`}>View More</Button>
      </div>
    );
  }
  