import assert from "node:assert/strict";

import { validateProject } from "../src/lib/builder/schema";
import { executeStructureCommand } from "../src/lib/builder/structure";
import type { BuilderNode, BuilderProject, ComponentType } from "../src/lib/builder/types";

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
        rootIds: [],
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

function createNode(id: string, type: ComponentType, children: string[] = []): BuilderNode {
  return {
    children,
    id,
    props: {},
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
  const pageParent = {
    id: "page-home",
    kind: "page" as const,
  };

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("section-1", "section"),
      parent: pageParent,
    }),
    "Expected section insertion at the page root to succeed.",
  );
  assert.deepEqual(project.pages[0]?.rootIds, ["section-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("text-1", "text"),
      parent: {
        id: "section-1",
        kind: "node",
      },
    }),
    "Expected text insertion inside section to succeed.",
  );

  expectSuccess(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("stack-1", "stack"),
      parent: {
        id: "section-1",
        kind: "node",
      },
    }),
    "Expected stack insertion inside section to succeed.",
  );
  assert.deepEqual(project.nodes["section-1"]?.children, ["text-1", "stack-1"]);

  expectSuccess(
    executeStructureCommand(project, {
      index: 0,
      kind: "move",
      nodeId: "text-1",
      parent: {
        id: "stack-1",
        kind: "node",
      },
    }),
    "Expected moving text into nested stack to succeed.",
  );
  assert.deepEqual(project.nodes["section-1"]?.children, ["stack-1"]);
  assert.deepEqual(project.nodes["stack-1"]?.children, ["text-1"]);

  expectFailure(
    executeStructureCommand(project, {
      index: 0,
      kind: "move",
      nodeId: "section-1",
      parent: {
        id: "stack-1",
        kind: "node",
      },
    }),
    "descendant-target",
    "Moving a node into one of its descendants should fail.",
  );
  assert.deepEqual(project.pages[0]?.rootIds, ["section-1"]);
  assert.deepEqual(project.nodes["section-1"]?.children, ["stack-1"]);

  expectFailure(
    executeStructureCommand(project, {
      kind: "insert",
      node: createNode("navbar-1", "navbar"),
      parent: {
        id: "section-1",
        kind: "node",
      },
    }),
    "invalid-child",
    "Inserting a root-only navbar into a section should fail.",
  );
  assert.equal(project.nodes["navbar-1"], undefined);

  const duplicateIdSequence = ["stack-copy", "text-copy"];
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
  assert.deepEqual(duplicateResult.createdNodeIds, ["stack-copy", "text-copy"]);
  assert.deepEqual(project.nodes["section-1"]?.children, ["stack-1", "stack-copy"]);
  assert.deepEqual(project.nodes["stack-copy"]?.children, ["text-copy"]);
  assert.equal(project.nodes["text-copy"]?.type, "text");

  const removeResult = expectSuccess(
    executeStructureCommand(project, {
      kind: "remove",
      nodeId: "stack-1",
    }),
    "Expected removing the original nested stack subtree to succeed.",
  );
  assert.deepEqual(removeResult.removedNodeIds, ["text-1", "stack-1"]);
  assert.deepEqual(project.nodes["section-1"]?.children, ["stack-copy"]);
  assert.equal(project.nodes["stack-1"], undefined);
  assert.equal(project.nodes["text-1"], undefined);

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
  invalidProject.pages[0]!.rootIds = ["button-root"];
  invalidProject.nodes["button-root"] = createNode("button-root", "button");
  invalidProject.nodes["orphan-text"] = createNode("orphan-text", "text");

  const invalidProjectResult = validateProject(invalidProject);
  assert.equal(invalidProjectResult.success, false, "Expected invalid structure to fail project validation.");

  const messages = invalidProjectResult.error.issues.map((issue) => issue.message);
  assert.ok(
    messages.some((message) => message.includes("invalid root button block")),
    "Expected validation to report invalid page-root placement.",
  );
  assert.ok(
    messages.some((message) => message.includes('Node "orphan-text" is not reachable')),
    "Expected validation to report orphan nodes.",
  );

  console.log("[verify:commands] Builder structure command verification passed.");
}

main();
