"use client";

import { ChevronDown, Paintbrush, ScrollText, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { getBlockDefinition } from "@/lib/builder/block-definitions";
import {
  getBlockRegionAcceptedChildrenLabel,
  getBlockRegionDescription,
  getBlockRegionLabel,
  getBlockRegionRole,
  getBlockRegions,
} from "@/lib/builder/block-placement";
import { getPageRegionLabel } from "@/lib/builder/regions";
import {
  findParentReference,
  getNodeDisplayLabel,
  getNodeHierarchyDepth,
  getNodeSiblingPosition,
} from "@/lib/builder/structure";
import { getSelectedNode, getSelectedPage, useBuilderStore } from "@/lib/builder/store";
import type { ControlField, PageRegionId } from "@/lib/builder/types";
import { clamp, cn } from "@/lib/utils";

import { NodeStructureActions } from "./node-structure-actions";

type InspectorTab = "selection" | "page" | "theme";

function InspectorSection({
  title,
  meta,
  defaultOpen = true,
  children,
}: {
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border bg-white/76">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</div>
        <div className="flex items-center gap-2">
          {meta ? <span className="rounded-md border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">{meta}</span> : null}
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-border/70 px-4 py-4">{children}</div>
    </details>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ControlField;
  value: string | number | boolean | undefined;
  onChange: (next: string | number | boolean) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={`${value ?? ""}`}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={5}
        className="min-h-28 w-full rounded-xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none ring-0"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={`${value ?? field.options[0]?.value ?? ""}`}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "toggle") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "inline-flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
          value ? "border-accent bg-accent/8 text-foreground" : "border-border bg-white/80 text-muted",
        )}
      >
        <span>{field.label}</span>
        <span
          className={cn(
            "h-6 w-11 rounded-full p-1 transition-colors",
            value ? "bg-accent" : "bg-black/[0.08]",
          )}
        >
          <span
            className={cn(
              "block h-4 w-4 rounded-full bg-white transition-transform",
              value ? "translate-x-5" : "translate-x-0",
            )}
          />
        </span>
      </button>
    );
  }

  if (field.type === "range") {
    const numeric = Number(value ?? field.min ?? 0);

    return (
      <div className="rounded-lg border border-border bg-white/80 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>{field.label}</span>
          <span>{numeric}</span>
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={numeric}
          onChange={(event) => onChange(clamp(Number(event.target.value), field.min ?? 0, field.max ?? 100))}
          className="w-full accent-[var(--accent)]"
        />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <label className="flex items-center gap-3 rounded-lg border border-border bg-white/80 px-4 py-3">
        <input
          type="color"
          value={`${value ?? "#ffffff"}`}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 rounded-full border-none bg-transparent"
        />
        <span className="text-sm text-foreground">{`${value ?? "#ffffff"}`}</span>
      </label>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      min={field.type === "number" ? field.min : undefined}
      max={field.type === "number" ? field.max : undefined}
      step={field.type === "number" ? field.step : undefined}
      value={`${value ?? ""}`}
      onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
      placeholder={"placeholder" in field ? field.placeholder : undefined}
      className="w-full rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
    />
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
  value,
}: {
  active: boolean;
  icon: typeof Sparkles;
  label: string;
  onClick: () => void;
  value: InspectorTab;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-builder-inspector-tab={value}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
        active ? "bg-accent text-accent-contrast" : "text-muted hover:bg-black/[0.04] hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SelectionTab({
  active,
  onShowPage,
}: {
  active: boolean;
  onShowPage: () => void;
}) {
  const project = useBuilderStore((state) => state.project);
  const selectedNode = useBuilderStore(getSelectedNode);
  const updateNodeField = useBuilderStore((state) => state.updateNodeField);
  const selectedDefinition = selectedNode ? getBlockDefinition(selectedNode.type) : null;
  const selectedParent = selectedNode ? findParentReference(project, selectedNode.id) : null;
  const siblingPosition = selectedNode ? getNodeSiblingPosition(project, selectedNode.id) : null;
  const selectedRegions = selectedNode ? getBlockRegions(selectedNode.type) : [];
  const parentLabel =
    selectedParent?.kind === "page-region"
      ? `${project.pages.find((page) => page.id === selectedParent.pageId)?.name ?? "Page"} ${getPageRegionLabel(selectedParent.regionId as PageRegionId)}`
      : selectedParent
        ? `${getNodeDisplayLabel(project.nodes[selectedParent.nodeId ?? ""])} / ${selectedParent.regionId}`
        : "None";
  const hierarchyDepth = selectedNode ? getNodeHierarchyDepth(project, selectedNode.id) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-white/72 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Selection</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {selectedDefinition ? selectedDefinition.title : "Nothing selected"}
            </h2>
          </div>
          {active ? (
            <span className="rounded-md border border-border bg-white/80 px-3 py-1 text-[11px] text-muted">
              Contextual
            </span>
          ) : null}
        </div>
      </div>

      {selectedNode && selectedDefinition ? (
        <>
          <InspectorSection title="Overview" meta={`Depth ${hierarchyDepth}`}>
            <p className="text-sm leading-6 text-muted">{selectedDefinition.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
                Parent: {parentLabel}
              </span>
              {siblingPosition ? (
                <span className="rounded-md border border-border bg-white/80 px-2 py-1 text-[11px] text-muted">
                  Sibling {siblingPosition.index + 1} of {siblingPosition.siblingCount}
                </span>
              ) : null}
            </div>
            {siblingPosition ? (
              <NodeStructureActions
                className="mt-4"
                index={siblingPosition.index}
                nodeId={selectedNode.id}
                parent={siblingPosition.parent}
                siblingCount={siblingPosition.siblingCount}
                size="md"
                surface="inspector"
              />
            ) : null}
          </InspectorSection>

          {selectedRegions.length > 0 ? (
            <InspectorSection title="Regions" meta={`${selectedRegions.length} total`}>
              <div className="grid gap-3">
                {selectedRegions.map((region) => (
                  <div key={`${selectedNode.id}-${region.id}`} className="rounded-lg border border-border bg-white/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {getBlockRegionLabel(selectedNode.type, region.id)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {getBlockRegionDescription(selectedNode.type, region.id)}
                        </p>
                        {getBlockRegionAcceptedChildrenLabel(selectedNode.type, region.id) ? (
                          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                            Accepts {getBlockRegionAcceptedChildrenLabel(selectedNode.type, region.id)}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-md border border-border bg-white/85 px-2 py-1 text-[11px] text-muted">
                        {getBlockRegionRole(selectedNode.type, region.id) === "primary" ? "Primary" : "Supporting"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </InspectorSection>
          ) : null}

          <InspectorSection title="Fields" meta={`${selectedDefinition.fields.length} controls`}>
            <div className="grid gap-3">
              {selectedDefinition.fields.map((field) => (
                <div key={field.key}>
                  {field.type !== "toggle" && (
                    <label className="mb-2 block text-xs font-medium text-muted">{field.label}</label>
                  )}
                  <FieldControl
                    field={field}
                    value={selectedNode.props[field.key]}
                    onChange={(next) => updateNodeField(selectedNode.id, field.key, next)}
                  />
                </div>
              ))}
            </div>
          </InspectorSection>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-white/70 p-4 text-sm leading-6 text-muted">
          Select a block on the canvas to edit its fields here, or jump to page details while nothing is selected.
          <div className="mt-3">
            <button
              type="button"
              onClick={onShowPage}
              className="builder-pill rounded-lg px-3 py-2 text-xs font-semibold text-foreground"
            >
              Go to page details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageTab() {
  const selectedPage = useBuilderStore(getSelectedPage);
  const updatePageField = useBuilderStore((state) => state.updatePageField);

  return (
    <InspectorSection title="Page details" meta={selectedPage.path}>
      <div className="grid gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">Page name</label>
          <input
            value={selectedPage.name}
            onChange={(event) => updatePageField(selectedPage.id, "name", event.target.value)}
            className="w-full rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">Route path</label>
          <input
            value={selectedPage.path}
            onChange={(event) => updatePageField(selectedPage.id, "path", event.target.value)}
            className="w-full rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">Page summary</label>
          <textarea
            value={selectedPage.description}
            onChange={(event) => updatePageField(selectedPage.id, "description", event.target.value)}
            rows={5}
            className="min-h-28 w-full rounded-xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
          />
        </div>
      </div>
    </InspectorSection>
  );
}

function ThemeTab() {
  const project = useBuilderStore((state) => state.project);
  const updateThemeField = useBuilderStore((state) => state.updateThemeField);

  const themeFields: ControlField[] = [
    { key: "accent", label: "Accent", type: "color" },
    { key: "accentContrast", label: "Accent contrast", type: "color" },
    { key: "background", label: "Background", type: "color" },
    { key: "surface", label: "Surface", type: "color" },
    { key: "foreground", label: "Foreground", type: "color" },
    { key: "muted", label: "Muted", type: "color" },
    { key: "radius", label: "Radius", type: "range", min: 12, max: 40, step: 1 },
    { key: "shadow", label: "Shadow depth", type: "range", min: 0, max: 8, step: 1 },
    {
      key: "fontFamily",
      label: "Font stack",
      type: "select",
      options: [
        { label: "Geist Sans", value: "var(--font-geist-sans), Arial, Helvetica, sans-serif" },
        { label: "Editorial Serif", value: "Georgia, 'Times New Roman', serif" },
        { label: "Product Mono", value: "'IBM Plex Mono', 'SFMono-Regular', monospace" },
      ],
    },
  ];

  return (
    <InspectorSection title="Theme tokens" meta="Global">
      <div className="grid gap-3">
        {themeFields.map((field) => (
          <div key={field.key}>
            {field.type !== "toggle" && (
              <label className="mb-2 block text-xs font-medium text-muted">{field.label}</label>
            )}
            <FieldControl
              field={field}
              value={project.theme[field.key as keyof typeof project.theme]}
              onChange={(next) => updateThemeField(field.key as keyof typeof project.theme, next)}
            />
          </div>
        ))}
      </div>
    </InspectorSection>
  );
}

export function InspectorPanel() {
  const selectedNode = useBuilderStore(getSelectedNode);
  const [activeTab, setActiveTab] = useState<InspectorTab>(selectedNode ? "selection" : "page");

  useEffect(() => {
    if (selectedNode) {
      setActiveTab("selection");
    }
  }, [selectedNode]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="rounded-xl border border-border bg-white/76 p-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton
            active={activeTab === "selection"}
            icon={Sparkles}
            label="Selection"
            onClick={() => setActiveTab("selection")}
            value="selection"
          />
          <TabButton
            active={activeTab === "page"}
            icon={ScrollText}
            label="Page"
            onClick={() => setActiveTab("page")}
            value="page"
          />
          <TabButton
            active={activeTab === "theme"}
            icon={Paintbrush}
            label="Theme"
            onClick={() => setActiveTab("theme")}
            value="theme"
          />
        </div>
      </div>

      <div className="builder-scrollbar mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
        {activeTab === "selection" ? <SelectionTab active onShowPage={() => setActiveTab("page")} /> : null}
        {activeTab === "page" ? <PageTab /> : null}
        {activeTab === "theme" ? <ThemeTab /> : null}
      </div>
    </div>
  );
}
