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

## Notes

- The build script is pinned to `next build --webpack` because local production serving was more stable than the default build path in this environment.
- The builder persists project state locally in the browser, so refreshes and revisits will restore the last saved working state.
- If you want a clean local reset in the browser, use the in-app `Reset demo` control or clear local storage for the app origin.

## Important Paths

- Builder shell: `apps/web/src/components/builder`
- Project store: `apps/web/src/lib/builder/store.ts`
- Registry and rendering: `apps/web/src/lib/builder/registry.tsx`
- Export generation: `apps/web/src/lib/builder/export.ts`
