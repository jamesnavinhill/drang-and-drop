"use client";

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
import { useEffect, useEffectEvent, useState } from "react";

import { exportProjectZip } from "@/lib/builder/export";
import type { AssistantMode } from "@/lib/ai/types";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

import { AssistantPanel } from "./assistant-panel";
import { BuilderCanvas } from "./canvas";
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
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("pages");
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("proposal");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const activePage = project.pages.find((page) => page.id === selectedPageId) ?? project.pages[0];
  const hasSelection = Boolean(selectedNodeId || selectedRegionTarget);

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

  if (!hasHydrated) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <div className="panel-surface w-full max-w-xl rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-muted">Hydrating project workspace...</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Preparing Drag and Drop Studio</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen px-3 py-3 text-foreground md:px-4">
      <div className="flex min-h-[calc(100vh-1.5rem)] flex-col gap-3">
        {editorNotice ? <EditorNoticeBanner notice={editorNotice} onDismiss={clearEditorNotice} /> : null}

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
              <BuilderCanvas />
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
      </div>
      <BuilderTestHooks />
    </main>
  );
}
