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
- Builder block definitions, placement rules, and preview rendering are now split into focused modules, and `src/lib/builder/registry.tsx` is reduced to a compatibility barrel instead of the implementation catch-all.
- Placement validation now resolves against explicit `page-root` and `layout-container` target kinds instead of only raw parent-type allowlists, and command verification now covers those target boundaries directly.
- The roadmap and operations docs have been updated to reflect the current implementation baseline and next slices.

## Next Best Slice

The next session should focus on one cohesive editor-foundation slice:

- continue from the new split builder modules instead of re-growing the compatibility barrel
- build on the new `page-root` / `layout-container` placement model toward clearer slot or region contracts
- tighten builder/export parity now that preview rendering and block definitions have clearer seams
- keep verification green while the placement/export contracts are tightened

## Suggested Starting Prompt

Continue from `apps/web` and follow `docs/plans/04-editor-foundation-hardening-plan.md`. The structure-command foundation is in place, the outline/inspector action surface is shared, the old builder registry has been split into block-definition, placement, and preview modules, and placement validation now resolves through explicit `page-root` and `layout-container` target kinds. Next, keep hardening the placement model and export parity on top of those seams without re-centralizing logic into the compatibility barrel.
