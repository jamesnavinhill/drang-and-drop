# Editor Foundation Hardening Plan

Date: April 1, 2026
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related shell plan: `docs/plans/03-builder-shell-and-assistant-foundation-plan.md`
Related feasibility report: `docs/reports/01-feasability-report.md`

## Purpose

Re-center the next implementation slices on the editor substrate instead of accelerating catalog and template breadth before the builder system is ready.

This plan pulls together unfinished work that was previously split across roadmap follow-ups, verification notes, and handoff guidance, then turns that work into a single foundation-first sequence for the current codebase in `apps/web`.

## Progress Update

Progress landed so far in the current codebase:

- shared placement validation now lives in `src/lib/builder/structure.ts`
- insert, move, duplicate, and remove now share a structure-command path before store history is recorded
- structural validation now rejects invalid placement and orphan-node states during import and persisted-state parsing
- drag verification now covers a first set of deeper invalid nested and descendant scenarios
- direct command verification now exists for shared insert/move/duplicate/remove behavior
- the canvas now surfaces live invalid-drop reasoning from the shared validator
- the full library catalog now flags blocks that do not fit the current insertion target
- failed structure-sensitive actions now surface through a shared shell-level editor notice
- the outline now shows the current insertion target so selection and insertion intent are easier to read
- outline and inspector now share the same structure-action controls for reorder, duplicate, and remove

This means the constraint-and-command foundation is partially landed. The next work inside this plan should lean harder into editor interaction clarity, validation surfacing, and registry separation instead of reopening already-centralized mutation paths.

## Why This Plan Exists

The current builder already has:

- a usable shell
- a schema-first project model
- constrained drag/drop
- persistence and undo/redo
- export to a runnable starter
- baseline builder and generated-starter verification

That is enough surface area to prove the product direction.

It is not yet enough editor infrastructure to safely scale:

- placement rules
- drag/drop edge cases
- block count and template breadth
- export complexity
- future assistant-driven edits

The current implementation also still couples too much responsibility inside the registry layer. If we keep expanding blocks and templates faster than the underlying editor system, the product will become harder to reason about, harder to verify, and harder to export cleanly.

## Unfinished Work Carried Forward

This plan consolidates unfinished tasks from earlier docs and slices:

### From the roadmap

- deeper drag/drop coverage
- richer undo/redo behavior
- layout edge-case hardening
- stronger generated-app fidelity assertions
- validation messages for invalid drops, props, and layouts
- cleaner export quality and route-generation hardening

### From handoff and verification

- broaden drag/drop verification beyond the current happy path
- turn placement constraints into a stronger system instead of scattered checks
- keep builder/runtime/export parity while the catalog grows

### From the current architecture state

- reduce registry coupling
- formalize editor commands and structural validation
- make placement and drop resolution easier to reason about

## Product Boundary For This Phase

During this phase, prefer system work over surface-area work.

Allowed focus:

- placement rules
- drag/drop behavior
- canvas clarity
- structural validation
- command architecture
- export parity contracts
- editor verification

Deprioritized until the foundation slice is healthier:

- broad block-catalog expansion
- template proliferation
- assistant mutation tooling
- deeper generated app embellishment that depends on a still-shifting editor model

## Current System Constraints

The main constraints in the current codebase are:

1. `src/lib/builder/registry.tsx` still mixes block metadata, inspector schema, placement rules, and builder preview rendering.
2. Placement constraints are mostly allowlists (`accepts`, `rootOnly`, `canHaveChildren`) instead of a clearer placement model.
3. The canvas flow in `src/components/builder/canvas.tsx` is deterministic, but it does not yet provide strong insertion semantics or guard every edge case.
4. The store in `src/lib/builder/store.ts` owns mutations directly without a more explicit command layer.
5. Schema validation in `src/lib/builder/schema.ts` checks shape, but not enough semantic or structural validity.
6. Export still depends on a parallel renderer contract in `src/lib/builder/starter-artifacts.ts`, so parity risks grow as the block system gets richer.

## Foundation Workstreams

### 1. Placement Model And Constraints

Goal:

- move from simple parent-child allowlists toward a clearer placement system that is easier to verify and extend

Target files:

- `apps/web/src/lib/builder/dnd.ts`
- `apps/web/src/lib/builder/structure.ts`
- `apps/web/src/lib/builder/store.ts`
- `apps/web/src/lib/builder/registry.tsx`

Work:

- formalize drop-target semantics for page root, container root, and sibling insertion
- support clearer rule evaluation for valid and invalid drops
- prepare for future slot or region-based placement without needing a second rewrite
- centralize placement checks so canvas, outline, assistant proposals, and verification share the same logic

Acceptance signals:

- one source of truth for placement resolution
- invalid-drop reasoning is explicit
- reorder and insert behavior are stable across root and nested contexts

### 2. Canvas And Editor Interaction Hardening

Goal:

- make drag/drop and selection behavior more predictable before scaling block breadth

Target files:

- `apps/web/src/components/builder/canvas.tsx`
- `apps/web/src/components/builder/page-panel.tsx`
- `apps/web/src/components/builder/library-panel.tsx`
- `apps/web/src/components/builder/inspector-panel.tsx`

Work:

- improve insertion affordances and reorder clarity
- reduce ambiguity between selection, drag handles, and drop zones
- harden empty-container and nested-container behavior
- tighten the mental model between outline actions and canvas actions

Acceptance signals:

- the same structure change is easy to perform from either canvas or outline
- nested containers remain understandable
- selection state does not fight drag state

### 3. Command Layer And History Integrity

Goal:

- make editor mutations easier to reason about, validate, test, and eventually expose to assistant tooling

Target files:

- `apps/web/src/lib/builder/store.ts`
- `apps/web/src/lib/builder/dnd.ts`
- `apps/web/src/lib/builder/structure.ts`

Work:

- introduce clearer editor commands around insert, move, duplicate, remove, and future wrap/unwrap operations
- reduce mutation logic duplication between surfaces
- make undo/redo correctness easier to preserve as more operations land

Acceptance signals:

- mutation flows are easier to inspect and verify
- history remains correct across insert, move, remove, duplicate, and reset
- future safe automation has a clearer mutation boundary

### 4. Structural Validation

Goal:

- validate more than just schema shape

Target files:

- `apps/web/src/lib/builder/schema.ts`
- `apps/web/src/lib/builder/structure.ts`
- `apps/web/src/lib/builder/store.ts`

Work:

- detect invalid parent-child relationships
- detect orphan nodes
- detect root-only violations
- detect impossible nested structures
- prepare for future validation messages in the UI

Acceptance signals:

- imported or mutated projects cannot silently drift into structurally invalid states
- invalid layout states are detectable without relying only on UI behavior

### 5. Registry Separation And Block Contract Cleanup

Goal:

- stop using the registry as a catch-all layer before the library grows further

Target files:

- `apps/web/src/lib/builder/registry.tsx`
- `apps/web/src/lib/builder/types.ts`
- any new helper files extracted from the registry

Work:

- separate metadata from rendering and placement concerns where practical
- define a clearer contract for:
  - block metadata
  - editing schema
  - placement behavior
  - preview/runtime/export rendering expectations
- prepare the system for a broader catalog without a giant monolith file

Acceptance signals:

- adding a block no longer implies touching one oversized, multipurpose registry definition
- export and preview parity rules become easier to see and review

### 6. Export Parity And Fidelity Foundation

Goal:

- protect the product promise while the editor evolves

Target files:

- `apps/web/src/lib/builder/starter-artifacts.ts`
- `apps/web/scripts/verify-generated-starters.ts`
- any shared renderer or block-contract helpers introduced in this phase

Work:

- tighten the mapping between builder structure and generated structure
- define what export parity means per block and per layout primitive
- add richer generated-app assertions only after the underlying contract is clearer

Acceptance signals:

- builder/editor changes do not silently drift away from exported output
- generated-app verification can grow from a stronger contract rather than brittle assertions

## Recommended Sequence

Implement the next slices in this order:

1. placement model and constraint centralization
2. canvas interaction hardening
3. command layer and history integrity
4. structural validation
5. registry separation
6. export parity contract hardening
7. only then resume broader block and template expansion

## Concrete Next Slice

The best immediate next slice is:

### Constraint And Command Foundation

Scope:

- centralize placement and mutation rules
- begin separating editor commands from UI-specific drag behavior
- harden structural validation around insert and move flows

Current status:

- shared insert/move/duplicate/remove command execution is now in place
- structural validation is now stronger for imported and persisted projects
- direct mutation-level verification now exists alongside browser drag verification
- canvas-side invalid-drop feedback is now in place for shared placement failures
- shell-level editor notices now surface failed structure-sensitive actions across the workspace
- outline insertion context now reflects the same target model used by the library
- outline and inspector now share a single node-action surface, reducing editor-surface drift

Suggested file focus:

- `apps/web/src/components/builder/canvas.tsx`
- `apps/web/src/components/builder/page-panel.tsx`
- `apps/web/src/components/builder/inspector-panel.tsx`
- `apps/web/src/lib/builder/registry.tsx`

Suggested acceptance criteria:

- canvas and outline interactions remain easy to understand on top of the shared command path
- invalid structural mutations are not only rejected consistently but are easier to explain to the user
- contextual library and canvas feedback stay aligned with the same placement rules
- shared notices and insertion context reduce the gap between outline and canvas mental models
- reorder, duplicate, and remove controls stay aligned across at least outline and inspector
- drag/drop, outline reorder, and future assistant-safe edits continue to share the same mutation rules
- existing verification remains green

## Verification Expectations For This Phase

Keep verification in parity with system work:

- keep `pnpm lint` and `pnpm build` green
- keep `pnpm verify:dnd` green as the drag system evolves
- keep `pnpm verify:starters` green as structural and export contracts change
- expand drag verification alongside placement-rule changes, especially invalid-drop and nested-container scenarios
- delay heavier generated-app visual-diff work until the export contract is less fluid

## Explicit Non-Goals For This Plan

- large catalog expansion
- many new templates
- assistant auto-apply mutation flows
- ambitious new generated-app styling systems
- full import/export roundtrip from generated code

## Completion Signal

This plan is successful when:

- the editor has a clearer placement model
- mutation logic is easier to reason about than it is today
- structural invalid states are better guarded
- canvas behavior is more predictable
- export parity is easier to evaluate
- the team can resume block and template expansion without outrunning the editor system again
