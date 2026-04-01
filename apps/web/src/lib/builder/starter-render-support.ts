import { blockContentFallbacks } from "./block-content";

export function createStarterRenderSupportFile() {
  return `import type { CSSProperties, ReactNode } from "react";

const blockContentFallbacks = {
  activityMeta: ${JSON.stringify(blockContentFallbacks.activityMeta)},
  activityStatus: ${JSON.stringify(blockContentFallbacks.activityStatus)},
  activityTitle: ${JSON.stringify(blockContentFallbacks.activityTitle)},
  faqAnswer: ${JSON.stringify(blockContentFallbacks.faqAnswer)},
  faqQuestion: ${JSON.stringify(blockContentFallbacks.faqQuestion)},
  messageSender: ${JSON.stringify(blockContentFallbacks.messageSender)},
  transcriptMessage: ${JSON.stringify(blockContentFallbacks.transcriptMessage)},
} as const;

export function buttonVariant(label: string, variant: string, fullWidth?: boolean) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    width: fullWidth ? "100%" : undefined,
  };

  if (variant === "secondary") {
    return (
      <button
        type="button"
        style={{
          ...style,
          border: "1px solid var(--builder-border)",
          background: "var(--builder-surface)",
          color: "var(--builder-foreground)",
        }}
      >
        {label}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button type="button" style={{ ...style, color: "var(--builder-muted)", background: "transparent" }}>
        {label}
      </button>
    );
  }

  return (
    <button type="button" style={{ ...style, background: "var(--builder-accent)", color: "var(--builder-accent-contrast)" }}>
      {label}
    </button>
  );
}

export function featureLines(value: string) {
  return (
    <ul style={{ display: "grid", gap: 12, listStyle: "none", margin: 0, padding: 0, color: "var(--builder-muted)" }}>
      {toLines(value).map((item) => (
        <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{ width: 10, height: 10, borderRadius: 999, background: "var(--builder-accent)", display: "inline-block" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function toLines(value: string) {
  return value
    .split("\\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTranscript(value: string) {
  return toLines(value).map((entry) => {
    const [sender, ...rest] = entry.split("|");
    const message = rest.join("|").trim();
    const normalizedSender = sender.trim() || blockContentFallbacks.messageSender;

    return {
      sender: normalizedSender,
      message: message || blockContentFallbacks.transcriptMessage,
      isAssistant: /assistant|copilot|system/i.test(normalizedSender),
    };
  });
}

export function parseFaqItems(value: string) {
  return toLines(value).map((entry) => {
    const [question, ...rest] = entry.split("|");
    const answer = rest.join("|").trim();

    return {
      answer: answer || blockContentFallbacks.faqAnswer,
      question: question.trim() || blockContentFallbacks.faqQuestion,
    };
  });
}

export function parseActivityEntries(value: string) {
  return toLines(value).map((entry) => {
    const [title, meta, status] = entry.split("|").map((item) => item.trim());

    return {
      meta: meta || blockContentFallbacks.activityMeta,
      status: status || blockContentFallbacks.activityStatus,
      title: title || blockContentFallbacks.activityTitle,
    };
  });
}

export function parseTable(columnsValue: string, rowsValue: string) {
  const columns = columnsValue
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  const rows = toLines(rowsValue).map((row) =>
    row
      .split("|")
      .map((cell) => cell.trim())
      .slice(0, columns.length || undefined),
  );

  return { columns, rows };
}

export function toBuilderThemeStyleVariables(projectTheme: {
  accent: string;
  accentContrast: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
}) {
  return {
    ["--builder-background" as string]: projectTheme.background,
    ["--builder-foreground" as string]: projectTheme.foreground,
    ["--builder-muted" as string]: projectTheme.muted,
    ["--builder-surface" as string]: projectTheme.surface,
    ["--builder-border" as string]: "rgba(16, 24, 40, 0.12)",
    ["--builder-accent" as string]: projectTheme.accent,
    ["--builder-accent-contrast" as string]: projectTheme.accentContrast,
  } as CSSProperties;
}
`;
}
