"use client";

import type { AssistantMode } from "@/lib/ai/types";
import { getAssistantFeatureLabel, isAssistantFeatureEnabled } from "@/lib/ai/config";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

export function SettingsPanel({
  assistantMode,
  onAssistantModeChange,
}: {
  assistantMode: AssistantMode;
  onAssistantModeChange: (mode: AssistantMode) => void;
}) {
  const assistantEnabled = isAssistantFeatureEnabled();
  const project = useBuilderStore((state) => state.project);
  const updateProjectField = useBuilderStore((state) => state.updateProjectField);

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Settings</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Project details and assistant defaults</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Keep project-wide configuration here so the right inspector stays focused on the current page, selection, and
          theme.
        </p>
      </section>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Project</p>
        <div className="mt-4 grid gap-3">
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Assistant</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Change behavior</h2>
          </div>
          <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] text-muted">
            {getAssistantFeatureLabel()}
          </span>
        </div>

        <div className="mt-3 rounded-[20px] border border-border/80 bg-white/76 px-4 py-3 text-sm leading-6 text-muted">
          {assistantEnabled
            ? "The assistant feature flag is enabled. Live requests still depend on provider credentials and model selection."
            : "The assistant feature flag is off, so the UI stays dormant even though the transport and route are already wired."}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => onAssistantModeChange("proposal")}
            className={cn(
              "rounded-[22px] border px-4 py-3 text-left transition-colors",
              assistantMode === "proposal"
                ? "border-accent bg-accent/8"
                : "border-border bg-white/76 hover:border-border-strong",
            )}
          >
            <p className="text-sm font-semibold text-foreground">Proposal first</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Best default for this phase. The assistant suggests safe edits before anything is applied.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onAssistantModeChange("auto-apply")}
            className={cn(
              "rounded-[22px] border px-4 py-3 text-left transition-colors",
              assistantMode === "auto-apply"
                ? "border-accent bg-accent/8"
                : "border-border bg-white/76 hover:border-border-strong",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Auto-apply safe edits</p>
              <span className="rounded-full border border-border bg-white px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                Future wiring
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Keep this as a preference for later. The shell can already reflect the intended behavior without executing
              direct edits yet.
            </p>
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Provider setup</p>
        <div className="mt-3 rounded-[20px] border border-dashed border-border bg-white/72 p-4 text-sm leading-6 text-muted">
          Configure `apps/web/.env.example` values in your local `.env.local` before using the live assistant. The
          current implementation supports Vercel AI Gateway or direct OpenAI selection through explicit env vars, and it
          stays provider-explicit when multiple credentials are present.
        </div>
      </section>
    </div>
  );
}
