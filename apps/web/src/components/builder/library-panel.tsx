"use client";

import { useDraggable } from "@dnd-kit/core";
import { Compass, Filter, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";

import { canAcceptChild, componentRegistry } from "@/lib/builder/registry";
import { describeInsertionTarget } from "@/lib/builder/structure";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

type LibraryView = "context" | "all";

function PaletteItem({
  title,
  type,
  description,
  icon,
  category,
  helperLabel,
}: {
  title: string;
  type: string;
  description: string;
  icon: string;
  category: string;
  helperLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      kind: "palette",
      componentType: type,
      title,
      description,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      data-builder-palette={type}
      aria-label={`Add ${title}`}
      className={cn("builder-pill rounded-[22px] p-4 text-left", isDragging && "opacity-60")}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            }
          : undefined
      }
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04] text-sm font-semibold text-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <span className="rounded-full border border-border bg-white/75 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
              {category}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
          <p className="mt-2 text-[11px] font-medium text-muted">{helperLabel}</p>
        </div>
      </div>
    </button>
  );
}

function LibraryModeButton({
  active,
  icon: Icon,
  label,
  onClick,
  value,
}: {
  active: boolean;
  icon: typeof Compass;
  label: string;
  onClick: () => void;
  value: LibraryView;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-builder-library-view={value}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-contrast" : "text-muted hover:bg-black/[0.04] hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function LibraryPanel() {
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const [libraryView, setLibraryView] = useState<LibraryView>("context");
  const insertion = describeInsertionTarget(project, selectedPageId, selectedNodeId);

  const visibleItems = useMemo(() => {
    if (libraryView === "all") {
      return componentRegistry;
    }

    const parentType =
      insertion.target.kind === "page" ? "page" : (project.nodes[insertion.target.id]?.type ?? "page");

    return componentRegistry.filter((item) => canAcceptChild(parentType, item.type));
  }, [insertion.target.id, insertion.target.kind, libraryView, project.nodes]);

  const groups = visibleItems.reduce<Record<string, typeof visibleItems>>((accumulator, item) => {
    accumulator[item.category] ??= [];
    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-border bg-white/76 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <LibraryModeButton
            active={libraryView === "context"}
            icon={Compass}
            label="Contextual"
            onClick={() => setLibraryView("context")}
            value="context"
          />
          <LibraryModeButton
            active={libraryView === "all"}
            icon={Layers3}
            label="All blocks"
            onClick={() => setLibraryView("all")}
            value="all"
          />
          <span className="ml-auto rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] text-muted">
            {visibleItems.length} option{visibleItems.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Library</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Blocks and layout primitives</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Drag blocks into the canvas. Containers accept children, leaf blocks keep content focused, and root-only
            blocks stay pinned to the page level.
          </p>
        </div>

        <div className="mt-4 rounded-[22px] border border-border bg-white/78 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {libraryView === "context" ? "Insertion context" : "Full catalog"}
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{insertion.label}</h3>
            </div>
            <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
              {insertion.kind === "page" ? "Root" : "Container"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {libraryView === "context"
              ? "These blocks are filtered to what can be dropped into the current insertion target."
              : "Showing the full catalog. Contextual mode narrows the list to valid drops for the current selection."}
          </p>
        </div>

        <div className="mt-5 grid gap-5">
          {Object.entries(groups).length > 0 ? (
            Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{category}</h3>
                  <span className="text-[11px] text-muted">
                    {items.length} block{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <PaletteItem
                      key={item.type}
                      title={item.title}
                      type={item.type}
                      description={item.description}
                      icon={item.icon}
                      category={item.category}
                      helperLabel={
                        item.rootOnly
                          ? "Root-level only"
                          : item.canHaveChildren
                            ? "Accepts nested blocks"
                            : "Leaf content block"
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-white/70 p-4 text-sm leading-6 text-muted">
              No blocks match the current insertion context. Clear the current selection or switch to all blocks to browse
              the full catalog.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[22px] border border-dashed border-border bg-white/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Filter className="h-3.5 w-3.5" />
            Placement rules
          </div>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            <p>`Navbar` is root-only and should start the page shell.</p>
            <p>`Section`, `Stack`, and `Grid` are the main nested layout primitives.</p>
            <p>Marketing and application cards can live at the root or inside layout containers, depending on context.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
