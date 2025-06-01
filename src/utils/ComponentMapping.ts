// src/utils/ComponentMapping.ts

// Only import React/JSX components—do NOT include .astro files here
const modules = import.meta.glob(
  '../components/LoopComponents/*.jsx',
  { eager: true }
);

const componentMapping: Record<string, any> = {};

for (const path in modules) {
  const match = path.match(/\/([^\/]+)\.jsx$/);
  if (match) {
    const fileName = match[1]; // e.g. "AccordionItem", "ListItem", "Card", etc.
    componentMapping[fileName] = (modules[path] as any).default;
  }
}

export { componentMapping };
