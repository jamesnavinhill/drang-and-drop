import type { BlockType, BuilderProject, PreviewMode } from "./types";

export interface BuilderVerificationNodeSnapshot {
  id: string;
  regions: Record<string, string[]>;
  type: BlockType;
}

export interface BuilderVerificationPageSnapshot {
  id: string;
  name: string;
  path: string;
  regions: Record<string, string[]>;
}

export interface BuilderVerificationSnapshot {
  currentPage: BuilderVerificationPageSnapshot | null;
  nodes: Record<string, BuilderVerificationNodeSnapshot>;
  pages: BuilderVerificationPageSnapshot[];
  previewMode: PreviewMode;
  selectedNodeId: string | null;
  selectedNodeType: BlockType | null;
  selectedPageId: string;
}

export function createBuilderVerificationSnapshot({
  project,
  previewMode,
  selectedNodeId,
  selectedPageId,
}: {
  project: BuilderProject;
  previewMode: PreviewMode;
  selectedNodeId: string | null;
  selectedPageId: string;
}): BuilderVerificationSnapshot {
  const pages = project.pages.map((page) => ({
    id: page.id,
    name: page.name,
    path: page.path,
    regions: Object.fromEntries(Object.entries(page.regions).map(([regionId, childIds]) => [regionId, [...childIds]])),
  }));
  const currentPage = pages.find((page) => page.id === selectedPageId) ?? null;
  const nodes = Object.fromEntries(
    Object.values(project.nodes).map((node) => [
      node.id,
      {
        id: node.id,
        regions: Object.fromEntries(Object.entries(node.regions).map(([regionId, childIds]) => [regionId, [...childIds]])),
        type: node.type,
      },
    ]),
  );
  const selectedNodeType = selectedNodeId ? project.nodes[selectedNodeId]?.type ?? null : null;

  return {
    currentPage,
    nodes,
    pages,
    previewMode,
    selectedNodeId,
    selectedNodeType,
    selectedPageId,
  };
}
