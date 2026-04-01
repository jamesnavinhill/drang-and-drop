import assert from "node:assert/strict";

import { createNodeRegions } from "../src/lib/builder/regions";
import { validateProject } from "../src/lib/builder/schema";
import { executeStructureCommand } from "../src/lib/builder/structure";
import type { BlockType, BuilderNode, BuilderProject, ParentReference } from "../src/lib/builder/types";

function createProject(): BuilderProject {
  return {
    description: "Command verification project",
    id: "project-verify",
    name: "Verify Commands",
    nodes: {},
    pages: [
      {
        description: "Verification page",
        id: "page-home",
        name: "Home",
        path: "/",
        regions: {
          header: [],
          main: [],
          footer: [],
        },
      },
    ],
    theme: {
      accent: "#0f766e",
      accentContrast: "#f8fafc",
      background: "#f7f4ed",
      fontFamily: "system-ui, sans-serif",
      foreground: "#101828",
      muted: "#667085",
      radius: 24,
      shadow: 2,
      surface: "#ffffff",
    },
    updatedAt: "2026-04-01T00:00:00.000Z",
  };
}

function createNode(id: string, type: BlockType, childIds: string[] = []): BuilderNode {
  return {
    id,
    props: {},
    regions: createNodeRegions(type, childIds),
    type,
  };
}

function expectSuccess(
  result: ReturnType<typeof executeStructureCommand>,
  message: string,
): Extract<ReturnType<typeof executeStructureCommand>, { ok: true }> {
  if (!result.ok) {
    throw new Error(`${message} Received failure: ${result.reason} (${result.message})`);
  }
  return result;
}

function expectFailure(
  result: ReturnType<typeof executeStructureCommand>,
  expectedReason: string,
  message: string,
) {
  if (result.ok) {
    throw new Error(`${message} Received success unexpectedly.`);
  }

  assert.equal(result.reason, expectedReason, message);
}

function main() {
  const project = createProject();
  const pageHeaderParent: ParentReference = {
    kind: "page-region",
    pageId: "page-home",
    regionId: "header",
  };
  const pageMainParent: ParentReference = {
    kind: "page-region",
    pageId: "page-home",
    regionId: "main",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("navbar-1", "navbar"),
      parent: pageHeaderParent,
    }),
    "Expected navbar insertion in the page header region to succeed.",
  );
  assert.deepEqual(project.pages[0]?.regions.header, ["navbar-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("section-1", "section"),
      parent: pageMainParent,
    }),
    "Expected section insertion in the page main region to succeed.",
  );
  assert.deepEqual(project.pages[0]?.regions.main, ["section-1"]);

  const sectionContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "section-1",
    regionId: "content",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("text-1", "text"),
      parent: sectionContentParent,
    }),
    "Expected text insertion inside section content to succeed.",
  );

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("stack-1", "stack"),
      parent: sectionContentParent,
    }),
    "Expected stack insertion inside section content to succeed.",
  );
  assert.deepEqual(project.nodes["section-1"]?.regions.content, ["text-1", "stack-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("sidebar-shell-1", "sidebarShell"),
      parent: pageMainParent,
    }),
    "Expected sidebar shell insertion in the page main region to succeed.",
  );
  assert.deepEqual(project.pages[0]?.regions.main, ["section-1", "sidebar-shell-1"]);

  const sidebarShellContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "sidebar-shell-1",
    regionId: "content",
  };
  const sidebarShellSidebarParent: ParentReference = {
    kind: "node-region",
    nodeId: "sidebar-shell-1",
    regionId: "sidebar",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("thread-1", "messageThread"),
      parent: sidebarShellContentParent,
    }),
    "Expected message thread insertion inside sidebar shell content to succeed.",
  );
  assert.deepEqual(project.nodes["sidebar-shell-1"]?.regions.content, ["thread-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("sidebar-button-1", "button"),
      parent: sidebarShellSidebarParent,
    }),
    "Expected button insertion inside sidebar shell sidebar to succeed.",
  );
  assert.deepEqual(project.nodes["sidebar-shell-1"]?.regions.sidebar, ["sidebar-button-1"]);

  const stackContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "stack-1",
    regionId: "content",
  };

  expectSuccess(
    executeStructureCommand(project, {
      index: 0,
      kind: "move",
      nodeId: "text-1",
      parent: stackContentParent,
    }),
    "Expected moving text into nested stack content to succeed.",
  );
  assert.deepEqual(project.nodes["section-1"]?.regions.content, ["stack-1"]);
  assert.deepEqual(project.nodes["stack-1"]?.regions.content, ["text-1"]);

  expectFailure(
    executeStructureCommand(project, {
      index: 0,
      kind: "move",
      nodeId: "section-1",
      parent: stackContentParent,
    }),
    "descendant-target",
    "Moving a node into one of its descendants should fail.",
  );
  assert.deepEqual(project.pages[0]?.regions.main, ["section-1", "sidebar-shell-1"]);
  assert.deepEqual(project.nodes["section-1"]?.regions.content, ["stack-1"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("button-root-attempt", "button"),
      parent: pageMainParent,
    }),
    "invalid-child",
    "Inserting a button in the page main region should fail because buttons require a layout content region.",
  );
  assert.equal(project.nodes["button-root-attempt"], undefined);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("navbar-nested-attempt", "navbar"),
      parent: sectionContentParent,
    }),
    "invalid-child",
    "Inserting a navbar into section content should fail.",
  );
  assert.equal(project.nodes["navbar-nested-attempt"], undefined);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("section-sidebar-attempt", "section"),
      parent: sidebarShellSidebarParent,
    }),
    "invalid-child",
    "Inserting a section into the sidebar shell sidebar should fail because sections require page or layout content regions.",
  );
  assert.equal(project.nodes["section-sidebar-attempt"], undefined);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("stat-1", "statCard"),
      parent: stackContentParent,
    }),
    "Expected stat card insertion inside a layout content region to succeed.",
  );
  assert.deepEqual(project.nodes["stack-1"]?.regions.content, ["text-1", "stat-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("pricing-card-1", "pricingCard"),
      parent: stackContentParent,
    }),
    "Expected pricing card insertion inside stack content to succeed.",
  );
  assert.deepEqual(project.nodes["stack-1"]?.regions.content, ["text-1", "stat-1", "pricing-card-1"]);

  const pricingCardContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "pricing-card-1",
    regionId: "content",
  };
  const pricingCardActionsParent: ParentReference = {
    kind: "node-region",
    nodeId: "pricing-card-1",
    regionId: "actions",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("pricing-text-1", "text"),
      parent: pricingCardContentParent,
    }),
    "Expected text insertion inside pricing card content to succeed.",
  );
  assert.deepEqual(project.nodes["pricing-card-1"]?.regions.content, ["pricing-text-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("pricing-button-1", "button"),
      parent: pricingCardActionsParent,
    }),
    "Expected button insertion inside pricing card actions to succeed.",
  );
  assert.deepEqual(project.nodes["pricing-card-1"]?.regions.actions, ["pricing-button-1"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("pricing-actions-text-attempt", "text"),
      parent: pricingCardActionsParent,
    }),
    "invalid-child",
    "Inserting text into pricing card actions should fail because the region only accepts buttons.",
  );
  assert.equal(project.nodes["pricing-actions-text-attempt"], undefined);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("form-card-1", "formCard"),
      parent: sidebarShellContentParent,
    }),
    "Expected form card insertion inside sidebar shell content to succeed.",
  );
  assert.deepEqual(project.nodes["sidebar-shell-1"]?.regions.content, ["thread-1", "form-card-1"]);

  const formCardContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "form-card-1",
    regionId: "content",
  };
  const formCardActionsParent: ParentReference = {
    kind: "node-region",
    nodeId: "form-card-1",
    regionId: "actions",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("form-text-1", "text"),
      parent: formCardContentParent,
    }),
    "Expected text insertion inside form card content to succeed.",
  );
  assert.deepEqual(project.nodes["form-card-1"]?.regions.content, ["form-text-1"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("form-stat-attempt", "statCard"),
      parent: formCardContentParent,
    }),
    "invalid-child",
    "Inserting an application block into form card content should fail because the region only accepts content blocks.",
  );
  assert.equal(project.nodes["form-stat-attempt"], undefined);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("form-button-1", "button"),
      parent: formCardActionsParent,
    }),
    "Expected button insertion inside form card actions to succeed.",
  );
  assert.deepEqual(project.nodes["form-card-1"]?.regions.actions, ["form-button-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("empty-state-1", "emptyState"),
      parent: pageMainParent,
    }),
    "Expected empty state insertion in the page main region to succeed.",
  );
  assert.deepEqual(project.pages[0]?.regions.main, ["section-1", "sidebar-shell-1", "empty-state-1"]);

  const emptyStateContentParent: ParentReference = {
    kind: "node-region",
    nodeId: "empty-state-1",
    regionId: "content",
  };
  const emptyStateActionsParent: ParentReference = {
    kind: "node-region",
    nodeId: "empty-state-1",
    regionId: "actions",
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("empty-text-1", "text"),
      parent: emptyStateContentParent,
    }),
    "Expected text insertion inside empty state content to succeed.",
  );
  assert.deepEqual(project.nodes["empty-state-1"]?.regions.content, ["empty-text-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("empty-button-1", "button"),
      parent: emptyStateActionsParent,
    }),
    "Expected button insertion inside empty state actions to succeed.",
  );
  assert.deepEqual(project.nodes["empty-state-1"]?.regions.actions, ["empty-button-1"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("empty-actions-text-attempt", "text"),
      parent: emptyStateActionsParent,
    }),
    "invalid-child",
    "Inserting text into empty state actions should fail because the region only accepts buttons.",
  );
  assert.equal(project.nodes["empty-actions-text-attempt"], undefined);

  const duplicateIdSequence = ["stack-copy", "text-copy", "stat-copy", "pricing-card-copy", "pricing-text-copy", "pricing-button-copy"];
  const duplicateResult = expectSuccess(
    executeStructureCommand(project, {
      createNodeId: () => {
        const nextId = duplicateIdSequence.shift();
        assert.ok(nextId, "Expected a deterministic duplicate id to be available.");
        return nextId;
      },
      kind: "duplicate",
      nodeId: "stack-1",
    }),
    "Expected duplicating the nested stack subtree to succeed.",
  );
  assert.equal(duplicateResult.nodeId, "stack-copy");
  assert.deepEqual(duplicateResult.createdNodeIds, [
    "stack-copy",
    "text-copy",
    "stat-copy",
    "pricing-card-copy",
    "pricing-text-copy",
    "pricing-button-copy",
  ]);
  assert.deepEqual(project.nodes["section-1"]?.regions.content, ["stack-1", "stack-copy"]);
  assert.deepEqual(project.nodes["stack-copy"]?.regions.content, ["text-copy", "stat-copy", "pricing-card-copy"]);
  assert.equal(project.nodes["text-copy"]?.type, "text");
  assert.equal(project.nodes["stat-copy"]?.type, "statCard");
  assert.deepEqual(project.nodes["pricing-card-copy"]?.regions.content, ["pricing-text-copy"]);
  assert.deepEqual(project.nodes["pricing-card-copy"]?.regions.actions, ["pricing-button-copy"]);

  const removeResult = expectSuccess(
    executeStructureCommand(project, {
      kind: "remove",
      nodeId: "stack-1",
    }),
    "Expected removing the original nested stack subtree to succeed.",
  );
  assert.deepEqual(removeResult.removedNodeIds, ["text-1", "stat-1", "pricing-text-1", "pricing-button-1", "pricing-card-1", "stack-1"]);
  assert.deepEqual(project.nodes["section-1"]?.regions.content, ["stack-copy"]);
  assert.equal(project.nodes["stack-1"], undefined);
  assert.equal(project.nodes["text-1"], undefined);
  assert.equal(project.nodes["stat-1"], undefined);
  assert.equal(project.nodes["pricing-card-1"], undefined);
  assert.equal(project.nodes["pricing-text-1"], undefined);
  assert.equal(project.nodes["pricing-button-1"], undefined);

  expectSuccess(
    executeStructureCommand(project, {
      index: 1,
      kind: "move",
      nodeId: "stat-copy",
      parent: sidebarShellSidebarParent,
    }),
    "Expected moving stat card into sidebar shell sidebar to succeed.",
  );
  assert.deepEqual(project.nodes["stack-copy"]?.regions.content, ["text-copy", "pricing-card-copy"]);
  assert.deepEqual(project.nodes["sidebar-shell-1"]?.regions.sidebar, ["sidebar-button-1", "stat-copy"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "remove",
      nodeId: "missing-node",
    }),
    "missing-node",
    "Removing a missing node should fail cleanly.",
  );

  const validProjectResult = validateProject(project);
  assert.equal(validProjectResult.success, true, "Expected the verified project shape to remain valid.");

  const invalidProject = createProject();
  invalidProject.pages[0]!.regions.main = ["button-root"];
  invalidProject.nodes["button-root"] = createNode("button-root", "button");
  invalidProject.nodes["orphan-text"] = createNode("orphan-text", "text");

  const invalidProjectResult = validateProject(invalidProject);
  assert.equal(invalidProjectResult.success, false, "Expected invalid structure to fail project validation.");

  const messages = invalidProjectResult.error.issues.map((issue) => issue.message);
  assert.ok(
    messages.some((message) => message.includes("invalid main button block")),
    "Expected validation to report invalid page-main placement.",
  );
  assert.ok(
    messages.some((message) => message.includes('Node "orphan-text" is not reachable')),
    "Expected validation to report orphan nodes.",
  );

  console.log("[verify:commands] Builder structure command verification passed.");
}

main();
