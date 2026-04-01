"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";

import { getStarterArchiveBaseName, getStarterProjectFiles } from "./starter-artifacts";
import type { BuilderProject } from "./types";

export async function exportProjectZip(project: BuilderProject) {
  const zip = new JSZip();

  for (const file of getStarterProjectFiles(project)) {
    zip.file(file.path, file.contents);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${getStarterArchiveBaseName(project)}.zip`);
}
