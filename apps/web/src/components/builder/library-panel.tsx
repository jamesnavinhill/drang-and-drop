"use client";

import { useDraggable } from "@dnd-kit/core";

import { componentRegistry } from "@/lib/builder/registry";
import { cn } from "@/lib/utils";

function PaletteItem({
  title,
  type,
  description,
  icon,
}: {
  title: string;
  type: string;
  description: string;
  icon: string;
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
      className={cn(
        "builder-pill rounded-[22px] p-4 text-left",
        isDragging && "opacity-60",
      )}
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
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function LibraryPanel() {
  const groups = componentRegistry.reduce<Record<string, typeof componentRegistry>>((accumulator, item) => {
    accumulator[item.category] ??= [];
    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  return (
    <section className="rounded-[24px] border border-border bg-white/72 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Library</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Blocks and layout primitives</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Drag any block into the page canvas. Layout primitives accept children, while leaf blocks focus on content.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{category}</h3>
            <div className="mt-3 grid gap-2">
              {items.map((item) => (
                <PaletteItem
                  key={item.type}
                  title={item.title}
                  type={item.type}
                  description={item.description}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
