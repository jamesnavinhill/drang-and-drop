import { blockContracts } from "./block-contracts";
import type { BlockCapability, BlockContract, BlockFamily, BlockType, BuilderProject } from "./types";

export const blockFamilyOrder: BlockFamily[] = ["root-composite", "layout", "content", "application"];

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
