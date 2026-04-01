# Foundational Catalog Implementation Plan

Date: April 1, 2026
Status: Completed on April 1, 2026
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

## Completion Snapshot

This phase is now landed in the current codebase.

The main implementation outcomes are:

- the foundational catalog pass shipped the broader reusable block set described in this plan
- the user-facing library grouping now presents the catalog by builder intent instead of only internal family taxonomy
- the internal verification project and shipped starter templates now exercise the full parity-critical catalog
- the block system now supports a second-pass slot-owner path for selected foundational blocks instead of forcing every reusable block to stay leaf-only or forcing the product into generic-anything containers
- `pricingCard`, `ctaBanner`, and `workspaceHeader` now preserve their core prop payloads while exposing explicit owned regions for nested authoring
- region-level child constraints now exist in the canonical contract model so constrained slots can stay composable without becoming arbitrary
- preview/export parity metadata, starter rendering, templates, and docs now describe those slot-owning composites honestly

## Confirmed Direction

This phase should proceed with these explicit decisions unless a later plan changes them:

1. Catalog expansion is family-first, not breadth-first.
2. Internal block ids and the canonical contract model should stay stable unless a rename is clearly worth migration cost.
3. User-facing naming, library grouping, descriptions, and template presentation can be improved aggressively when that improves clarity.
4. The internal family model and the user-facing library grouping do not need to be identical.
5. The first pass should favor a smaller, stronger foundational arsenal over a broad catalog of specialized one-offs.
6. Specialized or workflow-specific blocks remain future work for later V2 or V3 passes.
7. Media-heavy or asset-dependent blocks are deferred until after the first foundational family pass.
8. The next catalog pass should deepen current single-region families before introducing another intentional multi-region family.
9. The catalog system should lead template updates, not the other way around.
10. Templates remain part of the product, but they should stay few, curated, and representative of the canonical catalog.

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
- a cleaner distinction between internal taxonomy and the user-facing catalog experience
- template and verification updates in the same slice as catalog growth
- a clear distinction between presentational V1 blocks and V2-shaped integration blocks

If this phase is not explicit, the project risks rebuilding the same problems that `05` and `06` just removed.

## Phase Goals

1. Expand the V1 catalog by coherent block families instead of one-off block additions.
2. Keep every new block inside the canonical contract, placement, and region model.
3. Improve the usability of the catalog itself through better names, grouping, and discoverability.
4. Preserve preview/export parity discipline while the catalog grows.
5. Keep templates and the internal coverage project aligned with the new catalog.
6. Leave behind a durable catalog workflow that can support future development without another cleanup pass.

## Product Boundary For This Phase

Allowed focus:

- family-first catalog growth
- presentational and structurally-constrained blocks
- tighter user-facing naming and library grouping
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
- wide specialization for niche vertical use cases

## Technical Recommendations Folded Into This Phase

### 1. Soft taxonomy cleanup plus expansion

The proper implementation path for this project is:

- keep internal block ids stable whenever possible
- improve user-facing block titles, descriptions, grouping, and helper copy where useful
- add new blocks only once the family structure and user-facing library are coherent enough to absorb them cleanly

Why:

- block id renames are expensive because they pressure persistence, contracts, templates, export, and verification
- user-facing cleanup is cheap and high-leverage
- the codebase is still small enough that visible product language can be normalized without a disruptive migration

### 2. Stable internal families, cleaner user-facing library grouping

The current internal family model remains useful as the system contract:

- `root-composite`
- `layout`
- `content`
- `application`

The user-facing library should be allowed to present a more obvious builder-oriented grouping on top of that system.

Preferred user-facing grouping for this phase:

- Page Structure
- Marketing
- Content
- Forms and CTA
- Data and Metrics
- Workspace and Navigation

This is not a retrofit or compromise.

It is the normal pattern for a healthy builder:

- the internal model stays small, stable, and reviewable
- the user-facing model stays obvious, task-oriented, and easy to browse

### 3. Favor a smaller foundational arsenal over a broad specialized catalog

This phase should prefer:

- stronger defaults
- modest but meaningful configuration
- broad professional usefulness across multiple page types
- blocks that compose well with each other

This phase should avoid:

- blocks that are exciting mainly because they demo well
- blocks that only fit one template
- blocks that imply data bindings, auth, backend state, or asset pipelines
- multiple narrowly overlapping blocks that could be covered by one canonical block

### 4. Templates are curated builder projects, not skins

In this codebase, a template is a prebuilt builder project:

- it includes pages
- it includes theme values
- it includes arranged blocks with defaults and content
- it acts as a starting point inside the editor

It is not only a theme pack, and it is not only an exported starter.

This phase should keep templates, but treat them as:

- curated starting points
- examples of healthy catalog usage
- downstream artifacts of the catalog system

Templates should not create pressure for one-off block design.

## Catalog Direction

The next catalog phase should favor these family shapes:

### Marketing and content family completion

Target direction:

- strengthen core launch-page and supporting-content coverage
- deepen variations that fit the current page and layout model cleanly

Healthy additions in this phase:

- stronger text and copy presentation
- trust and proof blocks
- CTA-supporting content blocks
- comparison, summary, and process blocks
- lighter visual utility blocks that do not require an asset pipeline

### Application family completion

Target direction:

- deepen dashboard and internal-tool credibility without requiring live data systems

Healthy additions in this phase:

- compact status and summary blocks
- structured operational cards
- empty-state and workspace guidance shells
- additional static app-surface primitives

### Layout-owner family follow-up

Target direction:

- add useful layout-owner behavior where the current region model and inspector model can support it cleanly

Healthy additions in this phase:

- more configurable single-region layout owners
- layout display controls that improve real composition without introducing a new structural system
- another intentional multi-region family only when the active catalog clearly needs it

### Shell and navigation family follow-up

Target direction:

- broaden page-shell and workspace-shell support without overcomplicating routing or integration behavior

Healthy additions in this phase:

- stronger navigation-oriented support blocks
- better top-level app-shell support
- layout-adjacent shell helpers that still fit the present region model

## Recommended Canonical Block Set For The First Family Pass

This phase should continue to support the current shipped blocks while adding or reshaping toward a stronger foundational set.

Preferred block direction for the first pass:

- stronger text and summary primitives
- trust and proof primitives
- CTA-supporting primitives
- comparison and process primitives
- dashboard summary and guidance primitives
- empty-state and placeholder primitives
- light shell and navigation support

Suggested candidate additions or reshapes for the first `07` pass:

- `logoGrid`
- `calloutCard`
- `ctaBanner`
- `stepList`
- `comparisonTable`
- `metricRow`
- `infoList`
- `emptyState`
- `profileCard`
- `workspaceHeader`

These are examples of the right shape, not a fixed mandatory list.

The main principle is:

- obvious
- reusable
- presentational
- professional
- low-system-pressure

## Catalog Rules For This Phase

Every new block added during `07` should satisfy all of the following:

1. It belongs to a clear family and adds real coverage to that family.
2. Its user-facing name and role are obvious in the library.
3. Its placement contract is explicit and reviewable.
4. If it owns regions, those regions are explicit and carry shared region metadata.
5. Its preview/export parity story is documented in the contract.
6. Its verification impact is implemented, not postponed.
7. Its docs impact is handled in the same slice.
8. Its template impact is decided explicitly.
9. It does not exist only to satisfy one template.
10. It does not quietly introduce integration-shaped semantics.

This should be treated as a required workflow, not a best-effort suggestion.

## User-Facing Library Direction

This phase should explicitly separate internal family logic from user-facing library presentation.

Implementation goals:

- keep the current internal family map available for contracts, verification, and system-level reasoning
- add a user-facing grouping layer that helps builders browse by intent
- improve titles, helper descriptions, and placement hints so the library feels more like a professional builder and less like a raw registry view

Preferred user-facing library sections:

1. Page Structure
2. Marketing
3. Content
4. Forms and CTA
5. Data and Metrics
6. Workspace and Navigation

Acceptance signals:

- users can predict where a block will live before searching for it
- the library feels curated instead of technically grouped
- internal contract families remain stable and useful for code review and verification

## Template Strategy For This Phase

Templates remain valid and should stay in the product.

But they should be normalized into a cleaner setup and treated as downstream examples of the catalog.

Preferred template setup after the first `07` pass:

1. one polished marketing starter
2. one SaaS or product-marketing starter
3. one application or workspace starter

Current templates may be renamed, refined, or consolidated to better fit that structure as long as the resulting set is cleaner.

Template rules for this phase:

- keep the total template count small
- update templates only after the underlying catalog changes are real
- avoid block types created solely to make one template feel complete
- keep at least one template focused on marketing and one focused on application credibility
- use the internal coverage project for parity completeness, not the public templates alone

## Recommended Sequence

Implement `07` in these large logical groups:

1. catalog taxonomy and acceptance rules
2. user-facing library grouping and naming cleanup
3. foundational marketing and content family expansion
4. foundational application family expansion
5. layout-owner and shell follow-up
6. template and coverage-project alignment
7. verification and docs consolidation

This order keeps the system coherent while still producing visible product progress quickly.

## Workstreams

### 1. Catalog Taxonomy And Acceptance Rules

Goal:

- make the catalog phase disciplined before many new blocks begin landing

Work:

- define the first execution order for catalog families
- define what counts as a meaningful family addition
- keep new blocks tied to the existing authoring checklist and parity model
- keep templates downstream from the catalog instead of driving block design
- formalize the distinction between internal families and user-facing groups

Implementation checklist:

- [ ] Keep internal family ids and capability tags stable unless a concrete migration is justified
- [ ] Define the user-facing grouping model to sit on top of current contracts
- [ ] Update the acceptance rubric for what qualifies as a new foundational block
- [ ] Record deferred categories that must not leak into this phase
- [ ] Capture the first-pass candidate block list and explicitly defer lower-value additions

Expected outputs:

- explicit family-by-family sequencing for the phase
- a repeatable acceptance rubric for new block families
- a clean list of deferred categories that should not leak into this phase
- an agreed user-facing grouping model for the library

Acceptance signals:

- the next several block additions can be explained as a system, not a list
- family priorities are obvious before implementation begins
- V2-shaped pressure cases are named early instead of discovered late

### 2. User-Facing Library Grouping And Naming Cleanup

Goal:

- make the catalog easier to understand before or while the next block wave lands

Work:

- refine user-facing titles and descriptions where they are too technical or uneven
- introduce the new user-facing grouping model in the library
- tighten helper text, placement hints, and family labeling
- keep internal contract family structure intact unless a real system issue appears

Suggested file focus:

- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-catalog.ts`
- `apps/web/src/components/builder/library-panel.tsx`
- docs affected by the user-facing terminology

Implementation checklist:

- [ ] Review every shipped block title for clarity and consistency
- [ ] Review every shipped block description for tone and usefulness
- [ ] Add user-facing group metadata separate from internal families
- [ ] Update library rendering to use the new presentation model
- [ ] Keep placement guidance and capability hints aligned with the new grouping
- [ ] Confirm that verification still derives from canonical contracts, not UI-only grouping

Acceptance signals:

- the catalog feels easier to browse without changing the underlying system model
- the user-facing organization looks intentional and product-ready
- no contract or placement logic is made more brittle to support the UI grouping

### 3. Foundational Marketing And Content Family Expansion

Goal:

- broaden marketing and general-purpose content coverage without introducing new system pressure too early

Work:

- add the next wave of content and marketing blocks that fit the current page and layout model cleanly
- keep configuration constrained and intentional
- preserve clean placement behavior inside page and layout regions
- keep starter templates representative of real use, not just coverage fixtures

Suggested first-pass block shapes:

- trust and proof
- CTA-supporting sections
- process and summary blocks
- comparison and structured content blocks
- lighter visual utility blocks with no asset system dependency

Suggested file focus:

- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-preview.tsx`
- `apps/web/src/lib/builder/starter-artifacts.ts`
- `apps/web/src/lib/builder/default-project.ts`
- `apps/web/src/lib/builder/verification-project.ts`
- verification scripts touched by the new blocks

Implementation checklist:

- [ ] Add the first selected marketing/content blocks through canonical contracts
- [ ] Keep fields narrow and avoid config explosion
- [ ] Update preview rendering for each new block
- [ ] Update starter rendering for each new block
- [ ] Add new blocks to the internal coverage project
- [ ] Add new blocks to a template only if they serve real template coverage
- [ ] Update docs and authoring guidance for the expanded family

Acceptance signals:

- marketing/content coverage feels materially stronger
- no new placement exceptions are introduced casually
- parity and verification stay green

### 4. Foundational Application Family Expansion

Goal:

- make the builder more credible for app and dashboard surfaces while staying inside a static V1 boundary

Work:

- add more application-oriented blocks that do not require real bindings or actions
- focus on blocks that improve dashboard, workspace, and internal-tool composition
- keep them schema-driven and presentational

Suggested first-pass block shapes:

- compact status and summary blocks
- empty and loading-state style blocks
- structured operational cards
- workspace headers and guidance primitives

Implementation checklist:

- [ ] Add the first selected application blocks through canonical contracts
- [ ] Keep application blocks static and presentational
- [ ] Reuse existing parsing and display patterns where possible
- [ ] Extend templates only where the new blocks genuinely strengthen them
- [ ] Extend coverage-project usage for every parity-critical addition
- [ ] Update verification expectations for the expanded application family

Acceptance signals:

- application-family breadth improves without pulling in V2 systems
- the current workspace and dashboard templates can evolve from a stronger underlying block set
- verification coverage grows with the family

### 5. Layout-Owner And Shell Follow-Up

Goal:

- extend the current layout model carefully where it genuinely improves authoring

Work:

- deepen configurable single-region layout owners first
- add another multi-region family only if the active catalog clearly needs it
- keep the region model stable and avoid another structural rewrite

Implementation checklist:

- [ ] Review whether current layout blocks need stronger inspector controls before new layout families are added
- [ ] Prefer improvements to section, stack, grid, and sidebar-shell ergonomics first
- [ ] Add another multi-region family only if it unlocks multiple real catalog gaps
- [ ] Keep outline and canvas behavior understandable as layout flexibility grows

Acceptance signals:

- layout flexibility grows without degrading authoring clarity
- canvas and outline remain understandable
- new region owners feel intentional, not speculative

### 6. Template And Coverage-Project Alignment

Goal:

- make sure the public starter templates and the internal coverage project both reflect the evolving catalog honestly

Work:

- update templates only after the underlying catalog changes are real
- normalize the current template set into a cleaner, more intentional trio if needed
- keep the internal coverage project exercising every parity-critical shipped block type
- avoid using user-facing templates as the only parity guardrail

Implementation checklist:

- [ ] Review the current three-template set for overlap and naming clarity
- [ ] Rename or refine templates if a cleaner setup improves the product
- [ ] Ensure each template represents a distinct use case
- [ ] Remove or reduce template-specific one-off pressure
- [ ] Keep the internal coverage project ahead of or equal to template coverage

Acceptance signals:

- templates reflect the real catalog rather than compensating for it
- coverage-project drift does not appear
- starter verification remains representative

### 7. Verification And Docs Consolidation

Goal:

- keep the catalog phase reviewable and durable

Work:

- extend `verify:contracts` where family, grouping, and region expectations become more explicit
- extend command, drag, or starter verification only when the block changes actually require it
- update authoring, architecture, verification, and handoff docs in the same slice

Implementation checklist:

- [ ] Add contract-level checks for any new grouping or acceptance expectations that belong in code
- [ ] Extend starter verification for newly shipped parity-critical blocks
- [ ] Extend command or drag verification only when a new behavior truly needs it
- [ ] Update authoring docs to reflect the real workflow after the new family pass
- [ ] Update architecture and handoff docs where the catalog model becomes materially clearer

Acceptance signals:

- verification grows with the catalog instead of trailing it
- docs describe the actual system that exists
- future catalog work can inherit this phase cleanly

## Concrete First Slice

The best immediate slice inside `07` is:

### Foundation Catalog Pass 1

Scope:

- confirm the user-facing grouping model
- tighten block titles, descriptions, and helper copy
- add the first disciplined set of marketing/content and application blocks
- keep configuration intentionally narrow
- update the coverage project and selected templates where needed
- update contract and starter verification in the same slice

Suggested first-pass family order:

1. user-facing catalog cleanup
2. content and marketing follow-up
3. application follow-up
4. layout-owner follow-up
5. shell and navigation follow-up

Why this is the best first slice:

- it creates visible product progress quickly
- it improves the usability of the catalog before it expands too far
- it stays inside the healthy part of the current system
- it avoids prematurely pulling in media or integration systems
- it strengthens the most reusable parts of the catalog first

Suggested acceptance criteria:

- the catalog is easier to browse before or alongside the new additions
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

Add verification only where it protects a real new contract, placement rule, grouping rule, or parity expectation.

Avoid bloating the verification layer with brittle checks that only restate implementation details.

## Practical Guardrails

Treat these as active rules during `07`:

- do not add blocks just because they demo well
- do not let templates create one-off block pressure
- do not add media-heavy catalog breadth until the first family pass is landed cleanly
- do not quietly introduce integration-shaped props or runtime assumptions
- do not add another structural rewrite unless a real flaw appears in the current region model
- do not let user-facing grouping pressure distort the internal contract system unnecessarily
- do not grow configuration faster than verification and parity review can support

## Exit Condition

This phase is successful when all of the following are true:

- the builder has a broader foundational catalog that can be described by families instead of isolated exceptions
- the user-facing library feels more obvious, curated, and professional
- internal family and contract structures remain stable and reviewable
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
- stronger layout-owner configuration
- later V2 assistant-aware and integration-aware systems on top of a stronger V1 catalog base
