import type { BuilderProject } from "./types";

export function createId() {
  return crypto.randomUUID();
}

export function createDefaultProject(): BuilderProject {
  const heroId = createId();
  const statsSectionId = createId();
  const statsGridId = createId();
  const statOneId = createId();
  const statTwoId = createId();
  const statThreeId = createId();
  const proofSectionId = createId();
  const proofGridId = createId();
  const featureId = createId();
  const formId = createId();
  const chatId = createId();
  const pricingHeroId = createId();
  const pricingGridId = createId();
  const pricingCardId = createId();
  const sidebarId = createId();

  const homeId = createId();
  const pricingPageId = createId();

  return {
    id: createId(),
    name: "Launch Studio",
    description: "A visual builder prototype aimed at exportable starter apps.",
    updatedAt: new Date().toISOString(),
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
        rootIds: [heroId, statsSectionId, proofSectionId],
      },
      {
        id: pricingPageId,
        name: "Pricing",
        path: "/pricing",
        description: "Simple pricing and dashboard-flavored proof page.",
        rootIds: [pricingHeroId, pricingGridId],
      },
    ],
    nodes: {
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
          columns: 3,
          gap: 18,
        },
        children: [featureId, formId, chatId],
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
          title: "Product navigation",
          items: "Overview\nPages\nThemes\nExport\nSettings",
          highlight: "Export",
        },
        children: [],
      },
    },
  };
}
