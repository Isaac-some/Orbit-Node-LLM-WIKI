<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 算子地图

## Product Intent

This project is an AI 数据服务平台 capability catalog. Its domain model is Handler (smallest execution unit), Flow (registered Handler group), and Pipeline (orchestrated business chain that may contain Flow, Handler, and inline steps).

The target product surface is:
- AI 数据服务平台 sidebar information architecture
- Handler category filtering based on verified domains
- Separate Handler, Flow, and Pipeline catalogs
- Structured details with provenance, cost/resource placeholder status, and steps
- Read-only behavior until external CRUD and test APIs are configured

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Lucide React icons

## Commands

- `npm run dev` — Start the local dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint, typecheck, and build

## Code Style

- TypeScript strict mode, no `any`
- Prefer named exports for shared components and helpers
- PascalCase React components, camelCase variables and functions
- Tailwind utility classes, no inline styles unless there is a strong reason
- 2-space indentation
- Mobile-first responsive behavior

## Design Direction

- Match the original Orbit mail interface interaction rhythm first; do not add unrelated pages or decorative marketing sections.
- Keep the UI dense, calm, and tool-like.
- Favor stable layout dimensions for panels, rows, toolbars, and buttons so the app does not jump around.
- Use icons for common tool actions where possible.
- Facts must come from source extraction or confirmed registration data. Do not invent IDs, relationships, inputs, outputs, costs, or behavior.
- Treat legacy tc-hawk `aigc.Flow` declarations as Pipeline candidates, never as confirmed new-model Flow records.
- Never expose source paths, commit hashes, credentials, or raw Wiki backlinks in the public bundle.

## Current Structure

```text
src/components/catalog-workspace.tsx  Main catalog interface
src/components/catalog-detail.tsx     Entity details and test entry
src/lib/catalog-types.ts              Handler/Flow/Pipeline contracts
src/lib/handler-data.ts               Generated public Handler data
src/lib/flow-data.ts                  Confirmed Flow records
src/lib/pipeline-data.ts              Generated Pipeline candidates
scripts/                              Repeatable data builders
src/app/layout.tsx           App metadata
src/app/globals.css          Tailwind, theme tokens, global styles
src/lib/utils.ts             cn() class helper
public/                      Static asset folders
```
