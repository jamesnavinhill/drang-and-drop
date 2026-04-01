import type { BuilderProject, ComponentType, PreviewMode } from "./types";

export interface BuilderVerificationNodeSnapshot {
  childIds: string[];
  id: string;
  type: ComponentType;
}

export interface BuilderVerificationPageSnapshot {
  id: string;
  name: string;
  path: string;
  rootIds: string[];
}

export interface BuilderVerificationSnapshot {
  currentPage: BuilderVerificationPageSnapshot | null;
  nodes: Record<string, BuilderVerificationNodeSnapshot>;
  pages: BuilderVerificationPageSnapshot[];
  previewMode: PreviewMode;
  selectedNodeId: string | null;
  selectedNodeType: ComponentType | null;
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
    rootIds: [...page.rootIds],
  }));
  const currentPage = pages.find((page) => page.id === selectedPageId) ?? null;
  const nodes = Object.fromEntries(
    Object.values(project.nodes).map((node) => [
      node.id,
      {
        childIds: [...node.children],
        id: node.id,
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
