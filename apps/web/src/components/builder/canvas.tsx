"use client";

import {
  type DragEndEvent,
  DragOverlay,
  type DragOverEvent,
  type DragStartEvent,
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, LayoutTemplate, MousePointer2 } from "lucide-react";
import { useMemo, useState } from "react";

import { getBlockDefinition } from "@/lib/builder/block-definitions";
import {
  getBlockRegionAcceptedChildrenLabel,
  getBlockRegionDescription,
  getBlockRegionEmptyMessage,
  getBlockRegionLabel,
  getBlockRegions,
} from "@/lib/builder/block-placement";
import { getThemeStyles, renderNodePreview } from "@/lib/builder/block-preview";
import {
  applyBuilderDragOperation,
  evaluateBuilderDragOperation,
  type BuilderActiveDragData,
  type BuilderDragEvaluation,
  type BuilderOverDragData,
} from "@/lib/builder/dnd";
import {
  describeRegionReference,
  getPageRegionDescription,
  getPageRegionEmptyMessage,
  getPageRegionLabel,
} from "@/lib/builder/regions";
import { getNodeDisplayLabel } from "@/lib/builder/structure";
import { useBuilderStore } from "@/lib/builder/store";
import type { BuilderNode, BuilderProject, ParentReference } from "@/lib/builder/types";
import { pageRegionIds } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

type DragDescriptor =
  | {
      kind: "palette";
      title: string;
      description: string;
    }
  | {
      kind: "node";
      title: string;
      description: string;
    };

function sameParentReference(left: ParentReference | null | undefined, right: ParentReference | null | undefined) {
  if (!left || !right || left.kind !== right.kind || left.regionId !== right.regionId) {
    return false;
  }

  return left.kind === "page-region"
    ? left.pageId === right.pageId
    : left.nodeId === right.nodeId;
}

function toDropTargetValue(parent: ParentReference) {
  return parent.kind === "page-region"
    ? `page-region:${parent.pageId}:${parent.regionId}`
    : `node-region:${parent.nodeId}:${parent.regionId}`;
}

function describeDropMessage(
  project: BuilderProject,
  active: BuilderActiveDragData | null,
  evaluation: BuilderDragEvaluation,
  over: BuilderOverDragData | null,
) {
  if (!active) {
    return null;
  }

  if (!over || !evaluation.target) {
    return {
      message: "Move over a page region or block region to find a valid placement target.",
      tone: "info" as const,
    };
  }

  if (!evaluation.validation) {
    return null;
  }

  if (!evaluation.validation.ok) {
    return {
      message: evaluation.validation.message,
      tone: "error" as const,
    };
  }

  if (over.kind === "node") {
    const targetNode = project.nodes[over.nodeId];
    const targetLabel = targetNode
      ? `${getBlockDefinition(targetNode.type).title}: ${getNodeDisplayLabel(targetNode)}`
      : "this block";

    return {
      message:
        active.kind === "palette"
          ? `Release to add this block before ${targetLabel}.`
          : `Release to move this block before ${targetLabel}.`,
      tone: "info" as const,
    };
  }

  const parentLabel = describeRegionReference(project, evaluation.target.parent);

  return {
    message:
      active.kind === "palette"
        ? `Release to add this block inside ${parentLabel}.`
        : `Release to move this block into ${parentLabel}.`,
    tone: "info" as const,
  };
}

function EmptyRegionState({
  compact = false,
  message,
}: {
  compact?: boolean;
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/80 bg-white/55 text-muted",
        compact ? "px-3 py-3 text-sm leading-6" : "px-5 py-8 text-center",
      )}
    >
      {!compact ? <MousePointer2 className="mx-auto h-5 w-5" /> : null}
      <p className={compact ? "" : "mt-3"}>{message}</p>
    </div>
  );
}

function CanvasRegion({
  childIds,
  compact = false,
  description,
  dragEvaluation,
  emptyMessage,
  overDragData,
  parent,
  previewMode,
  project,
  acceptedChildrenLabel,
  selectedNodeId,
  title,
}: {
  childIds: string[];
  compact?: boolean;
  acceptedChildrenLabel?: string | null;
  description: string;
  dragEvaluation: BuilderDragEvaluation | null;
  emptyMessage: string;
  overDragData: BuilderOverDragData | null;
  parent: ParentReference;
  previewMode: "desktop" | "tablet" | "mobile";
  project: BuilderProject;
  selectedNodeId: string | null;
  title: string;
}) {
  const selectedRegionTarget = useBuilderStore((state) => state.selectedRegionTarget);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const { setNodeRef, isOver } = useDroppable({
    id: `region:${toDropTargetValue(parent)}`,
    data: {
      kind: "container",
      parent,
    },
  });
  const isContainerTarget = overDragData?.kind === "container" && sameParentReference(overDragData.parent, parent);
  const targetIsValid = dragEvaluation?.validation?.ok ?? false;
  const isSelectedRegion = sameParentReference(selectedRegionTarget, parent);

  return (
    <div
      ref={setNodeRef}
      data-builder-drop-target={toDropTargetValue(parent)}
      className={cn(
        "rounded-xl border transition-colors",
        compact ? "bg-white/52 p-3" : "bg-white/68 p-4",
        isSelectedRegion ? "border-accent shadow-[0_0_0_1px_rgba(15,118,110,0.12)]" : "border-border/80",
        (isOver || isContainerTarget) && targetIsValid && "ring-2 ring-accent/30",
        isContainerTarget && !targetIsValid && "border-orange-300 bg-orange-50/70 ring-2 ring-orange-200",
      )}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(null);
        selectRegionTarget(parent);
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
          {!compact ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-2">
          {acceptedChildrenLabel && !compact ? (
            <span className="rounded-md border border-border bg-white/80 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted">
              {acceptedChildrenLabel}
            </span>
          ) : null}
          <span className="rounded-md border border-border bg-white/80 px-2 py-1 text-[10px] text-muted">
            {childIds.length} item{childIds.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div className="grid gap-4">
          {childIds.length > 0 ? (
            childIds.map((childId, index) => {
              const childNode = project.nodes[childId];

              if (!childNode) {
                return null;
              }

              return (
                <CanvasNode
                  key={childId}
                  node={childNode}
                  index={index}
                  parent={parent}
                  previewMode={previewMode}
                  project={project}
                  selectedNodeId={selectedNodeId}
                  dragEvaluation={dragEvaluation}
                  overDragData={overDragData}
                />
              );
            })
          ) : (
            <EmptyRegionState compact={compact} message={emptyMessage} />
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasNode({
  node,
  index,
  parent,
  previewMode,
  project,
  selectedNodeId,
  dragEvaluation,
  overDragData,
}: {
  node: BuilderNode;
  index: number;
  parent: ParentReference;
  previewMode: "desktop" | "tablet" | "mobile";
  project: BuilderProject;
  selectedNodeId: string | null;
  dragEvaluation: BuilderDragEvaluation | null;
  overDragData: BuilderOverDragData | null;
}) {
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const definition = getBlockDefinition(node.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: {
      kind: "node",
      nodeId: node.id,
      parent,
      index,
      title: definition.title,
      description: definition.description,
    },
  });
  const isReorderTarget = overDragData?.kind === "node" && overDragData.nodeId === node.id;
  const targetIsValid = dragEvaluation?.validation?.ok ?? false;
  const renderedRegions = Object.fromEntries(
    getBlockRegions(node.type).map((region) => [
      region.id,
      <CanvasRegion
        key={`${node.id}-${region.id}`}
        childIds={node.regions[region.id] ?? []}
        compact
        description={getBlockRegionDescription(node.type, region.id)}
        dragEvaluation={dragEvaluation}
        emptyMessage={getBlockRegionEmptyMessage(node.type, region.id)}
        overDragData={overDragData}
        parent={{ kind: "node-region", nodeId: node.id, regionId: region.id }}
        previewMode={previewMode}
        project={project}
        acceptedChildrenLabel={getBlockRegionAcceptedChildrenLabel(node.type, region.id)}
        selectedNodeId={selectedNodeId}
        title={getBlockRegionLabel(node.type, region.id)}
      />,
    ]),
  );

  return (
    <div
      ref={setNodeRef}
      data-builder-node={node.id}
      data-builder-node-type={node.type}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-xl border bg-white/30 p-2 transition-shadow",
        selectedNodeId === node.id ? "border-accent shadow-[0_0_0_1px_rgba(15,118,110,0.14)]" : "border-transparent",
        isReorderTarget && targetIsValid && "ring-2 ring-accent/30",
        isReorderTarget && !targetIsValid && "border-orange-300 bg-orange-50/40 ring-2 ring-orange-200",
        isDragging && "z-10 shadow-xl",
      )}
      onClick={(event) => {
        event.stopPropagation();
        selectRegionTarget(null);
        selectNode(node.id);
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{definition.title}</p>
        <button
          type="button"
          data-builder-drag-handle={node.id}
          className="builder-pill inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-muted active:cursor-grabbing"
          aria-label={`Drag ${definition.title}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rounded-lg">{renderNodePreview(node, project, renderedRegions, previewMode)}</div>
    </div>
  );
}

export function BuilderCanvas() {
  const [activeDrag, setActiveDrag] = useState<DragDescriptor | null>(null);
  const [activeDragData, setActiveDragData] = useState<BuilderActiveDragData | null>(null);
  const [overDragData, setOverDragData] = useState<BuilderOverDragData | null>(null);
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const clearEditorNotice = useBuilderStore((state) => state.clearEditorNotice);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const page = project.pages.find((entry) => entry.id === selectedPageId) ?? project.pages[0];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const dragEvaluation = useMemo(
    () =>
      activeDragData
        ? evaluateBuilderDragOperation({
            active: activeDragData,
            over: overDragData ?? undefined,
            project,
          })
        : null,
    [activeDragData, overDragData, project],
  );
  const dragMessage = useMemo(
    () => describeDropMessage(project, activeDragData, dragEvaluation ?? { target: null, validation: null }, overDragData),
    [activeDragData, dragEvaluation, overDragData, project],
  );
  const totalRoots = pageRegionIds.reduce((total, regionId) => total + (page.regions[regionId]?.length ?? 0), 0);
  const widthClass =
    previewMode === "mobile"
      ? "max-w-sm"
      : previewMode === "tablet"
        ? "max-w-3xl"
        : "max-w-6xl";

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    clearEditorNotice();
    if (!data) {
      setActiveDrag(null);
      setActiveDragData(null);
      return;
    }

    if (data.kind === "palette") {
      setActiveDragData({
        blockType: data.blockType,
        kind: "palette",
      });
      setActiveDrag({
        kind: "palette",
        title: `${data.title}`,
        description: `${data.description}`,
      });
      return;
    }

    if (data.kind === "node") {
      setActiveDragData({
        kind: "node",
        nodeId: data.nodeId,
      });
      setActiveDrag({
        kind: "node",
        title: `${data.title}`,
        description: `${data.description}`,
      });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    setOverDragData((event.over?.data.current as BuilderOverDragData | undefined) ?? null);
  }

  function resetDragState() {
    setActiveDrag(null);
    setActiveDragData(null);
    setOverDragData(null);
  }

  function handleDragCancel() {
    resetDragState();
  }

  function handleDragEnd(event: DragEndEvent) {
    applyBuilderDragOperation({
      active: event.active.data.current as BuilderActiveDragData | undefined,
      addNode: (type, parent, index) => addNode(type, parent, index),
      moveNode: (nodeId, parent, index) => moveNode(nodeId, parent, index),
      over: event.over?.data.current as BuilderOverDragData | undefined,
      project,
    });

    resetDragState();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="builder-grid builder-scrollbar flex h-full flex-1 overflow-auto p-3 md:p-4">
        <div className={cn("mx-auto w-full transition-all duration-300", widthClass)}>
          {dragMessage ? (
            <div
              className={cn(
                "mb-3 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-6",
                dragMessage.tone === "error"
                  ? "border-orange-300 bg-orange-50 text-foreground"
                  : "border-border bg-white/80 text-muted",
              )}
            >
              <AlertCircle
                className={cn("mt-0.5 h-4 w-4 shrink-0", dragMessage.tone === "error" ? "text-orange-500" : "text-muted")}
              />
              <p>{dragMessage.message}</p>
            </div>
          ) : null}

          <div
            className="builder-theme min-h-[68vh] rounded-2xl p-4 md:p-5"
            style={getThemeStyles(project.theme)}
            onClick={() => {
              selectNode(null);
              selectRegionTarget(null);
            }}
          >
            <div className="grid gap-4">
              {pageRegionIds.map((regionId) => {
                const regionParent: ParentReference = {
                  kind: "page-region",
                  pageId: page.id,
                  regionId,
                };
                const regionChildIds = page.regions[regionId] ?? [];
                const isMain = regionId === "main";

                return (
                  <CanvasRegion
                    key={`${page.id}-${regionId}`}
                    childIds={regionChildIds}
                    compact={!isMain}
                    description={getPageRegionDescription(regionId)}
                    dragEvaluation={dragEvaluation}
                    emptyMessage={
                      isMain && totalRoots === 0
                        ? "Start with a section, hero, or grid. Drag blocks here to shape the page flow."
                        : getPageRegionEmptyMessage(regionId)
                  }
                    overDragData={overDragData}
                    parent={regionParent}
                    previewMode={previewMode}
                    project={project}
                    selectedNodeId={selectedNodeId}
                    title={getPageRegionLabel(regionId)}
                  />
                );
              })}

              {totalRoots === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-white/50 px-4 py-3 text-sm text-muted">
                  <LayoutTemplate className="h-4 w-4" />
                  The main region is the default drop target until you choose a different region.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDrag?.kind === "palette" ? (
          <div className="drag-overlay-card rounded-xl border border-border bg-white/96 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{activeDrag.kind}</p>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{activeDrag.title}</h3>
            <p className="mt-1 max-w-56 text-xs leading-5 text-muted">{activeDrag.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
