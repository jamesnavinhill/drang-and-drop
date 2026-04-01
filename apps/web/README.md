# Web Builder

The current product slice is a schema-driven visual builder for multi-page `Next.js + Tailwind` starter apps.

## Run

From `apps/web`:

```powershell
pnpm install
pnpm dev --port 3000
```

## Quality Checks

```powershell
pnpm lint
pnpm build
```

## Builder Shell

The current desktop shell is organized as:

- `Top Bar`
- `Left Sidebar`
  - `Pages`
  - `Library`
  - `Assistant`
  - `Settings`
- `Canvas`
- `Right Inspector`
  - `Selection`
  - `Page`
  - `Theme`

## Assistant Status

The assistant transport is wired with the official Vercel AI SDK patterns, but it is intentionally dormant by default.

To enable live requests later, configure a local `.env.local` using `apps/web/.env.example`.

Required pieces:

- `NEXT_PUBLIC_BUILDER_ASSISTANT_ENABLED=true`
- `BUILDER_AI_MODEL=...`
- one provider path:
  - `AI_GATEWAY_API_KEY=...`
  - or `OPENAI_API_KEY=...`

If both provider credentials are present, also set:

- `BUILDER_AI_PROVIDER=gateway`
  or
- `BUILDER_AI_PROVIDER=openai`

## Important Paths

- Builder shell: `src/components/builder`
- Assistant route: `src/app/api/chat/route.ts`
- Assistant config: `src/lib/ai`
- Builder store: `src/lib/builder/store.ts`
- Registry and rendering: `src/lib/builder/registry.tsx`
- Export generation: `src/lib/builder/export.ts`
