// src/components/Heading.jsx
import PropTypes from 'prop-types';

export default function Heading({ tagName, size, children, ...props }) {
  const Tag = tagName;

  // In this basic version, the size prop is not used for styling.
  return <Tag {...props}>{children}</Tag>;
}

Heading.propTypes = {
  tagName: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).isRequired,
  size: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  children: PropTypes.node,
};

Heading.defaultProps = {
  size: 'h3',
};
