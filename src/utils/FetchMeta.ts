// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

export async function getCollectionMeta(collectionName: string) {
  try {
    const metaModule = await import(`../content/${collectionName}/_meta.json`);
    const data = metaModule.default ?? {};
    return metaSchema.parse(data);
  } catch (error) {
    // If no _meta.json or parse error, parse an empty object
    // so Zod defaults (like itemsHasPage: true) get applied
    return metaSchema.parse({});
  }
}
