import { blockAuthoringChecklist } from "../src/lib/builder/block-authoring";
import { blockContracts, getBlockContract } from "../src/lib/builder/block-contracts";
import { blockFamilyOrder, collectProjectBlockTypes, getBlockParityMatrix, getParityCriticalBlockTypes } from "../src/lib/builder/block-catalog";
import { createBlockContractVerificationProject } from "../src/lib/builder/verification-project";
import { blockTypes } from "../src/lib/builder/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(blockContracts.length === blockTypes.length, "Block contract count does not match the shipped block type list.");

  const contractTypes = new Set(blockContracts.map((contract) => contract.type));
  assert(contractTypes.size === blockTypes.length, "Block contracts contain duplicate block types.");

  for (const type of blockTypes) {
    assert(contractTypes.has(type), `Missing block contract for "${type}".`);
    assert(getBlockContract(type).type === type, `Block contract lookup returned the wrong type for "${type}".`);
  }

  const familySet = new Set(blockFamilyOrder);
  const parityMatrix = getBlockParityMatrix();
  assert(parityMatrix.length === blockContracts.length, "Block parity matrix coverage fell out of sync with the shipped block contracts.");

  for (const contract of blockContracts) {
    assert(familySet.has(contract.family), `Block "${contract.type}" points at an unknown family "${contract.family}".`);
    assert(contract.definition.title.trim().length > 0, `Block "${contract.type}" is missing a title.`);
    assert(contract.definition.description.trim().length > 0, `Block "${contract.type}" is missing a description.`);
    assert(contract.definition.icon.trim().length > 0, `Block "${contract.type}" is missing an icon.`);
    assert(contract.placement.allowedParents.length > 0, `Block "${contract.type}" has no allowed parent targets.`);
    assert(contract.render.parity.notes.length > 0, `Block "${contract.type}" is missing preview/export parity notes.`);
    assert(contract.render.preview.implementation.trim().length > 0, `Block "${contract.type}" is missing preview render metadata.`);
    assert(contract.render.starter.implementation.trim().length > 0, `Block "${contract.type}" is missing starter render metadata.`);

    const fieldKeys = contract.definition.fields.map((field) => field.key);
    assert(new Set(fieldKeys).size === fieldKeys.length, `Block "${contract.type}" has duplicate inspector field keys.`);

    for (const field of contract.definition.fields) {
      assert(field.key in contract.definition.defaults, `Block "${contract.type}" is missing a default value for inspector field "${field.key}".`);
    }

    assert(
      new Set(contract.capabilities).size === contract.capabilities.length,
      `Block "${contract.type}" has duplicate capability tags.`,
    );

    if (contract.capabilities.includes("root-only")) {
      assert(
        contract.placement.allowedParents.length === 1 && contract.placement.allowedParents[0] === "page-root",
        `Root-only block "${contract.type}" must only allow page-root placement.`,
      );
    }

    if (contract.capabilities.includes("leaf")) {
      assert(!contract.placement.childTargetKind, `Leaf block "${contract.type}" must not declare a child target kind.`);
      assert(contract.render.children === "leaf", `Leaf block "${contract.type}" must use the leaf render contract.`);
    }

    if (contract.capabilities.includes("layout-owner")) {
      assert(contract.placement.childTargetKind === "layout-container", `Layout owner "${contract.type}" must expose a layout-container child target.`);
      assert(
        contract.render.children === "renders-children",
        `Layout owner "${contract.type}" must declare that it renders children.`,
      );
    }

    if (contract.family === "root-composite") {
      assert(contract.capabilities.includes("root-only"), `Root composite block "${contract.type}" must carry the root-only capability.`);
    }

    if (contract.family === "layout") {
      assert(contract.capabilities.includes("layout-owner"), `Layout block "${contract.type}" must carry the layout-owner capability.`);
    }

    if (contract.verification.previewExportParity === "required") {
      assert(
        contract.capabilities.includes("parity-critical"),
        `Parity-critical block "${contract.type}" must carry the parity-critical capability.`,
      );
    }
  }

  const requiredChecklistIds = [
    "family-classification",
    "defaults-and-inspector",
    "placement-contract",
    "render-contract",
    "verification",
    "docs-impact",
    "template-impact",
  ] as const;
  const checklistIds = new Set(blockAuthoringChecklist.map((item) => item.id));

  for (const checklistId of requiredChecklistIds) {
    assert(checklistIds.has(checklistId), `Block authoring checklist is missing "${checklistId}".`);
  }

  const coverageProjectTypes = collectProjectBlockTypes(createBlockContractVerificationProject());
  const missingCoverage = getParityCriticalBlockTypes().filter((type) => !coverageProjectTypes.has(type));
  assert(
    missingCoverage.length === 0,
    `The internal block contract coverage project is missing parity-critical blocks: ${missingCoverage.join(", ")}.`,
  );

  console.log(
    `[verify:contracts] Verified ${blockContracts.length} block contracts, ${blockAuthoringChecklist.length} authoring checklist items, and full parity coverage project alignment.`,
  );
}

main();
