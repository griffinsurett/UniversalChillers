// src/components/Heading.jsx
export default function Heading({ tagName, className = '', children, ...props }) {
  const Tag = tagName;
  // Only use the default tag class if no custom class is provided.
  const classes = className ? className : Tag;
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}