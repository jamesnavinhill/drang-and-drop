import { z } from "zod";

import { blockTypes } from "./types";
import { collectProjectStructureIssues } from "./structure";

const primitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(blockTypes),
  props: z.record(z.string(), primitiveValueSchema),
  children: z.array(z.string()),
});

const pageSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  description: z.string(),
  rootIds: z.array(z.string()),
});

const themeSchema = z.object({
  accent: z.string(),
  accentContrast: z.string(),
  background: z.string(),
  surface: z.string(),
  foreground: z.string(),
  muted: z.string(),
  radius: z.number(),
  shadow: z.number(),
  fontFamily: z.string(),
});

export const builderProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  theme: themeSchema,
  pages: z.array(pageSchema),
  nodes: z.record(z.string(), nodeSchema),
  updatedAt: z.string(),
});

export function validateProject(candidate: unknown) {
  const parsed = builderProjectSchema.safeParse(candidate);
  if (!parsed.success) {
    return parsed;
  }

  const structureIssues = collectProjectStructureIssues(parsed.data);
  if (structureIssues.length === 0) {
    return parsed;
  }

  return {
    success: false as const,
    error: new z.ZodError(
      structureIssues.map((issue) => ({
        code: "custom" as const,
        message: issue.message,
        path: issue.path,
      })),
    ),
  };
}
