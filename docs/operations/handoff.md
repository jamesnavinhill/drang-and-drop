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
- Shared block-content parsing and fallback semantics now live in one builder module, and generated starters receive a dedicated `render-support` file instead of keeping those helpers inline in the main page renderer.
- The roadmap and operations docs have been updated to reflect the current implementation baseline and next slices.

## Next Best Slice

The next session should transition from the end of the `04` editor-foundation slice into the `05` block-system slice defined in `docs/plans/05-builder-block-system-implementation-plan.md`.

Immediate focus:

- normalize the builder boundary around canonical `block` terminology
- turn the current split modules into an explicit block-contract system
- map the current shipped catalog into clear block families and capabilities
- fold the remaining preview/export parity follow-up into that new contract model
- keep verification and operating docs aligned while the system is reorganized

## Suggested Starting Prompt

Continue from `apps/web` and follow `docs/plans/05-builder-block-system-implementation-plan.md`. The structure-command foundation from `04` is already in place, the old builder registry has been split into definition, placement, and preview modules, placement validation now resolves through explicit `page-root` and `layout-container` target kinds, and export/render seams are clearer than before. Next, make the builder system canonical around `block` terminology, define an explicit block contract, map the shipped block families, and fold the remaining export-parity work into that cleaner contract without rebuilding a monolithic registry layer.
