export default function Heading({
  tagName: Tag = 'h2',
  className = '',
  before,
  text,
  after,
  beforeClass = '',
  textClass = '',
  afterClass = '',
  children,
  ...props
}) {
  const tagLevel = typeof Tag === 'string' ? Tag.toLowerCase() : 'h2';

  // Regex to check if className already includes h1 to h6
  const hasManualHeadingClass = /\bh[1-6]\b/.test(className);

  // If no manual heading class is found, add default based on tag
  const finalClassName = hasManualHeadingClass
    ? className
    : `${tagLevel} ${className}`.trim();

  const isPropBased = before !== undefined || text !== undefined || after !== undefined;

  if (isPropBased) {
    return (
      <Tag className={finalClassName} {...props}>
        {before && <span className={beforeClass}>{before}</span>}
        {text && <span className={textClass}>{text}</span>}
        {after && <span className={afterClass}>{after}</span>}
      </Tag>
    );
  }

  return (
    <Tag className={finalClassName} {...props}>
      {children}
    </Tag>
  );
}
