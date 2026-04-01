# Development

## Workspace

- App path: `apps/web`
- Package manager: `pnpm`
- Framework: `Next.js`

## Install

From `apps/web`:

```powershell
pnpm install
```

## Run The Builder

Development server:

```powershell
pnpm dev --port 3000
```

Production build:

```powershell
pnpm build
```

Production server:

```powershell
pnpm start --port 3001
```

## Quality Checks

Lint:

```powershell
pnpm lint
```

Build:

```powershell
pnpm build
```

Generated starter verification:

```powershell
pnpm verify:starters
```

Builder drag verification:

```powershell
pnpm verify:dnd
```

Runtime-only starter verification:

```powershell
pnpm verify:starters:runtime
```

Install Playwright Chromium for browser-backed verification:

```powershell
pnpm verify:playwright:install
```

## Notes

- The build script is pinned to `next build --webpack` because local production serving was more stable than the default build path in this environment.
- The builder persists project state locally in the browser, so refreshes and revisits will restore the last saved working state.
- If you want a clean local reset in the browser, use the in-app `Reset demo` control or clear local storage for the app origin.
- Project JSON import/export and template application live in the left sidebar `Settings` mode.
- `pnpm verify:starters` generates clean starter workspaces under `apps/web/output/starter-verification`, runs install/build/start for each shipped template, checks every generated route, verifies a live `_next/static` asset response, opens each generated route in headless Chromium, checks for browser errors, and saves screenshots.
- `pnpm verify:dnd` rebuilds the builder app, starts it in production mode, drives deterministic builder drag scenarios through the browser verification hook, checks palette insertion plus nested/root reordering behavior, and saves an end-state screenshot under `apps/web/output/builder-dnd-verification`.
- `pnpm verify:starters:runtime` keeps the earlier install/build/start/route/static-asset checks without the browser layer.
- The assistant shell and transport are wired, but live requests are intentionally disabled unless `NEXT_PUBLIC_BUILDER_ASSISTANT_ENABLED=true` is set in `apps/web/.env.local`.
- The current assistant backend supports Vercel AI Gateway or direct OpenAI configuration through explicit environment variables in `apps/web/.env.example`.

## Important Paths

- Builder shell: `apps/web/src/components/builder`
- Assistant route: `apps/web/src/app/api/chat/route.ts`
- Assistant config and prompting: `apps/web/src/lib/ai`
- Project store: `apps/web/src/lib/builder/store.ts`
- Block definitions: `apps/web/src/lib/builder/component-definitions.ts`
- Placement rules: `apps/web/src/lib/builder/component-placement.ts`
- Preview rendering: `apps/web/src/lib/builder/component-preview.tsx`
- Registry compatibility barrel: `apps/web/src/lib/builder/registry.tsx`
- Export generation: `apps/web/src/lib/builder/export.ts`
- Shared drag verification helpers: `apps/web/src/lib/builder/dnd.ts`
- Shared starter artifacts: `apps/web/src/lib/builder/starter-artifacts.ts`
- Builder drag verification hook: `apps/web/src/components/builder/builder-test-hooks.tsx`
- Builder drag verification script: `apps/web/scripts/verify-builder-dnd.ts`
- Starter verification script: `apps/web/scripts/verify-generated-starters.ts`
