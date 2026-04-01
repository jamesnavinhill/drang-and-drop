# Region Contract And Layout Structure Plan

Date: April 1, 2026
Status: In Progress
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related foundation plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related block-system plan: `docs/plans/05-builder-block-system-implementation-plan.md`
Related architecture doc: `docs/operations/architecture.md`
Related authoring doc: `docs/operations/block-authoring.md`

## Purpose

Move the builder from a coarse parent-kind placement model into a real named-region model before broader catalog growth or richer layout customization resumes.

This phase is meant to be structural, not decorative.

The goal is to replace the remaining `page-root` / `layout-container` simplification with a canonical region-based authoring model that can support richer layout composition and more granular configuration without another major cutover later.

## Current Status

The first big slice in this phase is now complete.

Landed in this slice:

- pages now own canonical `header`, `main`, and `footer` regions
- layout-owner blocks now own explicit `content` regions
- block contracts now express `allowedRegions` plus explicit owned-region definitions
- persisted, template-backed, and verification project inputs now normalize legacy `rootIds` and `children` into canonical `regions`
- structure commands, placement validation, canvas authoring, outline authoring, generated starter export, and verification now all traverse the same region graph
- browser verification now covers header/main/content region behaviors directly

Primary implementation touchpoints:

- `apps/web/src/lib/builder/types.ts`
- `apps/web/src/lib/builder/regions.ts`
- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-placement.ts`
- `apps/web/src/lib/builder/structure.ts`
- `apps/web/src/lib/builder/schema.ts`
- `apps/web/src/lib/builder/store.ts`
- `apps/web/src/components/builder/canvas.tsx`
- `apps/web/src/components/builder/page-panel.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- `apps/web/scripts/verify-builder-commands.ts`
- `apps/web/scripts/verify-builder-dnd.ts`
- `apps/web/scripts/verify-generated-starters.ts`

Verification completed for this slice:

- `pnpm lint`
- `pnpm build`
- `pnpm verify:contracts`
- `pnpm verify:commands`
- `pnpm verify:dnd`
- `pnpm verify:starters`

## Why This Phase Exists

The current builder is now strong enough to justify a deeper placement model:

- block contracts are explicit
- placement validation is centralized
- structure commands are centralized
- block family and capability mapping is real
- preview/export parity expectations are now documented

What is still too coarse for the next level of V1 work:

- pages still expose a flat root list instead of named top-level regions
- layout-owner blocks still expose only one implicit child list instead of explicit owned regions
- placement validation still reasons about parent target kinds more than authoring destinations
- the canvas and outline still think more in terms of containers than regions
- richer layout customization would currently require one-off exceptions instead of a stronger structural contract

## Product Boundary For This Phase

Allowed focus:

- canonical named-region schema changes
- page-region ownership
- block-region ownership
- region-aware placement and structure commands
- region-aware canvas and outline authoring
- migration of persisted and template-backed project data into the new model
- preview/export traversal updates required by that new model
- verification expansion tied directly to the new structural contract

Explicit non-goals:

- broader catalog expansion
- assistant mutation work
- V2 integrations or integration foundations
- major visual polish passes
- heavy generated-app fidelity assertions beyond what is needed to protect the new structure

## Canonical Model

The builder should now move toward these structural rules:

1. Pages own named top-level regions.
2. Region-owning blocks declare their owned regions explicitly in the block contract.
3. Placement validation targets regions, not only parent kinds.
4. Preview, export, structure commands, and verification all traverse the same region graph.
5. The system remains constrained and opinionated.

This is not intended to become an unconstrained slot engine where anything can go anywhere.

## Proposed Region Vocabulary

### Page regions

The initial page model should expose:

- `header`
- `main`
- `footer`

These are not decorative wrappers. They are canonical authoring destinations.

### Block-owned regions

The initial block-owned region model should be narrow:

- current layout-owner blocks own a `content` region
- future multi-region blocks can add more named regions later without a schema rewrite

### Region kinds

The first real region kinds should be:

- `page-header`
- `page-main`
- `page-footer`
- `layout-content`

Future phases can add more region kinds such as sidebar, aside, actions, media, or supporting-content without replacing the model.

## Contract Direction

The canonical block placement contract should evolve from:

- allowed parent target kinds
- one optional child target kind

into:

- allowed destination region kinds
- explicit owned region definitions

Each owned region should be able to express:

- id
- label
- region kind
- multiplicity expectations

That gives the builder enough structure to support granular composition without degrading into one-off layout exceptions.

## Recommended Sequence

Implement `06` in these large logical groups:

1. canonical region ownership in schema and contracts
2. region-aware placement validation and structure commands
3. region-aware canvas, outline, and insertion targeting
4. preview/export traversal updates
5. verification expansion around region behavior
6. follow-up layout customization work on top of the settled region model

## First Big Slice

### Canonical Region Ownership

Goal:

- make named regions the canonical structural model for pages and region-owning blocks

Scope:

- replace flat page `rootIds` with page regions
- replace flat node `children` with owned regions
- update block contracts so region ownership is explicit
- update placement validation so drops and commands resolve against regions
- make the canvas and outline expose those regions clearly enough to author against them
- migrate legacy persisted/template project structures into the new canonical model

Expected initial structure:

- pages own `header`, `main`, and `footer`
- `section`, `stack`, and `grid` own `content`
- leaf blocks own no regions
- `navbar` becomes `page-header` only
- `hero` becomes `page-main` only

Suggested file focus:

- `apps/web/src/lib/builder/types.ts`
- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-placement.ts`
- `apps/web/src/lib/builder/structure.ts`
- `apps/web/src/lib/builder/schema.ts`
- `apps/web/src/lib/builder/store.ts`
- `apps/web/src/lib/builder/default-project.ts`
- `apps/web/src/lib/builder/verification-project.ts`
- `apps/web/src/components/builder/canvas.tsx`
- `apps/web/src/components/builder/page-panel.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- verification scripts touched by the schema change

Acceptance signals:

- the persisted project model is region-based, not root-list based
- the block contract expresses owned regions explicitly
- layout-owner blocks no longer rely on an implied generic child list
- canvas and outline surfaces make page/header/main/footer destinations legible
- preview and export both traverse region-owned children canonically
- persisted old project data is migrated or normalized cleanly
- verification remains green

These acceptance signals are now satisfied for the first big slice.

## Verification Expectations

Keep verification aligned with the structural cutover:

- keep `pnpm lint` green
- keep `pnpm build` green
- keep `pnpm verify:contracts` green
- keep `pnpm verify:commands` green
- keep `pnpm verify:dnd` green
- keep `pnpm verify:starters` green
- add region-aware checks before deeper generated-app fidelity assertions

## Exit Condition

This phase is successful when all of the following are true:

- named regions are the canonical placement model
- page structure is owned through explicit page regions
- region-owning blocks declare owned regions explicitly
- structure commands and validation operate on region destinations instead of implicit child lists
- preview/export traversal follows the same region graph
- richer layout customization can build on the region model without another structural cutover

## What Comes After This Phase

Once the region model is stable, the project will be in a much healthier place to resume:

- richer layout customization
- more granular per-layout configuration
- future multi-region block families
- stronger generated-app fidelity assertions
- broader catalog growth on top of a settled structural model
