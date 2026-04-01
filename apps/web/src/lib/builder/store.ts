"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createDefaultProject, createId, createProjectFromTemplate } from "./default-project";
import { getComponentDefinition } from "./registry";
import { validateProject } from "./schema";
import { executeStructureCommand, findParentReference } from "./structure";
import type {
  BuilderNode,
  BuilderPage,
  BuilderProject,
  ComponentType,
  ParentReference,
  PreviewMode,
  PrimitiveValue,
} from "./types";
import type { BuilderTemplateId } from "./default-project";

interface BuilderState {
  project: BuilderProject;
  selectedPageId: string;
  selectedNodeId: string | null;
  previewMode: PreviewMode;
  hasHydrated: boolean;
  historyPast: BuilderSnapshot[];
  historyFuture: BuilderSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  selectPage: (pageId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
  addNode: (type: ComponentType, parent: ParentReference, index?: number) => boolean;
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
}

const HISTORY_LIMIT = 50;

function cloneProject(project: BuilderProject) {
  return structuredClone(project);
}

function createSnapshot(state: Pick<BuilderState, "project" | "selectedPageId" | "selectedNodeId">): BuilderSnapshot {
  return {
    project: state.project,
    selectedPageId: state.selectedPageId,
    selectedNodeId: state.selectedNodeId,
  };
}

function applySnapshot(snapshot: BuilderSnapshot) {
  return {
    project: snapshot.project,
    selectedPageId: snapshot.selectedPageId,
    selectedNodeId: snapshot.selectedNodeId,
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

function createNode(type: ComponentType): BuilderNode {
  const definition = getComponentDefinition(type);

  return {
    id: createId(),
    type,
    props: structuredClone(definition.defaults),
    children: [],
  };
}

function cloneSubtree(project: BuilderProject, nodeId: string): string {
  const source = getNode(project, nodeId);
  if (!source) {
    return nodeId;
  }

  const nextId = createId();
  const nextChildren = source.children.map((childId) => cloneSubtree(project, childId));

  project.nodes[nextId] = {
    ...structuredClone(source),
    id: nextId,
    children: nextChildren,
  };

  return nextId;
}

function deleteSubtree(project: BuilderProject, nodeId: string) {
  const node = getNode(project, nodeId);
  if (!node) {
    return;
  }

  for (const childId of node.children) {
    deleteSubtree(project, childId);
  }

  delete project.nodes[nodeId];
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
      previewMode: "desktop",
      hasHydrated: false,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
      selectPage: (pageId) =>
        set({
          selectedPageId: pageId,
          selectedNodeId: null,
        }),
      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
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
            rootIds: [],
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
          const nextRootIds = page.rootIds.map((rootId) => cloneSubtree(project, rootId));
          const nextPage: BuilderPage = {
            ...structuredClone(page),
            id: nextPageId,
            name: `${page.name} Copy`,
            path: page.path === "/" ? `/copy-${nextPageId.slice(0, 6)}` : `${page.path}-copy`,
            rootIds: nextRootIds,
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
          for (const rootId of page.rootIds) {
            deleteSubtree(project, rootId);
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
            return state;
          }

          didAdd = true;

          return withHistory(state, {
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page" ? result.parent.id : state.selectedPageId,
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
            return state;
          }

          didMove = true;

          return withHistory(state, {
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page" ? result.parent.id : state.selectedPageId,
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
            return state;
          }

          didDuplicate = true;

          return withHistory(state, {
            project: touch(project),
            selectedNodeId: result.nodeId,
            selectedPageId: result.parent.kind === "page" ? result.parent.id : state.selectedPageId,
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
            return state;
          }

          didRemove = true;

          return withHistory(state, {
            project: touch(project),
            selectedNodeId: selectionStillExists(project, state.selectedNodeId === nodeId ? null : state.selectedNodeId),
            selectedPageId: result.parent.kind === "page" ? result.parent.id : state.selectedPageId,
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
            previewMode: "desktop" as PreviewMode,
          });
        }),
    }),
    {
      name: "drag-and-drop-builder",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        project: state.project,
        selectedPageId: state.selectedPageId,
        selectedNodeId: state.selectedNodeId,
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
