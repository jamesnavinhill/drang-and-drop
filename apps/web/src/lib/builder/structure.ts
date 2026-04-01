import { getComponentDefinition } from "./registry";
import type { BuilderNode, BuilderProject, ParentReference } from "./types";

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
    if (page.rootIds.includes(nodeId)) {
      return { kind: "page", id: page.id };
    }
  }

  for (const node of Object.values(project.nodes)) {
    if (node.children.includes(nodeId)) {
      return { kind: "node", id: node.id };
    }
  }

  return null;
}

export function getParentChildren(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page") {
    return project.pages.find((page) => page.id === parent.id)?.rootIds ?? [];
  }

  return project.nodes[parent.id]?.children ?? [];
}

export function countSubtreeNodes(project: BuilderProject, nodeId: string): number {
  const node = project.nodes[nodeId];
  if (!node) {
    return 0;
  }

  return 1 + node.children.reduce((total, childId) => total + countSubtreeNodes(project, childId), 0);
}

export function countPageNodes(project: BuilderProject, pageId: string): number {
  const page = project.pages.find((entry) => entry.id === pageId);
  if (!page) {
    return 0;
  }

  return page.rootIds.reduce((total, rootId) => total + countSubtreeNodes(project, rootId), 0);
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

  return getComponentDefinition(node.type).title;
}

export function getNodeHierarchyDepth(project: BuilderProject, nodeId: string) {
  let depth = 0;
  let parent = findParentReference(project, nodeId);

  while (parent?.kind === "node") {
    depth += 1;
    parent = findParentReference(project, parent.id);
  }

  return depth;
}

export function getInsertionTarget(
  project: BuilderProject,
  selectedPageId: string,
  selectedNodeId: string | null,
): ParentReference {
  if (!selectedNodeId) {
    return { kind: "page", id: selectedPageId };
  }

  const selectedNode = project.nodes[selectedNodeId];
  if (!selectedNode) {
    return { kind: "page", id: selectedPageId };
  }

  const definition = getComponentDefinition(selectedNode.type);
  if (definition.canHaveChildren) {
    return { kind: "node", id: selectedNodeId };
  }

  return findParentReference(project, selectedNodeId) ?? { kind: "page", id: selectedPageId };
}

export function describeInsertionTarget(
  project: BuilderProject,
  selectedPageId: string,
  selectedNodeId: string | null,
) {
  const target = getInsertionTarget(project, selectedPageId, selectedNodeId);

  if (target.kind === "page") {
    const page = project.pages.find((entry) => entry.id === target.id);

    return {
      target,
      label: page ? `${page.name} page root` : "Page root",
      kind: "page" as const,
    };
  }

  const node = project.nodes[target.id];
  const definition = node ? getComponentDefinition(node.type) : null;

  return {
    target,
    label: node && definition ? `${definition.title}: ${getNodeDisplayLabel(node)}` : "Selected container",
    kind: "node" as const,
  };
}
