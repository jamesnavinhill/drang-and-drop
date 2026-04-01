# Foundational Catalog Implementation Plan

Date: April 1, 2026
Status: Ready to start
Related report: `docs/reports/03-v1-catalog-readiness-feasibility-report.md`
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related foundation plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related block-system plan: `docs/plans/05-builder-block-system-implementation-plan.md`
Related region plan: `docs/plans/06-region-contract-and-layout-structure-plan.md`
Related architecture doc: `docs/operations/architecture.md`
Related authoring doc: `docs/operations/block-authoring.md`
Related verification doc: `docs/operations/verification.md`

## Purpose

Turn the catalog-readiness audit into the next real implementation phase for the builder.

This plan assumes the codebase is now at the end of the `05` block-system pass and the current `06` region-contract follow-up slices:

- canonical block contracts are in place
- the canonical region graph is settled
- the first configurable multi-region layout block is shipped
- contract, command, drag, and starter verification are all active

The goal of `07` is to resume catalog growth without slipping back into one-off block work, scattered placement rules, or parity drift.

This phase is about building a robust foundational catalog system for V1.

It is not about assistant mutation work, V2 integrations, or maximum catalog breadth.

## Working Assumptions

Unless a later decision changes them, this plan should proceed with these assumptions:

1. Catalog expansion is family-first, not breadth-first.
2. Block configuration stays intentional and constrained.
3. Media-heavy or asset-dependent blocks are deferred until after the first foundational family pass.
4. The next catalog pass should deepen current single-region families before introducing another intentional multi-region family.
5. The catalog system should lead template updates, not the other way around.
6. Assistant work remains deferred to V2.

These assumptions come directly from the recommendations in `docs/reports/03-v1-catalog-readiness-feasibility-report.md`.

## Why This Phase Exists

The project now has the minimum architectural health needed to resume forward growth:

- one canonical block contract per shipped block
- one canonical placement model
- one canonical region graph across runtime, persistence, preview, and export
- a real verification stack instead of mostly manual confidence
- region-aware authoring affordances in canvas, outline, and library

What still needs discipline before the catalog grows much further:

- family-level sequencing instead of ad hoc additions
- stronger catalog acceptance rules so new blocks do not quietly create parity drift
- template and verification updates in the same slice as catalog growth
- a clean distinction between presentational V1 blocks and V2-shaped integration blocks

If this phase is not explicit, the project risks rebuilding the same problems that `05` and `06` just removed.

## Phase Goals

1. Expand the V1 catalog by coherent block families instead of one-off block additions.
2. Keep every new block inside the canonical contract, placement, and region model.
3. Preserve preview/export parity discipline while the catalog grows.
4. Keep templates and the internal coverage project aligned with the new catalog.
5. Leave behind a durable catalog workflow that can support future development without another cleanup pass.

## Product Boundary For This Phase

Allowed focus:

- family-first catalog growth
- presentational and structurally-constrained blocks
- richer layout-owner configuration that fits the current region model
- parity and verification updates required by those additions
- template updates that reflect the evolved catalog
- docs and authoring guidance updates tied directly to the catalog work

Explicit non-goals:

- assistant mutation tooling
- auth, data binding, storage, or action systems
- backend-aware or integration-shaped block families
- broad media pipeline or asset management systems
- large template proliferation disconnected from the catalog system
- another major editor-substrate rewrite

## Catalog Direction

The next catalog phase should favor these family shapes:

### Marketing and content family completion

Target direction:

- strengthen core launch-page and supporting-content coverage
- deepen variations that fit the current page and layout model cleanly

Examples of healthy additions:

- richer text/content presentation blocks
- proof and trust blocks
- CTA-supporting content blocks
- comparison and summary blocks

### Application family completion

Target direction:

- deepen dashboard and internal-tool credibility without requiring live data systems

Examples of healthy additions:

- compact status and summary blocks
- structured operational cards
- read-only workflow shells
- additional static app-surface primitives

### Layout-owner family follow-up

Target direction:

- add useful layout-owner behavior where the current region model and inspector model can support it cleanly

Examples of healthy additions:

- more configurable single-region layout owners
- another intentional multi-region family only when the current catalog actually needs it

### Shell and navigation family follow-up

Target direction:

- broaden page-shell and workspace-shell support without overcomplicating routing or integration behavior

Examples of healthy additions:

- stronger navigation-oriented support blocks
- supporting shell blocks that still fit the present region model

## Catalog Rules For This Phase

Every new block added during `07` should satisfy all of the following:

1. It belongs to a clear family and adds real coverage to that family.
2. Its placement contract is explicit and reviewable.
3. If it owns regions, those regions are explicit and carry shared region metadata.
4. Its preview/export parity story is documented in the contract.
5. Its verification impact is implemented, not postponed.
6. Its docs impact is handled in the same slice.
7. Its template impact is decided explicitly.

This should be treated as a required workflow, not a best-effort suggestion.

## Recommended Sequence

Implement `07` in these large logical groups:

1. catalog sequencing and acceptance rules
2. foundational marketing/content family expansion
3. foundational application family expansion
4. layout-owner and shell follow-up
5. template and coverage-project alignment
6. verification and docs consolidation

This order keeps the system coherent while still producing visible product progress quickly.

## Workstreams

### 1. Catalog Sequencing And Acceptance Rules

Goal:

- make the catalog phase disciplined before many new blocks begin landing

Work:

- define the first execution order for catalog families
- define what counts as a meaningful family addition
- keep new blocks tied to the existing authoring checklist and parity model
- keep templates downstream from the catalog instead of driving block design

Expected outputs:

- explicit family-by-family sequencing for the phase
- a repeatable acceptance rubric for new block families
- a clean list of deferred categories that should not leak into this phase

Acceptance signals:

- the next several block additions can be explained as a system, not a list
- family priorities are obvious before implementation begins
- V2-shaped pressure cases are named early instead of discovered late

### 2. Foundational Marketing And Content Family Expansion

Goal:

- broaden marketing and general-purpose content coverage without introducing new system pressure too early

Work:

- add the next wave of content and marketing blocks that fit the current page and layout model cleanly
- keep configuration constrained and intentional
- preserve clean placement behavior inside page and layout regions
- keep starter templates representative of real use, not just coverage fixtures

Suggested file focus:

- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-preview.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- `apps/web/src/lib/builder/default-project.ts`
- `apps/web/src/lib/builder/verification-project.ts`
- verification scripts touched by the new blocks

Acceptance signals:

- marketing/content coverage feels materially stronger
- no new placement exceptions are introduced casually
- parity and verification stay green

### 3. Foundational Application Family Expansion

Goal:

- make the builder more credible for app and dashboard surfaces while staying inside a static V1 boundary

Work:

- add more application-oriented blocks that do not require real bindings or actions
- focus on blocks that improve dashboard, workspace, and internal-tool composition
- keep them schema-driven and presentational

Acceptance signals:

- application-family breadth improves without pulling in V2 systems
- the current workspace and dashboard templates can evolve from a stronger underlying block set
- verification coverage grows with the family

### 4. Layout-Owner And Shell Follow-Up

Goal:

- extend the current layout model carefully where it genuinely improves authoring

Work:

- deepen configurable single-region layout owners first
- add another multi-region family only if the active catalog clearly needs it
- keep the region model stable and avoid another structural rewrite

Acceptance signals:

- layout flexibility grows without degrading authoring clarity
- canvas and outline remain understandable
- new region owners feel intentional, not speculative

### 5. Template And Coverage-Project Alignment

Goal:

- make sure the public starter templates and the internal coverage project both reflect the evolving catalog honestly

Work:

- update templates only after the underlying catalog changes are real
- keep the internal coverage project exercising every parity-critical shipped block type
- avoid using user-facing templates as the only parity guardrail

Acceptance signals:

- templates reflect the real catalog rather than compensating for it
- coverage-project drift does not appear
- starter verification remains representative

### 6. Verification And Docs Consolidation

Goal:

- keep the catalog phase reviewable and durable

Work:

- extend `verify:contracts` where family and region expectations become more explicit
- extend command, drag, or starter verification only when the block changes actually require it
- update authoring, architecture, verification, and handoff docs in the same slice

Acceptance signals:

- verification grows with the catalog instead of trailing it
- docs describe the actual system that exists
- future catalog work can inherit this phase cleanly

## Concrete First Slice

The best immediate slice inside `07` is:

### Family-First Catalog Pass

Scope:

- confirm the family order for the phase
- add the first disciplined set of content and application blocks
- keep configuration intentionally narrow
- update the coverage project and starter templates where needed
- update contract and starter verification in the same slice

Suggested first-pass family order:

1. content and marketing follow-up
2. application follow-up
3. layout-owner follow-up
4. shell/navigation follow-up

Why this is the best first slice:

- it creates visible product progress quickly
- it stays inside the healthy part of the current system
- it avoids prematurely pulling in media or integration systems
- it strengthens the most reusable parts of the catalog first

Suggested acceptance criteria:

- the first new family additions fit cleanly into the contract system
- no new one-off placement or parity debt is introduced
- at least one shipped template and the coverage project reflect the new catalog additions
- verification remains green across contracts, commands, drag, and starters

## Verification Expectations

Keep verification aligned with catalog growth:

- keep `pnpm lint` green
- keep `pnpm build` green
- keep `pnpm verify:contracts` green
- keep `pnpm verify:commands` green
- keep `pnpm verify:dnd` green
- keep `pnpm verify:starters` green

Prefer the fast-failure order:

1. `pnpm verify:contracts`
2. `pnpm verify:commands`
3. `pnpm verify:dnd`
4. `pnpm verify:starters`

Add verification only where it protects a real new contract, placement rule, or parity expectation.

Avoid bloating the verification layer with brittle checks that only restate implementation details.

## Practical Guardrails

Treat these as active rules during `07`:

- do not add blocks just because they demo well
- do not let templates create one-off block pressure
- do not add media-heavy catalog breadth until the first family pass is landed cleanly
- do not quietly introduce integration-shaped props or runtime assumptions
- do not add another structural rewrite unless a real flaw appears in the current region model

## Exit Condition

This phase is successful when all of the following are true:

- the builder has a broader foundational catalog that can be described by families instead of isolated exceptions
- new blocks consistently land through the canonical contract and region model
- preview/export parity remains governed by clear contracts and active verification
- starter templates and the internal coverage project stay aligned with the evolving catalog
- future catalog growth can continue without another immediate cleanup pass

## What Comes After This Phase

Once `07` is in a healthy state, the project will be in a much stronger position to resume larger V1 growth areas such as:

- broader catalog breadth
- more intentional multi-region block families
- stronger generated-app fidelity assertions
- more polished starter-template variety
- later V2 assistant-aware and integration-aware systems on top of a stronger V1 catalog base
