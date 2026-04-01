export const blockTypes = [
  "navbar",
  "section",
  "stack",
  "grid",
  "hero",
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
] as const;

export type BlockType = (typeof blockTypes)[number];

export type PrimitiveValue = string | number | boolean;
export type NodeProps = Record<string, PrimitiveValue>;

export type ControlField =
  | {
      key: string;
      label: string;
      type: "text" | "textarea" | "color";
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: "number" | "range";
      min?: number;
      max?: number;
      step?: number;
    }
  | {
      key: string;
      label: string;
      type: "toggle";
    }
  | {
      key: string;
      label: string;
      type: "select";
      options: Array<{ label: string; value: string }>;
    };

export const pageRegionIds = ["header", "main", "footer"] as const;

export type PageRegionId = (typeof pageRegionIds)[number];

export interface BuilderNode {
  id: string;
  type: BlockType;
  props: NodeProps;
  regions: Record<string, string[]>;
}

export interface BuilderPage {
  id: string;
  name: string;
  path: string;
  description: string;
  regions: Record<PageRegionId, string[]>;
}

export interface BuilderTheme {
  accent: string;
  accentContrast: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  radius: number;
  shadow: number;
  fontFamily: string;
}

export interface BuilderProject {
  id: string;
  name: string;
  description: string;
  theme: BuilderTheme;
  pages: BuilderPage[];
  nodes: Record<string, BuilderNode>;
  updatedAt: string;
}

export type BlockCategory = "Layout" | "Content" | "Marketing" | "Application";
export type BlockFamily = "root-composite" | "layout" | "content" | "application";
export type BlockCapability =
  | "future-region-pressure"
  | "layout-owner"
  | "leaf"
  | "parity-critical"
  | "root-only";

export interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  icon: string;
  category: BlockCategory;
  defaults: NodeProps;
  fields: ControlField[];
}

export const placementTargetKinds = [
  "page-header",
  "page-main",
  "page-footer",
  "layout-content",
  "layout-sidebar",
] as const;

export type PlacementTargetKind = (typeof placementTargetKinds)[number];

export interface BlockRegionDefinition {
  id: string;
  kind: PlacementTargetKind;
  label: string;
  allowsMultiple: boolean;
}

export interface BlockPlacementDefinition {
  allowedRegions: PlacementTargetKind[];
  regions: BlockRegionDefinition[];
}

export type BlockRenderChildrenMode = "leaf" | "renders-children";
export type BlockRenderParityStrategy = "shared-content" | "shared-layout" | "shared-shell";

export interface BlockRenderSurfaceDefinition {
  implementation: string;
  surface: string;
}

export interface BlockRenderDefinition {
  children: BlockRenderChildrenMode;
  parity: {
    notes: string[];
    strategy: BlockRenderParityStrategy;
  };
  preview: BlockRenderSurfaceDefinition;
  starter: BlockRenderSurfaceDefinition;
}

export interface BlockVerificationDefinition {
  previewExportParity: "required";
  structure: "required";
}

export interface BlockContract {
  type: BlockType;
  family: BlockFamily;
  definition: BlockDefinition;
  placement: BlockPlacementDefinition;
  render: BlockRenderDefinition;
  capabilities: BlockCapability[];
  verification: BlockVerificationDefinition;
}

export type BlockRegistryEntry = BlockDefinition &
  BlockPlacementDefinition & {
    capabilities: BlockCapability[];
    family: BlockFamily;
    render: BlockRenderDefinition;
    rootOnly: boolean;
    verification: BlockVerificationDefinition;
  };

export interface ParentReference {
  kind: "page-region" | "node-region";
  pageId?: string;
  nodeId?: string;
  regionId: string;
}

export type PreviewMode = "desktop" | "tablet" | "mobile";

export interface LegacyBuilderNode {
  id: string;
  type: BlockType;
  props: NodeProps;
  children?: string[];
  regions?: Record<string, string[]>;
}

export interface LegacyBuilderPage {
  id: string;
  name: string;
  path: string;
  description: string;
  rootIds?: string[];
  regions?: Record<PageRegionId, string[]>;
}

export interface LegacyBuilderProject {
  id: string;
  name: string;
  description: string;
  theme: BuilderTheme;
  pages: LegacyBuilderPage[];
  nodes: Record<string, LegacyBuilderNode>;
  updatedAt: string;
}
