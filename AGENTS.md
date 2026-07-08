<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 算子地图

## Product Intent

This project is an AI 数据服务平台 operator map frontend. Keep the work centered on browsing, filtering, and reading enabled operator Wiki cards, not a marketing website or general cloning scaffold.

The target product surface is:
- AI 数据服务平台 sidebar information architecture
- Operator category filtering based on the enabled operator Wiki domains
- Operator list rows with name, ID, labels, short intro, and weekly launch count
- Detail pane with operator name, labels, favorite/delete, previous/next, and raw Wiki Markdown
- Local-only UI interactions; do not execute operators or call production services

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
- Operator facts must come from the enabled operator Wiki. Do not invent operator IDs, categories, inputs, outputs, risks, or behavior.

## Current Structure

```text
src/app/page.tsx             Main operator map interface
src/lib/operator-data.ts     Generated operator catalog and Wiki Markdown
src/app/layout.tsx           App metadata
src/app/globals.css          Tailwind, theme tokens, global styles
src/lib/utils.ts             cn() class helper
public/                      Static asset folders
```
