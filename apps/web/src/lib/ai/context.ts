import { componentDefinitions, getComponentDefinition } from "@/lib/builder/component-definitions";
import { getComponentPlacement } from "@/lib/builder/component-placement";
import type { BuilderProject, PreviewMode } from "@/lib/builder/types";

import type { AssistantMode, BuilderAssistantContext } from "./types";

export function buildBuilderAssistantContext({
  assistantMode,
  previewMode,
  project,
  selectedPageId,
  selectedNodeId,
}: {
  assistantMode: AssistantMode;
  previewMode: PreviewMode;
  project: BuilderProject;
  selectedPageId: string;
  selectedNodeId: string | null;
}): BuilderAssistantContext {
  const activePage = project.pages.find((page) => page.id === selectedPageId) ?? project.pages[0] ?? null;
  const selectedNode = selectedNodeId ? project.nodes[selectedNodeId] ?? null : null;
  const selectedDefinition = selectedNode ? getComponentDefinition(selectedNode.type) : null;

  return {
    assistantMode,
    previewMode,
    project: {
      name: project.name,
      description: project.description,
      pageCount: project.pages.length,
      nodeCount: Object.keys(project.nodes).length,
      updatedAt: project.updatedAt,
    },
    page: activePage
      ? {
          name: activePage.name,
          path: activePage.path,
          description: activePage.description,
          rootCount: activePage.rootIds.length,
        }
      : null,
    selection:
      selectedNode && selectedDefinition
        ? {
            type: selectedNode.type,
            title: selectedDefinition.title,
            description: selectedDefinition.description,
            props: selectedNode.props,
          }
        : null,
    availableComponents: componentDefinitions.map((component) => ({
      type: component.type,
      title: component.title,
      category: component.category,
      description: component.description,
      canHaveChildren: getComponentPlacement(component.type).canHaveChildren,
    })),
  };
}
