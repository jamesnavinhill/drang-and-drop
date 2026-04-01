"use client";

import { Copy, FilePlus2, Trash2 } from "lucide-react";

import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

export function PagePanel() {
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectPage = useBuilderStore((state) => state.selectPage);
  const addPage = useBuilderStore((state) => state.addPage);
  const duplicatePage = useBuilderStore((state) => state.duplicatePage);
  const removePage = useBuilderStore((state) => state.removePage);

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
          className="builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-foreground"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          New page
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {project.pages.map((page) => {
          const active = page.id === selectedPageId;

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
                    {page.rootIds.length} root
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
