"use client";

import { Copy, FilePlus2, FolderTree, Route, Trash2 } from "lucide-react";
import { useState } from "react";

import { getBlockRegionDescription, getBlockRegionLabel, getBlockRegionRole } from "@/lib/builder/block-placement";
import { getBlockDefinition } from "@/lib/builder/block-definitions";
import { getPageRegionDefinition, getPageRegionEmptyMessage, getPageRegionLabel } from "@/lib/builder/regions";
import {
  countPageNodes,
  countSubtreeNodes,
  describeInsertionTarget,
  getNodeDisplayLabel,
  getParentChildren,
} from "@/lib/builder/structure";
import { useBuilderStore } from "@/lib/builder/store";
import { pageRegionIds, type BuilderProject, type ParentReference, type RegionRole } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

import { NodeStructureActions } from "./node-structure-actions";

type PagePanelTab = "routes" | "outline";

function PanelTabButton({
  active,
  icon: Icon,
  label,
  onClick,
  value,
}: {
  active: boolean;
  icon: typeof Route;
  label: string;
  onClick: () => void;
  value: PagePanelTab;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-builder-page-tab={value}
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

function RegionBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-white/80 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">
      {label}
    </span>
  );
}

function RegionRoleBadge({ role }: { role: RegionRole }) {
  return (
    <span className="rounded-full border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
      {role === "primary" ? "Primary region" : "Supporting region"}
    </span>
  );
}

function OutlineNodeRow({
  nodeId,
  parent,
  index,
  depth,
  project,
  selectedNodeId,
}: {
  nodeId: string;
  parent: ParentReference;
  index: number;
  depth: number;
  project: BuilderProject;
  selectedNodeId: string | null;
}) {
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const selectedRegionTarget = useBuilderStore((state) => state.selectedRegionTarget);
  const node = project.nodes[nodeId];

  if (!node) {
    return null;
  }

  const definition = getBlockDefinition(node.type);
  const siblingIds = getParentChildren(project, parent);
  const descendantCount = countSubtreeNodes(project, node.id) - 1;
  const regionEntries = Object.entries(node.regions);
  const childCount = regionEntries.reduce((total, [, childIds]) => total + childIds.length, 0);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-[20px] border px-3 py-3 transition-colors",
          selectedNodeId === node.id
            ? "border-accent bg-accent/8 shadow-sm"
            : "border-border bg-white/75 hover:border-border-strong hover:bg-white",
        )}
        style={{ marginLeft: depth * 16 }}
      >
        <button type="button" onClick={() => selectNode(node.id)} className="block w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <RegionBadge label={definition.title} />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {definition.category}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{getNodeDisplayLabel(node)}</p>
            </div>

            <span className="rounded-full border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
              {childCount} child{childCount === 1 ? "" : "ren"}
            </span>
          </div>
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <NodeStructureActions
            index={index}
            nodeId={node.id}
            parent={parent}
            siblingCount={siblingIds.length}
            surface="outline"
          />
          {descendantCount > 0 ? (
            <span className="rounded-full border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
              {descendantCount} nested
            </span>
          ) : null}
        </div>
      </div>

      {regionEntries.length > 0 ? (
        <div className="space-y-2">
          {regionEntries.map(([regionId, childIds]) => {
            const regionTarget: ParentReference = {
              kind: "node-region",
              nodeId: node.id,
              regionId,
            };
            const regionSelected =
              selectedRegionTarget?.kind === "node-region" &&
              selectedRegionTarget.nodeId === node.id &&
              selectedRegionTarget.regionId === regionId;

            return (
              <div key={`${node.id}-${regionId}`} style={{ marginLeft: depth * 16 + 16 }}>
                <button
                  type="button"
                  onClick={() => selectRegionTarget(regionTarget)}
                  className={cn(
                    "mb-2 w-full rounded-[18px] border px-3 py-2 text-left",
                    regionSelected
                      ? "border-accent bg-accent/8"
                      : "border-border bg-white/70 hover:border-border-strong hover:bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {getBlockRegionLabel(node.type, regionId)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {getBlockRegionDescription(node.type, regionId)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <RegionRoleBadge role={getBlockRegionRole(node.type, regionId)} />
                      <span className="text-[11px] text-muted">
                        {childIds.length} item{childIds.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="space-y-2">
                  {childIds.map((childId, childIndex) => (
                    <OutlineNodeRow
                      key={childId}
                      nodeId={childId}
                      parent={regionTarget}
                      index={childIndex}
                      depth={depth + 1}
                      project={project}
                      selectedNodeId={selectedNodeId}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function RoutesTab() {
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectPage = useBuilderStore((state) => state.selectPage);
  const addPage = useBuilderStore((state) => state.addPage);
  const duplicatePage = useBuilderStore((state) => state.duplicatePage);
  const removePage = useBuilderStore((state) => state.removePage);
  const activePage = project.pages.find((page) => page.id === selectedPageId) ?? project.pages[0];

  return (
    <section className="rounded-[24px] border border-border bg-white/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pages</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Routes and project flow</h2>
        </div>
        <button
          type="button"
          onClick={() => addPage()}
          data-builder-page-action="new"
          className="builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-foreground"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          New page
        </button>
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-white/76 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Active page</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{activePage.name}</h3>
            <p className="mt-1 text-xs text-muted">{activePage.path}</p>
          </div>
          <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
            {countPageNodes(project, activePage.id)} block{countPageNodes(project, activePage.id) === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{activePage.description}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {project.pages.map((page) => {
          const active = page.id === selectedPageId;
          const pageNodeCount = countPageNodes(project, page.id);

          return (
            <div
              key={page.id}
              data-builder-page={page.id}
              className={cn(
                "rounded-[22px] border px-4 py-3 transition-colors",
                active
                  ? "border-accent bg-accent/8 shadow-sm"
                  : "border-border bg-white/70 hover:border-border-strong hover:bg-white",
              )}
            >
              <button type="button" onClick={() => selectPage(page.id)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{page.name}</p>
                    <p className="mt-1 text-xs text-muted">{page.path}</p>
                  </div>
                  <span className="rounded-full border border-border bg-white/75 px-2 py-1 text-[11px] text-muted">
                    {pageNodeCount} block{pageNodeCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">{page.description}</p>
              </button>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => duplicatePage(page.id)}
                  className="builder-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-foreground"
                >
                  <Copy className="h-3 w-3" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => removePage(page.id)}
                  className="builder-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-danger"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OutlineTab() {
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectedRegionTarget = useBuilderStore((state) => state.selectedRegionTarget);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const selectRegionTarget = useBuilderStore((state) => state.selectRegionTarget);
  const page = project.pages.find((entry) => entry.id === selectedPageId) ?? project.pages[0];
  const insertion = describeInsertionTarget(project, selectedPageId, selectedNodeId, selectedRegionTarget);
  const selectedNode = selectedNodeId ? project.nodes[selectedNodeId] ?? null : null;
  const insertionContextMessage = selectedNode
    ? Object.keys(selectedNode.regions).length > 0
      ? "New blocks will target the selected block's primary region unless you choose a different region explicitly."
      : "The selected block is a leaf, so new blocks will target its current parent region."
    : selectedRegionTarget
      ? "The library is now scoped to the selected region."
      : "Nothing is selected, so new blocks will insert into the page main region by default.";
  const totalRoots = Object.values(page.regions).reduce((total, regionIds) => total + regionIds.length, 0);

  return (
    <section className="rounded-[24px] border border-border bg-white/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Outline</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Page structure and regions</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            selectNode(null);
            selectRegionTarget(null);
          }}
          className="builder-pill rounded-full px-3 py-2 text-xs font-semibold text-foreground"
        >
          Clear selection
        </button>
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-white/76 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{page.name}</h3>
            <p className="mt-1 text-xs text-muted">{page.path}</p>
          </div>
          <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
            {totalRoots} root block{totalRoots === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          Use the outline to select regions and blocks directly. The builder now treats page and block regions as
          canonical authoring destinations.
        </p>
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-white/76 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Current insertion target</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">{insertion.label}</h3>
          </div>
          <span className="rounded-full border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
            {insertion.kind === "page-region" ? "Page region" : "Block region"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{insertionContextMessage}</p>
      </div>

      <div className="mt-4 space-y-4">
        {pageRegionIds.map((regionId) => {
          const regionTarget: ParentReference = {
            kind: "page-region",
            pageId: page.id,
            regionId,
          };
          const regionRoots = page.regions[regionId];
          const regionSelected =
            selectedRegionTarget?.kind === "page-region" &&
            selectedRegionTarget.pageId === page.id &&
            selectedRegionTarget.regionId === regionId;

          return (
            <div key={`${page.id}-${regionId}`} className="rounded-[22px] border border-border bg-white/74 p-4">
              <button
                type="button"
                onClick={() => selectRegionTarget(regionTarget)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[18px] border px-3 py-3 text-left",
                  regionSelected ? "border-accent bg-accent/8" : "border-border bg-white/80",
                )}
              >
                {(() => {
                  const regionDefinition = getPageRegionDefinition(regionId);

                  return (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {getPageRegionLabel(regionId)}
                        </p>
                        <p className="mt-1 text-sm text-muted">{regionDefinition.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <RegionRoleBadge role={regionDefinition.role} />
                        <span className="rounded-full border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
                          {regionRoots.length} item{regionRoots.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </button>

              <div className="mt-3 space-y-2">
                {regionRoots.length > 0 ? (
                  regionRoots.map((rootId, index) => (
                    <OutlineNodeRow
                      key={rootId}
                      nodeId={rootId}
                      parent={regionTarget}
                      index={index}
                      depth={0}
                      project={project}
                      selectedNodeId={selectedNodeId}
                    />
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-border bg-white/65 p-3 text-sm leading-6 text-muted">
                    {getPageRegionEmptyMessage(regionId)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PagePanel() {
  const [activeTab, setActiveTab] = useState<PagePanelTab>("routes");
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const totalPageNodes = countPageNodes(project, selectedPageId);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-border bg-white/76 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <PanelTabButton
            active={activeTab === "routes"}
            icon={Route}
            label="Routes"
            onClick={() => setActiveTab("routes")}
            value="routes"
          />
          <PanelTabButton
            active={activeTab === "outline"}
            icon={FolderTree}
            label="Outline"
            onClick={() => setActiveTab("outline")}
            value="outline"
          />
          <span className="ml-auto rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] text-muted">
            {totalPageNodes} block{totalPageNodes === 1 ? "" : "s"} on page
          </span>
        </div>
      </div>

      {activeTab === "routes" ? <RoutesTab /> : null}
      {activeTab === "outline" ? <OutlineTab /> : null}
    </div>
  );
}
