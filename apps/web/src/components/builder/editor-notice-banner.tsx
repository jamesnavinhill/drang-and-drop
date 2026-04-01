"use client";

import { AlertCircle, X } from "lucide-react";

import type { BuilderEditorNotice } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

export function EditorNoticeBanner({
  notice,
  onDismiss,
}: {
  notice: BuilderEditorNotice;
  onDismiss: () => void;
}) {
  return (
    <div
      data-builder-editor-notice={notice.tone}
      className={cn(
        "flex items-start justify-between gap-3 rounded-[22px] border px-4 py-3 text-sm leading-6",
        notice.tone === "error" ? "border-orange-300 bg-orange-50 text-foreground" : "border-border bg-white/80 text-muted",
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={cn("mt-0.5 h-4 w-4 shrink-0", notice.tone === "error" ? "text-orange-500" : "text-muted")}
        />
        <p>{notice.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        data-builder-editor-notice-dismiss="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/[0.04] hover:text-foreground"
        aria-label="Dismiss editor notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
