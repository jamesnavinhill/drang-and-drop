# Builder System Naming And Mapping Report

Date: April 1, 2026
Related plan: `docs/plans/04-editor-foundation-hardening-plan.md`
Related shell plan: `docs/plans/03-builder-shell-and-assistant-foundation-plan.md`

## Purpose

Define a practical naming model for the current builder system, show how the major parts relate to each other, and clarify what should be mapped now versus what should wait until the editor/export contracts are more settled.

This report is intentionally about:

- naming
- system boundaries
- contract shape
- implementation sequencing

It is intentionally not a final catalog spec.

## Short Recommendation

For this codebase, use `block` as the primary product and authoring term.

Use `component` more narrowly for:

- implementation-level rendering units
- internal registry/module naming when needed
- future cases where one user-facing block may be composed from multiple lower-level render pieces

Use `template` only for larger prebuilt starting states, not for individual blocks.

That means:

- users add `blocks`
- pages are made of `blocks`
- some blocks are `layout blocks`
- some blocks are `content blocks`
- some blocks may later render through multiple internal `components`

This keeps the product language cleaner and gives us room to evolve the implementation without renaming the authoring model later.

## Recommended Naming Model

### 1. Product-Level Terms

Use these in UI copy, docs, and planning when possible:

- `Builder`
  The overall studio/product.
- `Page`
  A routed document in the project.
- `Block`
  The main authoring unit users add, move, duplicate, remove, and configure.
- `Layout Block`
  A block that owns structure and can contain other blocks.
- `Content Block`
  A block that primarily renders content and usually does not contain children.
- `Template`
  A larger starting project or page arrangement.
- `Theme`
  Global visual tokens and style settings.

### 2. System-Level Terms

Use these in code/docs when talking about the editor substrate:

- `Node`
  The normalized persisted record in the project schema.
- `Block Definition`
  Metadata, defaults, and editing fields for a block type.
- `Placement`
  Rules for where a block can live.
- `Placement Target`
  The target kind a block is being inserted into.
  Current examples: `page-root`, `layout-container`.
- `Preview Rendering`
  How a block is rendered inside the builder canvas.
- `Export Rendering`
  How a block is rendered in the generated starter.
- `Structure Command`
  Insert, move, duplicate, remove, and future safe mutation operations.

### 3. Implementation-Level Terms

Use these more selectively:

- `Component`
  A React implementation unit.
- `Render Support`
  Shared helper logic used by generated starter rendering.
- `Registry Compatibility Barrel`
  The old `registry.tsx` boundary that now mostly re-exports newer modules.

## Recommended Vocabulary Rules

If we want consistent language going forward, I recommend these rules:

1. In UI and roadmap language, prefer `block`.
2. In schema/store/validation language, prefer `node`.
3. In rendering/module language, use `component` only when talking about React implementation details.
4. Treat `template` as a prebuilt arrangement, not a synonym for `block`.
5. Avoid switching between `block` and `component` casually in the same paragraph unless the distinction matters.

## Current System Map

### Authoring Model

```text
Builder Project
|
+-- Theme
|
+-- Pages
|   |
|   +-- Page
|       |
|       +-- root node ids
|
+-- Nodes
    |
    +-- Node
        |
        +-- type
        +-- props
        +-- children
```

### Block Contract Shape

```text
Block Type
|
+-- Block Definition
|   |
|   +-- title
|   +-- description
|   +-- defaults
|   +-- inspector fields
|
+-- Placement Contract
|   |
|   +-- allowed parent target kinds
|   +-- child target kind, if container
|
+-- Preview Contract
|   |
|   +-- builder-side render behavior
|   +-- shared content parsing/fallback semantics
|
+-- Export Contract
    |
    +-- generated starter render behavior
    +-- generated render support helpers
```

### Current Implementation Flow

```text
User action
|
+-- Sidebar / Canvas / Inspector / Outline
    |
    +-- Store action
        |
        +-- Structure command
            |
            +-- Placement validation
            |   |
            |   +-- placement target kind
            |   +-- block placement contract
            |
            +-- Project mutation
                |
                +-- history
                +-- persisted state
                +-- canvas preview
                +-- export generation
```

## Proposed Future Flow

This is the shape I think we should keep moving toward.

```text
Block family map
|
+-- Layout Blocks
|   |
|   +-- page shell
|   +-- section
|   +-- stack
|   +-- grid
|   +-- future slot/region owners
|
+-- Content Blocks
|   |
|   +-- text
|   +-- button
|   +-- stat
|   +-- table
|   +-- faq
|   +-- testimonial
|
+-- Composite Blocks
|   |
|   +-- hero
|   +-- navbar
|   +-- form card
|   +-- pricing card
|   +-- message thread
|
+-- Templates
    |
    +-- starter project
    +-- starter page arrangements
```

And the contract flow:

```text
Block family
|
+-- Block type
    |
    +-- definition
    +-- placement
    +-- preview contract
    +-- export contract
    +-- verification expectations
```

## Sample Page Layout Map

This is a useful way to think about a saved page without overcommitting to final implementation details.

```text
Page: Home
Path: /
Target kind: page-root

[Navbar]                 root block
[Hero]                   root block
[Section]                root layout block
  |
  +-- [Text]             content block
  +-- [Stack]            layout block
      |
      +-- [Stat Card]    content block
      +-- [Button]       content block
  +-- [Grid]             layout block
      |
      +-- [Testimonial]  content block
      +-- [Pricing Card] content block

Saved project shape:

project
|
+-- pages["home"]
|   |
|   +-- rootIds: [navbar-1, hero-1, section-1]
|
+-- nodes
    |
    +-- navbar-1
    +-- hero-1
    +-- section-1
        |
        +-- text-1
        +-- stack-1
        |   |
        |   +-- stat-1
        |   +-- button-1
        |
        +-- grid-1
            |
            +-- testimonial-1
            +-- pricing-1
```

## Where We Are Safe To Map More

I think we are safe to map more in these areas right now:

- block families
- naming conventions
- authoring vocabulary
- contract checklist for a future block
- parity expectations between preview and export
- future slot/region direction

I do not think we should yet go heavy on:

- final props for a large future catalog
- deep implementation of many new block types
- large template expansion
- advanced nesting patterns we may redesign once slot/region rules are clearer

## Practical Tradeoffs For This Codebase

### Option A: Keep `component` as the main term everywhere

Practical upside:

- matches React habits
- lines up with some current file names

Practical downside:

- users are not building raw React components
- `component` gets overloaded across product, schema, and rendering

Technical downside in this codebase:

- we already have a split between authoring units, normalized nodes, and render modules
- using `component` for all three makes future contracts blurrier, not clearer

### Option B: Use `block` for authoring, `component` for implementation

Practical upside:

- clearer for users and docs
- maps well to library/catalog language
- gives us room for a block to be rendered by multiple internal pieces later

Technical upside in this codebase:

- fits the current separation between `component-definitions`, `component-placement`, `component-preview`, and schema nodes
- makes preview/export contract docs easier to read

Practical downside:

- some existing code paths still use `component` naming

Technical downside:

- we may eventually want to rename some modules if we want perfect alignment
- that rename is optional for now

### Option C: Finalize the full block map now and start implementing broadly

Practical upside:

- exciting momentum
- easier to imagine the final product surface

Technical downside in this codebase:

- preview/export JSX still duplicates too much per block
- slot/region semantics are not yet settled
- broad implementation now would likely create more cleanup later

### Option D: Map the final system now, but keep implementation narrow

Practical upside:

- gives the team shared language
- reduces confusion during future work
- helps avoid building the wrong shape

Technical upside in this codebase:

- matches where the architecture is now
- supports cleaner future contracts without forcing premature catalog work
- lowers the chance of rework while preview/export parity is still being hardened

Downside:

- requires discipline to stay at the contract level instead of turning the map into a build list too early

## Recommendation For This Codebase

My recommendation is:

1. Use `block` as the main product and authoring term.
2. Use `node` for persisted schema records.
3. Use `component` only for implementation-level React/rendering language.
4. Keep mapping the final block system now, but only at the contract and family level.
5. Wait on broad implementation until preview/export block rendering is less duplicated and slot/region direction is clearer.

If we follow that, the next healthy planning artifact after this report is probably:

- a `block family map`
- a `block authoring checklist`
- a `preview/export parity matrix`

Not:

- a giant final block backlog with immediate implementation commitments

## Clarifying Questions

These are the questions I think are worth settling next, with the tradeoffs attached.

### 1. Do we want `hero` and `navbar` treated as long-term root-only composite blocks, or as first examples of a future page-shell/section-region model?

Practical tradeoff:

- keeping them root-only is simpler and clearer now
- moving toward regions is more flexible later

Technical tradeoff in this codebase:

- root-only is already supported cleanly by current placement targets
- regions would require a richer placement contract, probably beyond `page-root` and `layout-container`

My recommendation:

- keep them root-only for now
- treat them as future region-model pressure cases, not as reasons to redesign immediately

### 2. Do we want templates to stay mostly project-level starters, or eventually support page-level block compositions as reusable authored assets?

Practical tradeoff:

- project-level starters are easier to explain
- reusable page compositions are more powerful

Technical tradeoff in this codebase:

- project starters already fit the current export model
- reusable page-level compositions would want clearer block contracts and stronger import/export discipline

My recommendation:

- keep `template` meaning starter project for now
- introduce smaller reusable authored units later under a different name if needed

### 3. How far do we want to push export parity before resuming broader block implementation?

Practical tradeoff:

- more parity hardening now reduces future rework
- too much hardening can feel like slower visible progress

Technical tradeoff in this codebase:

- current helper drift is improving
- per-block JSX duplication is still the main remaining parity risk

My recommendation:

- do a bit more parity shaping first
- specifically, define a clearer shared block render contract before broad catalog growth

### 4. Do we want to eventually rename code modules from `component-*` to `block-*`, or keep the current filenames and use product-language translation in docs/UI?

Practical tradeoff:

- renaming code improves conceptual consistency
- keeping filenames avoids churn

Technical tradeoff in this codebase:

- current filenames are already stable and understandable
- renaming now adds noise without much system benefit

My recommendation:

- keep current filenames for now
- standardize the docs/UI vocabulary first
- revisit code-level renames only if the mismatch starts causing confusion
