# Product Roadmap Plan: Drag-and-Drop shadcn Website/App Builder

Date: April 1, 2026
Related report: `docs/reports/01-feasability-report.md`

## Current Status

Last updated: April 1, 2026

Implemented in the current greenfield slice:

- Next.js application scaffold at `apps/web`
- schema-driven builder project model with persisted local state
- component registry for layout, marketing, content, and app blocks
- visual editor shell with pages, library, canvas, inspector, and theming
- route management plus page outline/layers controls in the left workspace
- contextual block library guidance tied to the current insertion target
- constrained drag/drop canvas with nested containers and node selection
- multi-page route editing and page duplication/removal
- project JSON import/export and starter template application
- starter zip export with generated `Next.js` project files
- verification coverage for build, lint, live browser rendering, page switching, node selection, preview mode changes, and export download
- deterministic builder drag verification for explicit palette insertion, nested insertion, reorder, and invalid-drop coverage
- shared structure-command foundation for insert, move, duplicate, and remove node mutations
- structural validation for invalid placement and orphan-node states during import and persisted-state parsing
- direct command verification for shared builder mutation flows
- canvas-side invalid-drop feedback and library placement hints driven by the shared placement validator
- shared shell-level editor notices plus outline insertion-context cues for clearer editor parity
- shared outline/inspector node action controls for reorder, duplicate, and remove parity
- split builder block definitions, placement rules, and preview rendering modules so the registry boundary is starting to harden
- placement validation now resolves through explicit `page-root` and `layout-container` targets, giving command and drag verification a clearer shared model
- shared content parsing/fallback helpers and generated render support are now separated so preview/export parity depends on fewer duplicated helper paths
- automated generated-starter verification across all shipped templates with install/build/serve/route/static-asset and browser-rendered checks

Open follow-up work after this slice:

- strengthen the editor foundation before accelerating more catalog breadth
- harden canvas behavior, validation surfacing, and layout edge-case handling on top of the new command layer
- expand builder drag verification across more block combinations and placement edge cases
- strengthen export parity tests and generated-project runtime verification
- deepen generated-app assertions beyond the current browser smoke checks and runtime harness
- begin M2/M3 hardening on codegen cleanliness, route generation polish, and onboarding flows

See `docs/plans/04-editor-foundation-hardening-plan.md` for the current foundation-first execution sequence.

## Purpose

This document turns the feasibility findings into a practical roadmap for building a shadcn-first visual builder that can export a clean starter project.

The goal is to ship a strong v1 without overcommitting to full no-code app-builder complexity too early.

## Product Thesis

Build a constrained visual builder for websites and starter apps that:

- feels polished like modern shadcn template builders
- lets users compose pages visually with drag/drop and resize
- keeps layouts responsive and structured
- exports a clean `Next.js + shadcn + Tailwind` codebase
- creates a strong path to future integrations for auth, APIs, storage, and actions

## Product Positioning

This product should be positioned as:

> A shadcn-first visual page and layout builder for developers, founders, and teams who want polished UI fast and still want the exported codebase to remain real, editable app code.

This product should **not** be positioned in v1 as:

- a fully general no-code platform
- a Figma replacement
- a backend workflow builder
- a visual programming environment

## Planning Principles

- Export quality is more important than maximum visual freedom.
- Schema-driven editing is more important than arbitrary DOM editing.
- Constrained layouts are better than freeform absolute positioning in v1.
- A smaller set of excellent blocks beats a huge unstable component library.
- Every feature should support future integrations without forcing v2 complexity into v1.

## Scope Boundaries

### In scope for v1

- multi-page editing
- page routing and navigation structure
- drag/drop composition with constrained containers
- basic resize and reorder interactions
- responsive preview and controlled breakpoint overrides
- theme controls for colors, fonts, radii, spacing, shadows
- block/component property editing
- undo/redo
- autosave and local/project persistence
- export to zipped project

### Out of scope for v1

- arbitrary custom code execution inside the builder
- visual backend logic orchestration
- first-class auth provider setup
- direct API/data-source bindings
- storage/file upload integrations
- collaboration/multiplayer editing
- guaranteed import-roundtrip of any exported codebase

## Recommended Technical Direction

### Editor model

Use a React-native, schema-driven editor approach.

Preferred path:

- editor foundation inspired by or built on `Puck`
- internal document schema for pages, nodes, props, and layouts
- internal block registry modeled after `shadcn/ui` registry conventions

Fallback path:

- `Craft.js` if deeper custom editor control becomes more important than speed

Not recommended for the main path:

- `GrapesJS` as the core editor if clean React/shadcn export remains the main value proposition

## Success Criteria

### V1 success looks like this

- a user can create a multi-page project visually
- the user can preview the project across breakpoints
- the user can edit content and layout using inspector controls
- the export generates a clean starter project a developer would actually keep
- the exported app runs with minimal setup and clear instructions

### Failure signals

- exported code is too messy to continue from
- the canvas behaves differently than the export
- layout freedom creates broken mobile output too often
- too many components need one-off rules and become hard to maintain

## Roadmap Summary

This roadmap is organized by milestones, not hard calendar promises. The durations below are planning estimates for a small focused team. If team size changes, keep the milestone order and decision gates even if dates move.

| Milestone | Focus | Target Duration | Exit Condition |
| --- | --- | --- | --- |
| M0 | Product foundation and architecture | 2 weeks | Core schema, editor direction, and export contract approved |
| M1 | Editor core and layout system | 4-6 weeks | Users can compose and save basic pages visually |
| M2 | Component library and theming | 3-4 weeks | Builder feels credible for real page design work |
| M3 | Multi-page workflows and export | 3-4 weeks | A zipped starter project is generated and runs cleanly |
| M4 | Hardening and v1 launch prep | 2-3 weeks | Quality, onboarding, and docs are good enough for external use |
| M5 | V2 foundations for integrations | 4-6 weeks | Data/action model is defined and first integrations are scoped |

## Milestone Plan

## M0: Product Foundation And Architecture

Duration: 2 weeks

### Objectives

- lock the v1 scope
- choose the editor foundation
- define the internal document schema
- define the export contract
- validate the component registry strategy

### Deliverables

- architecture decision record for editor foundation
- initial page/node/layout JSON schema
- component registry spec
- export directory/file contract for generated projects
- initial UX wireframes for editor shell

### Key decisions

- `Puck`-based vs `Craft.js`-based foundation
- layout primitives allowed in v1
- whether export is one-way or partial roundtrip
- route generation format for `Next.js`

### Exit gate

- we can render a small schema-driven page in both editor preview and standalone runtime

Status:

- completed in the current implementation slice

## M1: Editor Core And Layout System

Duration: 4-6 weeks

### Objectives

- ship the first working editor shell
- support drag/drop and reorder
- support constrained nested layouts
- support persistence and history

### Deliverables

- editor shell with left library, center canvas, right inspector
- page tree/outline panel
- section/container/grid/flex primitives
- node selection, drag/drop, duplicate, delete, reorder
- resize behavior for allowed layout types
- undo/redo history
- autosave/local persistence

### Required rules

- only valid child components can be dropped into valid parents
- layout primitives must own spacing/alignment behavior
- no freeform canvas positioning in v1
- every node must map to a registry entry

### Exit gate

- a user can build a simple landing page from scratch and come back to it later without losing structure

Status:

- mostly completed in the current implementation slice
- remaining work is now best treated as foundation hardening: deeper drag/drop coverage, stronger placement constraints, clearer command handling, richer undo/redo integrity, and more layout edge-case hardening

## M2: Component Library And Theming

Duration: 3-4 weeks

### Objectives

- make the builder useful for real design work
- establish the first strong component/block library
- add theme and design token controls

### Deliverables

- first-party component/block catalog
- prop editors for text, images, CTA, cards, forms, tables, nav, dashboard blocks
- theme token system for colors, type, radius, spacing, shadows
- global styles and page-level theme overrides where appropriate
- responsive preview modes

### Suggested v1 catalog

- typography blocks
- buttons and inputs
- cards and feature lists
- navbars and sidebars
- hero sections
- testimonials and pricing sections
- tables and stat blocks
- contact forms
- chat-input shell and message shell
- dashboard layout blocks

### Exit gate

- a user can build at least three different project types credibly:
- marketing site
- dashboard shell
- simple app landing page

Status:

- partially completed in the current implementation slice
- the current catalog includes navbars, testimonials, tables, message threads, dashboard shells, and starter-template coverage
- the current shell also includes page outline/layers management and contextual library filtering for valid drops
- follow-up work should pause broad catalog expansion until the editor foundation slice in `docs/plans/04-editor-foundation-hardening-plan.md` is healthier; after that, resume deeper library breadth, richer media/content blocks, export/runtime verification, and more polish across templates and validation

## M3: Multi-Page Workflows And Export

Duration: 3-4 weeks

### Objectives

- make projects feel real instead of canvas demos
- support multi-page information architecture
- produce a clean exported project

### Deliverables

- page manager with create, rename, duplicate, delete
- route/path editing
- nav link generation helpers
- export pipeline to zip
- generated `README` and setup instructions
- generated `.env.example` placeholders where appropriate
- starter app that runs cleanly after install

### Export requirements

- output must be human-readable
- files must be grouped logically
- routes must reflect page structure
- shared blocks/components should be deduplicated when reasonable
- generated code should remain editable without the builder

### Exit gate

- export three representative projects, install them, and verify they run successfully

Status:

- partially completed in the current implementation slice
- zip export is implemented and browser download is verified
- generated starters are now verified through automated install/build/serve/route/static-asset plus browser-rendered checks for all shipped templates
- follow-up work is now focused on stronger generated-app fidelity assertions and deeper export quality coverage, but should stay tied to the foundation work around shared block contracts and placement/export parity

## M4: Hardening And V1 Launch Prep

Duration: 2-3 weeks

### Objectives

- reduce fragile behavior
- tighten UX polish
- write the docs needed for adoption

### Deliverables

- bug bash across editor, preview, and export
- empty states and onboarding flow
- crash recovery and persistence checks
- validation messages for invalid drops/props/layouts
- export troubleshooting guide
- example templates/projects

### QA focus

- nested layout stability
- mobile preview parity
- undo/redo correctness
- large-page performance
- export reproducibility

### Exit gate

- external users can complete the core workflow without direct developer help

Status:

- not yet complete

## M5: V2 Foundations For Integrations

Duration: 4-6 weeks

### Objectives

- define the bridge from static UI builder to app assembly
- introduce safe, structured integration points

### Deliverables

- action model draft
- data binding model draft
- connector configuration architecture
- env/config strategy
- integration eligibility rules for components
- first integration spike, likely forms + webhook/API submission or auth shell wiring

### Candidate v2 feature set

- auth provider setup
- API resource binding
- storage/file upload configuration
- protected routes
- form submission actions
- CRUD starter blocks

### Exit gate

- one integration path works end to end without breaking export cleanliness

Status:

- not started

## Workstreams

The roadmap works best when tracked as parallel workstreams.

### 1. Core editor platform

- document schema
- history/state management
- selection/drag/drop
- persistence

### 2. Layout and rendering

- grid/flex/container logic
- responsive behavior
- preview/runtime parity

### 3. Component system

- block registry
- prop schema
- component constraints
- theme hooks

### 4. Export pipeline

- route generation
- file generation
- project packaging
- install/run verification

### 5. Product UX

- shell layout
- onboarding
- empty states
- interactions and polish

### 6. Documentation and adoption

- setup docs
- export docs
- template gallery
- known limitations

## Critical Decision Gates

These should be explicitly reviewed before moving forward.

### Gate 1: Editor foundation choice

Decision:

- confirm `Puck`-based or `Craft.js`-based path after first prototypes

Pass criteria:

- schema control is good
- drag/drop interactions feel stable
- future export architecture still looks clean

### Gate 2: Layout freedom level

Decision:

- confirm constrained grid/flex model and reject freeform absolute layout for v1 unless a strong reason appears

Pass criteria:

- mobile behavior remains predictable
- export code remains understandable

### Gate 3: Export quality threshold

Decision:

- confirm the product is ready for v1 only if exported code passes internal readability and maintainability review

Pass criteria:

- a developer can take over the exported project without fighting generated code

### Gate 4: V2 integration readiness

Decision:

- do not add connectors until the builder schema can support actions/data cleanly

Pass criteria:

- integrations can be modeled structurally, not hacked in component by component

## Risks And Mitigations

| Risk | Why It Matters | Mitigation |
| --- | --- | --- |
| Exported code quality is weak | This undercuts the entire value proposition | Design export contract early and review generated projects weekly |
| Responsive layouts become too complex | This creates editor confusion and broken output | Keep layout primitives limited and avoid freeform placement |
| Component rules become inconsistent | The builder becomes unpredictable fast | Require every registry item to define allowed props, parents, and children |
| Preview/export drift appears | User trust drops immediately | Share rendering logic where possible and test generated output constantly |
| Too much v2 ambition leaks into v1 | Delivery slips and architecture gets muddy | Keep integrations behind a separate milestone and decision gate |
| Licensing gets blurry with reference kits | Creates product and distribution risk | Only ship assets/code with clear rights; treat premium kits as inspiration unless reviewed |

## Recommended Team Focus By Phase

If multiple people are involved, the healthiest split is:

- one owner on editor/runtime architecture
- one owner on component registry and design system
- one owner on export pipeline and generated project quality
- one owner on UX polish, onboarding, and product workflows

If the team is smaller, protect these responsibilities even if one person holds more than one area.

## Immediate Next Steps

### This week

- execute the editor foundation hardening slice in `docs/plans/04-editor-foundation-hardening-plan.md`
- centralize placement rules and mutation handling
- harden structural validation and drag/drop edge cases
- tighten export parity contracts before broadening the catalog further

### Next 2 weeks

- complete the constraint and command foundation slice
- expand deterministic builder verification around invalid drops and nested layout cases
- keep generated starter verification green while evolving editor and export contracts

### Before writing lots of production code

- create a clear export quality rubric
- create a registry authoring checklist
- create a licensing review list for any borrowed inspiration/assets/templates

## Recommended V1 Release Criteria

Do not call v1 ready until all of the following are true:

- page creation works reliably
- core drag/drop interactions are stable
- responsive preview is trustworthy
- export generates a clean runnable project
- docs explain limitations honestly
- at least three polished starter templates exist

## Final Recommendation

Follow the roadmap in milestone order and protect the product boundary:

- v1 is a visual page/layout builder with strong export
- v2 is where integrations begin

That separation is the difference between a sharp product and an overextended platform.
