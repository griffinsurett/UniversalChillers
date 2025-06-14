// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

// 1. Eagerly load *all* of your _meta files at build-time:
const mdxModules = import.meta.glob<
  { frontmatter?: Record<string, any> }
>("../content/**/_meta.mdx", { eager: true });

const mdModules = import.meta.glob<
  { frontmatter?: Record<string, any> }
>("../content/**/_meta.md", { eager: true });

const jsonModules = import.meta.glob<
  { default?: Record<string, any> }
>("../content/**/_meta.json", { eager: true });

export function getCollectionMeta(collectionName: string) {
  // 2. Construct the exact key you expect in each map:
  const mdxKey  = `../content/${collectionName}/_meta.mdx`;
  const mdKey   = `../content/${collectionName}/_meta.md`;
  const jsonKey = `../content/${collectionName}/_meta.json`;

  // 3. Look up the module in those pre-globbed maps:
  let data: any = {};

  if (mdxModules[mdxKey]) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  } else if (mdModules[mdKey]) {
    data = (mdModules[mdKey] as any).frontmatter ?? {};
  } else if (jsonModules[jsonKey]) {
    data = (jsonModules[jsonKey] as any).default ?? {};
  }

  // 4. Validate & return
  return metaSchema.parse(data);
}
