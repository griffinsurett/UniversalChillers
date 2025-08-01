// src/components/Icon/Icon.jsx
export default function Icon({ icon, className = "" }) {
  if (!icon) return null;

  // 1) React element / inline SVG
  if (typeof icon === "object" && (icon.$$typeof || typeof icon === "function")) {
    const Element = icon;
    return <Element className={className} />;
  }

  // 2) imported asset (object with .src)
  if (typeof icon === "object" && icon.src) {
    return <img src={icon.src} alt="" className={className} loading="lazy" />;
  }

  // 3) string: URL, alias, relative path, raw SVG, or text
  if (typeof icon === "string") {
    // now match:
    //   /foo.svg     — public root
    //   @/assets/foo.svg — alias
    //   ./foo.svg    — relative
    //   ../foo.svg   — relative up
    //   http(s)://…
    const isUrl = /^(?:\/|@|\.{1,2}\/|https?:\/\/)/.test(icon);

    if (isUrl) {
      // for true relative (./ or ../) we need import.meta.url, otherwise leave it as-is
      const src = icon.startsWith(".")
        ? new URL(icon, import.meta.url).href
        : icon;
      return <img src={src} alt="" className={className} loading="lazy" />;
    }

    // inline SVG string?
    if (icon.trim().startsWith("<svg")) {
      return (
        <span
          className={className}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }

    // fallback: emoji or text
    return <span className={className}>{icon}</span>;
  }

  return null;
}
