import { blockContracts, getBlockContract } from "./block-contracts";
import { getBlockDefinition } from "./block-definitions";
import { blockCanHaveChildren, getBlockPlacement, isRootOnlyBlock } from "./block-placement";

export const blockRegistry = blockContracts.map((contract) => ({
  ...contract.definition,
  ...contract.placement,
  capabilities: contract.capabilities,
  canHaveChildren: blockCanHaveChildren(contract.type),
  family: contract.family,
  render: contract.render,
  rootOnly: isRootOnlyBlock(contract.type),
  verification: contract.verification,
}));

export const componentRegistry = blockRegistry;

export { getBlockContract, getBlockDefinition, blockCanHaveChildren, getBlockPlacement, isRootOnlyBlock };
export {
  getBlockDefinition as getComponentDefinition,
} from "./block-definitions";
export {
  blockCanHaveChildren as componentCanHaveChildren,
  getBlockPlacement as getComponentPlacement,
  isRootOnlyBlock as isRootOnlyComponent,
} from "./block-placement";
export { getPageSummary, getThemeStyles, renderNodePreview } from "./block-preview";
