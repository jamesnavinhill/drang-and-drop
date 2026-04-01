import { blockContracts } from "./block-contracts";
import type {
  BlockCapability,
  BlockContract,
  BlockFamily,
  BlockLibraryGroup,
  BlockType,
  BuilderProject,
} from "./types";

export const blockFamilyOrder: BlockFamily[] = ["root-composite", "layout", "content", "application"];
export const blockLibraryGroupOrder: BlockLibraryGroup[] = [
  "page-structure",
  "marketing",
  "content",
  "forms-and-cta",
  "data-and-metrics",
  "workspace-and-navigation",
];

const blockFamilyMeta: Record<
  BlockFamily,
  {
    description: string;
    title: string;
  }
> = {
  "application": {
    description: "Operational and internal-tool blocks for dashboards, workflows, and structured app surfaces.",
    title: "Application Blocks",
  },
  "content": {
    description: "Content-first blocks that carry copy, proof, pricing, and focused UI payloads.",
    title: "Content Blocks",
  },
  "layout": {
    description: "Structure-owning blocks that organize spacing, hierarchy, and nested composition.",
    title: "Layout Blocks",
  },
  "root-composite": {
    description: "Page-level composites that shape the top-level shell and should stay visually dominant.",
    title: "Root Blocks",
  },
};

const blockCapabilityLabels: Record<BlockCapability, string> = {
  "future-region-pressure": "Future region pressure",
  "layout-owner": "Layout owner",
  "leaf": "Leaf",
  "parity-critical": "Parity critical",
  "root-only": "Root only",
};

const blockLibraryGroupMeta: Record<
  BlockLibraryGroup,
  {
    description: string;
    title: string;
  }
> = {
  "content": {
    description: "Flexible copy, profile, and summary blocks that fit polished product and editorial surfaces.",
    title: "Content",
  },
  "data-and-metrics": {
    description: "Structured tables, metrics, and reporting blocks for dashboards, ops surfaces, and comparison views.",
    title: "Data and Metrics",
  },
  "forms-and-cta": {
    description: "Action-oriented blocks for conversion moments, input shells, and call-to-action emphasis.",
    title: "Forms and CTA",
  },
  "marketing": {
    description: "Launch-ready proof, process, pricing, and trust-building blocks for public-facing pages.",
    title: "Marketing",
  },
  "page-structure": {
    description: "High-level shells and layout primitives that define the page frame and nested composition.",
    title: "Page Structure",
  },
  "workspace-and-navigation": {
    description: "Application shells, navigation helpers, messaging, and empty-state support for workspace flows.",
    title: "Workspace and Navigation",
  },
};

const blockLibraryGroupByType: Record<BlockType, BlockLibraryGroup> = {
  activityFeed: "data-and-metrics",
  button: "forms-and-cta",
  calloutCard: "content",
  chatInput: "forms-and-cta",
  comparisonTable: "marketing",
  ctaBanner: "forms-and-cta",
  dataTable: "data-and-metrics",
  emptyState: "workspace-and-navigation",
  faqList: "marketing",
  featureGrid: "marketing",
  formCard: "forms-and-cta",
  grid: "page-structure",
  hero: "page-structure",
  infoList: "content",
  logoGrid: "marketing",
  messageThread: "workspace-and-navigation",
  metricRow: "data-and-metrics",
  navbar: "page-structure",
  pricingCard: "marketing",
  profileCard: "content",
  section: "page-structure",
  sidebarShell: "workspace-and-navigation",
  stack: "page-structure",
  statCard: "data-and-metrics",
  stepList: "marketing",
  testimonialCard: "marketing",
  text: "content",
  workspaceHeader: "workspace-and-navigation",
};

export function getBlockFamilyMeta(family: BlockFamily) {
  return blockFamilyMeta[family];
}

export function getBlockCapabilityLabels(capabilities: BlockCapability[]) {
  return capabilities.map((capability) => blockCapabilityLabels[capability]);
}

export function getDisplayableBlockCapabilityLabels(capabilities: BlockCapability[]) {
  return capabilities
    .filter((capability) => capability !== "parity-critical")
    .map((capability) => blockCapabilityLabels[capability]);
}

export function groupBlockContractsByFamily(contracts: BlockContract[]) {
  return blockFamilyOrder
    .map((family) => ({
      contracts: contracts.filter((contract) => contract.family === family),
      family,
      ...getBlockFamilyMeta(family),
    }))
    .filter((group) => group.contracts.length > 0);
}

export function getBlockLibraryGroup(type: BlockType) {
  return blockLibraryGroupByType[type];
}

export function getBlockLibraryGroupMeta(group: BlockLibraryGroup) {
  return blockLibraryGroupMeta[group];
}

export function groupBlockContractsByLibraryGroup(contracts: BlockContract[]) {
  return blockLibraryGroupOrder
    .map((group) => ({
      contracts: contracts.filter((contract) => getBlockLibraryGroup(contract.type) === group),
      group,
      ...getBlockLibraryGroupMeta(group),
    }))
    .filter((entry) => entry.contracts.length > 0);
}

export function getParityCriticalBlockTypes() {
  return blockContracts
    .filter((contract) => contract.verification.previewExportParity === "required")
    .map((contract) => contract.type);
}

export function getBlockParityMatrix(contracts: BlockContract[] = blockContracts) {
  return contracts.map((contract) => ({
    family: contract.family,
    parityNotes: contract.render.parity.notes,
    parityStrategy: contract.render.parity.strategy,
    previewSurface: contract.render.preview.surface,
    starterSurface: contract.render.starter.surface,
    title: contract.definition.title,
    type: contract.type,
  }));
}

export function collectProjectBlockTypes(project: BuilderProject) {
  return new Set<BlockType>(Object.values(project.nodes).map((node) => node.type));
}
