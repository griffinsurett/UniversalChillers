// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

// 1️⃣ Glob all possible meta files, eager so we can read them synchronously
const mdxModules = import.meta.glob("../content/**/_meta.mdx", { eager: true });
const mdModules = import.meta.glob("../content/**/_meta.md", { eager: true });
const jsonModules = import.meta.glob("../content/**/_meta.json", { eager: true });

// 2️⃣ Debug: print out exactly which keys were discovered
//    (remove or comment these out once you're certain it’s picking up your files)
console.log("🔍 MDX meta keys:", Object.keys(mdxModules));
console.log("🔍 MD  meta keys:", Object.keys(mdModules));
console.log("🔍 JSON meta keys:", Object.keys(jsonModules));

/**
 * getCollectionMeta(collectionName)
 * Returns the validated frontmatter for that collection's _meta file,
 * or an empty object if none exists.
 */
export function getCollectionMeta(collectionName: string) {
  // Must match the literal key in our glob above
  const mdxKey  = `../content/${collectionName}/_meta.mdx`;
  const mdKey   = `../content/${collectionName}/_meta.md`;
  const jsonKey = `../content/${collectionName}/_meta.json`;

  let data: Record<string, any> = {};

  if (mdxModules[mdxKey]) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  } else if (mdModules[mdKey]) {
    data = (mdModules[mdKey] as any).frontmatter ?? {};
  } else if (jsonModules[jsonKey]) {
    data = (jsonModules[jsonKey] as any).default ?? {};
  } else {
    console.warn(
      `[FetchMeta] No meta file found for collection "${collectionName}" (tried: ${mdxKey}, ${mdKey}, ${jsonKey})`
    );
  }

  // Validate & fill defaults via Zod
  return metaSchema.parse(data);
}
