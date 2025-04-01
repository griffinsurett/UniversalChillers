// src/components/Button.jsx

// This component is designed to be pre-rendered (SSG) by Astro,
// and it works equally well in a React environment.
// It renders as an <a> tag if an `href` is provided, otherwise as a <button>.
// You can override the rendered element using the `as` prop.
export default function Button({
    as: ComponentProp,
    type = "button",
    onClick,
    children,
    classname,
    href,
    ...props
  }) {
    // Default to an anchor tag if href is provided and no override is specified,
    // otherwise default to a button.
    const Component = ComponentProp ?? (href ? "a" : "button");
  
    return (
      <Component
        {...(Component === "button" ? { type } : {})}
        {...(Component === "a" ? { href } : {})}
        onClick={onClick}
        className={classname}
        {...props}
      >
        {children}
      </Component>
    );
  }
  