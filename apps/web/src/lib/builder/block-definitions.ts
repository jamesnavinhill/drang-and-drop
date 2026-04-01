import { blockContracts, getBlockContract } from "./block-contracts";
import type { BlockType } from "./types";

export const blockDefinitions = blockContracts.map((contract) => contract.definition);

export function getBlockDefinition(type: BlockType) {
  return getBlockContract(type).definition;
}
