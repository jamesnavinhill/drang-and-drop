import { getBlockContract } from "./block-contracts";
import type { BlockPlacementDefinition, BlockType, BuilderProject, ParentReference, PlacementTargetKind } from "./types";

export function getBlockPlacement(type: BlockType): BlockPlacementDefinition {
  return getBlockContract(type).placement;
}

export function blockCanHaveChildren(type: BlockType) {
  return Boolean(getBlockPlacement(type).childTargetKind);
}

export function isRootOnlyBlock(type: BlockType) {
  const placement = getBlockPlacement(type);
  return placement.allowedParents.length === 1 && placement.allowedParents[0] === "page-root";
}

export function describePlacementTargetKind(kind: PlacementTargetKind) {
  return kind === "page-root" ? "the page root" : "a layout container";
}

export function describeAllowedParentKinds(kinds: PlacementTargetKind[]) {
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
  if (parent.kind === "page") {
    return project.pages.some((page) => page.id === parent.id) ? "page-root" : null;
  }

  const parentNode = project.nodes[parent.id];
  if (!parentNode) {
    return null;
  }

  return getBlockPlacement(parentNode.type).childTargetKind ?? null;
}

export function canAcceptChild(parentTargetKind: PlacementTargetKind, childType: BlockType) {
  return getBlockPlacement(childType).allowedParents.includes(parentTargetKind);
}
