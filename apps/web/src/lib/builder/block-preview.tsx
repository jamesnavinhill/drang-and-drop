import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  parseActivityEntries,
  parseFaqItems,
  parseInfoListItems,
  parseMetricItems,
  parseStepItems,
  parseTable,
  parseTranscript,
  toLines,
} from "./block-content";
import type { BuilderNode, BuilderProject, BuilderTheme, PreviewMode } from "./types";

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
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors",
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

function getResponsiveColumns(columns: number, previewMode: PreviewMode) {
  if (previewMode === "mobile") {
    return 1;
  }

  if (previewMode === "tablet") {
    return Math.min(columns, 2);
  }

  return columns;
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
  previewMode,
}: {
  node: BuilderNode;
  children: ReactNode;
  previewMode: PreviewMode;
}) {
  const columns = getResponsiveColumns(Number(node.props.columns ?? 3), previewMode);

  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        gap: `${node.props.gap ?? 18}px`,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
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
  previewMode: PreviewMode = "desktop",
) {
  void project;
  const contentChildren = renderedRegions.content ?? null;
  const actionChildren = renderedRegions.actions ?? null;

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
          {`${node.props.title}`.trim() ? (
            <div className="mb-5 border-b border-[color:var(--builder-border)]/80 pb-3">
              <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            </div>
          ) : null}
          <div className="grid gap-4">{contentChildren}</div>
        </section>
      );
    }
    case "stack":
      return <StackLayout node={node}>{contentChildren}</StackLayout>;
    case "grid":
      return <GridLayout node={node} previewMode={previewMode}>{contentChildren}</GridLayout>;
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
    case "metricRow": {
      const metrics = parseMetricItems(`${node.props.metrics}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
            <span className="rounded-full border border-[color:var(--builder-border)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
              Summary
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={`${metric.label}-${index}`}
                className="rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--builder-muted)]">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[color:var(--builder-foreground)]">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--builder-muted)]">{metric.meta}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
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
            {contentChildren}
          </div>
          <div className="mt-5 grid gap-3">
            {(node.regions.actions ?? []).length === 0 ? (
              <ButtonPreview label={`${node.props.buttonLabel}`} variant="primary" fullWidth />
            ) : null}
            {actionChildren}
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
          <div className="mt-5">{contentChildren}</div>
          <div className="mt-5 grid gap-3">
            {(node.regions.actions ?? []).length === 0 ? (
              <ButtonPreview label={`${node.props.cta}`} variant="primary" fullWidth />
            ) : null}
            {actionChildren}
          </div>
        </div>
      );
    case "logoGrid": {
      const logos = toLines(`${node.props.logos}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => (
              <div
                key={logo}
                className="rounded-2xl border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-4 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "calloutCard": {
      const tone = `${node.props.tone ?? "accent"}`;
      const toneClasses =
        tone === "warning"
          ? "border-amber-300/80 bg-amber-50"
          : tone === "neutral"
            ? "border-[color:var(--builder-border)] bg-white/84"
            : "border-[color:var(--builder-accent)]/25 bg-[color:var(--builder-accent)]/8";

      return (
        <div className={cn("rounded-[calc(var(--builder-radius)-8px)] border p-6", toneClasses)}>
          <span className="inline-flex rounded-full border border-[color:var(--builder-border)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
            {`${node.props.eyebrow}`}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
        </div>
      );
    }
    case "ctaBanner": {
      const centered = `${node.props.align ?? "left"}` === "center";

      return (
        <div
          className={cn(
            "rounded-[calc(var(--builder-radius)+2px)] border border-[color:var(--builder-border)] p-6",
            centered && "text-center",
          )}
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--builder-accent) 12%, white), rgba(255,255,255,0.92))",
          }}
        >
          <span className="inline-flex rounded-full border border-[color:var(--builder-border)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
            {`${node.props.eyebrow}`}
          </span>
          <div className={cn("mt-4 grid gap-3", centered && "justify-items-center")}>
            <h3 className="max-w-3xl text-2xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5">{contentChildren}</div>
          <div className="mt-5 grid gap-3">
            {(node.regions.actions ?? []).length === 0 ? (
              <div className={cn("flex flex-wrap gap-3", centered && "justify-center")}>
                <ButtonPreview label={`${node.props.primaryLabel}`} variant="primary" />
                <ButtonPreview label={`${node.props.secondaryLabel}`} variant="secondary" />
              </div>
            ) : null}
            {actionChildren}
          </div>
        </div>
      );
    }
    case "stepList": {
      const steps = parseStepItems(`${node.props.steps}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {steps.map((step) => (
              <div
                key={`${step.index}-${step.title}`}
                className="grid gap-3 rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--builder-accent)] text-sm font-semibold text-[color:var(--builder-accent-contrast)]">
                  {step.index}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--builder-muted)]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "comparisonTable": {
      const { columns, rows } = parseTable(`${node.props.columns}`, `${node.props.rows}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/86 p-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[color:var(--builder-border)]">
            <div
              className="grid min-w-[36rem] bg-[color:var(--builder-surface)]"
              style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))` }}
            >
              {columns.map((column, index) => (
                <div
                  key={column}
                  className={cn(
                    "border-b border-[color:var(--builder-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]",
                    index === 0 ? "bg-white text-[color:var(--builder-foreground)]" : "text-[color:var(--builder-muted)]",
                  )}
                >
                  {column}
                </div>
              ))}
              {rows.flatMap((row, rowIndex) =>
                columns.map((column, columnIndex) => (
                  <div
                    key={`${rowIndex}-${column}-${columnIndex}`}
                    className={cn(
                      "border-b border-[color:var(--builder-border)] px-4 py-3 text-sm",
                      columnIndex === 0 ? "font-medium text-[color:var(--builder-foreground)]" : "text-[color:var(--builder-muted)]",
                    )}
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
    case "infoList": {
      const items = parseInfoListItems(`${node.props.items}`);

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-6">
          <h3 className="text-xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <div className="mt-5 grid gap-3">
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="grid gap-2 rounded-[calc(var(--builder-radius)-10px)] border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start"
              >
                <p className="text-sm font-medium text-[color:var(--builder-foreground)]">{item.label}</p>
                <p className="text-sm leading-6 text-[color:var(--builder-muted)] sm:text-right">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "profileCard":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[color:var(--builder-accent)] text-lg font-semibold text-[color:var(--builder-accent-contrast)]">
              {`${node.props.name}`.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[color:var(--builder-foreground)]">{`${node.props.name}`}</h3>
              <p className="mt-1 text-sm text-[color:var(--builder-muted)]">{`${node.props.role}`}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">{`${node.props.detail}`}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.bio}`}</p>
        </div>
      );
    case "chatInput":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/82 p-6">
          <p className="mb-4 text-sm font-medium text-[color:var(--builder-foreground)]">{`${node.props.label}`}</p>
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
          <p className="mb-4 text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
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
          <p className="mb-4 text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
          <div className="overflow-x-auto rounded-2xl border border-[color:var(--builder-border)]">
            <div
              className="grid min-w-[36rem] bg-[color:var(--builder-surface)]"
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
    case "emptyState":
      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-dashed border-[color:var(--builder-border)] bg-white/72 p-6">
          <div className="inline-flex rounded-full border border-[color:var(--builder-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
            Empty state
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
          <div className="mt-5">{contentChildren}</div>
          <div className="mt-5 grid gap-3">
            {(node.regions.actions ?? []).length === 0 ? (
              <div className="flex flex-wrap gap-3">
                <ButtonPreview label={`${node.props.primaryLabel}`} variant="primary" />
                <ButtonPreview label={`${node.props.secondaryLabel}`} variant="secondary" />
              </div>
            ) : null}
            {actionChildren}
          </div>
        </div>
      );
    case "workspaceHeader": {
      const tags = toLines(`${node.props.tags}`);
      const hasActionChildren = (node.regions.actions ?? []).length > 0;

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/84 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              {`${node.props.eyebrow}`.trim() ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
                  {`${node.props.eyebrow}`}
                </p>
              ) : null}
              <h3 className="mt-4 text-2xl font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--builder-muted)]">{`${node.props.body}`}</p>
            </div>
            {hasActionChildren ? <div className="w-full max-w-full lg:max-w-sm">{actionChildren}</div> : (
              <div className="flex flex-wrap gap-3">
                <ButtonPreview label={`${node.props.primaryLabel}`} variant="primary" />
                <ButtonPreview label={`${node.props.secondaryLabel}`} variant="secondary" />
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--builder-border)] bg-[color:var(--builder-surface)] px-3 py-1 text-xs text-[color:var(--builder-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5">{contentChildren}</div>
          {!hasActionChildren ? <div className="mt-5">{actionChildren}</div> : null}
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
              <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
              <div className="mt-3 grid gap-2">
                {items.map((item) => {
                  const active = item === `${node.props.highlight}`;

                  return (
                    <div
                      key={item}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
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
              <div className="mb-4 border-b border-[color:var(--builder-border)]/80 pb-3">
                <p className="text-sm font-semibold text-[color:var(--builder-foreground)]">Main content</p>
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
