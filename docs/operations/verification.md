# Verification

## Completed Checks

Code quality checks completed from `apps/web`:

```powershell
pnpm lint
pnpm build
pnpm verify:contracts
pnpm verify:commands
pnpm verify:dnd
pnpm verify:starters
```

All completed successfully in the current session.

Production serving checks completed from `apps/web`:

```powershell
pnpm exec next start --port 3001
```

Verified result:

- the app hydrates into the full editor shell under `next start`
- a production reload completed without any observed `_next/static/*` error responses in the Playwright session
- persisted builder state rehydrates as expected

## Browser Checks Completed

Local browser verification was performed with Playwright CLI against the running app.

Verified behaviors:

- app shell renders correctly in production mode
- undo/redo buttons activate after an edit and restore/reapply project state
- export button triggers a starter zip download

Direct command verification completed via `pnpm verify:commands`:

1. Verified shared insert command behavior for valid page-header, page-main, and nested block-region placements.
2. Verified first multi-region `sidebarShell` behavior for valid `content` and `sidebar` region inserts.
3. Verified region-placement rejection for a `button` block that requires a layout region and for a `section` block rejected from the sidebar region.
4. Verified shared move command behavior for nested block-region moves, including moving supporting content into the sidebar region.
5. Verified descendant-target rejection for invalid moves.
6. Verified page-region-only placement rejection for invalid nested inserts.
7. Verified shared duplicate command behavior for subtree cloning with fresh ids.
8. Verified shared remove command behavior for subtree deletion.
9. Verified structural validation rejects invalid page-region placement and orphan nodes.

Contract verification completed via `pnpm verify:contracts`:

1. Verified every shipped `blockType` resolves to one canonical block contract.
2. Verified family, capability, placement, and render-contract metadata remain internally consistent.
3. Verified page-region and block-region definitions still carry the required shared labels, descriptions, empty-state guidance, and role metadata.
4. Verified every inspector field has a matching default and every block contract has unique field keys and capabilities.
5. Verified the authoring checklist still contains the required workflow checkpoints.
6. Verified the internal block-contract coverage project still exercises every parity-critical shipped block type.

Canvas interaction feedback is now also validated by the browser drag harness:

1. The canvas now renders live guidance while a drag is active.
2. Invalid nested and descendant drag targets now surface the shared validation message before drop.
3. Full-catalog library browsing now shows when a block is not allowed in the current insertion target.
4. Invalid structure-sensitive actions now surface a shared editor notice at the studio shell level.
5. Inspector-driven node reorder now uses the same structure action surface as the outline and is covered by the browser harness.

Verified undo/redo flow:

- changed the project name from `Launch Studio` to `Launch Studio Prime`
- confirmed undo restored `Launch Studio`
- confirmed redo restored `Launch Studio Prime`

Verified export artifact:

- `launch-studio-starter.zip`
  Confirmed browser download event during verification

Automated generated starter validation completed via `pnpm verify:starters`:

1. Generated clean starter workspaces under `apps/web/output/starter-verification`.
2. Included the internal block-contract coverage project alongside the shipped templates so every parity-critical shipped block type stays exercised.
3. Ran `pnpm install` for each generated starter.
4. Ran `pnpm build` for each generated starter.
5. Ran `pnpm start --port <port>` for each generated starter.
6. Confirmed every generated route returned `200`.
7. Confirmed expected rendered content appeared in the HTML for each route.
8. Confirmed a live `/_next/static/*` asset request returned `200` for each starter.
9. Opened each generated route in headless Chromium.
10. Confirmed `main` rendered visibly and matched expected page content.
11. Verified exported region-owned layout wrappers exist for layout-owner blocks and that `sidebarShell` preserves expected `sidebar` versus `content` region order.
12. Confirmed no browser `pageerror`, no browser console error, and no failed network request for each route.
13. Saved browser screenshots for each generated route under the template verification workspace.

Automated builder drag validation completed via `pnpm verify:dnd`:

1. Rebuilt the builder app and served it under `next start`.
2. Reset the demo state and created a clean verification page in-browser with empty `header`, `main`, and `footer` regions.
3. Verified pointer-driven drag automation moves the live browser cursor between real source and target DOM bounds before asserting the resulting builder structure.
4. Kept the browser-pointer path on the core interaction loops that matter most to UX feel: root insertion, nested insertion, and node reorder.
5. Used the deterministic builder verification hook for later structural and invalid-placement assertions so those checks stay stable across browser hitbox differences while still exercising the same store and command layers.
6. Verified palette-to-canvas insertion for a `section` into the page `main` region.
7. Verified palette-to-canvas insertion for a `navbar` into the page `header` region after selecting that destination explicitly.
8. Verified nested insertion into section `content` for `text` and `button` blocks.
9. Verified nested reordering by moving `button` ahead of `text`.
10. Verified another page-main insertion for `hero`.
11. Verified page-main reordering by moving `hero` ahead of `section`.
12. Verified nested insertion for `stack`, then moved `text` into that nested block region.
13. Verified page-main insertion for the first multi-region `sidebarShell`.
14. Verified insertion into `sidebarShell.sidebar` for a compact supporting block.
15. Verified insertion into `sidebarShell.content` for a primary workspace block.
16. Verified an invalid nested `hero` move does not mutate the builder structure.
17. Verified an invalid sidebar-region `section` drop does not mutate the builder structure.
18. Verified an invalid descendant move does not mutate the builder structure.
19. Verified an invalid nested `navbar` drop does not mutate the builder structure.
20. Verified invalid hero, sidebar, descendant, and navbar interactions surface a visible editor notice.
21. Verified the shared editor notice can be dismissed.
22. Verified inspector-driven reorder can move a selected node down and restore it back up.
23. Confirmed no browser `pageerror`, no browser console error, and no failed network request during the builder session.
24. Saved a final builder screenshot under `apps/web/output/builder-dnd-verification/screenshots`.

## Remaining Caveat

The previous local `next start` concern no longer reproduces after the hydration change, and builder drag coverage is now in place through a hybrid harness: real pointer movement stays on the live interaction loop, while deterministic builder-hook checks cover deeper structural invalid cases that are more sensitive to browser hitbox drift.

The primary remaining verification gaps are now split between editor-foundation hardening and deeper generated-app fidelity coverage:

- builder drag verification now covers the main insertion/reorder loop plus invalid nested and descendant scenarios with visible notice assertions and an inspector parity check, but not yet every outline/canvas parity scenario or every placement-constraint edge case
- command-path verification now covers shared insert/move/duplicate/remove behavior, but future command types still need to be added as they land
- generated starter validation now includes browser-rendered route checks plus structural region-owned layout assertions, but it still does not include visual diffing or richer semantic assertions against layout fidelity

What is already in place to support that follow-up:

- stable `data-builder-*` hooks now back both browser automation selectors and the deterministic builder drag verification hook
- `scripts/verify-builder-commands.ts` now gives the structure-command layer a direct fast verification loop outside the browser
- canonical block contracts now live in `src/lib/builder/block-contracts.ts`, with derived definition, placement, and preview modules built on top of that boundary
- `src/lib/builder/block-catalog.ts` now exposes family/capability metadata used by both the builder UI and verification loops
- `src/lib/builder/block-authoring.ts` and `docs/operations/block-authoring.md` now record the block authoring workflow and preview/export parity matrix as first-class artifacts
- the older `component-*` compatibility shims and the old registry compatibility barrel are now retired, so the active codepaths resolve directly through the canonical `block-*` modules
- `scripts/verify-builder-contracts.ts` now gives the block system a fast contract-level verification loop before the heavier drag and starter checks run
- starter verification now includes an internal block-contract coverage project so preview/export parity checks do not depend only on the shape of the shipped user-facing templates
- placement rules now resolve through explicit page-region and block-region target kinds, including `layout-sidebar`, which gives validation and verification a clearer shared vocabulary
- shared page-region and block-region metadata now gives the editor surfaces and the starter verifier one more contract layer to agree on
- generated starters now emit explicit region-owned layout hooks for verification, which makes exported multi-region layout assertions cheaper to extend
- shared block-content parsing and fallback semantics now back both builder preview and generated starter render support, which reduces one more source of preview/export drift
- `output/` is now excluded from app lint/build scope so Playwright artifacts and exported starter workspaces can live under `apps/web/output` without breaking checks
- the current builder state model is already deterministic enough to support stronger structural and command-level verification once those layers are formalized

## Recommended Follow-Up Verification

Run these next:

1. Expand builder drag verification around more placement-constraint edges, especially empty-container affordances and outline/canvas parity scenarios.
2. Extend command verification when wrap/unwrap or assistant-safe mutation commands land.
3. Expand generated starter validation from the new structural region assertions into richer visual or DOM-level fidelity assertions only after the export contract is tightened further.
