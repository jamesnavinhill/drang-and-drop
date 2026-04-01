"use client";

import {
  type DragEndEvent,
  DragOverlay,
  type DragOverEvent,
  type DragStartEvent,
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, MousePointer2, MoveDown } from "lucide-react";
import { useMemo, useState } from "react";

import { getComponentDefinition } from "@/lib/builder/component-definitions";
import { getComponentPlacement } from "@/lib/builder/component-placement";
import { getThemeStyles, renderNodePreview } from "@/lib/builder/component-preview";
import {
  applyBuilderDragOperation,
  evaluateBuilderDragOperation,
  type BuilderActiveDragData,
  type BuilderDragEvaluation,
  type BuilderOverDragData,
} from "@/lib/builder/dnd";
import { getNodeDisplayLabel } from "@/lib/builder/structure";
import { useBuilderStore } from "@/lib/builder/store";
import type { BuilderProject, BuilderNode, ParentReference } from "@/lib/builder/types";
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

function describeParentReference(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page") {
    const page = project.pages.find((entry) => entry.id === parent.id);
    return page ? `${page.name} page root` : "page root";
  }

  const node = project.nodes[parent.id];
  if (!node) {
    return "selected container";
  }

  return `${getComponentDefinition(node.type).title}: ${getNodeDisplayLabel(node)}`;
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
      message: "Move over the page root or a container to find a valid placement target.",
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
      ? `${getComponentDefinition(targetNode.type).title}: ${getNodeDisplayLabel(targetNode)}`
      : "this block";

    return {
      message:
        active.kind === "palette"
          ? `Release to add this block before ${targetLabel}.`
          : `Release to move this block before ${targetLabel}.`,
      tone: "info" as const,
    };
  }

  const parentLabel = describeParentReference(project, evaluation.target.parent);

  return {
    message:
      active.kind === "palette"
        ? `Release to add this block inside ${parentLabel}.`
        : `Release to move this block into ${parentLabel}.`,
    tone: "info" as const,
  };
}

function CanvasNode({
  node,
  index,
  parent,
  project,
  selectedNodeId,
  dragEvaluation,
  overDragData,
}: {
  node: BuilderNode;
  index: number;
  parent: ParentReference;
  project: BuilderProject;
  selectedNodeId: string | null;
  dragEvaluation: BuilderDragEvaluation | null;
  overDragData: BuilderOverDragData | null;
}) {
  const selectNode = useBuilderStore((state) => state.selectNode);
  const definition = getComponentDefinition(node.type);
  const placement = getComponentPlacement(node.type);
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
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `container:${node.id}`,
    data: {
      kind: "container",
      parent: {
        kind: "node",
        id: node.id,
      } satisfies ParentReference,
    },
    disabled: !placement.canHaveChildren,
  });
  const isContainerTarget =
    overDragData?.kind === "container" &&
    overDragData.parent.kind === "node" &&
    overDragData.parent.id === node.id;
  const isReorderTarget = overDragData?.kind === "node" && overDragData.nodeId === node.id;
  const isActiveTarget = isContainerTarget || isReorderTarget;
  const targetIsValid = dragEvaluation?.validation?.ok ?? false;

  const childNodes = node.children.map((childId, childIndex) => (
    <CanvasNode
      key={childId}
      node={project.nodes[childId]}
      index={childIndex}
      parent={{ kind: "node", id: node.id }}
      project={project}
      selectedNodeId={selectedNodeId}
      dragEvaluation={dragEvaluation}
      overDragData={overDragData}
    />
  ));

  const renderedChildren = placement.canHaveChildren ? (
    <div
      ref={setDropRef}
      data-builder-drop-target={`node:${node.id}`}
      data-builder-child-list={node.id}
      className={cn(
        "grid min-h-14 gap-4",
        node.children.length === 0 && "rounded-[18px] border border-dashed border-border/90 bg-white/45 p-4",
        (isOver || isContainerTarget) && targetIsValid && "ring-2 ring-accent/30",
        isContainerTarget && !targetIsValid && "ring-2 ring-orange-300 bg-orange-50/60",
      )}
    >
      <SortableContext items={node.children} strategy={verticalListSortingStrategy}>
        {childNodes.length > 0 ? (
          childNodes
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted">
            <MoveDown className="h-4 w-4" />
            Drop compatible blocks here
          </div>
        )}
      </SortableContext>
    </div>
  ) : null;

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
        "rounded-[28px] border bg-white/28 p-2 transition-shadow",
        selectedNodeId === node.id ? "border-accent shadow-[0_0_0_2px_rgba(15,118,110,0.12)]" : "border-transparent",
        isReorderTarget && targetIsValid && "ring-2 ring-accent/30",
        isActiveTarget && !targetIsValid && "border-orange-300 bg-orange-50/40 ring-2 ring-orange-200",
        isDragging && "opacity-50",
      )}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(node.id);
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3 rounded-[18px] bg-white/75 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{definition.category}</p>
          <p className="text-sm font-semibold text-foreground">{definition.title}</p>
        </div>
        <button
          type="button"
          data-builder-drag-handle={node.id}
          className="builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-muted"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3.5 w-3.5" />
          Drag
        </button>
      </div>

      <div className="rounded-[24px]">
        {renderNodePreview(node, project, renderedChildren)}
      </div>
    </div>
  );
}

function EmptyCanvasDrop({
  isInvalidTarget,
  isOver,
}: {
  isInvalidTarget: boolean;
  isOver: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-dashed border-border bg-white/55 p-10 text-center transition-colors",
        isOver && !isInvalidTarget && "border-accent bg-accent/8",
        isInvalidTarget && "border-orange-300 bg-orange-50/70",
      )}
    >
      <MousePointer2 className="mx-auto h-8 w-8 text-muted" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">Start with a section, hero, or grid</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Drag blocks from the left sidebar onto the page. Layout primitives can hold other blocks inside them.
      </p>
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
  const page = project.pages.find((entry) => entry.id === selectedPageId) ?? project.pages[0];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { setNodeRef: setPageDropRef, isOver } = useDroppable({
    id: `page:${page.id}`,
    data: {
      kind: "container",
      parent: {
        kind: "page",
        id: page.id,
      } satisfies ParentReference,
    },
  });
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
  const pageIsCurrentTarget =
    overDragData?.kind === "container" && overDragData.parent.kind === "page" && overDragData.parent.id === page.id;
  const pageTargetIsInvalid = pageIsCurrentTarget && Boolean(dragEvaluation?.validation && !dragEvaluation.validation.ok);

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
        componentType: data.componentType,
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
      <div className="builder-grid flex h-full flex-1 flex-col overflow-hidden rounded-[24px] border border-border/70 bg-white/38">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Canvas</p>
            <h2 className="text-sm font-semibold text-foreground">
              {page.name} <span className="text-muted">({page.path})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => selectNode(null)}
            data-builder-action="clear-selection"
            className="builder-pill rounded-full px-3 py-2 text-xs font-semibold text-muted"
          >
            Clear selection
          </button>
        </div>

        <div className="builder-scrollbar flex-1 overflow-auto p-4 md:p-6">
          <div className={cn("mx-auto transition-all duration-300", widthClass)}>
            <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted">
              <span>{previewMode} preview</span>
              <span>{page.rootIds.length} root block{page.rootIds.length === 1 ? "" : "s"}</span>
            </div>

            {dragMessage ? (
              <div
                className={cn(
                  "mb-3 flex items-start gap-3 rounded-[22px] border px-4 py-3 text-sm leading-6",
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
              ref={setPageDropRef}
              data-builder-drop-target={`page:${page.id}`}
              className={cn(
                "builder-theme min-h-[68vh] rounded-[34px] p-5 md:p-7",
                (isOver || pageIsCurrentTarget) && !pageTargetIsInvalid && "ring-2 ring-accent/25",
                pageTargetIsInvalid && "ring-2 ring-orange-300",
              )}
              style={getThemeStyles(project.theme)}
              onClick={() => selectNode(null)}
            >
              <SortableContext items={page.rootIds} strategy={verticalListSortingStrategy}>
                <div className="grid gap-5" data-builder-root-list={page.id}>
                  {page.rootIds.length === 0 ? (
                    <EmptyCanvasDrop isInvalidTarget={pageTargetIsInvalid} isOver={isOver || pageIsCurrentTarget} />
                  ) : (
                    page.rootIds.map((rootId, index) => (
                      <CanvasNode
                        key={rootId}
                        node={project.nodes[rootId]}
                        index={index}
                        parent={{ kind: "page", id: page.id }}
                        project={project}
                        selectedNodeId={selectedNodeId}
                        dragEvaluation={dragEvaluation}
                        overDragData={overDragData}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="drag-overlay-card rounded-[24px] border border-border bg-white/95 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{activeDrag.kind}</p>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{activeDrag.title}</h3>
            <p className="mt-1 max-w-56 text-xs leading-5 text-muted">{activeDrag.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
