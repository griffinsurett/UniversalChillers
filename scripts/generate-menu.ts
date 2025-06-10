// scripts/generate-menu.ts
import fs from 'fs/promises';
import path from 'path';
import { buildAllMenuItems } from '../src/utils/MenuBuilder.server';

async function main() {
  const items = await buildAllMenuItems();
  const dest = path.resolve(process.cwd(), 'src/content/menuItems/menuItems.json');
  await fs.writeFile(dest, JSON.stringify(items, null, 2) + '\n');
  console.log(`✅ Generated ${items.length} menu items.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
