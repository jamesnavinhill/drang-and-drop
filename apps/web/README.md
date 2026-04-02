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

- `Left Sidebar`
  - collapsible workspace rail
  - `Pages`
  - `Library`
  - `Assistant`
  - `Settings`
- `Canvas Workspace`
  - compact workspace header for preview mode, history, selection clear, export, and reset
  - reduced canvas chrome with page-region and block-region drop surfaces
- `Right Inspector`
  - collapsible inspector rail
  - `Selection`
  - `Page`
  - `Theme`

Both side panels now support collapsible sections inside the panel content so the builder can stay compact while still exposing structure and editing controls.

## Core Workflow Features

- schema-driven multi-page builder state with undo/redo history
- compact three-pane editor shell with collapsible left and right rails
- shared structure-command layer for insert, move, duplicate, and remove operations
- structural project validation for import, persisted state hydration, and command-safe mutations
- drag/drop composition with constrained layout primitives, explicit page-region and block-region placement targets, live invalid-drop feedback, and node drags that follow the pointer instead of only swapping to a metadata ghost
- tabbed pages workspace with route management and page outline/layers controls
- contextual library filtering plus full-catalog placement hints based on the active insertion target
- separate internal family taxonomy and user-facing library grouping so the catalog stays reviewable in code and easier to browse in the product
- shared editor notices surfaced at the studio shell level for failed structure-sensitive actions
- outline insertion context cues that match the library and canvas targeting model
- shared node structure actions across outline and inspector so reorder/duplicate/remove stay aligned
- split builder block definitions, placement rules, and preview rendering modules so the registry layer is no longer the implementation catch-all
- shared content parsing/fallback helpers now back builder preview and generated-starter render support so export parity relies on fewer duplicated block contracts
- sharper default theme tokens with smaller radii, lighter surfaces, and tighter spacing so the editor reads more like a production app shell than a demo board
- project JSON import/export for backup and reuse
- starter templates for marketing and internal-tool starting points
- expanded first-party block catalog spanning launch-page, proof, CTA, metric, empty-state, and workspace-header primitives
- slot-owning composite blocks for `pricingCard`, `ctaBanner`, `formCard`, `emptyState`, and `workspaceHeader` so the builder can grow more composable internals without turning every block into a generic container
- zip export to a runnable `Next.js` starter
- browser-backed builder drag verification for live palette insertion and node reorder flows, paired with the deterministic builder verification hook for structural invalid-drop and deeper composition assertions
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
- Canonical block contracts: `src/lib/builder/block-contracts.ts`
- Derived block catalog metadata: `src/lib/builder/block-catalog.ts`
- Shared content parsing: `src/lib/builder/block-content.ts`
- Block definitions: `src/lib/builder/block-definitions.ts`
- Placement rules: `src/lib/builder/block-placement.ts`
- Preview rendering: `src/lib/builder/block-preview.tsx`
- Internal parity coverage project: `src/lib/builder/verification-project.ts`
- Generated render support source: `src/lib/builder/starter-render-support.ts`
- Export generation: `src/lib/builder/export.ts`
- Command verification: `scripts/verify-builder-commands.ts`
