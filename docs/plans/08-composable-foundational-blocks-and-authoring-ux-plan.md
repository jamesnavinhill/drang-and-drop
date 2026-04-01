# Composable Foundational Blocks And Authoring UX Plan

Date: April 1, 2026
Status: Completed on April 1, 2026
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related foundation plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related block-system plan: `docs/plans/05-builder-block-system-implementation-plan.md`
Related region plan: `docs/plans/06-region-contract-and-layout-structure-plan.md`
Related foundational catalog plan: `docs/plans/07-foundational-catalog-implementation-plan.md`
Related report: `docs/reports/03-v1-catalog-readiness-feasibility-report.md`
Related architecture doc: `docs/operations/architecture.md`
Related authoring doc: `docs/operations/block-authoring.md`

## Purpose

Turn the new slot-owner capability from a technically-correct contract into a productized authoring pattern the builder can keep growing on top of.

This phase is not about broad catalog expansion.

It is about validating and hardening the composable-foundation path that now exists through:

- `pricingCard`
- `ctaBanner`
- `workspaceHeader`

The goal of `08` is to make those richer internals feel obvious in the editor, verify the pattern through more honest template usage, and extend it to only the next few blocks that truly deserve it.

## Completion Snapshot

This phase is now landed in the current codebase.

The main implementation outcomes are:

- slot-owner authoring UX is clearer across canvas, outline, inspector, and library context
- block regions can now surface accepted-child guidance directly in the editor instead of leaving constrained slots implicit
- shipped templates now use the slot-owner pattern more honestly instead of only proving it in the verification harness
- `formCard` and `emptyState` now join the slot-owner path with constrained `content` plus `actions` regions
- preview/export parity, starter verification, and command-level placement verification now cover those new promoted blocks too
- the composable-foundation model remains intentionally narrow and metadata-driven rather than drifting into arbitrary nesting

## Starting Point

The codebase is now past the first foundational catalog pass and the first composable second-pass slice.

Already landed:

- canonical block contracts, placement rules, and region metadata
- page regions and block-owned regions as the active structural model
- user-facing library grouping on top of the internal family model
- one shipped multi-region layout-owner family through `sidebarShell`
- one shipped slot-owner pattern for constrained composable block internals
- preview/export/template/verification parity for `pricingCard`, `ctaBanner`, and `workspaceHeader`

That means the next question is no longer:

"Can this builder support composable internals at all?"

The next question is:

"How do we make that composable path easy to author, disciplined to extend, and narrow enough that it does not turn into arbitrary nesting?"

## Why This Phase Exists

The current system now has a healthy middle path:

- not every block has to stay `leaf`
- not every reusable block needs to become a generic container

That is the right direction.

What still needs work before this pattern spreads:

- editor affordances around named slots are still only as good as the generic region UI
- the new slot-owner path has not yet been pressure-tested across enough real template usage
- the current child-constraint model is intentionally narrow and should stay narrow unless real usage proves otherwise
- a few additional blocks now look like legitimate candidates for promotion, but most of the catalog does not

If this phase is skipped, the project risks one of two bad outcomes:

1. the new slot-owner path remains technically correct but product-awkward
2. more blocks get promoted too early without enough authoring discipline

## Phase Goals

1. Make slot-owner regions feel clear and intentional across the editor surfaces.
2. Validate the current slot-owner pattern through real builder usage, not only contract correctness.
3. Promote only the next small set of foundational blocks that materially benefit from constrained nested regions.
4. Keep the child-constraint system narrow and metadata-driven.
5. Preserve preview/export/template/verification parity while the pattern deepens.

## Product Boundary For This Phase

Allowed focus:

- authoring UX around named block regions
- clearer canvas, outline, library, and page-panel affordances for slot-owner blocks
- template updates that use the new composable foundation honestly
- a small number of additional slot-owner promotions
- verification and docs updates tied directly to that work

Explicit non-goals:

- broad catalog growth
- arbitrary slot systems or "anything inside anything" behavior
- a large new rule engine for child validation
- backend/data/auth/action systems
- assistant mutation work
- another editor-substrate rewrite

## Confirmed Working Decisions

This phase should proceed with these assumptions unless a later plan changes them:

1. Slot-owner blocks are a third useful shape beside `leaf` and `layout-owner`.
2. Region semantics should stay metadata-driven, not inferred from visual size or arbitrary DOM shape.
3. The child-constraint model should stay simple until repeated product pressure justifies more.
4. Most current blocks should remain `leaf`.
5. The next promotions should be chosen by real usage pressure, not by abstract purity.
6. Fallback prop-driven rendering can remain valid where it preserves parity and lowers migration churn.

## Recommended Scope

The next slice should focus on three workstreams.

### 1. Authoring UX hardening

Goal:

- make slot-owner blocks feel understandable without needing the team to remember the contract details

Primary targets:

- `apps/web/src/components/builder/canvas.tsx`
- `apps/web/src/components/builder/page-panel.tsx`
- `apps/web/src/components/builder/library-panel.tsx`
- any selection or outline surface that currently shows region labels generically

Work:

- improve empty-state copy for owned regions so builders understand what belongs in each slot
- make `content` versus `actions` style distinctions easier to read in the editor
- ensure the current insertion target language stays helpful for constrained slots
- surface region role and accepted-child guidance more clearly where that reduces confusion

Acceptance signals:

- a user can tell what a slot is for without reading code or docs
- invalid placement into constrained slots feels informative instead of arbitrary
- slot-owner blocks are easy to inspect in both canvas and structural authoring surfaces

### 2. Real usage validation through templates

Goal:

- prove the slot-owner model in product-shaped builder content, not only in the verification harness

Primary targets:

- `apps/web/src/lib/builder/default-project.ts`
- shipped templates that already use the promoted blocks

Work:

- revise the current template usage of slot-owner blocks where the first pass still feels too placeholder-like
- add or refine nested content inside the existing promoted blocks only where it improves the realism of the templates
- identify where authoring friction appears in normal page-building flow

Acceptance signals:

- templates use the slot-owner pattern honestly instead of only proving it exists
- at least a few real page sections feel materially better because of the promotion
- any awkwardness in the current slot model becomes visible before more blocks are promoted

### 3. Small additional promotion pass

Goal:

- extend the composable-foundation model carefully instead of leaving it as a one-off exception

Recommended candidate order:

- `formCard`
- `emptyState`
- maybe `calloutCard`

Rationale:

- `formCard` naturally wants clearer field/content versus actions composition
- `emptyState` naturally wants supporting content and constrained actions
- `calloutCard` is plausible, but it is lower urgency than the first two

What should probably not be promoted in this phase:

- `button`
- `faqList`
- `metricRow`
- `logoGrid`
- `comparisonTable`

Work:

- promote only the first one or two blocks that show the strongest real usage pressure
- keep each promotion narrow, with named regions and constrained child acceptance where needed
- avoid introducing new generalized layout responsibilities into these blocks

Acceptance signals:

- the promoted blocks feel more useful without becoming vague containers
- the contract model still reads as disciplined and reviewable
- verification remains straightforward rather than exploding in complexity

## Contract Direction For This Phase

The current slot-owner contract is enough to continue with only modest extension if needed.

The preferred order is:

1. keep using owned-region metadata plus narrow accepted-child rules
2. add clearer authoring guidance before adding richer validation knobs
3. only add more contract detail if repeated usage exposes a real need

Possible future additions, only if pressure appears:

- `maxChildren`
- region-level "recommended families" metadata for UI guidance
- richer distinction between fallback prop actions and explicit nested actions

Not recommended yet:

- free-form per-block child-expression logic
- large bespoke allow/deny matrices
- visually-driven nesting rules disconnected from contract metadata

## Verification Expectations

This phase should keep the same verification posture as `07`, with extra attention on slot-owner regressions.

Run from `apps/web`:

```powershell
pnpm lint
pnpm build
pnpm verify:contracts
pnpm verify:commands
pnpm verify:dnd
pnpm verify:starters
```

Additional verification expectations for this phase:

- command-level coverage for constrained slot acceptance and rejection
- starter verification coverage for every region-owning promoted block
- template usage that actually exercises the new slots instead of only fallback props

## Docs Impact

If this phase lands, update in the same slice:

- `docs/operations/architecture.md`
- `docs/operations/block-authoring.md`
- `apps/web/README.md`
- this plan document

If the next promotions materially change the definition of the current foundational catalog, also update:

- `docs/plans/07-foundational-catalog-implementation-plan.md`

## Suggested Execution Order

1. Polish slot-owner authoring UX around the currently shipped promoted blocks.
2. Rework templates until those promoted blocks feel like honest product usage.
3. Promote `formCard`.
4. Verify and reassess.
5. Promote `emptyState` only if the pattern still feels clean.
6. Stop and review before adding more.

## Exit Condition

This phase should be considered successful when:

- slot-owner authoring no longer feels like a raw systems feature
- templates demonstrate the composable foundation credibly
- one or two more foundational blocks are promoted without widening the model too much
- docs and verification still describe the system simply and honestly

At that point, the project should be in a good position either to:

- continue with another narrow composable-foundation pass

or

- resume selected catalog growth on top of a more proven authoring model
