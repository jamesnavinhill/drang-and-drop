# Architecture

## Current Build

The current implementation lives in `apps/web` and is a single Next.js application that hosts the first builder runtime.

Core layers:

- `src/lib/builder/types.ts`
  Defines the project schema, page model, node model, theme model, and preview modes.
- `src/lib/builder/default-project.ts`
  Seeds the demo project and starter page structure.
- `src/lib/builder/registry.tsx`
  Owns the component catalog, prop controls, placement constraints, theme style mapping, and preview rendering.
- `src/lib/builder/store.ts`
  Owns Zustand state, persistence, node/page mutations, duplication, deletion, and selection.
- `src/lib/builder/export.ts`
  Generates the zipped starter project from the current builder state.
- `src/components/builder/*`
  Implements the editor shell: page panel, library, canvas, and inspector.

## Data Model

The builder is schema-first.

Project shape:

- `project`
  Owns project metadata, theme tokens, page list, node dictionary, and update timestamp.
- `pages`
  Each page has a route path, description, and `rootIds`.
- `nodes`
  Each node is normalized by `id` and stores `type`, `props`, and child ids.

Why this matters:

- drag/drop mutations stay deterministic
- persistence is straightforward
- export can serialize the project cleanly
- future systems integration can extend the model without rebuilding the editor from scratch

## Editor Runtime

The editor shell uses three persistent surfaces:

- left rail
  Pages and block library
- center canvas
  Theme-aware page preview with constrained drag/drop
- right rail
  Project, page, selection, and theme editing

The canvas is intentionally constrained.

Supported layout primitives:

- section
- stack
- grid

Current leaf blocks:

- hero
- text
- button
- feature grid
- stat card
- form card
- pricing card
- chat input
- sidebar shell

## Export Model

Export uses `JSZip` in the client and generates a starter project with:

- `app/layout.tsx`
- `app/globals.css`
- route files for each page path
- `lib/project-data.ts`
- `lib/render-page.tsx`
- `README.md`
- `.env.example`

This export is still schema-driven on the generated side. That is deliberate for now because it preserves parity with the builder runtime while keeping the output understandable.

## Known Architectural Constraints

- Undo/redo is not implemented yet.
- Drag/drop is constrained, but not deeply guarded against every layout edge case yet.
- Export is readable, but not yet decomposed into highly granular generated components.
- Backend integrations, auth, and data bindings are intentionally deferred.
