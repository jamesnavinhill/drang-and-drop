import { createId } from "./default-project";
import { normalizeBuilderProjectStructure } from "./regions";
import type { BuilderProject, LegacyBuilderProject } from "./types";

export function createBlockContractVerificationProject(): BuilderProject {
  const homeId = createId();
  const navbarId = createId();
  const heroId = createId();
  const sectionId = createId();
  const stackId = createId();
  const textId = createId();
  const buttonId = createId();
  const statCardId = createId();
  const metricRowId = createId();
  const gridId = createId();
  const featureGridId = createId();
  const faqId = createId();
  const testimonialId = createId();
  const activityFeedId = createId();
  const formCardId = createId();
  const pricingCardId = createId();
  const logoGridId = createId();
  const calloutCardId = createId();
  const ctaBannerId = createId();
  const stepListId = createId();
  const comparisonTableId = createId();
  const infoListId = createId();
  const profileCardId = createId();
  const chatInputId = createId();
  const emptyStateId = createId();
  const workspaceHeaderId = createId();
  const sidebarShellId = createId();
  const sidebarTextId = createId();
  const sidebarButtonId = createId();
  const messageThreadId = createId();
  const dataTableId = createId();

  const legacyProject: LegacyBuilderProject = {
    id: createId(),
    name: "Block Contract Coverage",
    description: "Internal verification project that exercises every parity-critical shipped block type.",
    pages: [
      {
        description: "Coverage route for starter-render parity verification.",
        id: homeId,
        name: "Coverage",
        path: "/",
        rootIds: [navbarId, heroId, sectionId],
      },
    ],
    theme: {
      accent: "#14532d",
      accentContrast: "#f0fdf4",
      background: "#f6fbf7",
      fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
      foreground: "#112018",
      muted: "#506253",
      radius: 24,
      shadow: 3,
      surface: "#ffffff",
    },
    nodes: {
      [activityFeedId]: {
        children: [],
        id: activityFeedId,
        props: {
          body: "Timeline coverage for the generated-starter parity route.",
          entries:
            "Renderer seam review|Today at 9:15 AM|Ready\nCatalog coverage sweep|Today at 11:30 AM|Review\nStarter parity export|Today at 4:00 PM|Queued",
          title: "Activity coverage",
        },
        type: "activityFeed",
      },
      [buttonId]: {
        children: [],
        id: buttonId,
        props: {
          fullWidth: true,
          label: "Nested action",
          variant: "secondary",
        },
        type: "button",
      },
      [calloutCardId]: {
        children: [],
        id: calloutCardId,
        props: {
          body: "Callouts help us validate tone-aware cards without forcing more specialized alert systems yet.",
          eyebrow: "Coverage note",
          title: "Keep the first pass broad and reusable.",
          tone: "accent",
        },
        type: "calloutCard",
      },
      [chatInputId]: {
        children: [],
        id: chatInputId,
        props: {
          buttonLabel: "Send coverage note",
          label: "Assistant shell coverage",
          placeholder: "Summarize where preview and export still diverge.",
        },
        type: "chatInput",
      },
      [comparisonTableId]: {
        children: [],
        id: comparisonTableId,
        props: {
          body: "Coverage should include both application tables and marketing-style comparisons.",
          columns: "Capability|Starter|Growth",
          rows: "Catalog breadth|Focused|Expanded\nParity coverage|Required|Required\nTemplate count|Small|Small",
          title: "Coverage comparison",
        },
        type: "comparisonTable",
      },
      [ctaBannerId]: {
        children: [],
        id: ctaBannerId,
        props: {
          align: "left",
          body: "This internal page keeps every shipped block type exercised as the catalog evolves.",
          eyebrow: "Parity harness",
          primaryLabel: "Review contracts",
          secondaryLabel: "Inspect export",
          title: "Ship catalog growth with verification in the same slice.",
        },
        type: "ctaBanner",
      },
      [dataTableId]: {
        children: [],
        id: dataTableId,
        props: {
          columns: "Surface|Status|Owner",
          rows: "Preview|Aligned|Studio\nExport|Aligned|Starter\nContracts|Active|Builder",
          title: "Parity matrix",
        },
        type: "dataTable",
      },
      [emptyStateId]: {
        children: [],
        id: emptyStateId,
        props: {
          body: "An empty-state block belongs in the foundational app catalog even before deeper workflow systems exist.",
          primaryLabel: "Create first route",
          secondaryLabel: "Review setup guide",
          title: "No active workspace yet.",
        },
        type: "emptyState",
      },
      [faqId]: {
        children: [],
        id: faqId,
        props: {
          body: "Coverage content should still look like a real page, not a dead fixture.",
          items:
            "Why keep this internal?|So every shipped block type stays exercised even when user-facing templates evolve.\nDoes this replace template verification?|No. It complements shipped-template verification with full contract coverage.",
          title: "Coverage FAQ",
        },
        type: "faqList",
      },
      [featureGridId]: {
        children: [],
        id: featureGridId,
        props: {
          body: "This internal page keeps every parity-critical block type alive in starter verification.",
          features: "Root-only shell coverage\nNested layout coverage\nApplication block coverage\nContract-driven verification",
          title: "Coverage signals",
        },
        type: "featureGrid",
      },
      [formCardId]: {
        children: [],
        id: formCardId,
        props: {
          body: "Use the same exported shell for requests, approvals, or internal review loops.",
          buttonLabel: "Request review",
          title: "Form coverage",
        },
        type: "formCard",
      },
      [gridId]: {
        children: [
          featureGridId,
          faqId,
          testimonialId,
          activityFeedId,
          formCardId,
          pricingCardId,
          comparisonTableId,
          calloutCardId,
          infoListId,
          profileCardId,
          chatInputId,
          emptyStateId,
          workspaceHeaderId,
        ],
        id: gridId,
        props: {
          columns: 2,
          gap: 20,
          title: "Coverage grid",
        },
        type: "grid",
      },
      [heroId]: {
        children: [],
        id: heroId,
        props: {
          align: "left",
          body: "This route exists to keep the exported starter honest as the block system grows and the templates evolve.",
          eyebrow: "Internal parity harness",
          primaryLabel: "Review contracts",
          secondaryLabel: "Inspect export",
          title: "Exercise every shipped block type through one clean verification project.",
        },
        type: "hero",
      },
      [infoListId]: {
        children: [],
        id: infoListId,
        props: {
          items: "Coverage owner|Builder system\nVerification loop|Contracts, commands, DnD, starters\nCatalog phase|07 foundational catalog",
          title: "Coverage details",
        },
        type: "infoList",
      },
      [logoGridId]: {
        children: [],
        id: logoGridId,
        props: {
          body: "This keeps trust and proof semantics covered without introducing asset dependency into the test fixture.",
          logos: "Northline\nFieldnote\nOperator OS\nSummit\nOrbit\nCanvas Lab",
          title: "Coverage logos",
        },
        type: "logoGrid",
      },
      [messageThreadId]: {
        children: [],
        id: messageThreadId,
        props: {
          title: "Coverage handoff",
          transcript:
            "lead|Did the exported starter exercise every block type?\nassistant|Yes. The coverage route now includes the full parity-critical catalog.\nlead|Great. Keep the docs aligned with the contracts too.",
        },
        type: "messageThread",
      },
      [metricRowId]: {
        children: [],
        id: metricRowId,
        props: {
          metrics: "Covered block types|28|All shipped\nTemplates verified|3|Current trio\nRender paths|2|Preview and starter",
          title: "Coverage metrics",
        },
        type: "metricRow",
      },
      [navbarId]: {
        children: [],
        id: navbarId,
        props: {
          align: "between",
          ctaLabel: "Open verification",
          links: "Contracts\nParity\nCoverage\nDocs",
          logo: "Coverage Studio",
        },
        type: "navbar",
      },
      [pricingCardId]: {
        children: [],
        id: pricingCardId,
        props: {
          cta: "Ship verification",
          price: "$0",
          tagline: "Internal-only route used to keep parity expectations real.",
          tier: "Coverage",
        },
        type: "pricingCard",
      },
      [profileCardId]: {
        children: [],
        id: profileCardId,
        props: {
          bio: "Keeps catalog discipline, parity review, and starter verification aligned while the builder grows.",
          detail: "Builder system",
          name: "Coverage Owner",
          role: "Internal verification",
        },
        type: "profileCard",
      },
      [sectionId]: {
        children: [stackId, gridId, logoGridId, stepListId, ctaBannerId, sidebarShellId],
        id: sectionId,
        props: {
          backgroundStyle: "surface",
          inset: true,
          paddingY: 40,
          title: "Coverage section",
        },
        type: "section",
      },
      [sidebarButtonId]: {
        children: [],
        id: sidebarButtonId,
        props: {
          fullWidth: true,
          label: "Sidebar action",
          variant: "primary",
        },
        type: "button",
      },
      [sidebarShellId]: {
        id: sidebarShellId,
        props: {
          gap: 22,
          highlight: "Parity",
          items: "Overview\nCoverage\nParity\nExport\nDocs",
          sidebarPosition: "right",
          sidebarWidth: 300,
          title: "Coverage nav",
        },
        regions: {
          content: [messageThreadId, dataTableId],
          sidebar: [sidebarTextId, sidebarButtonId],
        },
        type: "sidebarShell",
      },
      [sidebarTextId]: {
        children: [],
        id: sidebarTextId,
        props: {
          body: "Use the sidebar rail to surface compact context, navigation helpers, or supporting status signals.",
          size: "sm",
          title: "Sidebar coverage",
        },
        type: "text",
      },
      [stackId]: {
        children: [textId, buttonId, statCardId, metricRowId],
        id: stackId,
        props: {
          align: "stretch",
          gap: 18,
          title: "Coverage stack",
        },
        type: "stack",
      },
      [statCardId]: {
        children: [],
        id: statCardId,
        props: {
          label: "Covered block types",
          trend: "All required",
          value: "28",
        },
        type: "statCard",
      },
      [stepListId]: {
        children: [],
        id: stepListId,
        props: {
          body: "Process-style content should stay covered because it is one of the most reusable professional page shapes.",
          steps:
            "Define the block|Keep the contract clear and placement explicit.\nRender both surfaces|Make preview and starter behavior intentionally aligned.\nVerify the result|Update coverage before calling the block shipped.",
          title: "Coverage process",
        },
        type: "stepList",
      },
      [testimonialId]: {
        children: [],
        id: testimonialId,
        props: {
          author: "Builder system",
          quote: "Contract-driven coverage keeps the exported starter trustworthy as the block system grows.",
          role: "Internal verification",
        },
        type: "testimonialCard",
      },
      [textId]: {
        children: [],
        id: textId,
        props: {
          body: "This stack intentionally covers nested content, nested actions, and nested application blocks in one place.",
          size: "lg",
          title: "Coverage text",
        },
        type: "text",
      },
      [workspaceHeaderId]: {
        children: [],
        id: workspaceHeaderId,
        props: {
          body: "The app catalog now includes a stronger route-header primitive for dashboards and workspace surfaces.",
          eyebrow: "Workspace",
          primaryLabel: "Open queue",
          secondaryLabel: "Share update",
          tags: "Ready\n2 blockers\nOwner: Avery",
          title: "Coverage header",
        },
        type: "workspaceHeader",
      },
    },
    updatedAt: new Date().toISOString(),
  };

  return normalizeBuilderProjectStructure(legacyProject);
}
