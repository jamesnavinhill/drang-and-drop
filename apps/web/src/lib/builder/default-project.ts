import { normalizeBuilderProjectStructure } from "./regions";
import type { BuilderTheme, LegacyBuilderNode, LegacyBuilderPage, LegacyBuilderProject, BuilderProject } from "./types";

export function createId() {
  return crypto.randomUUID();
}

export const builderTemplateCatalog = [
  {
    id: "launch-studio",
    name: "Launch Studio",
    description: "Balanced marketing starter with proof, pricing, and a product-oriented export story.",
    focus: "Marketing",
  },
  {
    id: "signal-flow",
    name: "Signal Flow",
    description: "SaaS landing template with sharper messaging, onboarding CTA, and clear conversion sections.",
    focus: "SaaS",
  },
  {
    id: "ops-hub",
    name: "Ops Hub",
    description: "Dashboard-flavored template with KPI rails, workspace navigation, and internal-tool energy.",
    focus: "Application",
  },
] as const;

export type BuilderTemplateId = (typeof builderTemplateCatalog)[number]["id"];

function createProjectFrame({
  name,
  description,
  theme,
  pages,
  nodes,
}: {
  description: string;
  name: string;
  nodes: Record<string, LegacyBuilderNode>;
  pages: LegacyBuilderPage[];
  theme: BuilderTheme;
}): BuilderProject {
  const legacyProject: LegacyBuilderProject = {
    id: createId(),
    name,
    description,
    updatedAt: new Date().toISOString(),
    theme,
    pages,
    nodes,
  };

  return normalizeBuilderProjectStructure(legacyProject);
}

function createLaunchStudioProject(): BuilderProject {
  const homeNavbarId = createId();
  const heroId = createId();
  const statsSectionId = createId();
  const statsGridId = createId();
  const statOneId = createId();
  const statTwoId = createId();
  const statThreeId = createId();
  const proofSectionId = createId();
  const proofGridId = createId();
  const featureId = createId();
  const faqId = createId();
  const testimonialId = createId();
  const formId = createId();
  const chatId = createId();
  const pricingNavbarId = createId();
  const pricingHeroId = createId();
  const pricingGridId = createId();
  const pricingCardId = createId();
  const sidebarId = createId();
  const pricingSidebarTextId = createId();
  const pricingSidebarButtonId = createId();
  const pricingSidebarTableId = createId();

  const homeId = createId();
  const pricingPageId = createId();

  return createProjectFrame({
    name: "Launch Studio",
    description: "A visual builder prototype aimed at exportable starter apps.",
    theme: {
      accent: "#0f766e",
      accentContrast: "#f0fdfa",
      background: "#f7f4ed",
      surface: "#ffffff",
      foreground: "#101828",
      muted: "#516074",
      radius: 24,
      shadow: 4,
      fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    },
    pages: [
      {
        id: homeId,
        name: "Home",
        path: "/",
        description: "Primary landing page with a focused product story.",
        rootIds: [homeNavbarId, heroId, statsSectionId, proofSectionId],
      },
      {
        id: pricingPageId,
        name: "Pricing",
        path: "/pricing",
        description: "Simple pricing and dashboard-flavored proof page.",
        rootIds: [pricingNavbarId, pricingHeroId, pricingGridId],
      },
    ],
    nodes: {
      [homeNavbarId]: {
        id: homeNavbarId,
        type: "navbar",
        props: {
          logo: "Launch Studio",
          links: "Product\nTemplates\nPricing\nDocs",
          ctaLabel: "Start free",
          align: "between",
        },
        children: [],
      },
      [heroId]: {
        id: heroId,
        type: "hero",
        props: {
          eyebrow: "Website and App Builder",
          title: "Drag sections into place, refine the design, then export a real Next.js starter.",
          body: "This prototype keeps layout constraints strict so the exported code stays understandable for a developer taking over after design is locked.",
          primaryLabel: "Start designing",
          secondaryLabel: "Inspect export",
          align: "left",
        },
        children: [],
      },
      [statsSectionId]: {
        id: statsSectionId,
        type: "section",
        props: {
          title: "Launch metrics",
          backgroundStyle: "surface",
          paddingY: 36,
          inset: true,
        },
        children: [statsGridId],
      },
      [statsGridId]: {
        id: statsGridId,
        type: "grid",
        props: {
          title: "KPI grid",
          columns: 3,
          gap: 18,
        },
        children: [statOneId, statTwoId, statThreeId],
      },
      [statOneId]: {
        id: statOneId,
        type: "statCard",
        props: {
          label: "Pages composed",
          value: "12",
          trend: "+3 today",
        },
        children: [],
      },
      [statTwoId]: {
        id: statTwoId,
        type: "statCard",
        props: {
          label: "Reusable blocks",
          value: "18",
          trend: "Ready",
        },
        children: [],
      },
      [statThreeId]: {
        id: statThreeId,
        type: "statCard",
        props: {
          label: "Export health",
          value: "Strong",
          trend: "v1 target",
        },
        children: [],
      },
      [proofSectionId]: {
        id: proofSectionId,
        type: "section",
        props: {
          title: "Builder proof",
          backgroundStyle: "accent",
          paddingY: 44,
          inset: true,
        },
        children: [proofGridId],
      },
      [proofGridId]: {
        id: proofGridId,
        type: "grid",
        props: {
          title: "Proof grid",
          columns: 4,
          gap: 18,
        },
        children: [featureId, faqId, testimonialId, formId, chatId],
      },
      [featureId]: {
        id: featureId,
        type: "featureGrid",
        props: {
          title: "Keep the system constrained",
          body: "This keeps drag/drop fast, responsive behavior predictable, and export quality high.",
          features: "Schema-driven page JSON\nMultiple pages and routes\nTheme controls\nZip export scaffold",
        },
        children: [],
      },
      [faqId]: {
        id: faqId,
        type: "faqList",
        props: {
          title: "What teams ask before exporting",
          body: "The builder stays focused on the workflows that keep visual editing credible for a developer handoff.",
          items:
            "Can we keep customizing the code later?|Yes. The starter export stays readable and intentionally easy to continue from.\nWhy keep drag rules constrained?|Because the value is reliable output, not arbitrary layout freedom.\nWhat does this protect?|Responsive behavior, export quality, and editor predictability.",
        },
        children: [],
      },
      [testimonialId]: {
        id: testimonialId,
        type: "testimonialCard",
        props: {
          quote: "We got to a polished launch surface in days, and the exported code still felt like ours.",
          author: "Rae Bennett",
          role: "Founder, Fieldnote",
        },
        children: [],
      },
      [formId]: {
        id: formId,
        type: "formCard",
        props: {
          title: "Capture demand now",
          body: "Forms can ship visually in v1, then wire into your own services in v2.",
          buttonLabel: "Join the list",
        },
        children: [],
      },
      [chatId]: {
        id: chatId,
        type: "chatInput",
        props: {
          label: "Copilot prompt shell",
          placeholder: "Turn this layout into a strong dashboard onboarding flow.",
          buttonLabel: "Generate",
        },
        children: [],
      },
      [pricingNavbarId]: {
        id: pricingNavbarId,
        type: "navbar",
        props: {
          logo: "Launch Studio",
          links: "Overview\nPlans\nExport\nSettings",
          ctaLabel: "Book intro",
          align: "between",
        },
        children: [],
      },
      [pricingHeroId]: {
        id: pricingHeroId,
        type: "hero",
        props: {
          eyebrow: "Pricing page",
          title: "Use dedicated routes to shape the whole product surface.",
          body: "The builder supports multiple pages, editable paths, and route-aware export from the same project model.",
          primaryLabel: "View plans",
          secondaryLabel: "Open docs",
          align: "center",
        },
        children: [],
      },
      [pricingGridId]: {
        id: pricingGridId,
        type: "grid",
        props: {
          title: "Pricing grid",
          columns: 2,
          gap: 20,
        },
        children: [pricingCardId, sidebarId],
      },
      [pricingCardId]: {
        id: pricingCardId,
        type: "pricingCard",
        props: {
          tier: "Studio Pro",
          price: "$29",
          tagline: "Per editor seat, with export and starter generation built in.",
          cta: "Start free",
        },
        children: [],
      },
      [sidebarId]: {
        id: sidebarId,
        type: "sidebarShell",
        props: {
          gap: 20,
          title: "Product navigation",
          items: "Overview\nPages\nThemes\nExport\nSettings",
          highlight: "Export",
          sidebarPosition: "right",
          sidebarWidth: 300,
        },
        regions: {
          sidebar: [pricingSidebarTextId, pricingSidebarButtonId],
          content: [pricingSidebarTableId],
        },
      },
      [pricingSidebarTextId]: {
        id: pricingSidebarTextId,
        type: "text",
        props: {
          title: "Need a handoff?",
          body: "Keep the route map, theme controls, and export summary close to the workspace shell.",
          size: "sm",
        },
        children: [],
      },
      [pricingSidebarButtonId]: {
        id: pricingSidebarButtonId,
        type: "button",
        props: {
          label: "Talk sales",
          variant: "primary",
          fullWidth: true,
        },
        children: [],
      },
      [pricingSidebarTableId]: {
        id: pricingSidebarTableId,
        type: "dataTable",
        props: {
          title: "Workspace modules",
          columns: "Area|Focus",
          rows: "Pages|Route setup\nTheme|Visual tokens\nExport|Starter handoff",
        },
        children: [],
      },
    },
  });
}

function createSignalFlowProject(): BuilderProject {
  const homeNavbarId = createId();
  const heroId = createId();
  const socialProofSectionId = createId();
  const proofGridId = createId();
  const featureOneId = createId();
  const featureTwoId = createId();
  const featureThreeId = createId();
  const testimonialId = createId();
  const conversionSectionId = createId();
  const conversionGridId = createId();
  const pricingId = createId();
  const formId = createId();
  const pricingNavbarId = createId();
  const pricingHeroId = createId();
  const pricingSectionId = createId();
  const pricingGridId = createId();
  const starterPlanId = createId();
  const growthPlanId = createId();
  const comparisonSectionId = createId();
  const comparisonTableId = createId();
  const faqId = createId();

  const homeId = createId();
  const pricingPageId = createId();

  return createProjectFrame({
    name: "Signal Flow",
    description: "A polished SaaS launch template focused on clear product messaging and onboarding conversion.",
    theme: {
      accent: "#1d4ed8",
      accentContrast: "#eff6ff",
      background: "#f6f8fc",
      surface: "#ffffff",
      foreground: "#0f172a",
      muted: "#5b6780",
      radius: 22,
      shadow: 3,
      fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    },
    pages: [
      {
        id: homeId,
        name: "Home",
        path: "/",
        description: "Marketing homepage for a workflow product launch.",
        rootIds: [homeNavbarId, heroId, socialProofSectionId, conversionSectionId],
      },
      {
        id: pricingPageId,
        name: "Pricing",
        path: "/pricing",
        description: "Plan comparison page with conversion-ready cards.",
        rootIds: [pricingNavbarId, pricingHeroId, pricingSectionId, comparisonSectionId],
      },
    ],
    nodes: {
      [homeNavbarId]: {
        id: homeNavbarId,
        type: "navbar",
        props: {
          logo: "Signal Flow",
          links: "Product\nPricing\nCustomers\nDocs",
          ctaLabel: "Book walkthrough",
          align: "between",
        },
        children: [],
      },
      [heroId]: {
        id: heroId,
        type: "hero",
        props: {
          eyebrow: "B2B workflow software",
          title: "Turn scattered team requests into clear, structured launches.",
          body: "Signal Flow helps revenue, product, and support teams move through intake, approval, and handoff without losing momentum.",
          primaryLabel: "Book a walkthrough",
          secondaryLabel: "See the flow",
          align: "left",
        },
        children: [],
      },
      [socialProofSectionId]: {
        id: socialProofSectionId,
        type: "section",
        props: {
          title: "Why teams switch",
          backgroundStyle: "surface",
          paddingY: 40,
          inset: true,
        },
        children: [proofGridId],
      },
      [proofGridId]: {
        id: proofGridId,
        type: "grid",
        props: {
          title: "Value grid",
          columns: 4,
          gap: 18,
        },
        children: [featureOneId, featureTwoId, featureThreeId, testimonialId],
      },
      [featureOneId]: {
        id: featureOneId,
        type: "featureGrid",
        props: {
          title: "Clear intake signals",
          body: "Capture requests with enough structure that teams can decide fast instead of chasing context.",
          features: "Shared intake format\nFewer Slack dead ends\nCleaner prioritization",
        },
        children: [],
      },
      [featureTwoId]: {
        id: featureTwoId,
        type: "featureGrid",
        props: {
          title: "Handoff without churn",
          body: "Keep delivery owners aligned as work moves from request to scope to launch.",
          features: "Route ownership\nApproval visibility\nLaunch checklist",
        },
        children: [],
      },
      [featureThreeId]: {
        id: featureThreeId,
        type: "featureGrid",
        props: {
          title: "Sharper executive reporting",
          body: "Show what changed, what shipped, and where momentum is blocked.",
          features: "Weekly rollups\nLaunch health view\nRisk summaries",
        },
        children: [],
      },
      [testimonialId]: {
        id: testimonialId,
        type: "testimonialCard",
        props: {
          quote: "Signal Flow replaced launch status theater with an operating rhythm our whole team could actually follow.",
          author: "Jordan Park",
          role: "VP Revenue, Fairline",
        },
        children: [],
      },
      [conversionSectionId]: {
        id: conversionSectionId,
        type: "section",
        props: {
          title: "Launch your pilot",
          backgroundStyle: "accent",
          paddingY: 44,
          inset: true,
        },
        children: [conversionGridId],
      },
      [conversionGridId]: {
        id: conversionGridId,
        type: "grid",
        props: {
          title: "Conversion grid",
          columns: 2,
          gap: 20,
        },
        children: [pricingId, formId],
      },
      [pricingId]: {
        id: pricingId,
        type: "pricingCard",
        props: {
          tier: "Growth",
          price: "$49",
          tagline: "Launch one shared operating system for intake, approval, and rollout.",
          cta: "Start pilot",
        },
        children: [],
      },
      [formId]: {
        id: formId,
        type: "formCard",
        props: {
          title: "Talk to the team",
          body: "Use this section for demo requests, waitlists, or launch readiness reviews.",
          buttonLabel: "Request demo",
        },
        children: [],
      },
      [pricingNavbarId]: {
        id: pricingNavbarId,
        type: "navbar",
        props: {
          logo: "Signal Flow",
          links: "Overview\nPlans\nSecurity\nDocs",
          ctaLabel: "Talk sales",
          align: "between",
        },
        children: [],
      },
      [pricingHeroId]: {
        id: pricingHeroId,
        type: "hero",
        props: {
          eyebrow: "Pricing",
          title: "Pick the plan that matches your team maturity.",
          body: "Signal Flow is built for teams graduating from ad hoc launch coordination into a repeatable workflow.",
          primaryLabel: "Start pilot",
          secondaryLabel: "Talk sales",
          align: "center",
        },
        children: [],
      },
      [pricingSectionId]: {
        id: pricingSectionId,
        type: "section",
        props: {
          title: "Plans",
          backgroundStyle: "surface",
          paddingY: 40,
          inset: true,
        },
        children: [pricingGridId],
      },
      [pricingGridId]: {
        id: pricingGridId,
        type: "grid",
        props: {
          title: "Plans grid",
          columns: 2,
          gap: 20,
        },
        children: [starterPlanId, growthPlanId],
      },
      [starterPlanId]: {
        id: starterPlanId,
        type: "pricingCard",
        props: {
          tier: "Starter",
          price: "$19",
          tagline: "For smaller teams that want a reliable launch checklist and intake structure.",
          cta: "Start starter",
        },
        children: [],
      },
      [growthPlanId]: {
        id: growthPlanId,
        type: "pricingCard",
        props: {
          tier: "Growth",
          price: "$49",
          tagline: "For teams coordinating multiple workstreams and stakeholders across launches.",
          cta: "Choose growth",
        },
        children: [],
      },
      [comparisonSectionId]: {
        id: comparisonSectionId,
        type: "section",
        props: {
          title: "Plan comparison",
          backgroundStyle: "accent",
          paddingY: 36,
          inset: true,
        },
        children: [comparisonTableId, faqId],
      },
      [comparisonTableId]: {
        id: comparisonTableId,
        type: "dataTable",
        props: {
          title: "Included by plan",
          columns: "Capability|Starter|Growth",
          rows:
            "Shared intake|Basic|Advanced\nApproval workflow|Limited|Unlimited\nExecutive rollups|Monthly|Weekly\nLaunch templates|2|10",
        },
        children: [],
      },
      [faqId]: {
        id: faqId,
        type: "faqList",
        props: {
          title: "Questions before a pilot",
          body: "Pricing pages usually need a little objection handling so teams can move from interest to evaluation.",
          items:
            "Can we start small?|Yes. Teams can begin with a starter plan and expand the shared workflow later.\nDo we need a big rollout first?|No. Signal Flow is designed for pilots before a broader process change.\nWhat happens after the pilot?|Use the exported starter as the basis for deeper integration or product polish.",
        },
        children: [],
      },
    },
  });
}

function createOpsHubProject(): BuilderProject {
  const heroId = createId();
  const workspaceSectionId = createId();
  const workspaceGridId = createId();
  const sidebarId = createId();
  const statOneId = createId();
  const statTwoId = createId();
  const statThreeId = createId();
  const guidanceSectionId = createId();
  const guidanceGridId = createId();
  const textId = createId();
  const activityFeedId = createId();
  const threadId = createId();
  const chatId = createId();
  const workspaceHeroId = createId();
  const workspaceProofSectionId = createId();
  const workspaceProofGridId = createId();
  const opsFeatureId = createId();
  const formId = createId();
  const workspaceTableId = createId();
  const workspaceSidebarTextId = createId();
  const workspaceSidebarButtonId = createId();
  const workspaceSidebarFeedId = createId();

  const overviewId = createId();
  const workspaceId = createId();

  return createProjectFrame({
    name: "Ops Hub",
    description: "An internal-tool template with KPI blocks, guided workflows, and operational navigation.",
    theme: {
      accent: "#7c3aed",
      accentContrast: "#f5f3ff",
      background: "#f7f5fb",
      surface: "#ffffff",
      foreground: "#18181b",
      muted: "#5f5b74",
      radius: 20,
      shadow: 2,
      fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    },
    pages: [
      {
        id: overviewId,
        name: "Overview",
        path: "/",
        description: "Dashboard overview with KPI and workflow framing.",
        rootIds: [heroId, workspaceSectionId, guidanceSectionId],
      },
      {
        id: workspaceId,
        name: "Workspace",
        path: "/workspace",
        description: "Workspace route for a more detailed internal-tool shell.",
        rootIds: [workspaceHeroId, workspaceProofSectionId],
      },
    ],
    nodes: {
      [heroId]: {
        id: heroId,
        type: "hero",
        props: {
          eyebrow: "Operations workspace",
          title: "Build calmer internal tools with clearer structure and stronger visual hierarchy.",
          body: "Ops Hub gives teams a dashboard shell that feels intentional without overcomplicating the first release.",
          primaryLabel: "Open workspace",
          secondaryLabel: "Review metrics",
          align: "left",
        },
        children: [],
      },
      [workspaceSectionId]: {
        id: workspaceSectionId,
        type: "section",
        props: {
          title: "Workspace summary",
          backgroundStyle: "surface",
          paddingY: 36,
          inset: true,
        },
        children: [workspaceGridId],
      },
      [workspaceGridId]: {
        id: workspaceGridId,
        type: "grid",
        props: {
          title: "Workspace grid",
          columns: 4,
          gap: 18,
        },
        children: [sidebarId, statOneId, statTwoId, statThreeId],
      },
      [sidebarId]: {
        id: sidebarId,
        type: "sidebarShell",
        props: {
          gap: 18,
          title: "Ops navigation",
          items: "Overview\nRequests\nApprovals\nIncidents\nReports",
          highlight: "Approvals",
          sidebarPosition: "left",
          sidebarWidth: 260,
        },
        regions: {
          sidebar: [workspaceSidebarTextId, workspaceSidebarButtonId],
          content: [workspaceSidebarFeedId],
        },
      },
      [workspaceSidebarTextId]: {
        id: workspaceSidebarTextId,
        type: "text",
        props: {
          title: "Queue guidance",
          body: "Put the highest-signal context in the rail so operators can orient before diving into the main panel.",
          size: "sm",
        },
        children: [],
      },
      [workspaceSidebarButtonId]: {
        id: workspaceSidebarButtonId,
        type: "button",
        props: {
          label: "Open queue",
          variant: "primary",
          fullWidth: true,
        },
        children: [],
      },
      [workspaceSidebarFeedId]: {
        id: workspaceSidebarFeedId,
        type: "activityFeed",
        props: {
          title: "Approvals queue",
          body: "A compact embedded feed keeps the shell useful even before deeper workflow-specific blocks land.",
          entries:
            "SLA review queued|Today at 9:05 AM|Review\nOwner reassignment|Today at 10:40 AM|Ready\nCoverage summary posted|Today at 1:20 PM|Queued",
        },
        children: [],
      },
      [statOneId]: {
        id: statOneId,
        type: "statCard",
        props: {
          label: "Open requests",
          value: "42",
          trend: "+6 today",
        },
        children: [],
      },
      [statTwoId]: {
        id: statTwoId,
        type: "statCard",
        props: {
          label: "Approval SLA",
          value: "94%",
          trend: "Stable",
        },
        children: [],
      },
      [statThreeId]: {
        id: statThreeId,
        type: "statCard",
        props: {
          label: "Escalations",
          value: "3",
          trend: "-2 wow",
        },
        children: [],
      },
      [guidanceSectionId]: {
        id: guidanceSectionId,
        type: "section",
        props: {
          title: "Operator guidance",
          backgroundStyle: "accent",
          paddingY: 42,
          inset: true,
        },
        children: [guidanceGridId],
      },
      [guidanceGridId]: {
        id: guidanceGridId,
        type: "grid",
        props: {
          title: "Guidance grid",
          columns: 4,
          gap: 20,
        },
        children: [textId, activityFeedId, threadId, chatId],
      },
      [textId]: {
        id: textId,
        type: "text",
        props: {
          title: "What to review first",
          body: "Start with approvals that are aging out, then review the incidents queue and staffing coverage for the next handoff window.",
          size: "lg",
        },
        children: [],
      },
      [activityFeedId]: {
        id: activityFeedId,
        type: "activityFeed",
        props: {
          title: "Queue activity",
          body: "Give operators a compact timeline of what changed, what is ready, and what needs follow-up before the next handoff.",
          entries:
            "Escalation sweep finished|Today at 8:45 AM|Ready\nSLA risk summary posted|Today at 10:15 AM|Review\nStaffing handoff queued|Today at 3:00 PM|Queued",
        },
        children: [],
      },
      [threadId]: {
        id: threadId,
        type: "messageThread",
        props: {
          title: "Approvals handoff",
          transcript:
            "lead|Flag the requests that will breach SLA before noon.\nassistant|Three approvals need escalation, and one owner is out today.\nlead|Perfect. Summarize that for the handoff note next.",
        },
        children: [],
      },
      [chatId]: {
        id: chatId,
        type: "chatInput",
        props: {
          label: "Ops copilot shell",
          placeholder: "Summarize what changed in open approvals since yesterday.",
          buttonLabel: "Run summary",
        },
        children: [],
      },
      [workspaceHeroId]: {
        id: workspaceHeroId,
        type: "hero",
        props: {
          eyebrow: "Workspace route",
          title: "Give every route a clear role inside the product surface.",
          body: "This page can evolve into requests, approvals, reports, or any other internal workflow shell without abandoning the shared design system.",
          primaryLabel: "Review queue",
          secondaryLabel: "Open report",
          align: "center",
        },
        children: [],
      },
      [workspaceProofSectionId]: {
        id: workspaceProofSectionId,
        type: "section",
        props: {
          title: "Workspace modules",
          backgroundStyle: "surface",
          paddingY: 40,
          inset: true,
        },
        children: [workspaceProofGridId],
      },
      [workspaceProofGridId]: {
        id: workspaceProofGridId,
        type: "grid",
        props: {
          title: "Modules grid",
          columns: 3,
          gap: 20,
        },
        children: [opsFeatureId, workspaceTableId, formId],
      },
      [opsFeatureId]: {
        id: opsFeatureId,
        type: "featureGrid",
        props: {
          title: "Internal tools still need polish",
          body: "The same builder constraints that help marketing pages also help dashboard shells stay readable and maintainable.",
          features: "Strong route framing\nTheme tokens stay shared\nReusable cards and shells",
        },
        children: [],
      },
      [workspaceTableId]: {
        id: workspaceTableId,
        type: "dataTable",
        props: {
          title: "Team queue snapshot",
          columns: "Queue|Open|Owner",
          rows: "Approvals|14|Nina\nIncidents|3|Avery\nRequests|25|Luca",
        },
        children: [],
      },
      [formId]: {
        id: formId,
        type: "formCard",
        props: {
          title: "Request access",
          body: "Use this shell for admin requests, workflow setup, or guided onboarding.",
          buttonLabel: "Submit request",
        },
        children: [],
      },
    },
  });
}

export function createProjectFromTemplate(templateId: BuilderTemplateId): BuilderProject {
  switch (templateId) {
    case "launch-studio":
      return createLaunchStudioProject();
    case "signal-flow":
      return createSignalFlowProject();
    case "ops-hub":
      return createOpsHubProject();
    default:
      return createLaunchStudioProject();
  }
}

export function createDefaultProject(): BuilderProject {
  return createProjectFromTemplate("launch-studio");
}
