import { z } from "zod";

import type { PreviewMode } from "@/lib/builder/types";

export const assistantModes = ["proposal", "auto-apply"] as const;

export type AssistantMode = (typeof assistantModes)[number];

export interface BuilderAssistantContext {
  assistantMode: AssistantMode;
  previewMode: PreviewMode;
  project: {
    name: string;
    description: string;
    pageCount: number;
    nodeCount: number;
    updatedAt: string;
  };
  page: {
    name: string;
    path: string;
    description: string;
    rootCount: number;
  } | null;
  selection: {
    capabilities: string[];
    family: string;
    type: string;
    title: string;
    description: string;
    props: Record<string, string | number | boolean>;
  } | null;
  availableBlocks: Array<{
    capabilities: string[];
    type: string;
    title: string;
    category: string;
    description: string;
    family: string;
    canHaveChildren: boolean;
  }>;
}

export const builderAssistantContextSchema = z.object({
  assistantMode: z.enum(assistantModes),
  previewMode: z.enum(["desktop", "tablet", "mobile"]),
  project: z.object({
    name: z.string(),
    description: z.string(),
    pageCount: z.number(),
    nodeCount: z.number(),
    updatedAt: z.string(),
  }),
  page: z
    .object({
      name: z.string(),
      path: z.string(),
      description: z.string(),
      rootCount: z.number(),
    })
    .nullable(),
  selection: z
    .object({
      capabilities: z.array(z.string()),
      family: z.string(),
      type: z.string(),
      title: z.string(),
      description: z.string(),
      props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    })
    .nullable(),
  availableBlocks: z.array(
    z.object({
      capabilities: z.array(z.string()),
      type: z.string(),
      title: z.string(),
      category: z.string(),
      description: z.string(),
      family: z.string(),
      canHaveChildren: z.boolean(),
    }),
  ),
});
