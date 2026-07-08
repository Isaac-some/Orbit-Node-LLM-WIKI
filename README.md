# 算子地图

AI 数据服务平台里的算子地图前端界面。它沿用原 Orbit 邮箱界面的暗色三栏交互骨架，但内容已经改为算子分类、算子列表和 Wiki 详情阅读。

## 功能范围

- 左侧：AI 数据服务平台信息架构侧边栏
- 中间：算子地图、搜索、Wiki 领域分类筛选、算子列表
- 右侧：算子名称、标签、收藏/删除、上一条/下一条，以及原始 Wiki Markdown 详情
- 数据：来自 `operator-workflow-advisor` 的启用算子 Wiki 快照

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React icons

## Commands

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```

## Project Structure

```text
src/app/page.tsx             Main operator map interface
src/lib/operator-data.ts     Generated operator catalog and Wiki Markdown
src/app/layout.tsx           App metadata
src/app/globals.css          Tailwind, theme tokens, global styles
src/lib/utils.ts             cn() class helper
```

This is a static frontend prototype. It does not execute operators or connect to production services.
