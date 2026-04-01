"use client";

import { useDraggable } from "@dnd-kit/core";
import { Compass, Filter, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  getBlockFamilyMeta,
  getDisplayableBlockCapabilityLabels,
  groupBlockContractsByLibraryGroup,
} from "@/lib/builder/block-catalog";
import { blockContracts } from "@/lib/builder/block-contracts";
import { blockCanHaveChildren, getBlockRegion, isRootOnlyBlock } from "@/lib/builder/block-placement";
import { getPageRegionDefinition } from "@/lib/builder/regions";
import { describeInsertionTarget, validateBlockPlacement } from "@/lib/builder/structure";
import { useBuilderStore } from "@/lib/builder/store";
import type { BuilderProject, PageRegionId, ParentReference } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

type LibraryView = "context" | "all";

function PaletteItem({
  title,
  type,
  description,
  icon,
  category,
  familyLabel,
  helperLabel,
  capabilityLabels,
  helperTone = "neutral",
}: {
  title: string;
  type: string;
  description: string;
  icon: string;
  category: string;
  familyLabel: string;
  helperLabel: string;
  capabilityLabels: string[];
  helperTone?: "neutral" | "warning";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      kind: "palette",
      blockType: type,
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
            <span className="rounded-full border border-border bg-white/75 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
              {familyLabel}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
          {capabilityLabels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {capabilityLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-white/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          <p className={cn("mt-2 text-[11px] font-medium", helperTone === "warning" ? "text-orange-600" : "text-muted")}>
            {helperLabel}
          </p>
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

function describeInsertionRegion(project: BuilderProject, target: ParentReference) {
  if (target.kind === "page-region") {
    const pageRegion = getPageRegionDefinition(target.regionId as PageRegionId);
    return {
      description: pageRegion.description,
      roleLabel: pageRegion.role === "primary" ? "Primary region" : "Supporting region",
    };
  }

  const node = project.nodes[target.nodeId ?? ""];
  const region = node ? getBlockRegion(node.type, target.regionId) : null;

  return {
    description: region?.description ?? "Add nested blocks here to continue the current layout flow.",
    roleLabel: region?.role === "supporting" ? "Supporting region" : "Primary region",
  };
}

export function LibraryPanel() {
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectedRegionTarget = useBuilderStore((state) => state.selectedRegionTarget);
  const [libraryView, setLibraryView] = useState<LibraryView>("context");
  const insertion = describeInsertionTarget(project, selectedPageId, selectedNodeId, selectedRegionTarget);
  const insertionRegion = describeInsertionRegion(project, insertion.target);

  const visibleContracts = useMemo(() => {
    if (libraryView === "all") {
      return blockContracts;
    }

    return blockContracts.filter((item) =>
      validateBlockPlacement({
        childType: item.type,
        parent: insertion.target,
        project,
      }).ok,
    );
  }, [insertion.target, libraryView, project]);

  const familyGroups = useMemo(() => groupBlockContractsByLibraryGroup(visibleContracts), [visibleContracts]);

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
            {visibleContracts.length} option{visibleContracts.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Library</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Blocks and layout primitives</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Drag blocks into the canvas. The library is grouped by user intent, while placement stays constrained by the
            canonical contract model underneath.
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
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
                {insertion.kind === "page-region" ? "Page region" : "Block region"}
              </span>
              <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
                {insertionRegion.roleLabel}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {insertionRegion.description}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {libraryView === "context"
              ? "These blocks are filtered to what can be dropped into the current insertion target."
              : "Showing the full catalog. Contextual mode narrows the list to valid drops for the current selection."}
          </p>
        </div>

        <div className="mt-5 grid gap-5">
          {familyGroups.length > 0 ? (
            familyGroups.map((group) => (
              <div key={group.group}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{group.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{group.description}</p>
                  </div>
                  <span className="text-[11px] text-muted">
                    {group.contracts.length} block{group.contracts.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {group.contracts.map((item) => {
                    const placement = validateBlockPlacement({
                      childType: item.type,
                      parent: insertion.target,
                      project,
                    });
                    return (
                      <PaletteItem
                        key={item.type}
                        title={item.definition.title}
                        type={item.type}
                        description={item.definition.description}
                        icon={item.definition.icon}
                        category={item.definition.category}
                        familyLabel={getBlockFamilyMeta(item.family).title}
                        capabilityLabels={getDisplayableBlockCapabilityLabels(item.capabilities)}
                        helperTone={libraryView === "all" && !placement.ok ? "warning" : "neutral"}
                        helperLabel={
                          libraryView === "all" && !placement.ok
                            ? "Not allowed in the current insertion target"
                            : isRootOnlyBlock(item.type)
                              ? "Root-level only"
                              : blockCanHaveChildren(item.type)
                                ? "Accepts nested blocks"
                                : "Leaf content block"
                        }
                      />
                    );
                  })}
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
            <p>`Navbar` stays root-only in the page header, while `Hero` stays root-only in the main page region.</p>
            <p>`Section`, `Stack`, `Grid`, and `Sidebar Shell` define most of the structural composition surface.</p>
            <p>Leaf blocks are grouped for browsing, but their real drop targets are still enforced by the placement contract.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
