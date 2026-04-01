# Handoff

## What Landed

- The greenfield builder app now exists at `apps/web`.
- The current slice delivers the first usable editor runtime with pages, library, canvas, inspector, theming, persistence, and starter export.
- Production hydration under `next start` is now stable again.
- Undo/redo is now implemented for builder mutations.
- The exported starter has been validated through unzip, install, build, and production serve.
- The roadmap plan has been updated to reflect current implementation status and next slices.

## Next Best Slice

The next session should focus on one cohesive editor-foundation slice:

- centralize placement constraints and mutation handling
- harden drag/drop and outline behavior around the same command path
- add stronger structural validation instead of relying on UI-level guardrails alone
- keep verification green while the canvas, store, and export contracts are tightened

## Suggested Starting Prompt

Continue from `apps/web` and follow `docs/plans/04-editor-foundation-hardening-plan.md`. Start with the constraint and command foundation slice by centralizing placement rules, unifying insert/move handling across canvas and outline flows, and adding stronger structural validation around those mutations before expanding the block catalog further.
