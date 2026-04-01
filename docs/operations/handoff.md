# Handoff

## What Landed

- The greenfield builder app now exists at `apps/web`.
- The current slice delivers the first usable editor runtime with pages, library, canvas, inspector, theming, persistence, and starter export.
- Production hydration under `next start` is now stable again.
- Undo/redo is now implemented for builder mutations.
- The exported starter has been validated through unzip, install, build, and production serve.
- Placement validation and structure-sensitive node mutations now share a centralized command layer in `src/lib/builder/structure.ts`.
- Insert, move, duplicate, and remove node flows now route through shared structure commands before history is recorded in the store.
- Structural validation now checks semantic layout issues such as invalid placement and orphan nodes during import and persisted-state parsing.
- Direct command verification now exists alongside browser drag verification through `scripts/verify-builder-commands.ts`.
- The canvas now surfaces live invalid-drop reasoning from the shared validator, and the full library catalog now flags blocks that are not valid for the current insertion target.
- Failed structure-sensitive actions now surface a shared shell-level editor notice, and the outline now shows the current insertion target so it reads more like the library/canvas model.
- Outline and inspector now share the same node-structure action surface for reorder, duplicate, and remove controls.
- Builder block definitions, placement rules, and preview rendering are now split into focused modules, and the old registry compatibility barrel has been retired.
- The canonical builder boundary now resolves directly through `block-contracts.ts`, `block-definitions.ts`, `block-placement.ts`, and `block-preview.tsx`, with the older `component-*` files retired.
- A derived `block-catalog.ts` layer now exposes family and capability metadata for the builder UI, assistant context, and contract-driven verification work.
- Shared block-content parsing now lives at the canonical `block-content.ts` boundary.
- Placement validation now resolves against explicit page-region and block-region target kinds instead of only raw parent-type allowlists, and command verification now covers those target boundaries directly.
- `sidebarShell` now acts as the first shipped multi-region proof block, with explicit `sidebar` and `content` regions plus matching preview/export and verification coverage.
- Page-region and block-region definitions now carry shared authoring metadata, including descriptions, empty-state guidance, and primary-versus-supporting role labels.
- Canvas, outline, and library insertion context now derive region affordances from those shared definitions instead of relying on more local UI strings.
- `sidebarShell` now exposes the first shipped configurable multi-region layout-owner controls, including sidebar position, sidebar width, and region gap.
- Generated starter verification now asserts exported region wrappers for region-owning layouts, including sidebar-shell region order fidelity.
- Shared block-content parsing and fallback semantics now live in one builder module, and generated starters receive a dedicated `render-support` file instead of keeping those helpers inline in the main page renderer.
- Starter verification now includes an internal block-contract coverage project so exported rendering stays exercised across every parity-critical shipped block type even when the public starter templates change.
- Block contracts now carry explicit preview/export render metadata, and a derived parity matrix now exists alongside a dedicated block authoring checklist.
- Fast contract verification now exists through `scripts/verify-builder-contracts.ts`, which checks block coverage, placement/capability consistency, render-contract completeness, and parity coverage alignment before the heavier browser-backed runs.
- The roadmap and operations docs have been updated to reflect the current implementation baseline and next slices.

## Next Best Slice

The structural region cutover inside `06` is now in a stronger follow-up state. The next session should keep building on the settled region model rather than revisiting the schema rewrite itself.

Immediate focus:

- extend the richer region metadata and layout-configuration contract into additional layout-owner families where it improves real authoring workflows
- keep new block additions aligned with the family map, capability tags, region metadata, render metadata, and parity matrix
- extend the fast contract verifier and the coverage project whenever new region-aware layout capabilities land
- expand generated-app fidelity assertions from the new structural region coverage only when a slice introduces meaningful starter-surface complexity

## Suggested Starting Prompt

Continue from `apps/web` after the current `06` region-contract follow-up slices. Treat the canonical region graph as settled, use the shared region metadata and configurable `sidebarShell` contract as the current baseline, and keep preview/export/verification aligned in the same pass if you extend region-aware layout behavior further.
