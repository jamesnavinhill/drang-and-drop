"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getBlockDefinition } from "./block-definitions";
import { createDefaultProject, createId, createProjectFromTemplate } from "./default-project";
import { createNodeRegions } from "./regions";
import { validateProject } from "./schema";
import { cloneNodeSubtree, deleteNodeSubtree, executeStructureCommand, findParentReference } from "./structure";
import type {
  BlockType,
  BuilderNode,
  BuilderPage,
  BuilderProject,
  ParentReference,
  PreviewMode,
  PrimitiveValue,
} from "./types";
import type { BuilderTemplateId } from "./default-project";

export interface BuilderEditorNotice {
  message: string;
  tone: "error" | "info";
}

interface BuilderState {
  project: BuilderProject;
  selectedPageId: string;
  selectedNodeId: string | null;
  previewMode: PreviewMode;
  editorNotice: BuilderEditorNotice | null;
  hasHydrated: boolean;
  historyPast: BuilderSnapshot[];
  historyFuture: BuilderSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  selectedRegionTarget: ParentReference | null;
  selectPage: (pageId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectRegionTarget: (target: ParentReference | null) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearEditorNotice: () => void;
  updateProjectField: (key: "name" | "description", value: string) => void;
  updateThemeField: (key: keyof BuilderProject["theme"], value: PrimitiveValue) => void;
  updatePageField: (
    pageId: string,
    key: keyof Pick<BuilderPage, "name" | "path" | "description">,
    value: string,
  ) => void;
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  removePage: (pageId: string) => void;
  addNode: (type: BlockType, parent: ParentReference, index?: number) => boolean;
  moveNode: (nodeId: string, parent: ParentReference, index: number) => boolean;
  duplicateNode: (nodeId: string) => boolean;
  removeNode: (nodeId: string) => boolean;
  updateNodeField: (nodeId: string, key: string, value: PrimitiveValue) => void;
  importProject: (project: BuilderProject) => void;
  applyTemplate: (templateId: BuilderTemplateId) => void;
  undo: () => void;
  redo: () => void;
  resetProject: () => void;
}

interface BuilderSnapshot {
  project: BuilderProject;
  selectedPageId: string;
  selectedNodeId: string | null;
  selectedRegionTarget: ParentReference | null;
}

const HISTORY_LIMIT = 50;

function cloneProject(project: BuilderProject) {
  return structuredClone(project);
}

function createSnapshot(
  state: Pick<BuilderState, "project" | "selectedPageId" | "selectedNodeId" | "selectedRegionTarget">,
): BuilderSnapshot {
  return {
    project: state.project,
    selectedPageId: state.selectedPageId,
    selectedNodeId: state.selectedNodeId,
    selectedRegionTarget: state.selectedRegionTarget,
  };
}

function applySnapshot(snapshot: BuilderSnapshot) {
  return {
    project: snapshot.project,
    selectedPageId: snapshot.selectedPageId,
    selectedNodeId: snapshot.selectedNodeId,
    selectedRegionTarget: snapshot.selectedRegionTarget,
  };
}

function withHistory(state: BuilderState, next: Partial<BuilderState>) {
  const historyPast = [...state.historyPast, createSnapshot(state)].slice(-HISTORY_LIMIT);

  return {
    ...next,
    historyPast,
    historyFuture: [],
    canUndo: historyPast.length > 0,
    canRedo: false,
  };
}

function touch(project: BuilderProject) {
  project.updatedAt = new Date().toISOString();
  return project;
}

function getPage(project: BuilderProject, pageId: string) {
  return project.pages.find((page) => page.id === pageId);
}

function getNode(project: BuilderProject, nodeId: string) {
  return project.nodes[nodeId];
}

function createNode(type: BlockType): BuilderNode {
  const definition = getBlockDefinition(type);

  return {
    id: createId(),
    type,
    props: structuredClone(definition.defaults),
    regions: createNodeRegions(type),
  };
}

function selectionStillExists(project: BuilderProject, nodeId: string | null) {
  if (!nodeId) {
    return null;
  }

  return project.nodes[nodeId] ? nodeId : null;
}

function resolveSelectedPageId(project: BuilderProject, pageId: string | undefined) {
  if (pageId && project.pages.some((page) => page.id === pageId)) {
    return pageId;
  }

  return project.pages[0]?.id ?? "";
}

function normalizePath(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/+/g, "/");
  return normalized === "/" ? normalized : normalized.replace(/\/$/, "");
}

const initialProject = createDefaultProject();

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      project: initialProject,
      selectedPageId: initialProject.pages[0]?.id ?? "",
      selectedNodeId: null,
      selectedRegionTarget: null,
      previewMode: "desktop",
      editorNotice: null,
      hasHydrated: false,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
      selectPage: (pageId) =>
        set({
          selectedPageId: pageId,
          selectedNodeId: null,
          selectedRegionTarget: null,
        }),
      selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedRegionTarget: null }),
      selectRegionTarget: (target) => set({ selectedNodeId: null, selectedRegionTarget: target }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearEditorNotice: () => set({ editorNotice: null }),
      updateProjectField: (key, value) =>
        set((state) => {
          const project = cloneProject(state.project);
          project[key] = value;
          return withHistory(state, { project: touch(project) });
        }),
      updateThemeField: (key, value) =>
        set((state) => {
          const project = cloneProject(state.project);
          project.theme[key] = value as never;
          return withHistory(state, { project: touch(project) });
        }),
      updatePageField: (pageId, key, value) =>
        set((state) => {
          const project = cloneProject(state.project);
          const page = getPage(project, pageId);
          if (!page) {
            return state;
          }
          page[key] = key === "path" ? normalizePath(value) : value;
          return withHistory(state, { project: touch(project) });
        }),
      addPage: () =>
        set((state) => {
          const project = cloneProject(state.project);
          const nextPage: BuilderPage = {
            id: createId(),
            name: `Page ${project.pages.length + 1}`,
            path: `/page-${project.pages.length + 1}`,
            description: "A new page ready for layout work.",
            regions: {
              header: [],
              main: [],
              footer: [],
            },
          };
          project.pages.push(nextPage);
          return withHistory(state, {
            project: touch(project),
            selectedPageId: nextPage.id,
            selectedNodeId: null,
          });
        }),
      duplicatePage: (pageId) =>
        set((state) => {
          const project = cloneProject(state.project);
          const page = getPage(project, pageId);
          if (!page) {
            return state;
          }

          const nextPageId = createId();
          const nextRegions = Object.fromEntries(
            Object.entries(page.regions).map(([regionId, nodeIds]) => [
              regionId,
              nodeIds.map((rootId) => cloneNodeSubtree(project, rootId, createId)?.rootId ?? rootId),
            ]),
          ) as BuilderPage["regions"];
          const nextPage: BuilderPage = {
            ...structuredClone(page),
            id: nextPageId,
            name: `${page.name} Copy`,
            path: page.path === "/" ? `/copy-${nextPageId.slice(0, 6)}` : `${page.path}-copy`,
            regions: nextRegions,
          };
          project.pages.push(nextPage);
          return withHistory(state, {
            project: touch(project),
            selectedPageId: nextPage.id,
            selectedNodeId: null,
          });
        }),
      removePage: (pageId) =>
        set((state) => {
          if (state.project.pages.length === 1) {
            return state;
          }

          const project = cloneProject(state.project);
          const pageIndex = project.pages.findIndex((page) => page.id === pageId);
          if (pageIndex < 0) {
            return state;
          }

          const [page] = project.pages.splice(pageIndex, 1);
          for (const rootIds of Object.values(page.regions)) {
            for (const rootId of rootIds) {
              deleteNodeSubtree(project, rootId);
            }
          }

          const fallbackPage = project.pages[Math.max(0, pageIndex - 1)] ?? project.pages[0];

          return withHistory(state, {
            project: touch(project),
            selectedPageId: fallbackPage.id,
            selectedNodeId: null,
          });
        }),
      addNode: (type, parent, index) => {
        let didAdd = false;

        set((state) => {
          const project = cloneProject(state.project);
          const node = createNode(type);
          const result = executeStructureCommand(project, {
            kind: "insert",
            index,
            node,
            parent,
          });

          if (!result.ok) {
            return {
              editorNotice: {
                message: result.message,
                tone: "error" as const,
              },
            };
          }

          didAdd = true;

          return withHistory(state, {
            editorNotice: null,
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page-region" ? result.parent.pageId ?? state.selectedPageId : state.selectedPageId,
            selectedRegionTarget: null,
          });
        });

        return didAdd;
      },
      moveNode: (nodeId, parent, index) => {
        let didMove = false;

        set((state) => {
          const project = cloneProject(state.project);
          const result = executeStructureCommand(project, {
            kind: "move",
            index,
            nodeId,
            parent,
          });

          if (!result.ok) {
            return {
              editorNotice: {
                message: result.message,
                tone: "error" as const,
              },
            };
          }

          didMove = true;

          return withHistory(state, {
            editorNotice: null,
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page-region" ? result.parent.pageId ?? state.selectedPageId : state.selectedPageId,
            selectedRegionTarget: null,
          });
        });

        return didMove;
      },
      duplicateNode: (nodeId) => {
        let didDuplicate = false;

        set((state) => {
          const project = cloneProject(state.project);
          const result = executeStructureCommand(project, {
            createNodeId: createId,
            kind: "duplicate",
            nodeId,
          });

          if (!result.ok) {
            return {
              editorNotice: {
                message: result.message,
                tone: "error" as const,
              },
            };
          }

          didDuplicate = true;

          return withHistory(state, {
            editorNotice: null,
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page-region" ? result.parent.pageId ?? state.selectedPageId : state.selectedPageId,
            selectedRegionTarget: null,
          });
        });

        return didDuplicate;
      },
      removeNode: (nodeId) => {
        let didRemove = false;

        set((state) => {
          const project = cloneProject(state.project);
          const result = executeStructureCommand(project, {
            kind: "remove",
            nodeId,
          });

          if (!result.ok) {
            return {
              editorNotice: {
                message: result.message,
                tone: "error" as const,
              },
            };
          }

          didRemove = true;

          return withHistory(state, {
            editorNotice: null,
            project: touch(project),
            selectedNodeId: selectionStillExists(project, state.selectedNodeId === nodeId ? null : state.selectedNodeId),
            selectedPageId: result.parent.kind === "page-region" ? result.parent.pageId ?? state.selectedPageId : state.selectedPageId,
            selectedRegionTarget: null,
          });
        });

        return didRemove;
      },
      updateNodeField: (nodeId, key, value) =>
        set((state) => {
          const project = cloneProject(state.project);
          const node = getNode(project, nodeId);
          if (!node) {
            return state;
          }
          node.props[key] = value;
          return withHistory(state, { project: touch(project) });
        }),
      importProject: (project) =>
        set((state) => {
          const nextProject = cloneProject(project);
          const validated = validateProject(nextProject);

          if (!validated.success) {
            return state;
          }

          return withHistory(state, {
            project: touch(validated.data),
            selectedPageId: validated.data.pages[0]?.id ?? "",
            selectedNodeId: null,
            selectedRegionTarget: null,
            previewMode: "desktop" as PreviewMode,
          });
        }),
      applyTemplate: (templateId) =>
        set((state) => {
          const nextProject = createProjectFromTemplate(templateId);

          return withHistory(state, {
            project: nextProject,
            selectedPageId: nextProject.pages[0]?.id ?? "",
            selectedNodeId: null,
            selectedRegionTarget: null,
            previewMode: "desktop" as PreviewMode,
          });
        }),
      undo: () =>
        set((state) => {
          const snapshot = state.historyPast.at(-1);
          if (!snapshot) {
            return state;
          }

          const historyPast = state.historyPast.slice(0, -1);
          const historyFuture = [createSnapshot(state), ...state.historyFuture].slice(0, HISTORY_LIMIT);

          return {
            ...applySnapshot(snapshot),
            historyPast,
            historyFuture,
            canUndo: historyPast.length > 0,
            canRedo: historyFuture.length > 0,
          };
        }),
      redo: () =>
        set((state) => {
          const snapshot = state.historyFuture[0];
          if (!snapshot) {
            return state;
          }

          const historyFuture = state.historyFuture.slice(1);
          const historyPast = [...state.historyPast, createSnapshot(state)].slice(-HISTORY_LIMIT);

          return {
            ...applySnapshot(snapshot),
            historyPast,
            historyFuture,
            canUndo: historyPast.length > 0,
            canRedo: historyFuture.length > 0,
          };
        }),
      resetProject: () =>
        set((state) => {
          const nextProject = createDefaultProject();

          return withHistory(state, {
            project: nextProject,
            selectedPageId: nextProject.pages[0]?.id ?? "",
            selectedNodeId: null,
            selectedRegionTarget: null,
            previewMode: "desktop" as PreviewMode,
          });
        }),
    }),
    {
      name: "drag-and-drop-builder",
      version: 2,
      skipHydration: true,
      partialize: (state) => ({
        project: state.project,
        selectedPageId: state.selectedPageId,
        selectedNodeId: state.selectedNodeId,
        selectedRegionTarget: state.selectedRegionTarget,
        previewMode: state.previewMode,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return currentState;
        }

        const candidate = persistedState as Partial<BuilderState>;
        const parsedProject = validateProject(candidate.project);

        if (!parsedProject.success) {
          return currentState;
        }

        return {
          ...currentState,
          project: parsedProject.data,
          selectedPageId: resolveSelectedPageId(parsedProject.data, candidate.selectedPageId ?? currentState.selectedPageId),
          selectedNodeId: selectionStillExists(
            parsedProject.data,
            candidate.selectedNodeId ?? currentState.selectedNodeId,
          ),
          selectedRegionTarget: null,
          previewMode: candidate.previewMode ?? currentState.previewMode,
        };
      },
    },
  ),
);

export function getSelectedPage(state: BuilderState) {
  return state.project.pages.find((page) => page.id === state.selectedPageId) ?? state.project.pages[0];
}

export function getSelectedNode(state: BuilderState) {
  if (!state.selectedNodeId) {
    return null;
  }

  return state.project.nodes[state.selectedNodeId] ?? null;
}

export function getParentReference(project: BuilderProject, nodeId: string) {
  return findParentReference(project, nodeId);
}
