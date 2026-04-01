# Architecture

## Current Build

The current implementation lives in `apps/web` and is a single Next.js application that hosts the first builder runtime.

Core layers:

- `src/lib/builder/types.ts`
  Defines the project schema, page model, node model, theme model, and preview modes.
- `src/lib/builder/default-project.ts`
  Seeds the starter templates, demo project, and template factories.
- `src/lib/builder/registry.tsx`
  Owns the component catalog, prop controls, placement constraints, theme style mapping, and preview rendering.
- `src/lib/builder/store.ts`
  Owns Zustand state, persistence, history, node/page mutations, duplication, deletion, and selection.
- `src/lib/builder/export.ts`
  Generates the zipped starter project from the current builder state.
- `src/lib/builder/starter-artifacts.ts`
  Owns the shared generated-starter file plan used by both browser export and automated runtime verification.
- `src/lib/builder/io.ts`
  Handles schema-safe builder project JSON import/export.
- `src/components/builder/*`
  Implements the editor shell: page panel, library, canvas, and inspector.
- `scripts/verify-generated-starters.ts`
  Generates clean starter workspaces for each shipped template, then runs install/build/start/route/static-asset verification.

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

The editor shell uses four persistent surfaces:

- top bar
  Preview modes, history actions, export, and workspace summary
- left sidebar
  Pages with route and outline modes, library with contextual insertion guidance, assistant, settings, templates, and project I/O
- center canvas
  Theme-aware page preview with constrained drag/drop
- right inspector
  Selection, page, and theme editing

The canvas is intentionally constrained.

Supported layout primitives:

- section
- stack
- grid

Current leaf blocks:

- navbar
- hero
- text
- button
- feature grid
- testimonial card
- stat card
- form card
- pricing card
- chat input
- message thread
- data table
- sidebar shell

## Export Model

Export uses a shared starter-artifact layer plus `JSZip` in the client and generates a starter project with:

- `app/layout.tsx`
- `app/globals.css`
- route files for each page path
- `lib/project-data.ts`
- `lib/render-page.tsx`
- `README.md`
- `.env.example`

This export is still schema-driven on the generated side. That is deliberate for now because it preserves parity with the builder runtime while keeping the output understandable.

The generated starter file plan now has a matching automated verification loop that:

- writes clean workspaces for each starter template
- runs `pnpm install`
- runs `pnpm build`
- runs `pnpm start`
- checks every generated route
- checks a live `/_next/static/*` asset response

## Known Architectural Constraints

- Drag/drop is constrained, but not deeply guarded against every layout edge case yet.
- Export is readable, but not yet decomposed into highly granular generated components.
- JSON import/export currently targets schema-safe builder state, not arbitrary roundtrip from generated code.
- Backend integrations, auth, and data bindings are intentionally deferred.
