import type { ComponentPlacementDefinition, ComponentType } from "./types";

const pageRootTypes: ComponentType[] = [
  "navbar",
  "hero",
  "section",
  "stack",
  "grid",
  "featureGrid",
  "faqList",
  "testimonialCard",
  "dataTable",
  "activityFeed",
  "messageThread",
  "formCard",
  "pricingCard",
  "sidebarShell",
  "chatInput",
  "text",
];

const containerChildTypes: ComponentType[] = [
  "text",
  "button",
  "featureGrid",
  "faqList",
  "testimonialCard",
  "statCard",
  "activityFeed",
  "formCard",
  "pricingCard",
  "chatInput",
  "messageThread",
  "dataTable",
  "sidebarShell",
  "stack",
  "grid",
  "section",
];

const componentPlacement: Record<ComponentType, ComponentPlacementDefinition> = {
  navbar: {
    accepts: [],
    canHaveChildren: false,
    rootOnly: true,
  },
  section: {
    accepts: containerChildTypes,
    canHaveChildren: true,
  },
  stack: {
    accepts: containerChildTypes,
    canHaveChildren: true,
  },
  grid: {
    accepts: containerChildTypes,
    canHaveChildren: true,
  },
  hero: {
    accepts: [],
    canHaveChildren: false,
  },
  text: {
    accepts: [],
    canHaveChildren: false,
  },
  button: {
    accepts: [],
    canHaveChildren: false,
  },
  featureGrid: {
    accepts: [],
    canHaveChildren: false,
  },
  faqList: {
    accepts: [],
    canHaveChildren: false,
  },
  testimonialCard: {
    accepts: [],
    canHaveChildren: false,
  },
  statCard: {
    accepts: [],
    canHaveChildren: false,
  },
  activityFeed: {
    accepts: [],
    canHaveChildren: false,
  },
  formCard: {
    accepts: [],
    canHaveChildren: false,
  },
  pricingCard: {
    accepts: [],
    canHaveChildren: false,
  },
  chatInput: {
    accepts: [],
    canHaveChildren: false,
  },
  messageThread: {
    accepts: [],
    canHaveChildren: false,
  },
  dataTable: {
    accepts: [],
    canHaveChildren: false,
  },
  sidebarShell: {
    accepts: [],
    canHaveChildren: false,
  },
};

export function getComponentPlacement(type: ComponentType) {
  return componentPlacement[type];
}

export function canAcceptChild(parentType: ComponentType | "page", childType: ComponentType) {
  const childPlacement = componentPlacement[childType];

  if (parentType === "page") {
    return pageRootTypes.includes(childType);
  }

  if (childPlacement.rootOnly) {
    return false;
  }

  const parentPlacement = componentPlacement[parentType];
  if (!parentPlacement.canHaveChildren) {
    return false;
  }

  return parentPlacement.accepts === "any" ? true : parentPlacement.accepts.includes(childType);
}
