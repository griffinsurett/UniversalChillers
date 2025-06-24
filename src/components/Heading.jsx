// src/components/Heading.jsx
export default function Heading({
  tagName: Tag = 'h2',
  className = '',
  before,
  text,
  after,
  beforeClass = '',
  textClass   = '',
  afterClass  = '',
  children,
  ...props
}) {
  // if any of our "before/text/after" props are set, render those
  const isPropBased = before !== undefined || text !== undefined || after !== undefined;

  if (isPropBased) {
    return (
      <Tag className={className} {...props}>
        {before  && <span className={beforeClass}>{before}</span>}
        {text    && <span className={textClass}>{text}</span>}
        {after   && <span className={afterClass}>{after}</span>}
      </Tag>
    );
  }

  // otherwise fall back to rendering whatever children were passed
  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
