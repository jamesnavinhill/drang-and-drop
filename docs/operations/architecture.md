# Architecture

## Current Build

The current implementation lives in `apps/web` and is a single Next.js application that hosts the first builder runtime.

Core layers:

- `src/lib/builder/types.ts`
  Defines the project schema, page model, node model, theme model, and preview modes.
- `src/lib/builder/default-project.ts`
  Seeds the starter templates, demo project, and template factories.
- `src/lib/builder/component-definitions.ts`
  Owns the current block catalog, default props, and inspector field definitions.
- `src/lib/builder/component-placement.ts`
  Owns the current placement allowlists and child-acceptance rules for page roots and nested containers.
- `src/lib/builder/component-preview.tsx`
  Owns builder-side theme style mapping and preview rendering for the current block set.
- `src/lib/builder/registry.tsx`
  Now acts as a compatibility barrel while the rest of the codebase migrates away from the old catch-all entry point.
- `src/lib/builder/dnd.ts`
  Owns shared drag/drop resolution helpers used by both the live canvas and deterministic browser verification.
- `src/lib/builder/structure.ts`
  Owns shared placement validation, structure-command execution for insert/move/duplicate/remove, subtree helpers, and structural issue detection.
- `src/lib/builder/store.ts`
  Owns Zustand state, persistence, history, node/page mutations, and selection while delegating structure-sensitive node commands to `structure.ts`.
- `src/lib/builder/export.ts`
  Generates the zipped starter project from the current builder state.
- `src/lib/builder/starter-artifacts.ts`
  Owns the shared generated-starter file plan used by both browser export and automated runtime verification.
- `src/lib/builder/io.ts`
  Handles schema-safe builder project JSON import/export.
- `src/components/builder/*`
  Implements the editor shell: page panel, library, canvas, inspector, and browser verification hook.
- `scripts/verify-builder-dnd.ts`
  Rebuilds and serves the builder app, then validates palette insertion, nested insertion, reorder, invalid root-only nesting, and descendant-move rejection through the browser harness.
- `scripts/verify-builder-commands.ts`
  Runs direct command-layer verification for shared insert/move/duplicate/remove behavior and structural validation failure cases.
- `scripts/verify-generated-starters.ts`
  Generates clean starter workspaces for each shipped template, then runs install/build/start/route/static-asset verification plus browser-rendered checks and screenshots.

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
- FAQ list
- testimonial card
- stat card
- activity feed
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
- opens every generated route in headless Chromium
- checks for browser console/page/network failures
- captures screenshots for the generated pages

## Known Architectural Constraints

- Drag/drop is constrained, runs through shared insert/move command paths, and now surfaces invalid-drop reasoning in the canvas while failed structure commands surface through a shared shell notice.
- Placement constraints are centralized for the current editor model, but they are still derived from registry allowlists rather than a richer slot or region contract.
- Duplicate and remove now share the same command layer as insert and move, and shell-level notices now make failures visible across editor surfaces, but higher-level editor interactions still need clearer affordances and tighter outline/canvas parity.
- Outline and inspector now share the same node-structure action surface for reorder/duplicate/remove, which reduces interaction drift between those editor surfaces.
- Structural validation now covers shape plus layout semantics for import and persisted state, and mutation failures can surface through shared editor notices, but validation messaging is still not threaded through every surface.
- Registry implementation coupling is lower now that block definitions, placement rules, and preview rendering are split into separate modules, but the placement model is still allowlist-based and preview/export contracts still duplicate block behavior.
- Export is readable, but not yet decomposed into highly granular generated components.
- JSON import/export currently targets schema-safe builder state, not arbitrary roundtrip from generated code.
- Backend integrations, auth, and data bindings are intentionally deferred.

## Current Architectural Priorities

- tighten canvas and outline parity on top of the shared command path
- keep refining validation and invalid-drop feedback across editor surfaces
- reduce the remaining interaction duplication between outline actions and canvas actions
- reduce registry coupling before significantly expanding the catalog again
- keep builder/runtime/export parity healthy while these editor-system changes land
- grow command-level verification alongside future wrap/unwrap or assistant-safe mutations
