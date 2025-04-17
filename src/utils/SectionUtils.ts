// src/utils/SectionUtils.ts
import { getCollectionMeta } from "./FetchMeta";
import { capitalize } from "./ContentUtils";
import { queryItems } from "./CollectionQueryUtils";

/**
 * Generate a unique section ID of form:
 *   {collection}-{query}-{pageSlug}[-{n}]
 *
 * Where '-n' is only appended if the same baseId has been generated before.
 */
const sectionIdCounts = new Map<string, number>();

export function resetSectionIds() {
  sectionIdCounts.clear();
}
/**
 * Generate a section ID of form:
 *   {collection}-{query}-{pageSlug}
 */
export function generateSectionId(
  collectionName: string | undefined,
  queryType: string | undefined,
  pagePath: string
): string {
  // derive the last segment of the path, or "home"
  const pageSlug =
    pagePath
      .split("/")
      .filter(Boolean)
      .pop() || "home";

  // fallback to "static" or "default" when undefined
  const sectionSlug = collectionName || "static";
  const queryName   = queryType      || "default";

  return `${sectionSlug}-${queryName}-${pageSlug}`;
}

// Returns meta data for the given collection.
export async function resolveMetaProps(
  collectionName: string,
  queryType: string
) {
  let meta = { heading: null, description: "", hasPage: false, itemsHasPage: true };
  if (collectionName && queryType) {
    const {
      heading: metaHeading,
      description: metaDesc = "",
      hasPage = false,
      itemsHasPage = true,
      ...restMeta
    } = await getCollectionMeta(collectionName);
    meta = { heading: metaHeading, description: metaDesc, hasPage, itemsHasPage, ...restMeta };
  }
  return meta;
}

// Resolves the heading by checking explicit props, then meta, then a fallback.
export function resolveHeading(
  headingProp: any,
  metaHeading: any,
  collectionName: string
) {
  if (headingProp) {
    return Array.isArray(headingProp) ? headingProp : [headingProp];
  } else if (metaHeading) {
    return Array.isArray(metaHeading) ? metaHeading : [metaHeading];
  } else {
    return [{ text: capitalize(collectionName), tagName: "h2" }];
  }
}

// Resolves the description similarly.
export function resolveDescription(
  descriptionProp: any,
  metaDescription: string
) {
  const descObj =
    typeof descriptionProp === "string"
      ? { text: descriptionProp }
      : descriptionProp || {};
  return descObj.text || metaDescription;
}

// Merges the style-related props with defaults from meta.
export function resolveSectionStyles(sectionProps: {
  sectionClass?: string;
  contentClass?: string;
  itemsClass?: string;
  buttonsSectionClass?: string;
}, defaultSection: any) {
  return {
    finalSectionClass: sectionProps.sectionClass || defaultSection.sectionClass || "",
    finalContentClass: sectionProps.contentClass || defaultSection.contentClass || "",
    finalItemsClass: sectionProps.itemsClass || defaultSection.itemsClass || "",
    finalButtonsSectionClass: sectionProps.buttonsSectionClass || defaultSection.buttonsSectionClass || "",
  };
}

// Resolves the buttons array.
export function resolveButtonsArray(
  buttons: any,
  metaHasPage: boolean,
  collectionName: string,
  currentPath: string
) {
  if (buttons && Array.isArray(buttons)) {
    return buttons;
  }
  const isCollectionRootPage =
    currentPath === `/${collectionName}` || currentPath === `/${collectionName}/`;
  if (metaHasPage && !isCollectionRootPage) {
    return [
      {
        text: `View All ${capitalize(collectionName)}`,
        link: `/${collectionName}`,
        class: "",
        variant: "primary",
      },
    ];
  }
  return [];
}

// Returns dynamic items for the section.
export async function getSectionItems(
  queryType: string,
  collectionName: string,
  currentPath: string
) {
  return await queryItems(queryType, collectionName, currentPath);
}

// Resolves the component to render using an external auto-imported mapping.
import { componentMapping } from "@/utils/ComponentMapping";
export function resolveComponent(ItemComponent: any, defaultComponent: any) {
  let finalComponent = ItemComponent || defaultComponent;
  if (typeof finalComponent === "string") {
    finalComponent = componentMapping[finalComponent] || componentMapping["Card"];
  }
  return finalComponent;
}