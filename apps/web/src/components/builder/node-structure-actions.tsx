"use client";

import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";

import { useBuilderStore } from "@/lib/builder/store";
import type { ParentReference } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function NodeStructureActions({
  className,
  index,
  nodeId,
  parent,
  surface,
  siblingCount,
  size = "sm",
}: {
  className?: string;
  index: number;
  nodeId: string;
  parent: ParentReference;
  surface: "inspector" | "outline";
  siblingCount: number;
  size?: "sm" | "md";
}) {
  const moveNode = useBuilderStore((state) => state.moveNode);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);
  const removeNode = useBuilderStore((state) => state.removeNode);
  const canMoveUp = index > 0;
  const canMoveDown = index < siblingCount - 1;
  const baseButtonClass =
    size === "md"
      ? "builder-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
      : "builder-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold";
  const iconClass = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => moveNode(nodeId, parent, index - 1)}
        disabled={!canMoveUp}
        data-builder-node-action="up"
        data-builder-node-action-surface={surface}
        data-builder-node-action-target={nodeId}
        className={cn(baseButtonClass, canMoveUp ? "text-foreground" : "cursor-not-allowed text-muted/60")}
      >
        <ArrowUp className={iconClass} />
        Up
      </button>
      <button
        type="button"
        onClick={() => moveNode(nodeId, parent, index + 2)}
        disabled={!canMoveDown}
        data-builder-node-action="down"
        data-builder-node-action-surface={surface}
        data-builder-node-action-target={nodeId}
        className={cn(baseButtonClass, canMoveDown ? "text-foreground" : "cursor-not-allowed text-muted/60")}
      >
        <ArrowDown className={iconClass} />
        Down
      </button>
      <button
        type="button"
        onClick={() => duplicateNode(nodeId)}
        data-builder-node-action="duplicate"
        data-builder-node-action-surface={surface}
        data-builder-node-action-target={nodeId}
        className={cn(baseButtonClass, "text-foreground")}
      >
        <Copy className={iconClass} />
        Duplicate
      </button>
      <button
        type="button"
        onClick={() => removeNode(nodeId)}
        data-builder-node-action="remove"
        data-builder-node-action-surface={surface}
        data-builder-node-action-target={nodeId}
        className={cn(baseButtonClass, "text-danger")}
      >
        <Trash2 className={iconClass} />
        Remove
      </button>
    </div>
  );
}
