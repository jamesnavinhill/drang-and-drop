import type { BuilderProject, ComponentType, ParentReference } from "./types";
import { findParentReference, getParentChildren } from "./structure";

export type BuilderActiveDragData =
  | {
      componentType: ComponentType;
      kind: "palette";
    }
  | {
      kind: "node";
      nodeId: string;
    };

export type BuilderOverDragData =
  | {
      kind: "container";
      parent: ParentReference;
    }
  | {
      index: number;
      kind: "node";
      parent: ParentReference;
    };

function getChildren(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page") {
    return project.pages.find((page) => page.id === parent.id)?.rootIds ?? [];
  }

  return project.nodes[parent.id]?.children ?? [];
}

export function resolveBuilderDropTarget(
  project: BuilderProject,
  overData: BuilderOverDragData | undefined,
): { index: number; parent: ParentReference } | null {
  if (!overData) {
    return null;
  }

  if (overData.kind === "container") {
    return {
      index: getChildren(project, overData.parent).length,
      parent: overData.parent,
    };
  }

  if (overData.kind === "node") {
    return {
      index: overData.index,
      parent: overData.parent,
    };
  }

  return null;
}

export function applyBuilderDragOperation({
  active,
  addNode,
  moveNode,
  over,
  project,
}: {
  active: BuilderActiveDragData | undefined;
  addNode: (type: ComponentType, parent: ParentReference, index: number) => void;
  moveNode: (nodeId: string, parent: ParentReference, index: number) => void;
  over: BuilderOverDragData | undefined;
  project: BuilderProject;
}) {
  const target = resolveBuilderDropTarget(project, over);

  if (!active || !target) {
    return false;
  }

  if (active.kind === "palette") {
    addNode(active.componentType, target.parent, target.index);
    return true;
  }

  moveNode(active.nodeId, target.parent, target.index);
  return true;
}

export function getNodeDropData(project: BuilderProject, nodeId: string): BuilderOverDragData | null {
  const parent = findParentReference(project, nodeId);
  if (!parent) {
    return null;
  }

  const index = getParentChildren(project, parent).indexOf(nodeId);
  if (index < 0) {
    return null;
  }

  return {
    index,
    kind: "node",
    parent,
  };
}
