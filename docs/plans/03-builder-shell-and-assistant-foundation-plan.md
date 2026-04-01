# Builder Shell And Assistant Foundation Plan

Date: April 1, 2026

## Purpose

Define the first professional shell for the visual builder and establish the UI foundation for a proposal-first assistant without overextending the product before layout, design, and agent tooling mature.

This plan is intentionally focused on the editor shell, naming, and interaction model. It does not attempt to finalize autonomous agent behavior or advanced design systems yet.

## Confirmed Product Decisions

The following decisions are now considered aligned for the current implementation pass:

- the builder remains a visual editor first, not a chat-first product
- the left side should be a single persistent sidebar with always-visible tabs
- the left sidebar tabs should be:
  - `Pages`
  - `Library`
  - `Assistant`
  - `Settings`
- the assistant should keep its conversation thread and prompt input together in the same panel
- the center canvas remains the primary working surface
- the right side should be a contextual inspector with tabs
- the right inspector tabs should be:
  - `Selection`
  - `Page`
  - `Theme`
- the top bar should continue to hold global builder actions such as preview, history, save/export, and related workspace actions
- the assistant should start as proposal-first
- a future assistant mode toggle can support more direct action, but that should not be the default now

## Naming

Use straightforward builder language in product copy, docs, and code:

- `Top Bar`
- `Left Sidebar`
- `Sidebar Tabs`
- `Sidebar Content`
- `Canvas`
- `Right Inspector`
- `Assistant Composer`

Avoid `drawer` and `sheet` for the desktop shell. Those names imply temporary overlays, while this builder uses persistent work surfaces.

## Recommended Desktop Information Architecture

### Top Bar

Responsibilities:

- current project identity
- current route / workspace summary
- preview mode switching
- undo / redo
- export
- save or reset actions as needed during alpha

### Left Sidebar

Responsibilities:

- switch between substantial workspace modes
- show one active mode at a time
- keep all assistant interaction together when `Assistant` is active

Tabs:

- `Pages`
  project routes and page management
- `Library`
  blocks, layout primitives, and future assets/templates
- `Assistant`
  conversation thread, proposals, and composer
- `Settings`
  project-level metadata and future workspace/assistant preferences

### Canvas

Responsibilities:

- remain visually dominant
- preserve current drag/drop mental model
- avoid overlay-heavy chat patterns that compete with selection and DnD behavior

### Right Inspector

Responsibilities:

- edit the current context cleanly
- avoid mixing project-wide settings with selection editing
- scale toward future tabs such as `Data`, `Actions`, or `Bindings`

Tabs:

- `Selection`
  selected node controls and destructive actions
- `Page`
  current page metadata and route details
- `Theme`
  design token controls

## Why This Shell Fits This Codebase

The current builder already has the right primitives:

- schema-first project data
- explicit state mutations
- a distinct canvas
- existing left-side page and library panels
- an existing right-side inspector

This means the best next step is not inventing new major architecture. It is reshaping the current shell into a clearer, more scalable composition.

Why this is the right move now:

- it reduces visual clutter by showing one left-side mode at a time
- it creates a natural home for assistant work without making the app chat-led
- it lets the right side become a real contextual inspector
- it keeps the current state/store model valid
- it minimizes rework when Vercel AI SDK is added later

## Assistant Foundation

### Phase 1 assistant behavior

The assistant should begin as a proposal-first guide, not as an autonomous editor.

Immediate responsibilities:

- explain how to use the builder
- suggest safe next steps
- suggest copy, theme, and small layout refinements
- frame changes as proposals before action

Immediate non-goals:

- direct mutation of the project from model output
- hidden autonomous actions
- browser-driving behavior
- large layout rewrites without explicit review

### Future assistant direction

After shell hardening and stronger guardrails:

- add Vercel AI SDK server-side model integration
- introduce structured proposal cards
- validate any proposed changes against builder schema and constraints
- support an eventual preference for auto-applying explicitly safe edits

## Immediate Implementation Scope

### 1. Shell Refactor

- convert the left column into a single tabbed sidebar
- keep tabs always visible
- preserve responsive stacking behavior on smaller screens
- simplify the header into a more product-like top bar

### 2. Right Inspector Refactor

- add tabs for `Selection`, `Page`, and `Theme`
- move project-level fields out of the right inspector
- keep selection editing focused and contextual

### 3. Assistant UI Foundation

- add an `Assistant` sidebar mode
- keep conversation history and input together
- make the initial state honest and proposal-first
- avoid pretending full agent execution exists before it is wired

### 4. Settings Sidebar Mode

- move project-level metadata into `Settings`
- leave room for future assistant/workspace preferences

## Implementation Notes

### Left Sidebar Tabs

Recommended first-pass ordering:

1. `Pages`
2. `Library`
3. `Assistant`
4. `Settings`

This order keeps creation workflows ahead of assistance and settings.

### Right Inspector Behavior

Recommended first-pass behavior:

- when a node is selected, default to `Selection`
- when nothing is selected and `Selection` was active, fall back to `Page`
- allow the user to manually switch to `Theme` at any time

### Assistant Messaging Tone

The assistant surface should feel:

- calm
- professional
- proposal-first
- helpful without pretending it can already perform hidden actions

## Acceptance Criteria For This Pass

- the desktop builder uses a single left sidebar with visible tabs
- `Pages`, `Library`, `Assistant`, and `Settings` render as distinct left-side modes
- the right side is a tabbed contextual inspector
- project metadata no longer competes with selection editing in the right inspector
- the assistant thread and composer live together in the same surface
- top-bar actions remain easy to discover and use
- the overall shell feels cleaner and more intentional than the previous stacked-panel layout

## Next Phase After This Pass

After this shell lands, the next recommended step is:

1. add assistant transport and model wiring with Vercel AI SDK
2. introduce structured proposals for copy/theme/safe layout tweaks
3. connect proposals to explicit builder mutation tools
4. add review/apply controls before any project mutation happens

This sequence protects UX clarity and preserves trust while the product is still establishing its editor foundations.
