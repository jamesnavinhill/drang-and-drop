import { getBlockContract } from "./block-contracts";
import type {
  BlockFamily,
  BlockRegionChildAcceptance,
  BlockPlacementDefinition,
  BlockRegionDefinition,
  BlockType,
  BuilderProject,
  PageRegionId,
  ParentReference,
  PlacementTargetKind,
} from "./types";

const pageRegionKindById: Record<PageRegionId, PlacementTargetKind> = {
  footer: "page-footer",
  header: "page-header",
  main: "page-main",
};

export function getBlockPlacement(type: BlockType): BlockPlacementDefinition {
  return getBlockContract(type).placement;
}

export function getBlockRegions(type: BlockType): BlockRegionDefinition[] {
  return getBlockPlacement(type).regions;
}

export function getBlockRegion(type: BlockType, regionId: string) {
  return getBlockRegions(type).find((region) => region.id === regionId) ?? null;
}

export function getBlockRegionLabel(type: BlockType, regionId: string) {
  return getBlockRegion(type, regionId)?.label ?? regionId;
}

export function getBlockRegionDescription(type: BlockType, regionId: string) {
  return getBlockRegion(type, regionId)?.description ?? "Add nested blocks here.";
}

export function getBlockRegionEmptyMessage(type: BlockType, regionId: string) {
  return getBlockRegion(type, regionId)?.emptyMessage ?? "Drop compatible blocks here.";
}

export function getBlockRegionRole(type: BlockType, regionId: string) {
  return getBlockRegion(type, regionId)?.role ?? "primary";
}

export function getBlockRegionAcceptedChildren(type: BlockType, regionId: string) {
  return getBlockRegion(type, regionId)?.acceptedChildren ?? null;
}

export function getBlockRegionAcceptedChildrenLabel(type: BlockType, regionId: string) {
  const acceptedChildren = getBlockRegionAcceptedChildren(type, regionId);
  return acceptedChildren ? describeAcceptedChildren(acceptedChildren) : null;
}

export function getPrimaryBlockRegion(type: BlockType) {
  return getBlockRegions(type)[0] ?? null;
}

export function blockCanHaveChildren(type: BlockType) {
  return getBlockRegions(type).length > 0;
}

export function isRootOnlyBlock(type: BlockType) {
  return getBlockPlacement(type).allowedRegions.every((kind) => kind.startsWith("page-"));
}

function humanizeBlockFamily(family: BlockFamily) {
  switch (family) {
    case "root-composite":
      return "root blocks";
    case "layout":
      return "layout blocks";
    case "content":
      return "content blocks";
    case "application":
      return "application blocks";
  }
}

function joinWithOr(labels: string[]) {
  if (labels.length === 1) {
    return labels[0] ?? "";
  }

  if (labels.length === 2) {
    return `${labels[0]} or ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

export function describeAcceptedChildren(acceptedChildren: BlockRegionChildAcceptance) {
  const labels = [
    ...(acceptedChildren.allowedTypes?.map((type) => {
      const title = getBlockContract(type).definition.title;
      return `${title} blocks`;
    }) ?? []),
    ...(acceptedChildren.allowedFamilies?.map((family) => humanizeBlockFamily(family)) ?? []),
  ];

  return labels.length > 0 ? joinWithOr(labels) : "compatible blocks";
}

export function describePlacementTargetKind(kind: PlacementTargetKind) {
  switch (kind) {
    case "page-header":
      return "the page header";
    case "page-main":
      return "the page main region";
    case "page-footer":
      return "the page footer";
    case "layout-content":
      return "a layout content region";
    case "layout-sidebar":
      return "a layout sidebar region";
  }
}

export function describeAllowedRegionKinds(kinds: PlacementTargetKind[]) {
  const labels = kinds.map((kind) => describePlacementTargetKind(kind));

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} or ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

export function getPlacementTargetKind(project: BuilderProject, parent: ParentReference): PlacementTargetKind | null {
  if (parent.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === parent.pageId);
    if (!page) {
      return null;
    }

    return pageRegionKindById[parent.regionId as PageRegionId] ?? null;
  }

  const parentNode = project.nodes[parent.nodeId ?? ""];
  if (!parentNode) {
    return null;
  }

  return getBlockRegion(parentNode.type, parent.regionId)?.kind ?? null;
}

export function canAcceptChild(
  parentTargetKind: PlacementTargetKind,
  childType: BlockType,
  parentType?: BlockType,
  parentRegionId?: string,
) {
  if (!getBlockPlacement(childType).allowedRegions.includes(parentTargetKind)) {
    return false;
  }

  if (!parentType || !parentRegionId) {
    return true;
  }

  const region = getBlockRegion(parentType, parentRegionId);
  if (!region?.acceptedChildren) {
    return true;
  }

  const childContract = getBlockContract(childType);
  const familyAllowed =
    !region.acceptedChildren.allowedFamilies ||
    region.acceptedChildren.allowedFamilies.includes(childContract.family);
  const typeAllowed =
    !region.acceptedChildren.allowedTypes ||
    region.acceptedChildren.allowedTypes.includes(childType);

  return familyAllowed && typeAllowed;
}
