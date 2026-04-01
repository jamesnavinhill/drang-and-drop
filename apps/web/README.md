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
pnpm verify:commands
pnpm verify:dnd
pnpm verify:starters
```

If Playwright browsers are not installed yet:

```powershell
pnpm verify:playwright:install
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

## Core Workflow Features

- schema-driven multi-page builder state with undo/redo history
- shared structure-command layer for insert, move, duplicate, and remove operations
- structural project validation for import, persisted state hydration, and command-safe mutations
- drag/drop composition with constrained layout primitives and centralized parent/child placement rules
- tabbed pages workspace with route management and page outline/layers controls
- contextual library filtering based on the active insertion target
- project JSON import/export for backup and reuse
- starter templates for marketing and internal-tool starting points
- expanded first-party block catalog including nav, FAQ, activity feed, testimonial, table, and message-thread shells
- zip export to a runnable `Next.js` starter
- deterministic builder drag verification for palette insertion, nested insertion, reorder, and invalid-drop coverage
- direct builder command verification for shared insert/move/duplicate/remove and structural validation flows
- automated generated-starter verification across all shipped templates
- browser-rendered starter verification with screenshots, console/page error checks, and route assertions

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
- Structure commands and validation: `src/lib/builder/structure.ts`
- Registry and rendering: `src/lib/builder/registry.tsx`
- Export generation: `src/lib/builder/export.ts`
- Command verification: `scripts/verify-builder-commands.ts`
