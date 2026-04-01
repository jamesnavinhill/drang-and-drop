"use client";

import { Copy, Trash2 } from "lucide-react";

import { getComponentDefinition } from "@/lib/builder/registry";
import { getSelectedNode, getSelectedPage, useBuilderStore } from "@/lib/builder/store";
import type { ControlField } from "@/lib/builder/types";
import { clamp, cn } from "@/lib/utils";

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
        className="min-h-28 w-full rounded-3xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none ring-0"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={`${value ?? field.options[0]?.value ?? ""}`}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
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
          "inline-flex w-full items-center justify-between rounded-full border px-4 py-3 text-sm font-medium transition-colors",
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
      <div className="rounded-[22px] border border-border bg-white/80 px-4 py-3">
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
      <label className="flex items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-3">
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
      className="w-full rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
    />
  );
}

export function InspectorPanel() {
  const project = useBuilderStore((state) => state.project);
  const selectedPage = useBuilderStore(getSelectedPage);
  const selectedNode = useBuilderStore(getSelectedNode);
  const updateProjectField = useBuilderStore((state) => state.updateProjectField);
  const updateThemeField = useBuilderStore((state) => state.updateThemeField);
  const updatePageField = useBuilderStore((state) => state.updatePageField);
  const updateNodeField = useBuilderStore((state) => state.updateNodeField);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);
  const removeNode = useBuilderStore((state) => state.removeNode);

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

  const selectedDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Project</p>
        <div className="mt-3 grid gap-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Name</label>
            <input
              value={project.name}
              onChange={(event) => updateProjectField("name", event.target.value)}
              className="w-full rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Description</label>
            <textarea
              value={project.description}
              onChange={(event) => updateProjectField("description", event.target.value)}
              rows={4}
              className="min-h-24 w-full rounded-[24px] border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Page</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">{selectedPage.name}</h2>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Page name</label>
            <input
              value={selectedPage.name}
              onChange={(event) => updatePageField(selectedPage.id, "name", event.target.value)}
              className="w-full rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Route path</label>
            <input
              value={selectedPage.path}
              onChange={(event) => updatePageField(selectedPage.id, "path", event.target.value)}
              className="w-full rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Page summary</label>
            <textarea
              value={selectedPage.description}
              onChange={(event) => updatePageField(selectedPage.id, "description", event.target.value)}
              rows={4}
              className="min-h-24 w-full rounded-[24px] border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Selection</p>
        {selectedNode && selectedDefinition ? (
          <div className="mt-3 grid gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedDefinition.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{selectedDefinition.description}</p>
              </div>
              <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs text-muted">
                {selectedNode.type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => duplicateNode(selectedNode.id)}
                className="builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => removeNode(selectedNode.id)}
                className="builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>

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
          </div>
        ) : (
          <div className="mt-3 rounded-[22px] border border-dashed border-border bg-white/70 p-4 text-sm leading-6 text-muted">
            Select a node on the canvas to edit its props. When nothing is selected, this panel stays focused on page and
            theme settings.
          </div>
        )}
      </section>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Theme</p>
        <div className="mt-4 grid gap-3">
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
      </section>
    </div>
  );
}
