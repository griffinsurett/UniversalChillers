// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/schema";

// Eagerly import all possible meta files
const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);
const mdModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.md",
  { eager: true }
);
const jsonModules = import.meta.glob<{ default?: Record<string, any> }>(
  "../content/**/_meta.json",
  { eager: true }
);

export function getCollectionMeta(collectionName: string) {
  let data: Record<string, any> = {};

  // find an MDX _meta for this collection
  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );
  if (mdxKey) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  } else {
    const mdKey = Object.keys(mdModules).find((k) =>
      k.endsWith(`/${collectionName}/_meta.md`)
    );
    if (mdKey) {
      data = (mdModules[mdKey] as any).frontmatter ?? {};
    } else {
      const jsonKey = Object.keys(jsonModules).find((k) =>
        k.endsWith(`/${collectionName}/_meta.json`)
      );
      if (jsonKey) {
        data = (jsonModules[jsonKey] as any).default ?? {};
      }
    }
  }

  // validate & fill defaults
  return metaSchema.parse(data);
}
