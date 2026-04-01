# V1 Catalog Readiness Feasibility Report

Date: April 1, 2026
Related roadmap: `docs/plans/02-product-roadmap-plan.md`
Related hardening plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related block-system plan: `docs/plans/05-builder-block-system-implementation-plan.md`
Related region plan: `docs/plans/06-region-contract-and-layout-structure-plan.md`
Related architecture doc: `docs/operations/architecture.md`
Related verification doc: `docs/operations/verification.md`

## Purpose

Audit the current builder baseline after the `05` block-system pass and the active `06` region-contract follow-up slices, then answer one practical question:

Is the project healthy enough to begin building out a more robust foundational catalog, or is there still a missing systems pass that should happen first?

This report is about readiness for catalog growth in V1.

It is not about assistant mutation work, V2 integrations, or launch polish.

## Short Answer

The codebase is now light-green for disciplined catalog expansion.

My recommendation is:

- proceed with foundational catalog work
- keep it contract-first and verification-backed
- do not interpret this as permission for uncontrolled breadth

The current system is not risk-free. No real builder is.

But it is now meaningfully cleaner, more structured, and better defended than it was before the `05` and `06` passes. The major architectural reason to pause catalog work again is no longer obvious.

## Executive Recommendation

Recommended next move:

1. Start the foundational catalog phase.
2. Expand by family, not by random block accumulation.
3. Require every new block to land with:
   - contract
   - placement rules
   - region metadata if applicable
   - preview/export parity review
   - verification impact
   - docs impact
4. Keep assistant work deferred to V2 as planned.

What I would not do first:

- another broad editor-foundation rewrite
- assistant-safe mutation tooling
- backend/data/auth systems
- broad template proliferation ahead of block-family discipline

## Readiness Verdict

### Overall status

- `Catalog readiness`: light green
- `Architectural health`: good
- `Verification posture`: good and improving
- `Codebase cleanliness`: good
- `Scalability of the current authoring model`: good for a constrained V1 catalog
- `Launch polish readiness`: not yet the focus

### What is now strong enough

- the builder has a canonical block contract
- the placement model is centralized and region-aware
- the runtime and persisted model share the same region graph
- structure-sensitive mutations share a command path
- contract, command, drag, and starter verification all exist and are relevant
- preview/export parity is not perfect, but it is now governed by clearer contracts instead of mostly team memory
- the current codebase organization is much healthier than a single catch-all registry model

### What remains true

- the system is healthy enough for the next catalog phase
- the system is not yet "finished"
- the right way to grow now is controlled expansion, not maximum expansion

## Why The Light Is Green

### 1. The authoring unit is now real

The biggest readiness signal is that the block system now has a canonical contract boundary.

That matters because catalog expansion stops being a scavenger hunt and starts becoming a constrained workflow. New blocks now have an explicit home for:

- metadata
- defaults
- inspector fields
- placement
- owned regions
- parity metadata
- verification expectations

Without that, a larger catalog would create drift quickly.

With it, a larger catalog is practical.

### 2. The placement model is finally durable enough

The move to explicit page and block regions was the right structural cutover to make before scaling layout variety.

That gives the project:

- clearer insertion semantics
- a better future path for multi-region families
- fewer one-off layout exceptions
- a cleaner mental model for canvas, outline, export, and validation

This was the main structural blocker to deeper layout-oriented catalog work.

It is no longer the blocker.

### 3. Verification is now strong enough to support growth

The verification stack is not cosmetic anymore.

It now meaningfully covers:

- contracts
- command behavior
- browser drag behavior
- generated starter runtime and browser rendering
- internal parity coverage through the verification project

That means new catalog work can be added against a live safety net instead of only manual inspection.

This is one of the clearest signs that the codebase is ready for a larger system phase.

### 4. The codebase shape is healthier than the product surface suggests

The app still looks like a young greenfield product, but the internals are now much more disciplined than that surface might imply.

Healthy signals:

- focused builder modules
- clearer separation between contracts, placement, preview, structure, store, and export
- schema validation plus structural validation
- deterministic builder verification hooks
- docs that increasingly match the real implementation

That is a good foundation for a robust V1 catalog.

## Remaining Risks

The answer is not "risk-free."

The real question is whether the remaining risks should block catalog work.

My answer is mostly no.

### Risk 1: Preview/export JSX duplication still exists

Practical risk:

- parity can still drift as more blocks are added

Technical risk:

- preview and generated starter still keep separate render trees

Why this does not block catalog work:

- parity is now contract-driven
- helper semantics are shared in more places
- starter verification is real
- the new region-owned layout assertions reduce one more important class of drift

Recommendation:

- keep catalog growth tied to parity review
- do not pause for a major renderer unification pass first

### Risk 2: Large-page performance is not yet proven

Practical risk:

- a much bigger catalog can encourage heavier pages
- that may expose canvas performance and editor responsiveness issues later

Technical risk:

- there is no virtualization strategy
- performance hardening is not yet a major tracked implementation artifact

Why this does not block foundational catalog work:

- it matters more for scale and polish than for the next disciplined catalog phase
- the current builder is still small enough to grow some before that becomes urgent

Recommendation:

- treat performance as a monitored risk, not a precondition blocker
- revisit once page size and block count grow materially

### Risk 3: Resize and deeper layout tooling are still limited

Practical risk:

- some roadmap language implies richer layout controls than the current builder exposes

Technical risk:

- resizing is not yet a major first-class subsystem in the current implementation

Why this does not block foundational catalog work:

- a robust foundational catalog does not require a full resize system first
- constrained configuration through contract fields is enough for the next phase

Recommendation:

- expand configurable layout semantics through inspector fields first
- only elevate resize as a dedicated system when there is a clear product need

### Risk 4: Some future families would pressure adjacent systems

Examples:

- media/image-heavy blocks
- richer nav shells
- forms with real submission behavior
- data-bound application blocks

Practical risk:

- those can drag in asset, integration, or runtime concerns too early

Why this does not block catalog work broadly:

- the answer is to scope the next catalog phase carefully, not to delay all catalog work

Recommendation:

- keep the next catalog phase focused on presentational and structurally-constrained blocks first

## Foundation Audit

### State model

Status: healthy

Why:

- normalized node dictionary
- explicit page regions
- explicit node regions
- deterministic persistence model
- clean import/export boundary

### Mutation model

Status: healthy enough

Why:

- insert, move, duplicate, and remove are centralized
- history runs on top of shared structure commands
- invalid actions surface clear failures

Remaining caveat:

- future command types such as wrap/unwrap are not yet present

Blocking?

- no

### Placement and layout model

Status: healthy

Why:

- explicit destination regions
- layout-owner blocks define owned regions
- first configurable multi-region block already shipped

Blocking?

- no

### Verification model

Status: healthy

Why:

- coverage exists at multiple layers
- starter verification is meaningfully stronger than simple export smoke tests
- contract verification is cheap enough to use continuously

Blocking?

- no

### Module organization

Status: healthy

Why:

- much less catch-all coupling
- cleaner separation of responsibilities
- docs and operating guidance are increasingly aligned

Blocking?

- no

### Assistant boundary

Status: correctly deferred

Why:

- proposal-first shell exists
- mutation tooling is intentionally not mixed into the current catalog decision

Blocking?

- no

This is the right call for now.

## Do We Need Another Systems Pass Before Catalog Work?

Not a major one.

If the question is:

"Do we need to pause and build another foundational subsystem before we can responsibly start the catalog?"

My answer is:

- no major subsystem appears mandatory first

If the question is:

"Should we enter catalog work with explicit rules so we do not recreate system drift?"

My answer is:

- yes, absolutely

That means the next move is not "more substrate first."

It is:

- catalog expansion with strong gates

## Recommended Catalog Strategy For This Codebase

### Best approach

Expand by coherent family slices.

Good examples:

- marketing content family completion
- application dashboard family completion
- layout-owner family completion
- shell/navigation family completion

Avoid:

- one-off blocks chosen only because they sound exciting
- families that quietly require deferred systems
- blocks that introduce data-binding pressure before V2

### Practical definition of "green enough"

The project is green enough if we do all new catalog work with these rules:

1. No block lands without a contract.
2. No layout-owner lands without an explicit region story.
3. No block lands without a parity review.
4. No block lands without verification impact review.
5. No family expansion lands without coverage-project consideration.
6. No block should drag in V2 systems accidentally.

If we hold those rules, the catalog phase is feasible now.

## Recommended Non-Blocking Guardrails Before Or During Catalog Work

These are worth doing, but they should happen as part of the catalog phase, not as a big gate before it.

### 1. Keep a formal family-by-family expansion sequence

Why:

- reduces random drift
- keeps verification additions coherent

### 2. Add a catalog acceptance rubric for new families

Why:

- family-level growth is where complexity actually starts to compound

Suggested checks:

- placement consistency
- parity expectations
- starter/template impact
- verification additions
- docs impact

### 3. Be strict about excluding integration-shaped blocks from this phase

Why:

- keeps V1 catalog work focused on UI composition
- avoids dragging in backend and action semantics early

### 4. Track performance and large-page responsiveness as a live watch item

Why:

- it is a real future risk
- it is just not the next blocker

## Final Go / No-Go

### Go if

- the catalog phase stays contract-first
- expansion is done by family
- verification stays part of the same slice
- V2-shaped blocks remain deferred

### No-go if

- the plan becomes "add lots of blocks fast and clean it up later"
- placement exceptions start growing faster than contracts
- preview/export parity is treated as optional during catalog work

## My Recommendation

Proceed.

This is the right moment to begin mapping and implementing a robust foundational catalog system for V1.

The light is green enough.

More precisely:

- not bright green for unrestricted breadth
- definitely green for disciplined foundational catalog expansion

## Clarifying Questions To Remove Ambiguity

These are the main decisions I would want answered before or at the very start of the catalog phase.

### 1. Do we want the next catalog phase to be breadth-first or family-first?

Option A: Breadth-first

Practical upside:

- the product surface looks richer faster
- easier to demo variety quickly

Practical downside:

- increases inconsistency risk fast
- verification and docs tend to lag behind one-off additions

Technical downside in this project:

- more likely to create scattered placement exceptions and parity drift

Option B: Family-first

Practical upside:

- produces a cleaner, more reviewable system
- easier to keep authoring guidance and verification aligned

Practical downside:

- visible variety grows a bit slower at first

Technical upside in this project:

- matches the current contract-driven architecture
- easier to extend the coverage project and starter verification coherently

Recommendation:

- choose family-first

### 2. How deep should block configurability go in this phase?

Option A: Tight defaults, lighter configuration

Practical upside:

- faster to ship
- easier to preserve layout quality

Practical downside:

- some blocks may feel too opinionated

Technical upside in this project:

- keeps parity review and verification cheaper
- lowers the chance of config explosion

Option B: Rich configuration per block

Practical upside:

- more flexible and impressive on paper

Practical downside:

- can overwhelm the inspector
- increases edge cases quickly

Technical downside in this project:

- multiplies preview/export parity risk
- creates more verification burden per block

Recommendation:

- prefer tight defaults with only meaningful configuration

### 3. Do we include media/image-oriented blocks in the foundational catalog phase?

Option A: Yes, include them early

Practical upside:

- stronger marketing-site credibility

Practical downside:

- quickly raises asset, placeholder, export, and possibly licensing questions

Technical downside in this project:

- likely pressures adjacent systems before they are ready

Option B: Defer them until after the first foundational catalog families land

Practical upside:

- keeps the next phase focused and lower-risk

Practical downside:

- the catalog may feel less visually broad at first

Technical upside in this project:

- avoids pulling asset and media concerns into a still-young catalog phase

Recommendation:

- defer richer media/image-heavy blocks until after the first foundational family pass

### 4. Do we want another new multi-region family immediately, or should we deepen single-region families first?

Option A: Add another multi-region family now

Practical upside:

- exercises the region model further
- may unlock more compelling layouts sooner

Practical downside:

- raises complexity faster

Technical upside:

- continues validating the region architecture under real use

Technical downside in this project:

- can spread attention across layout semantics before the catalog families fill in

Option B: Deepen single-region and current-family coverage first

Practical upside:

- steadier catalog growth
- easier to absorb into current verification

Practical downside:

- may delay some more interesting shell layouts

Technical upside in this project:

- lets `sidebarShell` remain the primary multi-region proving ground while the catalog fills out around it

Recommendation:

- deepen current families first, then add the next multi-region family intentionally

### 5. Should shipped templates be allowed to drive catalog priorities, or should the catalog system lead and templates follow?

Option A: Let templates drive priorities

Practical upside:

- easier to build what demos well right away

Practical downside:

- can produce a scattered catalog shaped by template gaps instead of system quality

Technical downside in this project:

- raises the chance of one-off blocks created for a single template

Option B: Let the catalog system lead, then update templates

Practical upside:

- keeps the underlying block system cleaner

Practical downside:

- templates may lag a little behind the block roadmap

Technical upside in this project:

- fits the current architecture and verification model much better

Recommendation:

- let the catalog system lead and have templates follow that system

## Final Recommendation Summary

Proceed with foundational catalog work now.

Use a family-first, contract-first expansion strategy.

Keep configuration intentional.

Defer media-heavy and integration-shaped blocks.

Let the catalog system lead template updates.

That is the healthiest next move for this codebase.
