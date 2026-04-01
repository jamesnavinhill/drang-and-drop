# Verification

## Completed Checks

Code quality checks completed from `apps/web`:

```powershell
pnpm lint
pnpm build
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

Verified undo/redo flow:

- changed the project name from `Launch Studio` to `Launch Studio Prime`
- confirmed undo restored `Launch Studio`
- confirmed redo restored `Launch Studio Prime`

Verified export artifact:

- `launch-studio-starter.zip`
  Confirmed browser download event during verification

Automated generated starter validation completed via `pnpm verify:starters`:

1. Generated clean starter workspaces under `apps/web/output/starter-verification`.
2. Ran `pnpm install` for each shipped template.
3. Ran `pnpm build` for each generated starter.
4. Ran `pnpm start --port <port>` for each generated starter.
5. Confirmed every generated route returned `200`.
6. Confirmed expected rendered content appeared in the HTML for each route.
7. Confirmed a live `/_next/static/*` asset request returned `200` for each starter.
8. Opened each generated route in headless Chromium.
9. Confirmed `main` rendered visibly and matched expected page content.
10. Confirmed no browser `pageerror`, no browser console error, and no failed network request for each route.
11. Saved browser screenshots for each generated route under the template verification workspace.

Automated builder drag validation completed via `pnpm verify:dnd`:

1. Rebuilt the builder app and served it under `next start`.
2. Reset the demo state and created a clean verification page in-browser.
3. Verified palette-to-canvas insertion for a root `section`.
4. Verified nested insertion into that section for `text` and `button` blocks.
5. Verified nested reordering by moving `button` ahead of `text`.
6. Verified another root insertion for `hero`.
7. Verified root-level reordering by moving `hero` ahead of `section`.
8. Verified an invalid nested `navbar` drop does not mutate the builder structure.
9. Confirmed no browser `pageerror`, no browser console error, and no failed network request during the builder session.
10. Saved a final builder screenshot under `apps/web/output/builder-dnd-verification/screenshots`.

## Remaining Caveat

The previous local `next start` concern no longer reproduces after the hydration change, and builder drag coverage is now in place through a deterministic browser-backed harness.

The primary remaining verification gap is now deeper generated-app fidelity coverage:

- generated starter validation now includes browser-rendered route checks, but it still does not include visual diffing or richer semantic assertions against layout fidelity
- builder drag verification currently covers the core insertion/reorder loop, but not yet the full block catalog or every placement constraint edge case

What is already in place to support that follow-up:

- stable `data-builder-*` hooks now back both browser automation selectors and the deterministic builder drag verification hook
- `output/` is now excluded from app lint/build scope so Playwright artifacts and exported starter workspaces can live under `apps/web/output` without breaking checks

## Recommended Follow-Up Verification

Run these next:

1. Expand builder drag verification across more block combinations and invalid placement edges.
2. Expand generated starter validation from browser smoke checks into richer visual or DOM-level fidelity assertions against the exported app.
3. Add comparison baselines or DOM-semantic assertions for layout fidelity across the generated routes.
