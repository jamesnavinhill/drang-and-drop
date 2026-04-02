"use client";

import {
  closestCorners,
  pointerWithin,
  type Collision,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Download,
  Files,
  MessageSquare,
  Laptop,
  Redo2,
  RotateCcw,
  Settings2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { exportProjectZip } from "@/lib/builder/export";
import type { AssistantMode } from "@/lib/ai/types";
import { getBlockDefinition } from "@/lib/builder/block-definitions";
import {
  applyBuilderDragOperation,
  evaluateBuilderDragOperation,
  getNodeDropData,
  type BuilderActiveDragData,
  type BuilderOverDragData,
} from "@/lib/builder/dnd";
import { describeRegionReference } from "@/lib/builder/regions";
import { getNodeDisplayLabel } from "@/lib/builder/structure";
import type { ParentReference } from "@/lib/builder/types";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

import { AssistantPanel } from "./assistant-panel";
import { BuilderCanvas, type BuilderCanvasDragMessage } from "./canvas";
import { BuilderTestHooks } from "./builder-test-hooks";
import { EditorNoticeBanner } from "./editor-notice-banner";
import { InspectorPanel } from "./inspector-panel";
import { LibraryPanel } from "./library-panel";
import { PagePanel } from "./page-panel";
import { SettingsPanel } from "./settings-panel";

type SidebarTab = "pages" | "library" | "assistant" | "settings";

const previewModes = [
  { value: "desktop", label: "Desktop", icon: Laptop },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
] as const;

const sidebarTabs = [
  { value: "pages", label: "Pages", icon: Files },
  { value: "library", label: "Library", icon: Blocks },
  { value: "assistant", label: "Assistant", icon: MessageSquare },
  { value: "settings", label: "Settings", icon: Settings2 },
] as const satisfies ReadonlyArray<{
  value: SidebarTab;
  label: string;
  icon: typeof Files;
}>;

function SidebarTabButton({
  active,
  collapsed = false,
  icon: Icon,
  label,
  onClick,
  value,
}: {
  active: boolean;
  collapsed?: boolean;
  icon: typeof Files;
  label: string;
  onClick: () => void;
  value: SidebarTab;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-builder-sidebar-tab={value}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
        collapsed && "justify-center px-2.5",
        active ? "bg-accent text-accent-contrast" : "text-muted hover:bg-black/[0.04] hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {!collapsed ? label : null}
    </button>
  );
}

interface BuilderDragOverlayCard {
  description: string;
  title: string;
}

function getCollisionDepth(collision: Collision) {
  const element = collision.data?.droppableContainer?.node.current;

  if (!element) {
    return 0;
  }

  let depth = 0;
  let current: HTMLElement | null = element;

  while (current) {
    depth += 1;
    current = current.parentElement;
  }

  return depth;
}

function getCollisionKind(collision: Collision) {
  const kind = collision.data?.droppableContainer?.data.current?.kind;
  return typeof kind === "string" ? kind : null;
}

const builderCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const candidates = collisions.length > 0 ? collisions : closestCorners(args);

  return [...candidates].sort((left, right) => {
    const depthDifference = getCollisionDepth(right) - getCollisionDepth(left);

    if (depthDifference !== 0) {
      return depthDifference;
    }

    const containerDifference =
      Number(getCollisionKind(right) === "container") - Number(getCollisionKind(left) === "container");

    if (containerDifference !== 0) {
      return containerDifference;
    }

    return (right.data?.value ?? 0) - (left.data?.value ?? 0);
  });
};

function isParentReference(value: unknown): value is ParentReference {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ParentReference>;

  return (
    (candidate.kind === "page-region" && typeof candidate.pageId === "string" && typeof candidate.regionId === "string") ||
    (candidate.kind === "node-region" && typeof candidate.nodeId === "string" && typeof candidate.regionId === "string")
  );
}

function getBuilderActiveDragData(value: unknown): BuilderActiveDragData | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<BuilderActiveDragData>;

  if (candidate.kind === "palette" && typeof candidate.blockType === "string") {
    return {
      blockType: candidate.blockType,
      kind: "palette",
    };
  }

  if (candidate.kind === "node" && typeof candidate.nodeId === "string") {
    return {
      kind: "node",
      nodeId: candidate.nodeId,
    };
  }

  return null;
}

function getBuilderOverDragData(value: unknown): BuilderOverDragData | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<BuilderOverDragData>;

  if (candidate.kind === "container" && isParentReference(candidate.parent)) {
    return {
      kind: "container",
      parent: candidate.parent,
    };
  }

  if (
    candidate.kind === "node" &&
    typeof candidate.nodeId === "string" &&
    typeof candidate.index === "number" &&
    isParentReference(candidate.parent)
  ) {
    return {
      index: candidate.index,
      kind: "node",
      nodeId: candidate.nodeId,
      parent: candidate.parent,
    };
  }

  return null;
}

function getBuilderOverDragDataFromCollisions({
  activeNodeId,
  collisions,
}: {
  activeNodeId?: string | null;
  collisions: Collision[] | null;
}) {
  if (!collisions) {
    return null;
  }

  for (const collision of collisions) {
    const nextOverDrag = getBuilderOverDragData(collision.data?.droppableContainer?.data.current);

    if (!nextOverDrag) {
      continue;
    }

    if (nextOverDrag.kind === "node" && activeNodeId && nextOverDrag.nodeId === activeNodeId) {
      continue;
    }

    return nextOverDrag;
  }

  return null;
}

function parseDropTargetValue(value: string): ParentReference | null {
  const [kind, targetId, regionId] = value.split(":");

  if (!targetId || !regionId) {
    return null;
  }

  if (kind === "page-region") {
    return {
      kind,
      pageId: targetId,
      regionId,
    };
  }

  if (kind === "node-region") {
    return {
      kind,
      nodeId: targetId,
      regionId,
    };
  }

  return null;
}

function getBuilderOverDragDataFromPoint({
  activeNodeId,
  coordinates,
  project,
}: {
  activeNodeId?: string | null;
  coordinates: { x: number; y: number } | null;
  project: ReturnType<typeof useBuilderStore.getState>["project"];
}) {
  if (!coordinates || typeof document === "undefined") {
    return null;
  }

  for (const element of document.elementsFromPoint(coordinates.x, coordinates.y)) {
    const dropTarget = element.getAttribute("data-builder-drop-target");

    if (dropTarget) {
      const parent = parseDropTargetValue(dropTarget);

      if (parent) {
        return {
          kind: "container",
          parent,
        } satisfies BuilderOverDragData;
      }
    }

    const nodeId = element.getAttribute("data-builder-node");

    if (nodeId) {
      if (activeNodeId && nodeId === activeNodeId) {
        continue;
      }

      const nodeDropData = getNodeDropData(project, nodeId);

      if (nodeDropData) {
        return nodeDropData;
      }
    }
  }

  return null;
}

function getActivatorCoordinates(event: Event) {
  if (event instanceof MouseEvent || event instanceof PointerEvent) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  if (event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0];

    if (touch) {
      return {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }

  return null;
}

function describeBuilderDragMessage({
  active,
  evaluation,
  project,
}: {
  active: BuilderActiveDragData | null;
  evaluation: ReturnType<typeof evaluateBuilderDragOperation> | null;
  project: ReturnType<typeof useBuilderStore.getState>["project"];
}): BuilderCanvasDragMessage | null {
  if (!active || !evaluation?.target) {
    return null;
  }

  if (evaluation.validation && !evaluation.validation.ok) {
    return {
      message: evaluation.validation.message,
      tone: "error",
    };
  }

  const targetLabel = describeRegionReference(project, evaluation.target.parent);

  if (active.kind === "palette") {
    return {
      message: `Drop ${getBlockDefinition(active.blockType).title} into ${targetLabel}.`,
      tone: "info",
    };
  }

  const node = project.nodes[active.nodeId];
  const nodeLabel = node ? getNodeDisplayLabel(node) : "Selected block";

  return {
    message: `Move ${nodeLabel} into ${targetLabel}.`,
    tone: "info",
  };
}

export function BuilderStudio() {
  const project = useBuilderStore((state) => state.project);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectedRegionTarget = useBuilderStore((state) => state.selectedRegionTarget);
  const editorNotice = useBuilderStore((state) => state.editorNotice);
  const hasHydrated = useBuilderStore((state) => state.hasHydrated);
  const canUndo = useBuilderStore((state) => state.canUndo);
  const canRedo = useBuilderStore((state) => state.canRedo);
  const setPreviewMode = useBuilderStore((state) => state.setPreviewMode);
  const setHasHydrated = useBuilderStore((state) => state.setHasHydrated);
  const clearEditorNotice = useBuilderStore((state) => state.clearEditorNotice);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const resetProject = useBuilderStore((state) => state.resetProject);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("pages");
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("proposal");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [activeDragData, setActiveDragData] = useState<BuilderActiveDragData | null>(null);
  const [activeDragOverlayCard, setActiveDragOverlayCard] = useState<BuilderDragOverlayCard | null>(null);
  const [overDragData, setOverDragData] = useState<BuilderOverDragData | null>(null);
  const dragStartCoordinatesRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerCoordinatesRef = useRef<{ x: number; y: number } | null>(null);
  const activePage = project.pages.find((page) => page.id === selectedPageId) ?? project.pages[0];
  const hasSelection = Boolean(selectedNodeId || selectedRegionTarget);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );
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
    () =>
      describeBuilderDragMessage({
        active: activeDragData,
        evaluation: dragEvaluation,
        project,
      }),
    [activeDragData, dragEvaluation, project],
  );

  function resetDragState() {
    setActiveDragData(null);
    setActiveDragOverlayCard(null);
    setOverDragData(null);
    dragStartCoordinatesRef.current = null;
  }

  function handleDragStart(event: DragStartEvent) {
    clearEditorNotice();
    dragStartCoordinatesRef.current = getActivatorCoordinates(event.activatorEvent);

    const nextActiveDrag = getBuilderActiveDragData(event.active.data.current);

    if (!nextActiveDrag) {
      resetDragState();
      return;
    }

    setActiveDragData(nextActiveDrag);
    setOverDragData(null);

    if (nextActiveDrag.kind !== "palette") {
      setActiveDragOverlayCard(null);
      return;
    }

    const definition = getBlockDefinition(nextActiveDrag.blockType);
    const data = event.active.data.current as { description?: unknown; title?: unknown } | undefined;

    setActiveDragOverlayCard({
      description: typeof data?.description === "string" ? data.description : definition.description,
      title: typeof data?.title === "string" ? data.title : definition.title,
    });
  }

  function handleDragOver(event: DragOverEvent) {
    setOverDragData(getBuilderOverDragData(event.over?.data.current) ?? null);
  }

  function handleDragCancel() {
    resetDragState();
  }

  function handleDragEnd(event: DragEndEvent) {
    const nextActiveDrag = getBuilderActiveDragData(event.active.data.current);
    const dragEndCoordinates = dragStartCoordinatesRef.current
      ? {
          x: dragStartCoordinatesRef.current.x + event.delta.x,
          y: dragStartCoordinatesRef.current.y + event.delta.y,
        }
      : lastPointerCoordinatesRef.current;
    const nextOverDrag =
      getBuilderOverDragDataFromCollisions({
        activeNodeId: nextActiveDrag?.kind === "node" ? nextActiveDrag.nodeId : null,
        collisions: event.collisions,
      }) ??
      getBuilderOverDragDataFromPoint({
        activeNodeId: nextActiveDrag?.kind === "node" ? nextActiveDrag.nodeId : null,
        coordinates: dragEndCoordinates,
        project,
      }) ??
      getBuilderOverDragData(event.over?.data.current);

    if (nextActiveDrag && nextOverDrag) {
      clearEditorNotice();
      applyBuilderDragOperation({
        active: nextActiveDrag,
        addNode,
        moveNode,
        over: nextOverDrag,
        project,
      });
    }

    resetDragState();
  }

  useEffect(() => {
    let active = true;

    Promise.resolve(useBuilderStore.persist.rehydrate()).finally(() => {
      if (active) {
        setHasHydrated(true);
      }
    });

    return () => {
      active = false;
    };
  }, [setHasHydrated]);

  const handleHistoryKeydown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target;
    const isEditableTarget =
      target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

    if (isEditableTarget) {
      return;
    }

    const isModifierPressed = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    const wantsUndo = isModifierPressed && key === "z" && !event.shiftKey;
    const wantsRedo = isModifierPressed && (key === "y" || (key === "z" && event.shiftKey));

    if (wantsUndo && canUndo) {
      event.preventDefault();
      undo();
    }

    if (wantsRedo && canRedo) {
      event.preventDefault();
      redo();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleHistoryKeydown);

    return () => {
      window.removeEventListener("keydown", handleHistoryKeydown);
    };
  }, []);

  useEffect(() => {
    function updatePointerCoordinates(clientX: number, clientY: number) {
      lastPointerCoordinatesRef.current = {
        x: clientX,
        y: clientY,
      };
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointerCoordinates(event.clientX, event.clientY);
    }

    function handleMouseMove(event: MouseEvent) {
      updatePointerCoordinates(event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!hasHydrated) {
    return (
      <main className="app-shell flex h-screen items-center justify-center overflow-hidden p-6">
        <div className="panel-surface w-full max-w-xl rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-muted">Hydrating project workspace...</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Preparing Drag and Drop Studio</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell h-screen overflow-hidden px-3 py-3 text-foreground md:px-4">
      <div className="flex h-[calc(100vh-1.5rem)] min-h-0 flex-col gap-3">
        {editorNotice ? <EditorNoticeBanner notice={editorNotice} onDismiss={clearEditorNotice} /> : null}

        <DndContext
          sensors={sensors}
          collisionDetection={builderCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[var(--builder-left-width)_minmax(0,1fr)_var(--builder-right-width)]"
            style={{
              ["--builder-left-width" as string]: leftSidebarCollapsed ? "4.5rem" : "18rem",
              ["--builder-right-width" as string]: rightSidebarCollapsed ? "4.5rem" : "20rem",
            }}
          >
            <aside className="panel-surface flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl">
              <header className="flex items-center gap-2 border-b border-border/80 px-3 py-2">
                <div className={cn("grid flex-1 gap-1", leftSidebarCollapsed ? "justify-items-center" : "grid-cols-2")}>
                  {sidebarTabs.map((tab) => (
                    <SidebarTabButton
                      key={tab.value}
                      active={activeSidebarTab === tab.value}
                      collapsed={leftSidebarCollapsed}
                      icon={tab.icon}
                      label={tab.label}
                      onClick={() => {
                        setActiveSidebarTab(tab.value);
                        setLeftSidebarCollapsed(false);
                      }}
                      value={tab.value}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setLeftSidebarCollapsed((current) => !current)}
                  className="builder-pill inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted"
                  aria-label={leftSidebarCollapsed ? "Expand left sidebar" : "Collapse left sidebar"}
                >
                  {leftSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </header>

              {!leftSidebarCollapsed ? (
                <div className="builder-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                  {activeSidebarTab === "pages" ? <PagePanel /> : null}
                  {activeSidebarTab === "library" ? <LibraryPanel /> : null}
                  {activeSidebarTab === "assistant" ? <AssistantPanel assistantMode={assistantMode} /> : null}
                  {activeSidebarTab === "settings" ? (
                    <SettingsPanel assistantMode={assistantMode} onAssistantModeChange={setAssistantMode} />
                  ) : null}
                </div>
              ) : null}
            </aside>

            <section className="panel-surface flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
                  <p className="truncate text-xs text-muted">
                    {activePage?.name} {activePage?.path ? `(${activePage.path})` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-white/82 p-1">
                    {previewModes.map((mode) => {
                      const Icon = mode.icon;
                      const active = previewMode === mode.value;

                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setPreviewMode(mode.value)}
                          data-builder-preview-mode={mode.value}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                            active ? "bg-accent text-accent-contrast" : "text-muted hover:bg-black/[0.04] hover:text-foreground",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-border bg-white/82 p-1">
                    <button
                      type="button"
                      onClick={() => undo()}
                      disabled={!canUndo}
                      data-builder-action="undo"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                        canUndo ? "text-foreground hover:bg-black/[0.04]" : "cursor-not-allowed text-muted/60",
                      )}
                      aria-label="Undo last change"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Undo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => redo()}
                      disabled={!canRedo}
                      data-builder-action="redo"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                        canRedo ? "text-foreground hover:bg-black/[0.04]" : "cursor-not-allowed text-muted/60",
                      )}
                      aria-label="Redo last undone change"
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Redo</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      selectNode(null);
                      selectRegionTarget(null);
                    }}
                    disabled={!hasSelection}
                    data-builder-action="clear-selection"
                    className={cn(
                      "builder-pill inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                      hasSelection ? "text-foreground" : "cursor-not-allowed text-muted/60",
                    )}
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={() => exportProjectZip(project)}
                    data-builder-action="export"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export zip
                  </button>
                  <button
                    type="button"
                    onClick={() => resetProject()}
                    data-builder-action="reset"
                    className="builder-pill inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1">
                <BuilderCanvas
                  dragEvaluation={dragEvaluation}
                  dragMessage={dragMessage}
                  overDragData={overDragData}
                />
              </div>
            </section>

            <aside className="panel-surface flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl">
              <header className="flex items-center gap-2 border-b border-border/80 px-3 py-2">
                <div className={cn("flex-1", rightSidebarCollapsed && "flex justify-center")}>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {rightSidebarCollapsed ? "Inspect" : selectedNodeId ? "Selection inspector" : "Page inspector"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRightSidebarCollapsed((current) => !current)}
                  className="builder-pill inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted"
                  aria-label={rightSidebarCollapsed ? "Expand inspector" : "Collapse inspector"}
                >
                  {rightSidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </header>

              {!rightSidebarCollapsed ? (
                <div className="builder-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                  <InspectorPanel />
                </div>
              ) : null}
            </aside>
          </div>

          <DragOverlay>
            {activeDragData?.kind === "palette" && activeDragOverlayCard ? (
              <div className="w-72 rounded-lg border border-border bg-white/96 p-4 shadow-2xl">
                <p className="text-sm font-semibold text-foreground">{activeDragOverlayCard.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{activeDragOverlayCard.description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      <BuilderTestHooks />
    </main>
  );
}
