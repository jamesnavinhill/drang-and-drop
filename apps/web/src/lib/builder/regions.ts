import { getBlockPlacement } from "./block-placement";
import type {
  BlockType,
  BuilderNode,
  BuilderPage,
  BuilderProject,
  LegacyBuilderNode,
  LegacyBuilderPage,
  LegacyBuilderProject,
  PageRegionId,
  ParentReference,
} from "./types";

export const pageRegionDefinitions = [
  {
    id: "header",
    kind: "page-header",
    label: "Header",
  },
  {
    id: "main",
    kind: "page-main",
    label: "Main",
  },
  {
    id: "footer",
    kind: "page-footer",
    label: "Footer",
  },
] as const;

export function createEmptyPageRegions(): Record<PageRegionId, string[]> {
  return {
    header: [],
    main: [],
    footer: [],
  };
}

export function getPageRegionDefinition(regionId: PageRegionId) {
  return pageRegionDefinitions.find((definition) => definition.id === regionId) ?? pageRegionDefinitions[1];
}

export function getPageRegionLabel(regionId: PageRegionId) {
  return getPageRegionDefinition(regionId).label;
}

export function getPageRegionChildIds(page: BuilderPage, regionId: PageRegionId) {
  return page.regions[regionId] ?? [];
}

export function getNodeRegionChildIds(node: BuilderNode, regionId: string) {
  return node.regions[regionId] ?? [];
}

export function getPrimaryNodeRegionId(type: BlockType) {
  return getBlockPlacement(type).regions[0]?.id ?? null;
}

export function createNodeRegions(type: BlockType, childIds: string[] = []) {
  const placement = getBlockPlacement(type);

  if (placement.regions.length === 0) {
    return {};
  }

  return Object.fromEntries(
    placement.regions.map((region, index) => [region.id, index === 0 ? [...childIds] : [] as string[]]),
  );
}

function normalizePage(page: LegacyBuilderPage, project: LegacyBuilderProject): BuilderPage {
  if (page.regions) {
    return {
      ...page,
      regions: {
        ...createEmptyPageRegions(),
        ...page.regions,
      },
    };
  }

  const regions = createEmptyPageRegions();

  for (const rootId of page.rootIds ?? []) {
    const node = project.nodes[rootId];
    if (!node) {
      continue;
    }

    if (node.type === "navbar") {
      regions.header.push(rootId);
      continue;
    }

    regions.main.push(rootId);
  }

  return {
    description: page.description,
    id: page.id,
    name: page.name,
    path: page.path,
    regions,
  };
}

function normalizeNode(node: LegacyBuilderNode): BuilderNode {
  if (node.regions) {
    const defaultRegions = createNodeRegions(node.type);

    return {
      ...node,
      regions: {
        ...defaultRegions,
        ...Object.fromEntries(
          Object.entries(node.regions).map(([regionId, childIds]) => [regionId, [...childIds]]),
        ),
      },
    };
  }

  return {
    id: node.id,
    props: node.props,
    regions: createNodeRegions(node.type, node.children ?? []),
    type: node.type,
  };
}

export function normalizeBuilderProjectStructure(project: LegacyBuilderProject): BuilderProject {
  const nextProject: BuilderProject = {
    description: project.description,
    id: project.id,
    name: project.name,
    nodes: {},
    pages: [],
    theme: project.theme,
    updatedAt: project.updatedAt,
  };

  nextProject.nodes = Object.fromEntries(
    Object.entries(project.nodes).map(([nodeId, node]) => [nodeId, normalizeNode(node)]),
  );

  nextProject.pages = project.pages.map((page) => normalizePage(page, project));

  return nextProject;
}

export function describeRegionReference(project: BuilderProject, parent: ParentReference) {
  if (parent.kind === "page-region") {
    const page = project.pages.find((entry) => entry.id === parent.pageId);
    const regionLabel = getPageRegionLabel(parent.regionId as PageRegionId).toLowerCase();
    return page ? `${page.name} ${regionLabel}` : regionLabel;
  }

  const node = project.nodes[parent.nodeId ?? ""];
  const placement = node ? getBlockPlacement(node.type) : null;
  const region = placement?.regions.find((entry) => entry.id === parent.regionId);
  return region && node ? `${node.type} ${region.label.toLowerCase()}` : "selected region";
}
