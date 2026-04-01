import { getBlockDefinition } from "./block-definitions";
import {
  blockCanHaveChildren,
  canAcceptChild,
  describeAllowedRegionKinds,
  describePlacementTargetKind,
  getBlockRegionLabel,
  getBlockPlacement,
  getPlacementTargetKind,
} from "./block-placement";
import { describeRegionReference, getNodeRegionChildIds, getPageRegionChildIds, getPageRegionLabel, getPrimaryNodeRegionId } from "./regions";
import type { BlockType, BuilderNode, BuilderProject, PageRegionId, ParentReference } from "./types";

export type BuilderPlacementFailureReason =
  | "duplicate-node-id"
  | "missing-node"
  | "missing-parent"
  | "missing-region"
  | "self-target"
  | "descendant-target"
  | "invalid-child";

export type BuilderPlacementResult =
  | {
      ok: true;
      index: number;
      parent: ParentReference;
    }
  | {
      ok: false;
      reason: BuilderPlacementFailureReason;
      message: string;
    };

export type BuilderStructureCommand =
  | {
      kind: "insert";
      index?: number;
      node: BuilderNode;
      parent: ParentReference;
    }
  | {
      createNodeId: () => string;
      kind: "duplicate";
      nodeId: string;
    }
  | {
      kind: "move";
      index: number;
      nodeId: string;
      parent: ParentReference;
    }
  | {
      kind: "remove";
      nodeId: string;
    };

export type BuilderStructureCommandResult =
  | {
      createdNodeIds?: string[];
      ok: true;
      index: number;
      nodeId: string;
      parent: ParentReference;
      previousIndex?: number;
      previousParent?: ParentReference;
      removedNodeIds?: string[];
    }
  | {
      ok: false;
      reason: BuilderPlacementFailureReason;
      message: string;
    };

export interface BuilderStructureIssue {
  code:
    | "cycle"
    | "duplicate-parent"
    | "invalid-node-key"
    | "invalid-placement"
    | "missing-node-reference"
    | "missing-region"
    | "orphan-node";
  message: string;
  path: Array<number | string>;
}

const labelKeys = [
  "title",
  "label",
  "logo",
  "tier",
  "author",
  "eyebrow",
  "ctaLabel",
  "primaryLabel",
  "buttonLabel",
] as const;

function trimSnippet(value: string, maxLength = 56) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

export function findParentReference(project: BuilderProject, nodeId: string): ParentReference | null {
  for (const page of project.pages) {
    for (const regionId of Object.keys(page.regions) as PageRegionId[]) {
      if (getPageRegionChildIds(page, regionId).includes(nodeId)) {
        return { kind: "page-region", pageId: page.id, regionId };
      }
    }
  }

  for (const node of Object.values(project.nodes)) {
    for (const [regionId, childIds] of Object.entries(node.regions)) {
      if (childIds.includes(nodeId)) {
        return { kind: "node-region", nodeId: node.id, regionId };
      }
    }
  }

  return null;
}

function hasParentReference(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === parent.pageId);
    return Boolean(page && parent.regionId in page.regions);
  }

  const node = project.nodes[parent.nodeId ?? ""];
  return Boolean(node && parent.regionId in node.regions);
}

export function getParentChildren(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === parent.pageId);
    return page ? getPageRegionChildIds(page, parent.regionId as PageRegionId) : [];
  }

  const node = project.nodes[parent.nodeId ?? ""];
  return node ? getNodeRegionChildIds(node, parent.regionId) : [];
}

export function getParentType(project: BuilderProject, parent: ParentReference): BlockType | "page" | null {
  if (parent.kind === "page-region") {
    return project.pages.some((page) => page.id === parent.pageId) ? "page" : null;
  }

  return project.nodes[parent.nodeId ?? ""]?.type ?? null;
}

export function getPlacementTarget(project: BuilderProject, parent: ParentReference) {
  const kind = getPlacementTargetKind(project, parent);
  if (!kind) {
    return null;
  }

  return {
    kind,
    parent,
  };
}

function getPlacementFailureMessage(
  project: BuilderProject,
  childType: BlockType,
  parent: ParentReference,
  attemptedTargetKind: NonNullable<ReturnType<typeof getPlacementTargetKind>>,
) {
  const parentLabel = describeRegionReference(project, parent);
  const allowedTargets = describeAllowedRegionKinds(getBlockPlacement(childType).allowedRegions);
  const attemptedTarget = describePlacementTargetKind(attemptedTargetKind);

  return `A ${childType} block can only be placed in ${allowedTargets}, not in ${attemptedTarget} under ${parentLabel}.`;
}

function setParentChildren(project: BuilderProject, parent: ParentReference, nextChildren: string[]) {
  if (parent.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === parent.pageId);
    if (page) {
      page.regions[parent.regionId as PageRegionId] = nextChildren;
    }
    return;
  }

  const node = project.nodes[parent.nodeId ?? ""];
  if (node) {
    node.regions[parent.regionId] = nextChildren;
  }
}

function insertChildReference(project: BuilderProject, parent: ParentReference, nodeId: string, index?: number) {
  const children = [...getParentChildren(project, parent)];
  const safeIndex = index === undefined ? children.length : Math.max(0, Math.min(index, children.length));
  children.splice(safeIndex, 0, nodeId);
  setParentChildren(project, parent, children);
  return safeIndex;
}

function removeChildReference(project: BuilderProject, nodeId: string) {
  const parent = findParentReference(project, nodeId);
  if (!parent) {
    return null;
  }

  const children = [...getParentChildren(project, parent)];
  const index = children.indexOf(nodeId);
  if (index < 0) {
    return null;
  }

  children.splice(index, 1);
  setParentChildren(project, parent, children);

  return { index, parent };
}

function createUniqueNodeId(project: BuilderProject, createNodeId: () => string) {
  let nextId = createNodeId();

  while (project.nodes[nextId]) {
    nextId = createNodeId();
  }

  return nextId;
}

export function cloneNodeSubtree(
  project: BuilderProject,
  nodeId: string,
  createNodeId: () => string,
): { createdNodeIds: string[]; rootId: string } | null {
  const source = project.nodes[nodeId];
  if (!source) {
    return null;
  }

  const nextId = createUniqueNodeId(project, createNodeId);
  const nextRegions = Object.fromEntries(
    Object.keys(source.regions).map((regionId) => [regionId, [] as string[]]),
  ) as Record<string, string[]>;
  const createdNodeIds = [nextId];

  for (const [regionId, childIds] of Object.entries(source.regions)) {
    for (const childId of childIds) {
      const childClone = cloneNodeSubtree(project, childId, createNodeId);
      if (!childClone) {
        return null;
      }

      nextRegions[regionId].push(childClone.rootId);
      createdNodeIds.push(...childClone.createdNodeIds);
    }
  }

  project.nodes[nextId] = {
    ...structuredClone(source),
    id: nextId,
    regions: nextRegions,
  };

  return {
    createdNodeIds,
    rootId: nextId,
  };
}

export function deleteNodeSubtree(project: BuilderProject, nodeId: string): string[] {
  const node = project.nodes[nodeId];
  if (!node) {
    return [];
  }

  const removedNodeIds: string[] = [];

  for (const childIds of Object.values(node.regions)) {
    for (const childId of childIds) {
      removedNodeIds.push(...deleteNodeSubtree(project, childId));
    }
  }

  delete project.nodes[nodeId];
  removedNodeIds.push(nodeId);

  return removedNodeIds;
}

export function isDescendantNode(project: BuilderProject, ancestorId: string, potentialDescendantId: string): boolean {
  const visited = new Set<string>();

  function visit(nodeId: string): boolean {
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);

    const node = project.nodes[nodeId];
    if (!node) {
      return false;
    }

    for (const childIds of Object.values(node.regions)) {
      for (const childId of childIds) {
        if (childId === potentialDescendantId || visit(childId)) {
          return true;
        }
      }
    }

    return false;
  }

  return visit(ancestorId);
}

export function validateBlockPlacement({
  childType,
  index,
  parent,
  project,
}: {
  childType: BlockType;
  index?: number;
  parent: ParentReference;
  project: BuilderProject;
}): BuilderPlacementResult {
  if (!hasParentReference(project, parent)) {
    return {
      ok: false,
      reason: "missing-parent",
      message: "The requested parent target does not exist.",
    };
  }

  const targetKind = getPlacementTargetKind(project, parent);
  if (!targetKind) {
    return {
      ok: false,
      reason: "missing-region",
      message: "The requested destination region does not exist.",
    };
  }

  if (!canAcceptChild(targetKind, childType)) {
    return {
      ok: false,
      reason: "invalid-child",
      message: getPlacementFailureMessage(project, childType, parent, targetKind),
    };
  }

  return {
    ok: true,
    index:
      index === undefined
        ? getParentChildren(project, parent).length
        : Math.max(0, Math.min(index, getParentChildren(project, parent).length)),
    parent,
  };
}

export function validateNodePlacement({
  index,
  nodeId,
  parent,
  project,
}: {
  index?: number;
  nodeId: string;
  parent: ParentReference;
  project: BuilderProject;
}): BuilderPlacementResult {
  const node = project.nodes[nodeId];
  if (!node) {
    return {
      ok: false,
      reason: "missing-node",
      message: "The requested node does not exist.",
    };
  }

  if (parent.kind === "node-region" && parent.nodeId === nodeId) {
    return {
      ok: false,
      reason: "self-target",
      message: "A node cannot be inserted into itself.",
    };
  }

  if (parent.kind === "node-region" && isDescendantNode(project, nodeId, parent.nodeId ?? "")) {
    return {
      ok: false,
      reason: "descendant-target",
      message: "A node cannot be inserted into one of its descendants.",
    };
  }

  return validateBlockPlacement({
    childType: node.type,
    index,
    parent,
    project,
  });
}

export function executeStructureCommand(
  project: BuilderProject,
  command: BuilderStructureCommand,
): BuilderStructureCommandResult {
  switch (command.kind) {
    case "insert": {
      if (project.nodes[command.node.id]) {
        return {
          ok: false,
          reason: "duplicate-node-id",
          message: `The node id "${command.node.id}" already exists in the project.`,
        };
      }

      const placement = validateBlockPlacement({
        childType: command.node.type,
        index: command.index,
        parent: command.parent,
        project,
      });
      if (!placement.ok) {
        return placement;
      }

      project.nodes[command.node.id] = command.node;
      const insertedIndex = insertChildReference(project, placement.parent, command.node.id, placement.index);

      return {
        ok: true,
        index: insertedIndex,
        nodeId: command.node.id,
        parent: placement.parent,
      };
    }

    case "move": {
      const placement = validateNodePlacement({
        index: command.index,
        nodeId: command.nodeId,
        parent: command.parent,
        project,
      });
      if (!placement.ok) {
        return placement;
      }

      const previous = removeChildReference(project, command.nodeId);
      if (!previous) {
        return {
          ok: false,
          reason: "missing-parent",
          message: "The requested node is not attached to any current parent.",
        };
      }

      let targetIndex = placement.index;
      if (
        previous.parent.kind === placement.parent.kind &&
        previous.parent.regionId === placement.parent.regionId &&
        previous.parent.pageId === placement.parent.pageId &&
        previous.parent.nodeId === placement.parent.nodeId &&
        previous.index < placement.index
      ) {
        targetIndex = placement.index - 1;
      }

      const insertedIndex = insertChildReference(project, placement.parent, command.nodeId, targetIndex);

      return {
        ok: true,
        index: insertedIndex,
        nodeId: command.nodeId,
        parent: placement.parent,
        previousIndex: previous.index,
        previousParent: previous.parent,
      };
    }

    case "duplicate": {
      const source = project.nodes[command.nodeId];
      if (!source) {
        return {
          ok: false,
          reason: "missing-node",
          message: "The requested node does not exist.",
        };
      }

      const parent = findParentReference(project, command.nodeId);
      if (!parent) {
        return {
          ok: false,
          reason: "missing-parent",
          message: "The requested node is not attached to any current parent.",
        };
      }

      const siblingIds = getParentChildren(project, parent);
      const currentIndex = siblingIds.indexOf(command.nodeId);
      const clone = cloneNodeSubtree(project, command.nodeId, command.createNodeId);
      if (!clone) {
        return {
          ok: false,
          reason: "missing-node",
          message: "The requested node subtree could not be cloned cleanly.",
        };
      }

      const placement = validateBlockPlacement({
        childType: source.type,
        index: currentIndex + 1,
        parent,
        project,
      });
      if (!placement.ok) {
        clone.createdNodeIds.forEach((createdNodeId) => {
          delete project.nodes[createdNodeId];
        });
        return placement;
      }

      const insertedIndex = insertChildReference(project, parent, clone.rootId, currentIndex + 1);

      return {
        ok: true,
        createdNodeIds: clone.createdNodeIds,
        index: insertedIndex,
        nodeId: clone.rootId,
        parent,
        previousIndex: currentIndex,
        previousParent: parent,
      };
    }

    case "remove": {
      const node = project.nodes[command.nodeId];
      if (!node) {
        return {
          ok: false,
          reason: "missing-node",
          message: "The requested node does not exist.",
        };
      }

      const previous = removeChildReference(project, command.nodeId);
      if (!previous) {
        return {
          ok: false,
          reason: "missing-parent",
          message: "The requested node is not attached to any current parent.",
        };
      }

      const removedNodeIds = deleteNodeSubtree(project, node.id);

      return {
        ok: true,
        index: previous.index,
        nodeId: node.id,
        parent: previous.parent,
        previousIndex: previous.index,
        previousParent: previous.parent,
        removedNodeIds,
      };
    }
  }
}

export function collectProjectStructureIssues(project: BuilderProject): BuilderStructureIssue[] {
  const issues = new Map<string, BuilderStructureIssue>();
  const parentReferences = new Map<string, ParentReference[]>();

  function addIssue(issue: BuilderStructureIssue, key = `${issue.code}:${issue.path.join(".")}:${issue.message}`) {
    if (!issues.has(key)) {
      issues.set(key, issue);
    }
  }

  function trackParent(nodeId: string, parent: ParentReference) {
    const parents = parentReferences.get(nodeId) ?? [];
    parents.push(parent);
    parentReferences.set(nodeId, parents);
  }

  for (const [nodeKey, node] of Object.entries(project.nodes)) {
    if (node.id !== nodeKey) {
      addIssue({
        code: "invalid-node-key",
        message: `Node record key "${nodeKey}" does not match node.id "${node.id}".`,
        path: ["nodes", nodeKey, "id"],
      });
    }
  }

  project.pages.forEach((page, pageIndex) => {
    for (const regionId of Object.keys(page.regions) as PageRegionId[]) {
      page.regions[regionId].forEach((rootId, rootIndex) => {
        const rootNode = project.nodes[rootId];
        const path = ["pages", pageIndex, "regions", regionId, rootIndex] satisfies Array<number | string>;

        if (!rootNode) {
          addIssue({
            code: "missing-node-reference",
            message: `Page "${page.name}" references missing node "${rootId}".`,
            path,
          });
          return;
        }

        const parent: ParentReference = { kind: "page-region", pageId: page.id, regionId };
        trackParent(rootId, parent);

        const placement = validateBlockPlacement({
          childType: rootNode.type,
          index: rootIndex,
          parent,
          project,
        });

        if (!placement.ok) {
          addIssue({
            code: "invalid-placement",
            message: `Page "${page.name}" contains an invalid ${regionId} ${rootNode.type} block.`,
            path,
          });
        }
      });
    }
  });

  Object.values(project.nodes).forEach((node) => {
    for (const region of Object.keys(node.regions)) {
      const childIds = node.regions[region] ?? [];

      childIds.forEach((childId, childIndex) => {
        const childNode = project.nodes[childId];
        const path = ["nodes", node.id, "regions", region, childIndex] satisfies Array<number | string>;

        if (!childNode) {
          addIssue({
            code: "missing-node-reference",
            message: `Node "${node.id}" references missing child "${childId}".`,
            path,
          });
          return;
        }

        const parent: ParentReference = { kind: "node-region", nodeId: node.id, regionId: region };
        trackParent(childId, parent);

        const placement = validateBlockPlacement({
          childType: childNode.type,
          index: childIndex,
          parent,
          project,
        });

        if (!placement.ok) {
          addIssue({
            code: "invalid-placement",
            message: `A ${childNode.type} block cannot be nested inside ${node.type} ${region}.`,
            path,
          });
        }
      });
    }
  });

  Object.keys(project.nodes).forEach((nodeId) => {
    const parents = parentReferences.get(nodeId) ?? [];

    if (parents.length === 0) {
      addIssue({
        code: "orphan-node",
        message: `Node "${nodeId}" is not reachable from any page region.`,
        path: ["nodes", nodeId],
      });
    }

    if (parents.length > 1) {
      addIssue(
        {
          code: "duplicate-parent",
          message: `Node "${nodeId}" is attached to multiple parents.`,
          path: ["nodes", nodeId],
        },
        `duplicate-parent:${nodeId}`,
      );
    }
  });

  const visitState = new Map<string, "visiting" | "visited">();

  function visit(nodeId: string, path: string[]) {
    const currentState = visitState.get(nodeId);
    if (currentState === "visiting") {
      addIssue(
        {
          code: "cycle",
          message: `Node cycle detected through "${nodeId}".`,
          path: ["nodes", nodeId, "regions"],
        },
        `cycle:${[...path, nodeId].join("->")}`,
      );
      return;
    }

    if (currentState === "visited") {
      return;
    }

    visitState.set(nodeId, "visiting");

    const node = project.nodes[nodeId];
    if (node) {
      for (const childIds of Object.values(node.regions)) {
        childIds.forEach((childId) => {
          if (project.nodes[childId]) {
            visit(childId, [...path, nodeId]);
          }
        });
      }
    }

    visitState.set(nodeId, "visited");
  }

  project.pages.forEach((page) => {
    (Object.keys(page.regions) as PageRegionId[]).forEach((regionId) => {
      page.regions[regionId].forEach((rootId) => {
        if (project.nodes[rootId]) {
          visit(rootId, []);
        }
      });
    });
  });

  Object.keys(project.nodes).forEach((nodeId) => {
    if (!visitState.has(nodeId)) {
      visit(nodeId, []);
    }
  });

  return [...issues.values()];
}

export function countSubtreeNodes(project: BuilderProject, nodeId: string): number {
  const node = project.nodes[nodeId];
  if (!node) {
    return 0;
  }

  return (
    1 +
    Object.values(node.regions).reduce(
      (total, childIds) => total + childIds.reduce((subtotal, childId) => subtotal + countSubtreeNodes(project, childId), 0),
      0,
    )
  );
}

export function countPageNodes(project: BuilderProject, pageId: string): number {
  const page = project.pages.find((entry) => entry.id === pageId);
  if (!page) {
    return 0;
  }

  return (Object.keys(page.regions) as PageRegionId[]).reduce(
    (total, regionId) =>
      total + page.regions[regionId].reduce((subtotal, rootId) => subtotal + countSubtreeNodes(project, rootId), 0),
    0,
  );
}

export function getNodeDisplayLabel(node: BuilderNode) {
  for (const key of labelKeys) {
    const value = node.props[key];

    if (typeof value === "string" && value.trim()) {
      return trimSnippet(value);
    }
  }

  if (typeof node.props.quote === "string" && node.props.quote.trim()) {
    return trimSnippet(node.props.quote);
  }

  if (typeof node.props.body === "string" && node.props.body.trim()) {
    return trimSnippet(node.props.body);
  }

  return getBlockDefinition(node.type).title;
}

export function getNodeHierarchyDepth(project: BuilderProject, nodeId: string) {
  let depth = 0;
  let parent = findParentReference(project, nodeId);

  while (parent?.kind === "node-region") {
    depth += 1;
    parent = findParentReference(project, parent.nodeId ?? "");
  }

  return depth;
}

export function getNodeSiblingPosition(project: BuilderProject, nodeId: string) {
  const parent = findParentReference(project, nodeId);
  if (!parent) {
    return null;
  }

  const siblingIds = getParentChildren(project, parent);
  const index = siblingIds.indexOf(nodeId);
  if (index < 0) {
    return null;
  }

  return {
    index,
    parent,
    siblingCount: siblingIds.length,
  };
}

export function getInsertionTarget(
  project: BuilderProject,
  selectedPageId: string,
  selectedNodeId: string | null,
  selectedRegionTarget: ParentReference | null,
): ParentReference {
  if (selectedNodeId) {
    const selectedNode = project.nodes[selectedNodeId];
    if (!selectedNode) {
      return { kind: "page-region", pageId: selectedPageId, regionId: "main" };
    }

    if (blockCanHaveChildren(selectedNode.type)) {
      const primaryRegionId = getPrimaryNodeRegionId(selectedNode.type);
      if (primaryRegionId) {
        return { kind: "node-region", nodeId: selectedNodeId, regionId: primaryRegionId };
      }
    }

    return findParentReference(project, selectedNodeId) ?? { kind: "page-region", pageId: selectedPageId, regionId: "main" };
  }

  if (selectedRegionTarget && hasParentReference(project, selectedRegionTarget)) {
    return selectedRegionTarget;
  }

  return { kind: "page-region", pageId: selectedPageId, regionId: "main" };
}

export function describeInsertionTarget(
  project: BuilderProject,
  selectedPageId: string,
  selectedNodeId: string | null,
  selectedRegionTarget: ParentReference | null,
) {
  const target = getInsertionTarget(project, selectedPageId, selectedNodeId, selectedRegionTarget);

  if (target.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === target.pageId);
    const regionLabel = getPageRegionLabel(target.regionId as PageRegionId);

    return {
      target,
      label: page ? `${page.name} ${regionLabel}` : regionLabel,
      kind: "page-region" as const,
    };
  }

  const node = project.nodes[target.nodeId ?? ""];
  const definition = node ? getBlockDefinition(node.type) : null;
  const regionLabel = node ? getBlockRegionLabel(node.type, target.regionId) : target.regionId;

  return {
    target,
    label: node && definition ? `${definition.title}: ${getNodeDisplayLabel(node)} / ${regionLabel}` : "Selected region",
    kind: "node-region" as const,
  };
}
