// src/components/Heading.jsx
const defaultHeadingStyles = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export default function Heading({ tagName, className = '', children, ...props }) {
  const Tag = tagName;
  // Use the tag name as a CSS class – for example, an h2 tag will get the "h2" class.
  return (
    <Tag className={`${Tag} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}