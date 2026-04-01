"use client";

import { saveAs } from "file-saver";

import { validateProject } from "./schema";
import type { BuilderProject } from "./types";

function projectFileName(projectName: string) {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "builder-project";
}

export function exportProjectJson(project: BuilderProject) {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, `${projectFileName(project.name)}.builder.json`);
}

export async function parseProjectJsonFile(file: File) {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  const result = validateProject(parsed);

  if (!result.success) {
    throw new Error("The selected file is not a valid builder project JSON export.");
  }

  return result.data;
}
