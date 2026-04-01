import { z } from "zod";

import { componentTypes } from "./types";

const primitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(componentTypes),
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
  return builderProjectSchema.safeParse(candidate);
}
