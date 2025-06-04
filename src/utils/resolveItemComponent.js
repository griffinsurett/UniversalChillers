/**
 * Shared helper: given whatever the caller passed as “ItemComponent”
 * (string, object, or function), normalise it and hand back:
 *
 *  • componentKey   – the inferred filename (e.g. "Card", "ListItem")
 *  • componentProps – extra props supplied by the caller
 *  • originalFn     – the function reference itself, if any
 */
function getKeyAndProps(ItemComponent) {
  let componentKey   = "Card";
  let componentProps = {};
  let originalFn     = null;

  if (typeof ItemComponent === "string") {
    componentKey = ItemComponent;
  } else if (
    ItemComponent &&
    typeof ItemComponent === "object" &&
    ItemComponent.component
  ) {
    const candidate   = ItemComponent.component;
    componentProps    = ItemComponent.props || {};
    if (typeof candidate === "string") {
      componentKey = candidate;
    } else if (typeof candidate === "function") {
      originalFn   = candidate;
      componentKey = candidate.name || "Card";
    }
  } else if (typeof ItemComponent === "function") {
    originalFn   = ItemComponent;
    componentKey = ItemComponent.name || "Card";
  }

  return { componentKey, componentProps, originalFn };
}

/* ─────────────────────────── 1. SSR (Astro) ─────────────────────────── */

export async function resolveSSRComponent(ItemComponent) {
  const { componentKey, componentProps, originalFn } = getKeyAndProps(ItemComponent);

  if (originalFn) {
    return { RenderComponent: originalFn, componentKey, componentProps };
  }

  /* Try <componentKey>.jsx → <componentKey>.astro → Card.jsx */
  const paths = [
    `../components/LoopComponents/${componentKey}.jsx`,
    `../components/LoopComponents/${componentKey}.astro`,
    `../components/LoopComponents/Card.jsx`,
  ];

  for (const p of paths) {
    try {
      const mod = await import(p);
      return { RenderComponent: mod.default, componentKey, componentProps };
    } catch (_) { /* continue */ }
  }

  throw new Error(`resolveSSRComponent: could not resolve ${componentKey}`);
}

/* ─────────────────────────── 2. CSR (React) ─────────────────────────── */

import { lazy } from "react";

export function resolveCSRComponent(ItemComponent) {
  const { componentKey, componentProps, originalFn } = getKeyAndProps(ItemComponent);

  /* Caller passed a React function component directly → wrap in lazy() */
  if (originalFn) {
    return {
      LazyComponent: lazy(() => Promise.resolve({ default: originalFn })),
      componentKey,
      componentProps,
    };
  }

  /* Dynamically import ONLY .jsx files (Astro components are SSR-only) */
  const modules = import.meta.glob("../components/LoopComponents/*.jsx");

  const wanted   = `../components/LoopComponents/${componentKey}.jsx`;
  const fallback = "../components/LoopComponents/Card.jsx";

  let importer = modules[wanted] || modules[fallback];
  if (!importer) {
    throw new Error(`resolveCSRComponent: no JSX module found for ${componentKey}`);
  }

  return {
    LazyComponent: lazy(importer),
    componentKey,
    componentProps,
  };
}
