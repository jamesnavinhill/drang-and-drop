import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type {
  BuilderNode,
  BuilderProject,
  BuilderTheme,
  ComponentDefinition,
  ComponentType,
} from "./types";

const pageRootTypes: ComponentType[] = [
  "navbar",
  "hero",
  "section",
  "stack",
  "grid",
  "featureGrid",
  "faqList",
  "testimonialCard",
  "dataTable",
  "activityFeed",
  "messageThread",
  "formCard",
  "pricingCard",
  "sidebarShell",
  "chatInput",
  "text",
];

const containerChildTypes: ComponentType[] = [
  "text",
  "button",
  "featureGrid",
  "faqList",
  "testimonialCard",
  "statCard",
  "activityFeed",
  "formCard",
  "pricingCard",
  "chatInput",
  "messageThread",
  "dataTable",
  "sidebarShell",
  "stack",
  "grid",
  "section",
];

const definitions: Record<ComponentType, ComponentDefinition> = {
  navbar: {
    type: "navbar",
    title: "Navbar",
    description: "Root-level navigation bar with a logo, links, and optional CTA.",
    icon: "N",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    rootOnly: true,
    defaults: {
      logo: "Signal Flow",
      links: "Product\nPricing\nTemplates\nDocs",
      ctaLabel: "Book demo",
      align: "between",
    },
    fields: [
      { key: "logo", label: "Logo label", type: "text" },
      { key: "links", label: "Links", type: "textarea", placeholder: "One link per line" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      {
        key: "align",
        label: "Align",
        type: "select",
        options: [
          { label: "Spread", value: "between" },
          { label: "Centered", value: "center" },
        ],
      },
    ],
  },
  section: {
    type: "section",
    title: "Section",
    description: "Flexible content wrapper with spacing and background controls.",
    icon: "S",
    category: "Layout",
    canHaveChildren: true,
    accepts: containerChildTypes,
    defaults: {
      title: "Section frame",
      backgroundStyle: "surface",
      paddingY: 48,
      inset: true,
    },
    fields: [
      { key: "title", label: "Label", type: "text" },
      {
        key: "backgroundStyle",
        label: "Background",
        type: "select",
        options: [
          { label: "Surface", value: "surface" },
          { label: "Accent wash", value: "accent" },
          { label: "Transparent", value: "transparent" },
        ],
      },
      { key: "paddingY", label: "Vertical padding", type: "range", min: 24, max: 120, step: 4 },
      { key: "inset", label: "Inset content", type: "toggle" },
    ],
  },
  stack: {
    type: "stack",
    title: "Stack",
    description: "Vertical stack for content, cards, and compact layouts.",
    icon: "V",
    category: "Layout",
    canHaveChildren: true,
    accepts: containerChildTypes,
    defaults: {
      title: "Content stack",
      gap: 18,
      align: "stretch",
    },
    fields: [
      { key: "title", label: "Label", type: "text" },
      { key: "gap", label: "Gap", type: "range", min: 8, max: 40, step: 2 },
      {
        key: "align",
        label: "Align",
        type: "select",
        options: [
          { label: "Stretch", value: "stretch" },
          { label: "Start", value: "flex-start" },
          { label: "Center", value: "center" },
        ],
      },
    ],
  },
  grid: {
    type: "grid",
    title: "Grid",
    description: "Responsive card rail with adjustable columns and gap.",
    icon: "G",
    category: "Layout",
    canHaveChildren: true,
    accepts: containerChildTypes,
    defaults: {
      title: "Grid",
      columns: 3,
      gap: 18,
    },
    fields: [
      { key: "title", label: "Label", type: "text" },
      { key: "columns", label: "Columns", type: "range", min: 1, max: 4, step: 1 },
      { key: "gap", label: "Gap", type: "range", min: 8, max: 36, step: 2 },
    ],
  },
  hero: {
    type: "hero",
    title: "Hero",
    description: "A launch-ready top section with headline, copy, and action row.",
    icon: "H",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      eyebrow: "Visual Builder",
      title: "Build polished product surfaces before the backend catches up.",
      body: "Shape pages, dashboards, and starter apps with a constrained canvas that still exports a real codebase.",
      primaryLabel: "Open roadmap",
      secondaryLabel: "Preview export",
      align: "left",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "primaryLabel", label: "Primary CTA", type: "text" },
      { key: "secondaryLabel", label: "Secondary CTA", type: "text" },
      {
        key: "align",
        label: "Align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      },
    ],
  },
  text: {
    type: "text",
    title: "Text",
    description: "Editable copy block with size and tone controls.",
    icon: "T",
    category: "Content",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Section title",
      body: "Use the inspector to change the language, tone, and scale for each block.",
      size: "lg",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      {
        key: "size",
        label: "Size",
        type: "select",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    ],
  },
  button: {
    type: "button",
    title: "Button",
    description: "Standalone action button for CTAs and command strips.",
    icon: "B",
    category: "Content",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      label: "Primary action",
      variant: "primary",
      fullWidth: false,
    },
    fields: [
      { key: "label", label: "Label", type: "text" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Ghost", value: "ghost" },
        ],
      },
      { key: "fullWidth", label: "Full width", type: "toggle" },
    ],
  },
  featureGrid: {
    type: "featureGrid",
    title: "Feature Grid",
    description: "Marketing summary block with a title and feature bullets.",
    icon: "F",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Why teams will keep using it",
      body: "A focused builder is easier to trust than a giant no-code maze.",
      features: "Schema-driven pages\nResponsive preview\nZip export\nTheme controls",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "features", label: "Features", type: "textarea", placeholder: "One feature per line" },
    ],
  },
  faqList: {
    type: "faqList",
    title: "FAQ List",
    description: "Question and answer stack for launch pages, docs surfaces, and pricing follow-up.",
    icon: "?",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Questions teams ask before rollout",
      body: "Use this block to handle objections, explain the operating model, or keep launch details easy to skim.",
      items:
        "How strict is the builder?|The layout system stays constrained so export quality and responsive behavior remain predictable.\nCan teams keep editing the code later?|Yes. The exported starter stays readable and intentionally schema-driven.\nWhat should we verify next?|Broader block coverage, stronger drag rules, and deeper generated-app fidelity checks.",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      {
        key: "items",
        label: "Items",
        type: "textarea",
        placeholder: "Use question|answer format, one item per line",
      },
    ],
  },
  testimonialCard: {
    type: "testimonialCard",
    title: "Testimonial",
    description: "Proof block with a quote, author, and role for social credibility.",
    icon: "Q",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      quote: "This builder gave us a cleaner launch surface without boxing us into generated chaos.",
      author: "Avery Stone",
      role: "Product lead, Northline",
    },
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      { key: "role", label: "Role", type: "text" },
    ],
  },
  statCard: {
    type: "statCard",
    title: "Stat Card",
    description: "Compact KPI block for dashboards and summaries.",
    icon: "K",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      label: "Activated workspaces",
      value: "128",
      trend: "+12.4%",
    },
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
      { key: "trend", label: "Trend", type: "text" },
    ],
  },
  activityFeed: {
    type: "activityFeed",
    title: "Activity Feed",
    description: "Operational timeline block for launches, approvals, incidents, or internal updates.",
    icon: "A",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Recent activity",
      body: "Highlight the events, ownership changes, and status checks a team should read first.",
      entries:
        "Release readiness review|Today at 9:10 AM|Ready\nGenerated starter audit|Today at 11:40 AM|Review\nDesign QA follow-up|Tomorrow at 2:00 PM|Queued",
    },
    fields: [
      { key: "title", label: "Feed title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      {
        key: "entries",
        label: "Entries",
        type: "textarea",
        placeholder: "Use item|meta|status format, one entry per line",
      },
    ],
  },
  formCard: {
    type: "formCard",
    title: "Form Card",
    description: "A simple signup or request form shell.",
    icon: "I",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Ship the waitlist",
      body: "Get signups today and wire the submission later in v2.",
      buttonLabel: "Request access",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "buttonLabel", label: "Button label", type: "text" },
    ],
  },
  pricingCard: {
    type: "pricingCard",
    title: "Pricing Card",
    description: "Single plan pricing block for launches and landing pages.",
    icon: "P",
    category: "Marketing",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      tier: "Studio Pro",
      price: "$29",
      tagline: "Per editor seat, with export included.",
      cta: "Start free",
    },
    fields: [
      { key: "tier", label: "Tier", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "cta", label: "Button label", type: "text" },
    ],
  },
  chatInput: {
    type: "chatInput",
    title: "Chat Input",
    description: "Prompt entry shell for assistants, support, or copilots.",
    icon: "C",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      label: "Ask the system anything",
      placeholder: "Summarize the launch plan and tell me what is missing.",
      buttonLabel: "Send",
    },
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "textarea" },
      { key: "buttonLabel", label: "Button label", type: "text" },
    ],
  },
  messageThread: {
    type: "messageThread",
    title: "Message Thread",
    description: "Conversation shell for copilots, support flows, or internal collaboration.",
    icon: "M",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Latest handoff",
      transcript:
        "lead|Can we tighten the onboarding copy before launch?\nassistant|Yes. Start with the hero title and remove the second sentence.\nlead|Great. Queue that for review after the pricing pass.",
    },
    fields: [
      { key: "title", label: "Thread title", type: "text" },
      {
        key: "transcript",
        label: "Transcript",
        type: "textarea",
        placeholder: "Use sender|message format, one line per message",
      },
    ],
  },
  dataTable: {
    type: "dataTable",
    title: "Data Table",
    description: "Compact table block for pricing comparisons, reports, or internal tooling views.",
    icon: "D",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Launch report",
      columns: "Team|Status|Owner",
      rows: "Growth|Ready|Avery\nSupport|Review|Nina\nProduct|Blocked|Luca",
    },
    fields: [
      { key: "title", label: "Table title", type: "text" },
      { key: "columns", label: "Columns", type: "text", placeholder: "Use | between columns" },
      {
        key: "rows",
        label: "Rows",
        type: "textarea",
        placeholder: "Use | between cells and one row per line",
      },
    ],
  },
  sidebarShell: {
    type: "sidebarShell",
    title: "Sidebar Shell",
    description: "Navigation preview block for internal tools and dashboards.",
    icon: "R",
    category: "Application",
    canHaveChildren: false,
    accepts: [],
    defaults: {
      title: "Workspace",
      items: "Overview\nAutomation\nMembers\nBilling\nDeployments",
      highlight: "Automation",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Items", type: "textarea" },
      { key: "highlight", label: "Highlighted item", type: "text" },
    ],
  },
};

export const componentRegistry = Object.values(definitions);

function toLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTable(columnsValue: string, rowsValue: string) {
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

function parseTranscript(value: string) {
  return toLines(value).map((entry) => {
    const [sender, ...rest] = entry.split("|");
    const message = rest.join("|").trim();
    const normalizedSender = sender.trim() || "user";

    return {
      sender: normalizedSender,
      message: message || "Message",
      isAssistant: /assistant|copilot|system/i.test(normalizedSender),
    };
  });
}

function parseFaqItems(value: string) {
  return toLines(value).map((entry) => {
    const [question, ...rest] = entry.split("|");
    const answer = rest.join("|").trim();

    return {
      answer: answer || "Add an answer in the inspector.",
      question: question.trim() || "Question",
    };
  });
}

function parseActivityEntries(value: string) {
  return toLines(value).map((entry) => {
    const [title, meta, status] = entry.split("|").map((item) => item.trim());

    return {
      meta: meta || "No timestamp yet",
      status: status || "Queued",
      title: title || "Activity",
    };
  });
}

export function getComponentDefinition(type: ComponentType) {
  return definitions[type];
}

export function canAcceptChild(parentType: ComponentType | "page", childType: ComponentType) {
  const childDefinition = definitions[childType];

  if (parentType === "page") {
    return pageRootTypes.includes(childType);
  }

  if (childDefinition.rootOnly) {
    return false;
  }

  const definition = definitions[parentType];
  if (!definition.canHaveChildren) {
    return false;
  }

  return definition.accepts === "any" ? true : definition.accepts.includes(childType);
}

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
  children: ReactNode,
) {
  void project;

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
          <div className="grid gap-4">{children}</div>
        </section>
      );
    }
    case "stack":
      return <StackLayout node={node}>{children}</StackLayout>;
    case "grid":
      return <GridLayout node={node}>{children}</GridLayout>;
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

      return (
        <div className="rounded-[calc(var(--builder-radius)-8px)] border border-[color:var(--builder-border)] bg-white/86 p-4">
          <p className="mb-4 text-sm font-semibold text-[color:var(--builder-foreground)]">{`${node.props.title}`}</p>
          <div className="grid gap-2">
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
