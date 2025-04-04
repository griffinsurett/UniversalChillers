// SectionUtils.ts
import { getCollectionMeta } from "./FetchMeta";
import { capitalize } from "./ContentUtils";
import { queryItems } from "./CollectionQueryUtils";
import { shouldShowSectionButton, getDefaultButtonText } from "./ButtonVisibilityUtils";

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

export function resolveHeading(
  headingProp: any,
  metaHeading: any,
  collectionName: string
) {
  let finalHeadingArray = [];
  if (headingProp) {
    finalHeadingArray = Array.isArray(headingProp)
      ? headingProp
      : [headingProp];
  } else if (metaHeading) {
    finalHeadingArray = Array.isArray(metaHeading) ? metaHeading : [metaHeading];
  } else {
    finalHeadingArray = [{ text: capitalize(collectionName), tagName: "h2" }];
  }
  return finalHeadingArray;
}

export function resolveDescription(
  descriptionProp: any,
  metaDescription: string
) {
  const descriptionObj =
    typeof descriptionProp === "string"
      ? { text: descriptionProp }
      : descriptionProp || {};
  return descriptionObj.text || metaDescription;
}

export function resolveContainerClasses(
  buttonsSectionClass: string | undefined
) {
  return buttonsSectionClass !== undefined
    ? buttonsSectionClass
    : "mt-4 space-x-2";
}

export function resolveButtonsArray(
  buttons: any,
  metaHasPage: boolean,
  collectionName: string,
  currentPath: string
) {
  // If buttons are explicitly provided in the Section props, use them.
  if (buttons && Array.isArray(buttons)) {
    return buttons;
  }
  // Otherwise, if the meta indicates a page exists and we're not on the root, create a default button.
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


export async function getSectionItems(
  queryType: string,
  collectionName: string,
  currentPath: string
) {
  return await queryItems(queryType, collectionName, currentPath);
}