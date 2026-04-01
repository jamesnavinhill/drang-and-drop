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

export interface BuilderNode {
  id: string;
  type: BlockType;
  props: NodeProps;
  children: string[];
}

export interface BuilderPage {
  id: string;
  name: string;
  path: string;
  description: string;
  rootIds: string[];
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

export const placementTargetKinds = ["page-root", "layout-container"] as const;

export type PlacementTargetKind = (typeof placementTargetKinds)[number];

export interface BlockPlacementDefinition {
  allowedParents: PlacementTargetKind[];
  childTargetKind?: PlacementTargetKind;
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
  capabilities: BlockCapability[];
  verification: BlockVerificationDefinition;
}

export type BlockRegistryEntry = BlockDefinition &
  BlockPlacementDefinition & {
    capabilities: BlockCapability[];
    family: BlockFamily;
    rootOnly: boolean;
    verification: BlockVerificationDefinition;
  };

export interface ParentReference {
  kind: "page" | "node";
  id: string;
}

export type PreviewMode = "desktop" | "tablet" | "mobile";

// Compatibility aliases while the rest of the codebase finishes moving to the canonical block boundary.
export const componentTypes = blockTypes;
export type ComponentType = BlockType;
export type ComponentDefinition = BlockDefinition;
export type ComponentPlacementDefinition = BlockPlacementDefinition;
export type ComponentRegistryEntry = BlockRegistryEntry;
