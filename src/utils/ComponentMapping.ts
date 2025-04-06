// src/utils/ComponentMapping.ts

// Eagerly import all .jsx and .astro files from the LoopComponents directory
const modules = import.meta.glob('../components/LoopComponents/*.{jsx,astro}', { eager: true });

// Build a mapping from the component file name (without extension) to its default export
const componentMapping: Record<string, any> = {};

for (const path in modules) {
  // Extract the file name from the path; for example, "../components/LoopComponents/ServiceCard.astro" becomes "ServiceCard"
  const match = path.match(/\/([^\/]+)\.(jsx|astro)$/);
  if (match) {
    const fileName = match[1];
    componentMapping[fileName] = modules[path].default;
  }
}

export { componentMapping };
