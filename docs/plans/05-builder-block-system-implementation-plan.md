# Builder Block System Implementation Plan

Date: April 1, 2026
Related report: `docs/reports/02-builder-system-naming-and-mapping-report.md`
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related shell plan: `docs/plans/03-builder-shell-and-assistant-foundation-plan.md`
Related foundation plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related architecture doc: `docs/operations/architecture.md`

## Purpose

Turn the naming and mapping report into the next real implementation phase for the builder system.

This plan assumes the codebase is at the end of the `04` editor-foundation slice, with only a small amount of export-parity work intentionally rolling forward into this phase.

The goal of `05` is not broad catalog growth. The goal is to make the builder system canonical, uniform, and durable before customization depth and feature count expand further.

## Why This Phase Exists

The current codebase now has enough editor structure to support a more deliberate system pass:

- placement and structure commands are centralized
- invalid placement feedback is visible across the shell
- definitions, placement, and preview rendering are already split apart
- export verification exists and is meaningful

What is still not clean enough for long-term growth:

- mixed `component` and `block` language across the codebase
- block contracts are implied across several files instead of expressed as one clear model
- preview and export still duplicate too much per-block rendering logic
- the current catalog is real, but its family map and capability map are not yet first-class implementation artifacts
- the authoring workflow for adding a new block is still too dependent on local codebase knowledge

If we leave those seams informal while the catalog and customization surface grow, the builder will become harder to evolve, harder to verify, and harder to keep professional.

## Confirmed Working Decisions

The following decisions are now treated as implementation assumptions for this phase:

- `block` is the canonical authoring and product term
- `node` remains the persisted schema/store term
- `component` should be reserved for implementation-level React/rendering details
- `template` continues to mean a starter project, not an individual block or reusable page fragment
- `navbar` and `hero` remain root-only for now
- `page-root` and `layout-container` remain the active placement-target model for this phase
- future slot/region work should be prepared for, but not implemented broadly here
- documentation and operating docs should be updated alongside system changes, not after the fact
- because this is a greenfield codebase, canonical and uniform naming should be preferred whenever the change can be made cleanly

## Phase Goals

1. Make the builder system canonical around `block` terminology and boundaries.
2. Define an explicit block contract that preview, export, validation, and verification can all share.
3. Turn the current catalog into a mapped block-family system instead of a flat growing list.
4. Fold the remaining export-parity work from `04` into a cleaner shared render contract.
5. Create a repeatable, documented authoring workflow for future block additions.
6. Keep architecture, verification, and handoff docs aligned with the codebase as the system changes land.

## Product Boundary For This Phase

Allowed focus:

- canonical naming cleanup
- block contract definition
- registry and module organization
- block family and capability mapping
- preview/export parity shaping
- block authoring workflow
- verification expansion tied to those contracts
- architecture and operating-doc upkeep

Explicit non-goals:

- large catalog expansion
- large template expansion
- slot or region implementation beyond contract preparation
- assistant mutation tooling
- broad generated-app embellishment not tied to parity
- import/export roundtrip from generated code

## Primary Deliverables

This phase should leave behind these durable artifacts:

- a canonical block contract in code
- a cleaner block registry assembly model
- a block family map grounded in the current shipped catalog
- a layout capability map grounded in the current placement model
- a preview/export parity matrix for shipped block types
- a block authoring checklist for future implementation work
- updated architecture, verification, and handoff docs that describe the new system honestly

## Workstreams

### 1. Canonical Terminology And Boundary Cleanup

Goal:

- remove avoidable naming drift while the codebase is still small enough to cleanly normalize

Target areas:

- `apps/web/src/lib/builder/types.ts`
- `apps/web/src/lib/builder/component-definitions.ts`
- `apps/web/src/lib/builder/component-placement.ts`
- `apps/web/src/lib/builder/component-preview.tsx`
- `apps/web/src/lib/builder/registry.tsx`
- `apps/web/src/components/builder/*`
- docs that still mix `component` and `block` casually

Work:

- standardize product, UI, and planning language on `block`
- introduce canonical `block-*` module boundaries where practical
- rename or replace `component-*` builder modules in a deliberate early pass rather than allowing mixed naming to persist indefinitely
- keep compatibility shims only briefly and only where they reduce migration risk
- ensure new files and new interfaces use block terminology by default

Acceptance signals:

- the main builder system reads as `block` at the public boundary
- schema/store records still read as `node`
- `component` remains only an implementation detail where it still adds clarity
- the codebase no longer relies on casual translation between `component` and `block` to understand core behavior

### 2. Explicit Block Contract

Goal:

- define the builder’s real unit of implementation as a first-class contract instead of an implied convention

Target areas:

- current builder type definitions
- current definition/placement/preview modules
- export-side rendering artifacts
- verification helpers

Work:

- define a block contract shape that cleanly separates:
  - metadata
  - defaults
  - inspector fields
  - placement rules
  - preview behavior
  - export behavior
  - verification expectations
- make registry assembly consume those contracts instead of constructing behavior ad hoc
- make it obvious what is required to ship a new block type
- keep the contract narrow enough that future slot/region work can extend it instead of replacing it

Acceptance signals:

- one block type has one obvious contract home
- registry assembly becomes simpler and more reviewable
- export and preview expectations are visible alongside the rest of the block definition
- future block work is constrained by a clear system instead of team memory

### 3. Block Family Map And Layout Capability Map

Goal:

- turn the current catalog into a system with explicit families and capabilities

Target areas:

- block registry organization
- supporting docs under `docs/plans` and `docs/operations`

Work:

- formalize family groupings for the current catalog
- at minimum, map:
  - root-level composite blocks
  - layout blocks
  - content blocks
  - application-oriented blocks
- define capability flags and expectations such as:
  - root-only
  - layout owner
  - child target kind
  - leaf-only
  - parity-critical
  - future region pressure
- use this map to guide future block additions and verification scope

Acceptance signals:

- the current block catalog can be described as a system, not just a list
- layout and content responsibilities are easier to review
- future roadmap conversations can discuss families and capabilities instead of one-off block exceptions

### 4. Shared Preview And Export Render Contract

Goal:

- reduce the remaining duplication risk between builder preview and exported starter rendering

Target areas:

- `apps/web/src/lib/builder/component-preview.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- `apps/web/src/lib/builder/starter-render-support.ts`
- any new shared block-render contract modules introduced in this phase

Work:

- fold the remaining export-parity follow-up from `04` into this phase
- define what parity means per shipped block family and per layout primitive
- move away from two loosely parallel block render implementations toward a clearer shared contract
- keep the solution practical:
  - do not force a premature universal renderer
  - do not preserve large duplicated JSX trees without an explicit reason
- make parity drift easier to detect in both code review and verification

Acceptance signals:

- preview/export rendering differences are intentional and documented
- per-block parity review becomes straightforward
- exported starter behavior remains readable while staying closer to builder expectations

### 5. Block Authoring Workflow And Verification Expansion

Goal:

- make future block implementation a disciplined system workflow instead of a scavenger hunt

Target areas:

- builder verification scripts
- generated-starter verification
- authoring docs

Work:

- create a block authoring checklist that every new block must satisfy
- include at minimum:
  - family classification
  - defaults and inspector fields
  - placement contract
  - preview contract
  - export contract
  - verification additions
  - docs impact
  - template impact
- expand verification where it directly supports the new contract model
- prefer contract-level verification over brittle one-off checks

Acceptance signals:

- adding a new block follows a repeatable documented path
- verification grows with the system instead of lagging behind it
- parity and placement regressions are easier to catch before catalog expansion resumes

### 6. Documentation And Operating-System Upkeep

Goal:

- keep planning and operating docs truthful as the builder system becomes more formal

Target docs:

- `docs/operations/architecture.md`
- `docs/operations/verification.md`
- `docs/operations/handoff.md`
- roadmap or plan docs affected by the work
- any new architecture or operating notes introduced during this phase

Work:

- update architecture docs whenever module boundaries or contracts materially change
- update verification docs whenever the expected contract or test loop changes
- update handoff guidance so future sessions inherit the new system cleanly
- avoid letting architectural knowledge live only in code comments or commit history

Acceptance signals:

- the docs describe the actual builder system that exists
- future implementation slices can start from docs without reconstructing intent from code
- new operating conventions are recorded in the same phase that introduced them

## Recommended Sequence

Implement `05` in these large logical groups:

1. canonical terminology and boundary cleanup
2. explicit block contract introduction
3. block family and capability mapping
4. preview/export parity contract shaping
5. block authoring checklist plus verification expansion
6. documentation and operating-doc consolidation

This order keeps the codebase readable first, then makes the contracts real, then tightens parity and future workflow on top of those contracts.

## Concrete First Slice

The best immediate slice inside `05` is:

### Canonical Block Contract Pass

Scope:

- normalize the main builder vocabulary around `block`
- establish the first explicit block contract boundary
- migrate the existing registry assembly to that contract
- leave short-lived compatibility shims only where needed
- capture the current shipped catalog in a first-pass family/capability map

Suggested file focus:

- `apps/web/src/lib/builder/types.ts`
- `apps/web/src/lib/builder/component-definitions.ts`
- `apps/web/src/lib/builder/component-placement.ts`
- `apps/web/src/lib/builder/component-preview.tsx`
- `apps/web/src/lib/builder/registry.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- `docs/operations/architecture.md`

Suggested acceptance criteria:

- core builder contracts read canonically
- registry assembly is cleaner than the current compatibility-barrel approach
- the current shipped block set is explicitly grouped by family/capability
- remaining preview/export parity work has a clear next seam instead of living as general debt
- existing verification remains green

## Verification Expectations

Keep verification aligned with system changes:

- keep `pnpm lint` green
- keep `pnpm build` green
- keep `pnpm verify:commands` green
- keep `pnpm verify:dnd` green
- keep `pnpm verify:starters` green
- add contract-level verification where block-family or parity rules become more explicit
- avoid adding brittle checks that duplicate the implementation instead of validating behavior

## Exit Condition

This phase is successful when all of the following are true:

- the builder system is canonically organized around `block` terminology
- one explicit block contract exists and is used across the core builder boundary
- the current catalog has a durable family and capability map
- preview/export parity is governed by a clearer shared contract than it is today
- adding a new block is a professional, documented workflow
- architecture, verification, and handoff docs all reflect the new reality of the codebase

## What Comes After This Phase

After `05` is complete, the codebase should be in a healthier position to resume forward product growth with larger implementation slices such as:

- broader catalog expansion
- richer layout customization
- future slot or region contracts
- stronger generated-app fidelity assertions
- more advanced assistant-aware builder workflows

Those should resume only after this phase leaves the builder system cleaner, more canonical, and easier to extend than it is now.
