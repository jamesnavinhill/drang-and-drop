import { blockTypes } from "./types";
import type { BlockContract, BlockDefinition, BlockType } from "./types";

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
      allowedParents: ["page-root"],
    },
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
      allowedParents: ["page-root", "layout-container"],
      childTargetKind: "layout-container",
    },
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
      allowedParents: ["page-root", "layout-container"],
      childTargetKind: "layout-container",
    },
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
      allowedParents: ["page-root", "layout-container"],
      childTargetKind: "layout-container",
    },
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
      allowedParents: ["page-root"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
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
      allowedParents: ["page-root", "layout-container"],
    },
    verification: {
      previewExportParity: "required",
      structure: "required",
    },
  }),
  sidebarShell: defineBlockContract("sidebarShell", {
    capabilities: ["leaf", "parity-critical"],
    definition: {
      title: "Sidebar Shell",
      description: "Navigation preview block for internal tools and dashboards.",
      icon: "R",
      category: "Application",
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
    family: "application",
    placement: {
      allowedParents: ["page-root", "layout-container"],
    },
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
