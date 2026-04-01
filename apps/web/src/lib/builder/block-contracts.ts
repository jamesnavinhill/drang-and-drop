import { blockTypes } from "./types";
import type {
  BlockContract,
  BlockDefinition,
  BlockRegionDefinition,
  BlockRenderDefinition,
  BlockRenderParityStrategy,
  BlockType,
  PlacementTargetKind,
} from "./types";

function defineBlockContract(
  type: BlockType,
  contract: Omit<BlockContract, "definition" | "type"> & {
    definition: Omit<BlockDefinition, "type">;
  },
): BlockContract {
  return {
    ...contract,
    definition: {
      ...contract.definition,
      type,
    },
    type,
  };
}

function defineRenderContract({
  children,
  note,
  strategy,
}: {
  children: BlockRenderDefinition["children"];
  note: string;
  strategy: BlockRenderParityStrategy;
}): BlockRenderDefinition {
  return {
    children,
    parity: {
      notes: [note],
      strategy,
    },
    preview: {
      implementation: "block-preview.tsx",
      surface: "builder-canvas",
    },
    starter: {
      implementation: "starter-artifacts.ts#createRendererFile",
      surface: "generated-route",
    },
  };
}

function defineLeafRender(note: string) {
  return defineRenderContract({
    children: "leaf",
    note,
    strategy: "shared-content",
  });
}

function defineLayoutRender(note: string) {
  return defineRenderContract({
    children: "renders-children",
    note,
    strategy: "shared-layout",
  });
}

function defineRootRender(note: string) {
  return defineRenderContract({
    children: "leaf",
    note,
    strategy: "shared-shell",
  });
}

function defineRegion(
  id: string,
  kind: PlacementTargetKind,
  label: string,
  {
    allowsMultiple = true,
    description,
    emptyMessage,
    role = "primary",
  }: {
    allowsMultiple?: boolean;
    description: string;
    emptyMessage: string;
    role?: BlockRegionDefinition["role"];
  },
): BlockRegionDefinition {
  return {
    allowsMultiple,
    description,
    emptyMessage,
    id,
    kind,
    label,
    role,
  };
}

const pageFooterMainAndLayoutContent = ["page-footer", "page-main", "layout-content"] as const;
const pageFooterMainAndNestedLayoutRegions = [
  "page-footer",
  "page-main",
  "layout-content",
  "layout-sidebar",
] as const;
const layoutContentAndSidebar = ["layout-content", "layout-sidebar"] as const;
const contentRegion = [
  defineRegion("content", "layout-content", "Content", {
    description: "Add nested blocks here to compose the primary layout flow.",
    emptyMessage: "Drop compatible blocks here.",
  }),
] as const;
const sidebarShellRegions = [
  defineRegion("content", "layout-content", "Content", {
    description: "Compose the primary workspace surface here.",
    emptyMessage: "Add layout or content blocks here for the main workspace.",
  }),
  defineRegion("sidebar", "layout-sidebar", "Sidebar rail", {
    description: "Add compact context, actions, or supporting status blocks here.",
    emptyMessage: "Add compact supporting blocks here.",
    role: "supporting",
  }),
] as const;

const blockContractsByType: Record<BlockType, BlockContract> = {
  navbar: defineBlockContract("navbar", {
    capabilities: ["future-region-pressure", "parity-critical", "root-only"],
    definition: {
      title: "Navbar",
      description: "Root-level navigation bar with a logo, links, and optional CTA.",
      icon: "N",
      category: "Marketing",
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
    family: "root-composite",
    placement: {
      allowedRegions: ["page-header"],
      regions: [],
    },
    render: defineRootRender(
      "Preview keeps the navbar inside an editor-safe shell, while starter export keeps the public page chrome aligned around the same content payload.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  section: defineBlockContract("section", {
    capabilities: ["future-region-pressure", "layout-owner", "parity-critical"],
    definition: {
      title: "Section",
      description: "Flexible content wrapper with spacing and background controls.",
      icon: "S",
      category: "Layout",
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
    family: "layout",
    placement: {
      allowedRegions: [...pageFooterMainAndLayoutContent],
      regions: [...contentRegion],
    },
    render: defineLayoutRender(
      "Section spacing, background mode, and child flow should stay aligned across preview and starter, even though preview keeps extra editor framing labels visible.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  stack: defineBlockContract("stack", {
    capabilities: ["layout-owner", "parity-critical"],
    definition: {
      title: "Stack",
      description: "Vertical stack for content, cards, and compact layouts.",
      icon: "V",
      category: "Layout",
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
    family: "layout",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [...contentRegion],
    },
    render: defineLayoutRender(
      "Stack layout parity is driven by the shared gap and alignment contract while each surface keeps its own presentation details.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  grid: defineBlockContract("grid", {
    capabilities: ["layout-owner", "parity-critical"],
    definition: {
      title: "Grid",
      description: "Responsive card rail with adjustable columns and gap.",
      icon: "G",
      category: "Layout",
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
    family: "layout",
    placement: {
      allowedRegions: [...pageFooterMainAndLayoutContent],
      regions: [...contentRegion],
    },
    render: defineLayoutRender(
      "Grid parity is defined by shared column and gap semantics, with preview and starter free to style the surrounding shell differently.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  hero: defineBlockContract("hero", {
    capabilities: ["future-region-pressure", "parity-critical", "root-only"],
    definition: {
      title: "Hero",
      description: "A launch-ready top section with headline, copy, and action row.",
      icon: "H",
      category: "Marketing",
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
    family: "root-composite",
    placement: {
      allowedRegions: ["page-main"],
      regions: [],
    },
    render: defineRootRender(
      "Hero parity depends on shared headline, body, CTA, and alignment behavior while the preview can keep an editor-oriented shell treatment.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  text: defineBlockContract("text", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Text",
      description: "Editable copy block with size and tone controls.",
      icon: "T",
      category: "Content",
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
    family: "content",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Text blocks keep copy and size semantics shared between builder preview and starter export, even when the preview wraps them in an editor card.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  button: defineBlockContract("button", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Button",
      description: "Standalone action button for CTAs and command strips.",
      icon: "B",
      category: "Content",
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
    family: "content",
    placement: {
      allowedRegions: [...layoutContentAndSidebar],
      regions: [],
    },
    render: defineLeafRender(
      "Button parity is anchored to the shared label, variant, and width contract while each surface chooses the framing around the CTA.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  featureGrid: defineBlockContract("featureGrid", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Feature Grid",
      description: "Marketing summary block with a title and feature bullets.",
      icon: "F",
      category: "Marketing",
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
    family: "content",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Feature grid parity uses the same parsed feature-line content on both surfaces, with only the surrounding shell presentation allowed to differ.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  faqList: defineBlockContract("faqList", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "FAQ List",
      description: "Question and answer stack for launch pages, docs surfaces, and pricing follow-up.",
      icon: "?",
      category: "Marketing",
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
    family: "content",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "FAQ parity is defined by the shared item parser and question-answer ordering, while preview and starter may keep slightly different framing details.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  testimonialCard: defineBlockContract("testimonialCard", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Testimonial",
      description: "Proof block with a quote, author, and role for social credibility.",
      icon: "Q",
      category: "Marketing",
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
    family: "content",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Testimonial parity centers on quote, author, and role content staying aligned even when preview and starter use different card chrome.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  statCard: defineBlockContract("statCard", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Stat Card",
      description: "Compact KPI block for dashboards and summaries.",
      icon: "K",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...layoutContentAndSidebar],
      regions: [],
    },
    render: defineLeafRender(
      "Stat card parity is driven by the shared KPI label, value, and trend payload while each surface can tune the card presentation to its context.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  activityFeed: defineBlockContract("activityFeed", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Activity Feed",
      description: "Operational timeline block for launches, approvals, incidents, or internal updates.",
      icon: "A",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Activity feed parity uses the shared activity-entry parser so the exported starter and builder preview keep the same operational timeline semantics.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  formCard: defineBlockContract("formCard", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Form Card",
      description: "A simple signup or request form shell.",
      icon: "I",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Form card parity is based on the shared title, body, and button contract, with each surface free to keep its own surrounding shell details.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  pricingCard: defineBlockContract("pricingCard", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Pricing Card",
      description: "Single plan pricing block for launches and landing pages.",
      icon: "P",
      category: "Marketing",
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
    family: "content",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Pricing card parity depends on shared tier, price, tagline, and CTA semantics while preview and starter preserve their own page-specific framing.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  chatInput: defineBlockContract("chatInput", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Chat Input",
      description: "Prompt entry shell for assistants, support, or copilots.",
      icon: "C",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Chat input parity keeps the same label, placeholder, and action semantics across builder preview and starter export.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  messageThread: defineBlockContract("messageThread", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Message Thread",
      description: "Conversation shell for copilots, support flows, or internal collaboration.",
      icon: "M",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Message thread parity is defined by the shared transcript parser and assistant/user role styling semantics, not by identical shell markup.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  dataTable: defineBlockContract("dataTable", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Data Table",
      description: "Compact table block for pricing comparisons, reports, or internal tooling views.",
      icon: "D",
      category: "Application",
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
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndNestedLayoutRegions],
      regions: [],
    },
    render: defineLeafRender(
      "Data table parity depends on the shared column and row parser so both surfaces render the same structured dataset with surface-specific chrome.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  sidebarShell: defineBlockContract("sidebarShell", {
    capabilities: ["future-region-pressure", "layout-owner", "parity-critical"],
    definition: {
      title: "Sidebar Shell",
      description: "Two-column application shell with a configured navigation rail and explicit sidebar plus content regions.",
      icon: "R",
      category: "Application",
      defaults: {
        gap: 18,
        title: "Workspace",
        items: "Overview\nAutomation\nMembers\nBilling\nDeployments",
        highlight: "Automation",
        sidebarPosition: "left",
        sidebarWidth: 280,
      },
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "items", label: "Items", type: "textarea" },
        { key: "highlight", label: "Highlighted item", type: "text" },
        {
          key: "sidebarPosition",
          label: "Sidebar position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        { key: "sidebarWidth", label: "Sidebar width", type: "range", min: 220, max: 360, step: 10 },
        { key: "gap", label: "Region gap", type: "range", min: 12, max: 32, step: 2 },
      ],
    },
    family: "application",
    placement: {
      allowedRegions: [...pageFooterMainAndLayoutContent],
      regions: [...sidebarShellRegions],
    },
    render: defineLayoutRender(
      "Sidebar shell parity keeps the same configured navigation rail plus sidebar and content layout semantics while preview and starter render each region through their own surface-specific shell treatment.",
    ),
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
};

export const blockContracts = blockTypes.map((type) => blockContractsByType[type]);

export function getBlockContract(type: BlockType) {
  return blockContractsByType[type];
}
