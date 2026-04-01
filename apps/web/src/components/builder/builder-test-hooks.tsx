"use client";

import { useEffect } from "react";

import { applyBuilderDragOperation, getNodeDropData, type BuilderActiveDragData, type BuilderOverDragData } from "@/lib/builder/dnd";
import { componentTypes, type ComponentType, type ParentReference } from "@/lib/builder/types";
import { useBuilderStore } from "@/lib/builder/store";
import { createBuilderVerificationSnapshot, type BuilderVerificationSnapshot } from "@/lib/builder/verification";

interface BuilderVerificationDragOptions {
  sourceSelector: string;
  sourceXFactor?: number;
  sourceYFactor?: number;
  steps?: number;
  targetSelector: string;
  targetXFactor?: number;
  targetYFactor?: number;
}

declare global {
  interface Window {
    __builderVerification?: {
      dragBetween: (options: BuilderVerificationDragOptions) => Promise<void>;
      getSnapshot: () => BuilderVerificationSnapshot;
    };
  }
}

function isComponentType(value: string): value is ComponentType {
  return componentTypes.includes(value as ComponentType);
}

function getActiveDragData(element: Element, project: ReturnType<typeof useBuilderStore.getState>["project"]): BuilderActiveDragData {
  const paletteType = element.getAttribute("data-builder-palette");
  if (paletteType) {
    if (!isComponentType(paletteType)) {
      throw new Error(`Unknown palette component type "${paletteType}".`);
    }

    return {
      componentType: paletteType,
      kind: "palette",
    };
  }

  const handleNodeId = element.getAttribute("data-builder-drag-handle");
  if (handleNodeId) {
    if (!project.nodes[handleNodeId]) {
      throw new Error(`Could not find source node "${handleNodeId}" for drag handle.`);
    }

    return {
      kind: "node",
      nodeId: handleNodeId,
    };
  }

  throw new Error("Drag source did not expose a supported builder drag attribute.");
}

function parseParentReference(value: string): ParentReference {
  const [kind, id] = value.split(":");

  if (!id || (kind !== "page" && kind !== "node")) {
    throw new Error(`Invalid builder drop target "${value}".`);
  }

  return {
    id,
    kind,
  };
}

function getOverDragData(element: Element, project: ReturnType<typeof useBuilderStore.getState>["project"]): BuilderOverDragData {
  const dropTarget = element.getAttribute("data-builder-drop-target");
  if (dropTarget) {
    return {
      kind: "container",
      parent: parseParentReference(dropTarget),
    };
  }

  const nodeId = element.getAttribute("data-builder-node");
  if (nodeId) {
    const nodeData = getNodeDropData(project, nodeId);
    if (!nodeData) {
      throw new Error(`Could not resolve reorder target for node "${nodeId}".`);
    }

    return nodeData;
  }

  throw new Error("Drag target did not expose a supported builder drop attribute.");
}

async function dragBetween({ sourceSelector, targetSelector }: BuilderVerificationDragOptions) {
  const source = document.querySelector(sourceSelector);
  const target = document.querySelector(targetSelector);

  if (!source) {
    throw new Error(`Could not find drag source for selector "${sourceSelector}".`);
  }

  if (!target) {
    throw new Error(`Could not find drag target for selector "${targetSelector}".`);
  }

  const state = useBuilderStore.getState();

  applyBuilderDragOperation({
    active: getActiveDragData(source, state.project),
    addNode: (type, parent, index) => state.addNode(type, parent, index),
    moveNode: (nodeId, parent, index) => state.moveNode(nodeId, parent, index),
    over: getOverDragData(target, state.project),
    project: state.project,
  });
}

export function BuilderTestHooks() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams.has("builder-test")) {
      return;
    }

    window.__builderVerification = {
      dragBetween,
      getSnapshot: () => {
        const state = useBuilderStore.getState();

        return createBuilderVerificationSnapshot({
          project: state.project,
          previewMode: state.previewMode,
          selectedNodeId: state.selectedNodeId,
          selectedPageId: state.selectedPageId,
        });
      },
    };

    return () => {
      delete window.__builderVerification;
    };
  }, []);

  return null;
}
