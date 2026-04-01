# Handoff

## What Landed

- The greenfield builder app now exists at `apps/web`.
- The current slice delivers the first usable editor runtime with pages, library, canvas, inspector, theming, persistence, and starter export.
- Production hydration under `next start` is now stable again.
- Undo/redo is now implemented for builder mutations.
- The exported starter has been validated through unzip, install, build, and production serve.
- The roadmap plan has been updated to reflect current implementation status and next slices.

## Next Best Slice

The next session should focus on one cohesive product-hardening slice:

- add explicit drag/drop insertion and reorder coverage
- expand the block catalog and add more robust placement constraints
- turn the new stable `data-builder-*` hooks into a deterministic drag verification harness
- add higher-confidence browser checks against the exported starter output

## Suggested Starting Prompt

Continue from `apps/web` and focus on hardening drag/drop verification. Use the new `data-builder-*` hooks to build a deterministic insert/reorder verification loop for the `dnd-kit` canvas, then expand block constraints and broader catalog coverage. After that, add browser-level checks for the exported starter, since unzip, install, build, and production serve are already verified.
