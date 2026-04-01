# Block Authoring

## Purpose

This document records the expected workflow for adding or changing builder blocks after the `05` block-system phase.

The goal is to keep the builder canonical around `block` terminology, make preview/export parity reviewable, and prevent future catalog growth from turning back into ad hoc registry work.

## Canonical Workflow

Every shipped block should satisfy this checklist:

1. Family classification
   Classify the block as `root-composite`, `layout`, `content`, or `application`, and set capability tags that explain special behavior such as `root-only`, `layout-owner`, `leaf`, `parity-critical`, or `future-region-pressure`.
2. Defaults and inspector fields
   Define meaningful defaults in the block contract and keep every editable prop represented by an inspector field with a matching default value.
3. Placement contract
   Declare the allowed destination region kinds and any explicit owned regions the block exposes for nested authoring, including shared region descriptions, empty-state guidance, and primary-versus-supporting role metadata where applicable.
4. Preview and export render contract
   Add or update the block render metadata so the parity strategy and any intentional preview-versus-starter differences are visible in the contract itself.
5. Verification impact
   Extend the fast contract verification or the heavier command/drag/starter verification when the block changes parity coverage, placement rules, or starter behavior.
6. Docs impact
   Update architecture, development, verification, and handoff docs in the same slice when the block system changes materially.
7. Template impact
   Decide whether the block belongs in a shipped starter template, the internal block-contract coverage project, or both.

The codebase artifacts that back this workflow are:

- `apps/web/src/lib/builder/block-contracts.ts`
- `apps/web/src/lib/builder/block-catalog.ts`
- `apps/web/src/lib/builder/block-authoring.ts`
- `apps/web/scripts/verify-builder-contracts.ts`
- `apps/web/src/lib/builder/verification-project.ts`

## Preview And Export Parity Matrix

The current shipped block set uses these parity strategies:

- `shared-shell`
  Root composites keep the same content payload and high-level layout intent while preview and starter preserve surface-specific shell treatment.
- `shared-layout`
  Layout owners keep the same spacing, alignment, and child-flow semantics while preview and starter can differ in surrounding editor chrome.
- `shared-content`
  Leaf blocks keep the same parsed content, variants, and structured payloads while preview and starter may differ in their framing shell.

Current matrix:

| Block | Family | Strategy | Child mode | Preview surface | Starter surface |
| --- | --- | --- | --- | --- | --- |
| `navbar` | `root-composite` | `shared-shell` | `leaf` | `builder-canvas` | `generated-route` |
| `hero` | `root-composite` | `shared-shell` | `leaf` | `builder-canvas` | `generated-route` |
| `section` | `layout` | `shared-layout` | `renders-children` | `builder-canvas` | `generated-route` |
| `stack` | `layout` | `shared-layout` | `renders-children` | `builder-canvas` | `generated-route` |
| `grid` | `layout` | `shared-layout` | `renders-children` | `builder-canvas` | `generated-route` |
| `text` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `button` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `featureGrid` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `faqList` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `testimonialCard` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `pricingCard` | `content` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `statCard` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `activityFeed` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `formCard` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `chatInput` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `messageThread` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `dataTable` | `application` | `shared-content` | `leaf` | `builder-canvas` | `generated-route` |
| `sidebarShell` | `application` | `shared-layout` | `renders-children` | `builder-canvas` | `generated-route` |

Current region-aware layout note:

- `sidebarShell` is the first configurable multi-region layout owner and now carries shared sidebar position, width, and inter-region gap semantics across preview and generated starter export.

## Verification Expectations

When block-system work changes the shipped catalog or its contract model, run from `apps/web`:

```powershell
pnpm lint
pnpm build
pnpm verify:contracts
pnpm verify:commands
pnpm verify:dnd
pnpm verify:starters
```

The fast failure order should usually be:

1. `pnpm verify:contracts`
2. `pnpm verify:commands`
3. `pnpm verify:dnd`
4. `pnpm verify:starters`

This keeps contract drift cheap to catch before spending time on browser-backed verification.
