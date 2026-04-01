import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  parseActivityEntries,
  parseFaqItems,
  parseTable,
  parseTranscript,
  toLines,
} from "./block-content";
import type { BuilderNode, BuilderProject, BuilderTheme } from "./types";

export function getThemeStyles(theme: BuilderTheme): CSSProperties {
  const shadowDepth = 18 + theme.shadow * 8;

  return {
    ["--builder-background" as string]: theme.background,
    ["--builder-foreground" as string]: theme.foreground,
    ["--builder-muted" as string]: theme.muted,
    ["--builder-surface" as string]: theme.surface,
    ["--builder-border" as string]: "color-mix(in srgb, #101828 12%, white)",
    ["--builder-accent" as string]: theme.accent,
    ["--builder-accent-contrast" as string]: theme.accentContrast,
    ["--builder-radius" as string]: `${theme.radius}px`,
    ["--builder-shadow" as string]: `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(16, 24, 40, 0.12)`,
    fontFamily: theme.fontFamily,
  };
}

function ButtonPreview({
  label,
  variant,
  fullWidth,
}: {
  label: string;
  variant: string;
  fullWidth?: boolean;
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
    fullWidth && "w-full",
  );

  if (variant === "secondary") {
    return (
      <button
        type="button"
        className={cn(
          classes,
          "border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] text-[color:var(--builder-foreground)]",
        )}
      >
        {label}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button type="button" className={cn(classes, "text-[color:var(--builder-muted)]")}>
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        classes,
        "bg-[color:var(--builder-accent)] text-[color:var(--builder-accent-contrast)] shadow-sm",
      )}
    >
      {label}
    </button>
  );
}

function StackLayout({
  node,
  children,
}: {
  node: BuilderNode;
  children: ReactNode;
}) {
  return (
    <div
      className="w-full"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${node.props.gap ?? 18}px`,
        alignItems: `${node.props.align ?? "stretch"}`,
      }}
    >
      {children}
    </div>
  );
}

function GridLayout({
  node,
  children,
}: {
  node: BuilderNode;
  children: ReactNode;
}) {
  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        gap: `${node.props.gap ?? 18}px`,
        gridTemplateColumns: `repeat(${node.props.columns ?? 3}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

function FeatureLines({ value }: { value: string }) {
  return (
    <ul className="grid gap-3 text-sm text-[color:var(--builder-muted)]">
      {toLines(value).map((item) => (
        <li key={item} className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--builder-accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function renderNodePreview(
  node: BuilderNode,
  project: BuilderProject,
  renderedRegions: Record<string, ReactNode>,
) {
  void project;
  const contentChildren = renderedRegions.content ?? null;

  switch (node.type) {
    case "navbar": {
      const links = toLines(`${node.props.links}`);
      const centered = node.props.align === "center";

      return (
        <div className="rounded-[calc(var(--builder-radius)+2px)] border border-[color:var(--builder-border)] bg-white/90 px-5 py-4">
          <div className={cn("flex flex-wrap items-center gap-4", centered ? "justify-center" : "justify-between")}>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--builder-foreground)]">
              {`${node.props.logo}`}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {links.map((link) => (
                <span
                  key={link}
                  className="rounded-full border border-[color:var(--builder-border)] px-3 py-2 text-xs font-medium text-[color:var(--builder-muted)]"
                >
                  {link}
                </span>
              ))}
            </div>
            <ButtonPreview label={`${node.props.ctaLabel}`} variant="primary" />
          </div>
        </div>
      );
    }
    case "section": {
      const backgroundStyle = `${node.props.backgroundStyle ?? "surface"}`;
      const surfaceStyles: Record<string, CSSProperties> = {
        surface: { background: "var(--builder-surface)", border: "1px solid var(--builder-border)" },
        accent: {
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--builder-accent) 16%, white), rgba(255,255,255,0.72))",
          border: "1px solid color-mix(in srgb, var(--builder-accent) 20%, white)",
        },
        transparent: {
          background: "transparent",
          border: "1px dashed color-mix(in srgb, var(--builder-border) 70%, transparent)",
        },
      };

      return (
        <section
          className="w-full rounded-[calc(var(--builder-radius)-4px)]"
          style={{
            padding: `${node.props.paddingY ?? 48}px ${node.props.inset ? 24 : 0}px`,
            ...surfaceStyles[backgroundStyle],
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[color:var(--builder-muted)]">Section</p>
              <h3 className="text-lg font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            </div>
            <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-xs text-[color:var(--builder-muted)]">
              Layout wrapper
            </span>
          </div>
          <div className="grid gap-4">{contentChildren}</div>
        </section>
      );
    }
    case "stack":
      return <StackLayout node={node}>{contentChildren}</StackLayout>;
    case "grid":
      return <GridLayout node={node}>{contentChildren}</GridLayout>;
    case "hero": {
      const centered = node.props.align === "center";

      return (
        <section
          className={cn(
            "rounded-[calc(var(--builder-radius)+8px)] border border-[color:var(--builder-border)] px-8 py-10",
            centered && "text-center",
          )}
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--builder-accent) 12%, white), rgba(255,255,255,0.95))",
          }}
        >
          <span className="inline-flex rounded-full border border-[color:var(--builder-border)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--builder-muted)]">
            {`${node.props.eyebrow}`}
          </span>
          <div className={cn("mt-6 max-w-3xl space-y-4", centered && "mx-auto")}>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--builder-foreground)] sm:text-5xl">
              {`${node.props.title}`}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--builder-muted)]">
              {`${node.props.body}`}
            </p>
          </div>
          <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>
            <ButtonPreview label={`${node.props.primaryLabel}`} variant="primary" />
            <ButtonPreview label={`${node.props.secondaryLabel}`} variant="secondary" />
          </div>
        </section>
      );
    }
    case "text": {
      const size = `${node.props.size ?? "lg"}`;
      const bodyClasses =
        size === "sm" ? "text-sm leading-6" : size === "md" ? "text-base leading-7" : "text-lg leading-8";

      return (
        <div className="rounded-[calc(var(--builder-radius)-6px)] border border-[color:var(--builder-border)] bg-white/75 p-6">
          <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <p className={cn("mt-3 text-[color:var(--builder-muted)]", bodyClasses)}>{`${node.props.body}`}</p>
        </div>
      );
    }
    case "button":
      return (
        <div className="rounded-[calc(var(--builder-radius)-6px)] border border-dashed border-[color:var(--builder-border)] bg-white/60 p-4">
          <ButtonPreview
            label={`${node.props.label}`}
            variant={`${node.props.variant}`}
            fullWidth={Boolean(node.props.fullWidth)}
          />
        </div>
      );
    case "featureGrid":
      return (
        <div className="rounded-[calc(var(--builder-radius)-6px)] border border-[color:var(--builder-border)] bg-white/78 p-6">
          <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          <div className="mt-5">
            <FeatureLines value={`${node.props.features}`} />
          </div>
        </div>
      );
    case "faqList": {
      const items = parseFaqItems(`${node.props.items}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-6px)] border border-[color:var(--builder-border)] bg-white/82 p-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {items.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--builder-accent)]/10 text-[11px] font-semibold text-[color:var(--builder-accent)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{item.question}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--builder-muted)]">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "testimonialCard":
      return (
        <div className="rounded-[calc(var(--builder-radius)-6px)] border border-[color:var(--builder-border)] bg-white/86 p-6">
          <p className="text-2xl leading-9 text-[color:var(--builder-foreground)]">
            &quot;{`${node.props.quote}`}&quot;
          </p>
          <div className="mt-5 border-t border-[color:var(--builder-border)] pt-4">
            <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.author}`}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">{`${node.props.role}`}</p>
          </div>
        </div>
      );
    case "statCard":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/82 p-5">
          <p className="text-sm text-[color:var(--builder-muted)]">{`${node.props.label}`}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-4xl font-semibold tracking-tight text-[color:var(--builder-foreground)]">{`${node.props.value}`}</p>
            <span className="rounded-full bg-[color:var(--builder-accent)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--builder-accent)]">
              {`${node.props.trend}`}
            </span>
          </div>
        </div>
      );
    case "activityFeed": {
      const entries = parseActivityEntries(`${node.props.entries}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {entries.map((entry, index) => (
              <div
                key={`${entry.title}-${entry.meta}-${index}`}
                className="grid gap-3 rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-4 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-[color:var(--builder-accent)]" />
                <div>
                  <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{entry.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">{entry.meta}</p>
                </div>
                <span className="justify-self-start rounded-full bg-[color:var(--builder-accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--builder-accent)]">
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "formCard":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/82 p-6">
          <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-4 py-3 text-sm text-[color:var(--builder-muted)]">
              Email address
            </div>
            <ButtonPreview label={`${node.props.buttonLabel}`} variant="primary" fullWidth />
          </div>
        </div>
      );
    case "pricingCard":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/86 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">{`${node.props.tier}`}</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-4xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.price}`}</p>
            <span className="pb-1 text-sm text-[color:var(--builder-muted)]">/ month</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.tagline}`}</p>
          <div className="mt-5">
            <ButtonPreview label={`${node.props.cta}`} variant="primary" fullWidth />
          </div>
        </div>
      );
    case "chatInput":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/82 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[color:var(--builder-foreground)]">{`${node.props.label}`}</p>
            <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-xs text-[color:var(--builder-muted)]">
              AI shell
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] p-4">
            <p className="text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.placeholder}`}</p>
            <div className="flex justify-end">
              <ButtonPreview label={`${node.props.buttonLabel}`} variant="primary" />
            </div>
          </div>
        </div>
      );
    case "messageThread": {
      const transcript = parseTranscript(`${node.props.transcript}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
            <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">
              Thread
            </span>
          </div>
          <div className="grid gap-3">
            {transcript.map((entry, index) => (
              <div
                key={`${entry.sender}-${index}`}
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
                  entry.isAssistant
                    ? "justify-self-start border border-[color:var(--builder-border)] bg-white text-[color:var(--builder-foreground)]"
                    : "justify-self-end bg-[color:var(--builder-accent)] text-[color:var(--builder-accent-contrast)]",
                )}
              >
                <p
                  className={cn(
                    "mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    entry.isAssistant ? "text-[color:var(--builder-muted)]" : "text-current/80",
                  )}
                >
                  {entry.sender}
                </p>
                <p>{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "dataTable": {
      const { columns, rows } = parseTable(`${node.props.columns}`, `${node.props.rows}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/86 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
            <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">
              Table
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[color:var(--builder-border)]">
            <div
              className="grid bg-[color:var(--builder-surface)]"
              style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))` }}
            >
              {columns.map((column) => (
                <div
                  key={column}
                  className="border-b border-[color:var(--builder-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]"
                >
                  {column}
                </div>
              ))}
              {rows.flatMap((row, rowIndex) =>
                columns.map((column, columnIndex) => (
                  <div
                    key={`${rowIndex}-${column}-${columnIndex}`}
                    className="border-b border-[color:var(--builder-border)] px-4 py-3 text-sm text-[color:var(--builder-foreground)]"
                  >
                    {row[columnIndex] ?? "--"}
                  </div>
                )),
              )}
            </div>
          </div>
        </div>
      );
    }
    case "sidebarShell": {
      const items = toLines(`${node.props.items}`);
      const sidebarPosition = `${node.props.sidebarPosition ?? "left"}` === "right" ? "right" : "left";
      const sidebarWidth = Number(node.props.sidebarWidth ?? 280);
      const gap = Number(node.props.gap ?? 18);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/86 p-4">
          <div
            className={cn(
              "grid gap-4",
              sidebarPosition === "right"
                ? "lg:grid-cols-[minmax(0,1fr)_var(--builder-sidebar-width)]"
                : "lg:grid-cols-[var(--builder-sidebar-width)_minmax(0,1fr)]",
            )}
            style={{
              ["--builder-sidebar-width" as string]: `${sidebarWidth}px`,
              gap: `${gap}px`,
            }}
          >
            <aside
              className={cn(
                "rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] p-4",
                sidebarPosition === "right" && "lg:order-2",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">
                Workspace rail
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
              <div className="mt-4 grid gap-2">
                {items.map((item) => {
                  const active = item === `${node.props.highlight}`;

                  return (
                    <div
                      key={item}
                      className={cn(
                        "rounded-2xl px-3 py-2 text-sm",
                        active
                          ? "bg-[color:var(--builder-accent)] text-[color:var(--builder-accent-contrast)]"
                          : "border border-transparent text-[color:var(--builder-muted)]",
                      )}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">{renderedRegions.sidebar ?? null}</div>
            </aside>
            <div
              className={cn(
                "rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-white/72 p-4",
                sidebarPosition === "right" && "lg:order-1",
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--builder-muted)]">
                    Main content
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--builder-muted)]">
                    Compose the primary application surface here.
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-[11px] text-[color:var(--builder-muted)]">
                  Multi-region shell
                </span>
              </div>
              {renderedRegions.content ?? null}
            </div>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="rounded-3xl border border-[color:var(--builder-border)] bg-white/80 p-6">
          <p className="text-sm text-[color:var(--builder-muted)]">Unsupported node</p>
        </div>
      );
  }
}

export function getPageSummary(project: BuilderProject) {
  return `${project.pages.length} page${project.pages.length === 1 ? "" : "s"} - ${Object.keys(project.nodes).length} nodes`;
}
