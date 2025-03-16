// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

export async function getCollectionMeta(collectionName: string) {
  let data = {};
  try {
    // Try to import _meta.mdx
    const mdxModule = await import(`../content/${collectionName}/_meta.mdx`);
    data = mdxModule.frontmatter ?? {};
  } catch (e1) {
    try {
      // If _meta.mdx isn't found, try _meta.md
      const mdModule = await import(`../content/${collectionName}/_meta.md`);
      data = mdModule.frontmatter ?? {};
    } catch (e2) {
      try {
        // If neither MDX nor MD exists, fallback to _meta.json
        const jsonModule = await import(`../content/${collectionName}/_meta.json`);
        data = jsonModule.default ?? {};
      } catch (e3) {
        // If none exist, default to an empty object
        data = {};
      }
    }
  }
  return metaSchema.parse(data);
}

