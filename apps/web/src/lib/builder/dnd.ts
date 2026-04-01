import type { BlockType, BuilderProject, ParentReference } from "./types";
import {
  findParentReference,
  getParentChildren,
  validateBlockPlacement,
  validateNodePlacement,
  type BuilderPlacementResult,
} from "./structure";

export type BuilderActiveDragData =
  | {
      blockType: BlockType;
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
      nodeId: string;
      parent: ParentReference;
    };

export interface BuilderDragEvaluation {
  target: { index: number; parent: ParentReference } | null;
  validation: BuilderPlacementResult | null;
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
      index: getParentChildren(project, overData.parent).length,
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

export function evaluateBuilderDragOperation({
  active,
  over,
  project,
}: {
  active: BuilderActiveDragData | undefined;
  over: BuilderOverDragData | undefined;
  project: BuilderProject;
}): BuilderDragEvaluation {
  const target = resolveBuilderDropTarget(project, over);

  if (!active || !target) {
    return {
      target,
      validation: null,
    };
  }

  if (active.kind === "palette") {
    return {
      target,
      validation: validateBlockPlacement({
        childType: active.blockType,
        index: target.index,
        parent: target.parent,
        project,
      }),
    };
  }

  return {
    target,
    validation: validateNodePlacement({
      index: target.index,
      nodeId: active.nodeId,
      parent: target.parent,
      project,
    }),
  };
}

export function applyBuilderDragOperation({
  active,
  addNode,
  moveNode,
  over,
  project,
}: {
  active: BuilderActiveDragData | undefined;
  addNode: (type: BlockType, parent: ParentReference, index: number) => boolean;
  moveNode: (nodeId: string, parent: ParentReference, index: number) => boolean;
  over: BuilderOverDragData | undefined;
  project: BuilderProject;
}) {
  const target = resolveBuilderDropTarget(project, over);

  if (!active || !target) {
    return false;
  }

  if (active.kind === "palette") {
    return addNode(active.blockType, target.parent, target.index);
  }

  return moveNode(active.nodeId, target.parent, target.index);
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
    nodeId,
    parent,
  };
}
