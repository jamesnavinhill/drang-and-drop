# Verification

## Completed Checks

Code quality checks completed from `apps/web`:

```powershell
pnpm lint
pnpm build
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

## Remaining Caveat

The previous local `next start` concern no longer reproduces after the hydration change, and generated starter static assets also stayed healthy in the current automated run.

The remaining verification gap is now primarily specific to drag automation and browser-level generated UI checks:

- the `dnd-kit` pointer drag gesture still did not trigger reliably through the current Playwright CLI drag/mouse helpers in this Windows environment
- stronger insert/reorder automation will likely need either a lower-level browser harness or an app-level deterministic verification hook
- generated starter validation is now strong at install/build/serve/route/static-asset level, but it still does not include browser-rendered screenshot or DOM assertions against the exported app

What is already in place to support that follow-up:

- stable `data-builder-*` hooks were added around palette items, canvas nodes, drop targets, pages, and history actions
- `output/` is now excluded from app lint/build scope so Playwright artifacts and exported starter workspaces can live under `apps/web/output` without breaking checks

## Recommended Follow-Up Verification

Run these next:

1. Add or choose a more deterministic browser harness for `dnd-kit` pointer drag automation.
2. Re-run explicit palette-to-canvas insert and reorder coverage using the new `data-builder-*` hooks.
3. Expand generated starter validation from HTTP/runtime checks into browser-level visual checks against the exported app.
