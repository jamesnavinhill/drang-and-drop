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
- Placement validation now resolves against explicit `page-root` and `layout-container` target kinds instead of only raw parent-type allowlists, and command verification now covers those target boundaries directly.
- Shared block-content parsing and fallback semantics now live in one builder module, and generated starters receive a dedicated `render-support` file instead of keeping those helpers inline in the main page renderer.
- Starter verification now includes an internal block-contract coverage project so exported rendering stays exercised across every parity-critical shipped block type even when the public starter templates change.
- Block contracts now carry explicit preview/export render metadata, and a derived parity matrix now exists alongside a dedicated block authoring checklist.
- Fast contract verification now exists through `scripts/verify-builder-contracts.ts`, which checks block coverage, placement/capability consistency, render-contract completeness, and parity coverage alignment before the heavier browser-backed runs.
- The roadmap and operations docs have been updated to reflect the current implementation baseline and next slices.

## Next Best Slice

The `05` block-system phase is now in a good finished state. The next session should resume forward product growth from that cleaner baseline instead of doing more contract clean-up first.

Immediate focus:

- resume broader catalog or customization work using the new block authoring workflow instead of ad hoc registry edits
- keep new block additions aligned with the family map, capability tags, render metadata, and parity matrix
- extend the fast contract verifier and the coverage project whenever new block families or layout capabilities land
- expand generated-app fidelity assertions only after a new slice introduces meaningful starter-surface complexity

## Suggested Starting Prompt

Continue from `apps/web` after the completed `05` block-system pass. Use the canonical block contracts, family/capability map, render parity metadata, and block authoring checklist as the baseline for the next product slice. If you add or change shipped blocks, update the coverage project, `pnpm verify:contracts`, and the operations docs in the same pass.
