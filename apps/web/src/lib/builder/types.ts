export const componentTypes = [
  "navbar",
  "section",
  "stack",
  "grid",
  "hero",
  "text",
  "button",
  "featureGrid",
  "testimonialCard",
  "statCard",
  "formCard",
  "pricingCard",
  "chatInput",
  "messageThread",
  "dataTable",
  "sidebarShell",
] as const;

export type ComponentType = (typeof componentTypes)[number];

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
  type: ComponentType;
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

export interface ComponentDefinition {
  type: ComponentType;
  title: string;
  description: string;
  icon: string;
  category: "Layout" | "Content" | "Marketing" | "Application";
  canHaveChildren: boolean;
  accepts: "any" | ComponentType[];
  rootOnly?: boolean;
  defaults: NodeProps;
  fields: ControlField[];
}

export interface ParentReference {
  kind: "page" | "node";
  id: string;
}

export type PreviewMode = "desktop" | "tablet" | "mobile";
