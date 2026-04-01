import type { BuilderProject, ComponentPlacementDefinition, ComponentType, ParentReference, PlacementTargetKind } from "./types";

const pageRootOnlyPlacement: ComponentPlacementDefinition = {
  allowedParents: ["page-root"],
};

const layoutContainerPlacement: ComponentPlacementDefinition = {
  allowedParents: ["page-root", "layout-container"],
  childTargetKind: "layout-container",
};

const flexibleLeafPlacement: ComponentPlacementDefinition = {
  allowedParents: ["page-root", "layout-container"],
};

const nestedLeafPlacement: ComponentPlacementDefinition = {
  allowedParents: ["layout-container"],
};

const componentPlacement: Record<ComponentType, ComponentPlacementDefinition> = {
  navbar: pageRootOnlyPlacement,
  section: layoutContainerPlacement,
  stack: layoutContainerPlacement,
  grid: layoutContainerPlacement,
  hero: pageRootOnlyPlacement,
  text: flexibleLeafPlacement,
  button: nestedLeafPlacement,
  featureGrid: flexibleLeafPlacement,
  faqList: flexibleLeafPlacement,
  testimonialCard: flexibleLeafPlacement,
  statCard: nestedLeafPlacement,
  activityFeed: flexibleLeafPlacement,
  formCard: flexibleLeafPlacement,
  pricingCard: flexibleLeafPlacement,
  chatInput: flexibleLeafPlacement,
  messageThread: flexibleLeafPlacement,
  dataTable: flexibleLeafPlacement,
  sidebarShell: flexibleLeafPlacement,
};

export function getComponentPlacement(type: ComponentType) {
  return componentPlacement[type];
}

export function componentCanHaveChildren(type: ComponentType) {
  return Boolean(getComponentPlacement(type).childTargetKind);
}

export function isRootOnlyComponent(type: ComponentType) {
  const placement = getComponentPlacement(type);
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

  return getComponentPlacement(parentNode.type).childTargetKind ?? null;
}

export function canAcceptChild(parentTargetKind: PlacementTargetKind, childType: ComponentType) {
  return getComponentPlacement(childType).allowedParents.includes(parentTargetKind);
}
