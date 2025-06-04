/**
 * Shared helper: given whatever the caller passed as “ItemComponent”
 * (string, object, or function), normalise it and hand back:
 *
 *  • componentKey   – inferred filename (e.g. "Card", "ListItem")
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
    const candidate    = ItemComponent.component;
    componentProps     = ItemComponent.props || {};
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

  /* 1️⃣ Caller passed a React/Astro component directly */
  if (originalFn) {
    return { RenderComponent: originalFn, componentKey, componentProps };
  }

  /* 2️⃣ Let Vite figure out chunk paths for us */
  const jsxMods   = import.meta.glob("../components/LoopComponents/*.jsx");
  const astroMods = import.meta.glob("../components/LoopComponents/*.astro");

  const wantedJsx   = `../components/LoopComponents/${componentKey}.jsx`;
  const wantedAstro = `../components/LoopComponents/${componentKey}.astro`;
  const fallbackJsx = `../components/LoopComponents/Card.jsx`;

  const importer =
    jsxMods[wantedJsx]   ||
    astroMods[wantedAstro] ||
    jsxMods[fallbackJsx];

  if (!importer) {
    throw new Error(
      `resolveSSRComponent: no component "${componentKey}" (looked for .jsx and .astro)`
    );
  }

  const mod = await importer();          // Vite rewrites to hashed chunk path in build
  return { RenderComponent: mod.default, componentKey, componentProps };
}

/* ─────────────────────────── 2. CSR (React) ─────────────────────────── */

import { lazy } from "react";

export function resolveCSRComponent(ItemComponent) {
  const { componentKey, componentProps, originalFn } = getKeyAndProps(ItemComponent);

  /* Direct React component → wrap with lazy() */
  if (originalFn) {
    return {
      LazyComponent: lazy(() => Promise.resolve({ default: originalFn })),
      componentKey,
      componentProps,
    };
  }

  /* Dynamically import JSX modules only (Astro files are SSR-only) */
  const modules = import.meta.glob("../components/LoopComponents/*.jsx");

  const wanted   = `../components/LoopComponents/${componentKey}.jsx`;
  const fallback = "../components/LoopComponents/Card.jsx";

  const importer = modules[wanted] || modules[fallback];
  if (!importer) {
    throw new Error(`resolveCSRComponent: no JSX module found for ${componentKey}`);
  }

  return {
    LazyComponent: lazy(importer),
    componentKey,
    componentProps,
  };
}
