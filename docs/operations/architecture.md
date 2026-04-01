# Architecture

## Current Build

The current implementation lives in `apps/web` and is a single Next.js application that hosts the first builder runtime.

Core layers:

- `src/lib/builder/types.ts`
  Defines the project schema, page model, node model, theme model, preview modes, and the canonical block contract types.
- `src/lib/builder/default-project.ts`
  Seeds the starter templates, demo project, and template factories.
- `src/lib/builder/block-contracts.ts`
  Owns the canonical block contracts, including family, metadata, placement, render parity metadata, capability tags, and verification expectations for each shipped block type.
- `src/lib/builder/block-catalog.ts`
  Owns derived family metadata, capability labeling, contract-driven catalog helpers, and the preview/export parity matrix used by the UI and verification.
- `src/lib/builder/block-authoring.ts`
  Records the shipped block authoring checklist so future catalog work has an explicit workflow artifact in code.
- `src/lib/builder/block-definitions.ts`
  Derives block metadata, defaults, and inspector field definitions from the canonical block contracts.
- `src/lib/builder/block-placement.ts`
  Derives the canonical placement-target model, including page-region and block-region target kinds plus child-acceptance helpers, from the canonical block contracts.
- `src/lib/builder/regions.ts`
  Owns canonical page-region definitions, block-region helpers, and normalization from legacy `rootIds` / `children` shapes into region-based builder state.
- `src/lib/builder/block-content.ts`
  Owns shared block-content parsing and fallback semantics used by both the builder preview and generated starter support layers.
- `src/lib/builder/block-preview.tsx`
  Owns builder-side theme style mapping and preview rendering for the current block set.
- `src/lib/builder/starter-render-support.ts`
  Owns the generated starter render-support file source so export helper behavior can stay aligned with the builder-side content contract.
- `src/lib/builder/verification-project.ts`
  Owns the internal block-contract coverage project used to keep starter verification exercising every parity-critical shipped block type.
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
  Rebuilds and serves the builder app, then validates page-region and block-region insertion, nested insertion, reorder, invalid region placement, and descendant-move rejection through the browser harness.
- `scripts/verify-builder-commands.ts`
  Runs direct command-layer verification for shared insert/move/duplicate/remove behavior and structural validation failure cases.
- `scripts/verify-builder-contracts.ts`
  Runs fast contract-level verification for block coverage, capability/placement consistency, render parity metadata, authoring checklist completeness, and parity-coverage project alignment.
- `scripts/verify-generated-starters.ts`
  Generates clean starter workspaces for each shipped template plus the internal block-contract coverage project, then runs install/build/start/route/static-asset verification plus browser-rendered checks and screenshots.

## Data Model

The builder is schema-first.

Project shape:

- `project`
  Owns project metadata, theme tokens, page list, node dictionary, and update timestamp.
- `pages`
  Each page has a route path, description, and canonical `header` / `main` / `footer` regions.
- `nodes`
  Each node is normalized by `id` and stores `type`, `props`, and explicit owned `regions`.

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

The current structural model is now explicitly region-based:

- pages own named top-level regions
- layout-owner blocks own named block regions
- insertion targeting resolves against regions, not generic parent containers
- preview, export, structure commands, persistence normalization, and verification all traverse the same region graph

Supported layout primitives:

- section
- stack
- grid

Current leaf blocks:

Current shipped block families:

- root composite blocks
  navbar
  hero
- layout blocks
  section
  stack
  grid
- content blocks
  text
  button
  feature grid
  FAQ list
  testimonial card
  pricing card
- application blocks
  stat card
  activity feed
  form card
  chat input
  message thread
  data table
  sidebar shell

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
- Placement constraints are centralized for the current editor model and now resolve through explicit page-region and block-region target kinds. The region contract is now canonical, but richer multi-region block families and more granular layout semantics are still future work.
- Duplicate and remove now share the same command layer as insert and move, and shell-level notices now make failures visible across editor surfaces, but higher-level editor interactions still need clearer affordances and tighter outline/canvas parity.
- Outline and inspector now share the same node-structure action surface for reorder/duplicate/remove, which reduces interaction drift between those editor surfaces.
- Structural validation now covers shape plus layout semantics for import and persisted state, and mutation failures can surface through shared editor notices, but validation messaging is still not threaded through every surface.
- Registry implementation coupling is lower now that canonical block contracts, region helpers, derived block-definition/placement modules, block-content helpers, and block preview rendering are split into separate modules. The old compatibility barrel and legacy `component-*` shims are now retired. Preview/export parity is documented in the contract layer, and both surfaces now traverse the same canonical region graph even though they still keep separate JSX trees.
- The family and capability map is now a real derived builder module instead of only being implicit inside planning docs, which makes both catalog UI and verification easier to align with the current system.
- The block authoring workflow and preview/export parity matrix now exist as durable artifacts, which makes future block additions easier to review before broader catalog growth resumes.
- Export is clearer now that generated render support is split away from the main starter-artifact file, but it is not yet decomposed into highly granular generated components.
- JSON import/export currently targets schema-safe builder state, not arbitrary roundtrip from generated code.
- Backend integrations, auth, and data bindings are intentionally deferred.

## Current Architectural Priorities

- tighten canvas and outline parity on top of the shared command path
- keep refining validation and invalid-drop feedback across editor surfaces
- reduce the remaining interaction duplication between outline actions and canvas actions
- preserve the new contract-driven parity model while broader catalog or customization work resumes
- keep builder/runtime/export parity healthy while these editor-system changes land
- grow fast contract verification alongside command-level and browser-backed verification
