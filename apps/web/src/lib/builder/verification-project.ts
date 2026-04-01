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
  const gridId = createId();
  const featureGridId = createId();
  const faqId = createId();
  const testimonialId = createId();
  const activityFeedId = createId();
  const formCardId = createId();
  const pricingCardId = createId();
  const chatInputId = createId();
  const messageThreadId = createId();
  const dataTableId = createId();
  const sidebarShellId = createId();

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
          chatInputId,
          messageThreadId,
          dataTableId,
          sidebarShellId,
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
      [sectionId]: {
        children: [stackId, gridId],
        id: sectionId,
        props: {
          backgroundStyle: "surface",
          inset: true,
          paddingY: 40,
          title: "Coverage section",
        },
        type: "section",
      },
      [sidebarShellId]: {
        children: [],
        id: sidebarShellId,
        props: {
          highlight: "Parity",
          items: "Overview\nCoverage\nParity\nExport\nDocs",
          title: "Coverage nav",
        },
        type: "sidebarShell",
      },
      [stackId]: {
        children: [textId, buttonId, statCardId],
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
          value: "18",
        },
        type: "statCard",
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
    },
    updatedAt: new Date().toISOString(),
  };

  return normalizeBuilderProjectStructure(legacyProject);
}
