# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js version warning

This project uses **Next.js 16.2.6** (canary/pre-release-era APIs), which has breaking changes vs. the Next.js you were trained on — APIs, conventions, and file structure may differ. Before writing Next.js-specific code, check the relevant guide in `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`) and heed any deprecation notices.

`npm run build` and `npm run lint` currently pass clean — no known breakage from the 16.x upgrade. Note: Next.js 16's flagship feature, [Instant Navigation / Cache Components](node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md) (`unstable_instant`, `use cache`, Suspense-based static shells), does not apply here — this app is a fully static export (`output: "export"` in `next.config.ts`) with a single route and no server data fetching, so there's nothing for it to optimize. Don't introduce it unless the app moves off static export.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Architecture

Next.js App Router + TypeScript app for planning tasks on a timebox grid (member × day × hours).

- **State**: single Zustand store (`src/store/usePlannerStore.ts`), persisted to localStorage under the key `timebox-planner`. Holds `members`, `projects`, and `tasks` and all mutation actions — there is no server/database layer, everything is client-side state.
- **Domain types** (`src/types/index.ts`): `Member`, `Project`, `Task`, `Placement`. A `Task` belongs to one `Member`/`Project`, has an `estimatedHours` and `deadline`, and holds an array of `Placement`s (one placement = a block of hours assigned to a specific date). `addPlacement` replaces any existing placement for the same date on that task.
- **UI structure**:
  - `src/app/` — App Router entry (`layout.tsx`, `page.tsx`).
  - `src/components/timeline/TimelineGrid.tsx` — the core grid where tasks are placed against members/days; uses `@dnd-kit` for drag-and-drop.
  - `src/components/task/` — task creation/edit (`TaskDialog`) and placing a task onto the grid (`TaskPlacementDialog`).
  - `src/components/member/MemberDialog.tsx` — member management.
  - `src/components/ui/` — shadcn-generated primitives (button, dialog, input, select, etc.) — treat these as generated code, prefer composing over rewriting.
- **Styling**: Tailwind CSS v4 (`src/app/globals.css`, no `tailwind.config`), shadcn `base-nova` style with `neutral` base color, icons via `lucide-react`. Import alias `@/*` maps to `src/*` (see `components.json` for the exact alias map: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
