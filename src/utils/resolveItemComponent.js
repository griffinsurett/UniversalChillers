// src/utils/resolveItemComponent.js

/**
 * Shared helper: given whatever the user passed as “ItemComponent” (string, object, or function),
 * return a { componentKey, componentProps, originalFn } object:
 *
 *  • componentKey  – the filename (e.g. "Card", "ListItem", "AccordionItem") we will load from LoopComponents/.
 *  • componentProps – an object of any extra props the caller provided.
 *  • originalFn     – if ItemComponent was a function reference, this will be that function; otherwise null.
 */
function getKeyAndProps(ItemComponent) {
  let componentKey = "Card";
  let componentProps = {};
  let originalFn = null;

  if (typeof ItemComponent === "string") {
    componentKey = ItemComponent;
  }
  else if (
    ItemComponent != null &&
    typeof ItemComponent === "object" &&
    ItemComponent.component
  ) {
    // shape is { component: <string|function>, props: {...} }
    const candidate = ItemComponent.component;
    componentProps = ItemComponent.props || {};

    if (typeof candidate === "string") {
      componentKey = candidate;
    } else if (typeof candidate === "function") {
      originalFn = candidate;
      componentKey = candidate.name || "Card";
    } else {
      componentKey = "Card";
    }
  }
  else if (typeof ItemComponent === "function") {
    originalFn = ItemComponent;
    componentKey = ItemComponent.name || "Card";
  }

  return { componentKey, componentProps, originalFn };
}


/** Resolve for SSR (Astro). */
export async function resolveSSRComponent(ItemComponent) {
  // 1. Extract key/props + see if it was a direct function reference
  const { componentKey, componentProps, originalFn } = getKeyAndProps(ItemComponent);

  // 2. If the caller gave us a function directly, use it immediately:
  if (originalFn) {
    return {
      RenderComponent: originalFn,
      componentKey,
      componentProps,
    };
  }

  // 3. Otherwise we attempt to dynamic‑import `<componentKey>.jsx` or fallback to `<componentKey>.astro`.
  //    If that fails entirely, we fallback to "Card.jsx".
  let RenderComponent = null;
  try {
    const mod = await import(`../components/LoopComponents/${componentKey}.jsx`);
    RenderComponent = mod.default;
  } catch {
    try {
      const mod = await import(`../components/LoopComponents/${componentKey}.astro`);
      RenderComponent = mod.default;
    } catch {
      const fallback = await import(`../components/LoopComponents/Card.jsx`);
      RenderComponent = fallback.default;
    }
  }

  return { RenderComponent, componentKey, componentProps };
}


/** Resolve for CSR (React). */
export function resolveCSRComponent(ItemComponent) {
  // We only need the key + props. The actual lazy() import happens in ClientItemsTemplate.jsx.
  const { componentKey, componentProps } = getKeyAndProps(ItemComponent);
  return { componentKey, componentProps };
}
