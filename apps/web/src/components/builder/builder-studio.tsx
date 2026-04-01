"use client";

import { Download, Laptop, RotateCcw, Smartphone, Tablet, Sparkles } from "lucide-react";

import { exportProjectZip } from "@/lib/builder/export";
import { getPageSummary, getThemeStyles } from "@/lib/builder/registry";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

import { BuilderCanvas } from "./canvas";
import { InspectorPanel } from "./inspector-panel";
import { LibraryPanel } from "./library-panel";
import { PagePanel } from "./page-panel";

const previewModes = [
  { value: "desktop", label: "Desktop", icon: Laptop },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
] as const;

export function BuilderStudio() {
  const project = useBuilderStore((state) => state.project);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const hasHydrated = useBuilderStore((state) => state.hasHydrated);
  const setPreviewMode = useBuilderStore((state) => state.setPreviewMode);
  const resetProject = useBuilderStore((state) => state.resetProject);
  const activePage = project.pages.find((page) => page.id === selectedPageId) ?? project.pages[0];

  if (!hasHydrated) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <div className="panel-surface w-full max-w-xl rounded-[32px] p-10 text-center">
          <p className="text-sm font-medium text-muted">Hydrating project workspace...</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Preparing Drag and Drop Studio</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen px-4 py-4 text-foreground md:px-6">
      <div className="panel-surface flex min-h-[calc(100vh-2rem)] flex-col rounded-[34px] p-3 md:p-4">
        <header className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-white/72 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Builder Alpha
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.name}</h1>
                <p className="max-w-3xl text-sm leading-6 text-muted md:text-base">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2 rounded-full border border-border bg-white/70 p-1">
                {previewModes.map((mode) => {
                  const Icon = mode.icon;
                  const active = previewMode === mode.value;

                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setPreviewMode(mode.value)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-contrast"
                          : "text-muted hover:bg-black/[0.04] hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => exportProjectZip(project)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Export starter zip
              </button>
              <button
                type="button"
                onClick={() => resetProject()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/70 px-4 py-3 text-sm font-semibold text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Reset demo
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="rounded-full border border-border bg-white/60 px-3 py-1">{getPageSummary(project)}</span>
            <span className="rounded-full border border-border bg-white/60 px-3 py-1">
              Active route: {activePage?.path ?? "/"}
            </span>
            <span className="rounded-full border border-border bg-white/60 px-3 py-1">
              Updated {new Date(project.updatedAt).toLocaleString()}
            </span>
          </div>
        </header>

        <div className="mt-4 grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="builder-scrollbar panel-surface flex max-h-[calc(100vh-13.25rem)] flex-col gap-4 overflow-y-auto rounded-[28px] p-4">
            <PagePanel />
            <LibraryPanel />
          </aside>

          <section className="panel-surface rounded-[28px] p-4">
            <div className="flex h-full flex-col rounded-[24px] border border-border/80 bg-[#ece6d7]/75 p-3">
              <BuilderCanvas />
            </div>
          </section>

          <aside className="builder-scrollbar panel-surface max-h-[calc(100vh-13.25rem)] overflow-y-auto rounded-[28px] p-4">
            <InspectorPanel />
          </aside>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-white/68 px-4 py-3 text-sm text-muted">
          <p>
            Foundation slice: schema-driven pages, constrained drag and drop, theme controls, multi-page management,
            persistence, and starter export.
          </p>
          <div className="builder-theme rounded-full px-4 py-2 text-xs" style={getThemeStyles(project.theme)}>
            Preview theme synced to project tokens
          </div>
        </footer>
      </div>
    </main>
  );
}
