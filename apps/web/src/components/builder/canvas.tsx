"use client";

import {
  type DragEndEvent,
  DragOverlay,
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
import { GripVertical, MousePointer2, MoveDown } from "lucide-react";
import { useState } from "react";

import { getComponentDefinition, getThemeStyles, renderNodePreview } from "@/lib/builder/registry";
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

function getChildren(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page") {
    return project.pages.find((page) => page.id === parent.id)?.rootIds ?? [];
  }

  return project.nodes[parent.id]?.children ?? [];
}

function CanvasNode({
  node,
  index,
  parent,
  project,
  selectedNodeId,
}: {
  node: BuilderNode;
  index: number;
  parent: ParentReference;
  project: BuilderProject;
  selectedNodeId: string | null;
}) {
  const selectNode = useBuilderStore((state) => state.selectNode);
  const definition = getComponentDefinition(node.type);
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
    disabled: !definition.canHaveChildren,
  });

  const childNodes = node.children.map((childId, childIndex) => (
    <CanvasNode
      key={childId}
      node={project.nodes[childId]}
      index={childIndex}
      parent={{ kind: "node", id: node.id }}
      project={project}
      selectedNodeId={selectedNodeId}
    />
  ));

  const renderedChildren = definition.canHaveChildren ? (
    <div
      ref={setDropRef}
      className={cn(
        "grid min-h-14 gap-4",
        node.children.length === 0 && "rounded-[18px] border border-dashed border-border/90 bg-white/45 p-4",
        isOver && "ring-2 ring-accent/30",
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
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-[28px] border bg-white/28 p-2 transition-shadow",
        selectedNodeId === node.id ? "border-accent shadow-[0_0_0_2px_rgba(15,118,110,0.12)]" : "border-transparent",
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

function EmptyCanvasDrop({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-dashed border-border bg-white/55 p-10 text-center transition-colors",
        isOver && "border-accent bg-accent/8",
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
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
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

  const widthClass =
    previewMode === "mobile"
      ? "max-w-sm"
      : previewMode === "tablet"
        ? "max-w-3xl"
        : "max-w-6xl";

  function resolveDropTarget(
    overData: Record<string, unknown> | undefined,
  ): { parent: ParentReference; index: number } | null {
    if (!overData) {
      return null;
    }

    if (overData.kind === "container") {
      const parent = overData.parent as ParentReference;
      return {
        parent,
        index: getChildren(project, parent).length,
      };
    }

    if (overData.kind === "node") {
      return {
        parent: overData.parent as ParentReference,
        index: overData.index as number,
      };
    }

    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (!data) {
      setActiveDrag(null);
      return;
    }

    if (data.kind === "palette") {
      setActiveDrag({
        kind: "palette",
        title: `${data.title}`,
        description: `${data.description}`,
      });
      return;
    }

    if (data.kind === "node") {
      setActiveDrag({
        kind: "node",
        title: `${data.title}`,
        description: `${data.description}`,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = event.active.data.current;
    const over = event.over?.data.current;
    const target = resolveDropTarget(over as Record<string, unknown> | undefined);

    setActiveDrag(null);

    if (!active || !target) {
      return;
    }

    if (active.kind === "palette") {
      addNode(active.componentType, target.parent, target.index);
      return;
    }

    if (active.kind === "node") {
      moveNode(active.nodeId, target.parent, target.index);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

            <div
              ref={setPageDropRef}
              className={cn("builder-theme min-h-[68vh] rounded-[34px] p-5 md:p-7", isOver && "ring-2 ring-accent/25")}
              style={getThemeStyles(project.theme)}
              onClick={() => selectNode(null)}
            >
              <SortableContext items={page.rootIds} strategy={verticalListSortingStrategy}>
                <div className="grid gap-5">
                  {page.rootIds.length === 0 ? (
                    <EmptyCanvasDrop isOver={isOver} />
                  ) : (
                    page.rootIds.map((rootId, index) => (
                      <CanvasNode
                        key={rootId}
                        node={project.nodes[rootId]}
                        index={index}
                        parent={{ kind: "page", id: page.id }}
                        project={project}
                        selectedNodeId={selectedNodeId}
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
