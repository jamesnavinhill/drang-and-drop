# Handoff

## What Landed

- The greenfield builder app now exists at `apps/web`.
- The current slice delivers the first usable editor runtime with pages, library, canvas, inspector, theming, persistence, and starter export.
- The roadmap plan has been updated to reflect current implementation status and next slices.

## Next Best Slice

The next session should focus on one cohesive product-hardening slice:

- implement undo/redo
- add explicit drag/drop insertion and reorder coverage
- expand the block catalog and add more robust placement constraints
- verify the exported starter by unzipping and building it separately
- investigate and resolve the local `next start` static asset `500` issue

## Suggested Starting Prompt

Continue from `apps/web` and focus on hardening the builder. First reproduce and fix the local `next start` static asset failures, then add undo/redo plus stronger drag/drop verification for insert and reorder flows. After that, validate the exported starter project end to end.
