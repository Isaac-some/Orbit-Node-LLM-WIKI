"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  FileBarChart,
  FileText,
  HardDrive,
  Image,
  Layers3,
  Map as MapIcon,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Video,
  Workflow,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { CatalogDetail } from "@/components/catalog-detail";
import type {
  CatalogEntityType,
  CatalogRecord,
  HandlerDomain,
} from "@/lib/catalog-types";
import { flowRecords } from "@/lib/flow-data";
import { handlerRecords } from "@/lib/handler-data";
import { domainLabels } from "@/lib/handler-detail";
import { pipelineRecords } from "@/lib/pipeline-data";
import { cn } from "@/lib/utils";

const categoryFilters = [
  { key: "all", label: "全部算子", icon: Boxes },
  { key: "ai-labeling", label: "AI 打标与模型", icon: Sparkles },
  { key: "video", label: "视频处理", icon: Video },
  { key: "image", label: "图片处理", icon: Image },
  { key: "metadata", label: "媒体元数据", icon: FileBarChart },
  { key: "storage", label: "存储、取数与链接", icon: HardDrive },
  { key: "tabular", label: "表格与字段处理", icon: Table2 },
  { key: "validation", label: "校验与过滤", icon: ShieldCheck },
  { key: "delivery", label: "预览与交付", icon: PackageCheck },
  { key: "audio", label: "音频处理", icon: Bot },
  { key: "hbase", label: "HBase 读写", icon: Database },
] as const;

type CategoryKey = (typeof categoryFilters)[number]["key"];

const sidebarSections = [
  {
    label: "AI 数据内控矩阵",
    items: [
      { label: "图片看班数据集", icon: Database },
      { label: "视频看板数据集", icon: FileBarChart },
      { label: "全量可视化（图片）", icon: FileText },
      { label: "Demo 交付工具", icon: Bot, chevron: "right" as const },
      { label: "Tos系统", icon: FileBarChart },
      {
        label: "机器标注平台",
        icon: Code2,
        chevron: "down" as const,
        children: [
          { label: "资源入库" },
          { label: "通用模板" },
          { label: "算子地图", active: true },
          { label: "项目管理" },
        ],
      },
      { label: "内部模型工具", icon: FileText },
      { label: "AI能力平台", icon: FileText },
    ],
  },
  {
    label: "AI 数据开放生态台",
    items: [
      { label: "成品数据台", icon: Database },
      { label: "众包&标注平台", icon: FileBarChart },
    ],
  },
];

const modes: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  mode: CatalogEntityType;
}> = [
  { mode: "handler", label: "算子", description: "最小执行单元", icon: Layers3 },
  { mode: "flow", label: "Flow", description: "Handler 组", icon: Boxes },
  { mode: "pipeline", label: "Pipeline", description: "编排链路", icon: Workflow },
];

export function CatalogWorkspace() {
  const [mode, setMode] = useState<CatalogEntityType>("handler");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<CatalogEntityType, string>>({
    handler: handlerRecords[0]?.handlerId ?? "",
    flow: flowRecords[0]?.flowId ?? "",
    pipeline: pipelineRecords[0]?.pipelineId ?? "",
  });
  const searchRef = useRef<HTMLInputElement>(null);

  const records = useMemo<CatalogRecord[]>(() => {
    if (mode === "handler") return handlerRecords;
    if (mode === "flow") return flowRecords;
    return pipelineRecords;
  }, [mode]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      if (
        record.entityType === "handler" &&
        activeCategory !== "all" &&
        !record.domains.includes(activeCategory as HandlerDomain)
      ) {
        return false;
      }

      if (!query) return true;
      return searchableText(record).toLowerCase().includes(query);
    });
  }, [activeCategory, records, search]);

  const selectedRecord = records.find(
    (record) => recordId(record) === selectedIds[mode],
  );

  function changeMode(nextMode: CatalogEntityType) {
    setMode(nextMode);
    setActiveCategory("all");
    setSearch("");
    setDetailOpen(false);
  }

  function selectRecord(record: CatalogRecord) {
    setSelectedIds((current) => ({
      ...current,
      [record.entityType]: recordId(record),
    }));
    setDetailOpen(true);
  }

  return (
    <main className="flex h-dvh min-h-[640px] overflow-hidden bg-gray-100 text-gray-950">
      <PlatformSidebar />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapIcon className="size-5 text-cyan-700" />
                <h1 className="text-base font-semibold">算子地图</h1>
              </div>
              <p className="mt-1 text-xs text-gray-500">Handler → Flow → Pipeline</p>
            </div>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
              只读目录
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md bg-gray-100 p-1" aria-label="目录类型">
            {modes.map(({ description, icon: Icon, label, mode: itemMode }) => (
              <button
                aria-pressed={mode === itemMode}
                className={cn(
                  "flex min-h-12 min-w-0 items-center justify-center gap-2 rounded px-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600",
                  mode === itemMode ? "bg-white text-gray-950 shadow-sm" : "text-gray-600 hover:text-gray-950",
                )}
                key={itemMode}
                onClick={() => changeMode(itemMode)}
                type="button"
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{label}</span>
                  <span className="hidden truncate text-[11px] text-gray-500 sm:block">{description}</span>
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,42%)_minmax(0,1fr)]">
          <section className={cn("min-h-0 min-w-0 flex-col border-r border-gray-200 bg-white", detailOpen ? "hidden lg:flex" : "flex")}>
            <div className="shrink-0 border-b border-gray-200 px-3 py-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="h-11 w-full rounded-md bg-gray-50 pl-9 pr-3 text-base text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-600 sm:text-sm"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`搜索${modes.find((item) => item.mode === mode)?.label ?? "目录"}名称或 ID`}
                  ref={searchRef}
                  type="search"
                  value={search}
                />
              </label>
            </div>

            {mode === "handler" ? (
              <div className="orbit-scroll flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-3 py-2 lg:flex-wrap">
                {categoryFilters.map(({ icon: Icon, key, label }) => (
                  <button
                    aria-pressed={activeCategory === key}
                    className={cn(
                      "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600",
                      activeCategory === key ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200" : "text-gray-600 hover:bg-gray-100",
                    )}
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    type="button"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex h-9 shrink-0 items-center justify-between border-b border-gray-200 px-3 text-xs text-gray-500">
              <span>{visibleRecords.length} 项</span>
              <span>{mode === "pipeline" ? "源码候选" : mode === "flow" ? "已登记" : "已导入"}</span>
            </div>

            <div className="orbit-scroll min-h-0 flex-1 overflow-y-auto">
              {visibleRecords.length ? (
                <ul className="divide-y divide-gray-200">
                  {visibleRecords.map((record) => (
                    <CatalogRow
                      active={recordId(record) === selectedIds[mode]}
                      key={`${record.entityType}-${recordId(record)}`}
                      onSelect={() => selectRecord(record)}
                      record={record}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState mode={mode} searching={Boolean(search.trim())} />
              )}
            </div>
          </section>

          <CatalogDetail
            className={cn(detailOpen ? "flex" : "hidden lg:flex")}
            onClose={() => setDetailOpen(false)}
            record={selectedRecord}
          />
        </div>
      </section>
    </main>
  );
}

function CatalogRow({ active, onSelect, record }: { active: boolean; onSelect: () => void; record: CatalogRecord }) {
  const Icon = record.entityType === "handler" ? Layers3 : record.entityType === "flow" ? Boxes : Workflow;
  const tone = record.entityType === "handler" ? "bg-cyan-700 text-white" : record.entityType === "flow" ? "bg-emerald-700 text-white" : "bg-amber-500 text-gray-950";

  return (
    <li>
      <button
        className={cn(
          "flex min-h-24 w-full items-start gap-3 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-600",
          active ? "bg-cyan-50/70" : "hover:bg-gray-50",
        )}
        onClick={onSelect}
        type="button"
      >
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", tone)}><Icon className="size-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-semibold text-gray-950">{record.displayName}</span>
          <span className="mt-1 block break-all font-mono text-xs text-gray-500">{recordId(record)}</span>
          <span className="mt-2 block text-xs leading-5 text-gray-600">{recordSecondary(record)}</span>
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-gray-400" />
      </button>
    </li>
  );
}

function EmptyState({ mode, searching }: { mode: CatalogEntityType; searching: boolean }) {
  const Icon = mode === "handler" ? Layers3 : mode === "flow" ? Boxes : Workflow;
  const message = searching
    ? "没有匹配结果。"
    : mode === "flow"
      ? "暂无已确认的 Flow。旧源码 Flow 已进入 Pipeline 候选，不会自动降级成 Handler 组。"
      : "暂无目录数据。";

  return (
    <div className="grid min-h-64 place-items-center px-6 text-center">
      <div className="max-w-sm">
        <Icon className="mx-auto size-8 text-gray-400" />
        <p className="mt-3 text-sm font-medium text-gray-800">{message}</p>
      </div>
    </div>
  );
}

function PlatformSidebar() {
  return (
    <aside className="orbit-scroll hidden w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white xl:block">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="grid size-8 place-items-center rounded-md bg-gray-950 text-white"><Code2 className="size-4" /></span>
        <div><p className="text-sm font-semibold">机器标注平台</p><p className="text-[11px] text-gray-500">内部能力目录</p></div>
      </div>
      <nav className="px-2 py-3" aria-label="平台导航">
        {sidebarSections.map((section) => (
          <div className="mb-5" key={section.label}>
            <p className="px-2 pb-2 text-[11px] font-semibold text-gray-400">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => <SidebarNode item={item} key={item.label} />)}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarNode({ item }: { item: { active?: boolean; children?: Array<{ active?: boolean; label: string }>; chevron?: "down" | "right"; icon?: LucideIcon; label: string } }) {
  const Icon = item.icon;
  return (
    <div>
      <div className={cn("flex min-h-9 items-center gap-2 rounded-md px-2 text-xs", item.active ? "bg-cyan-50 font-semibold text-cyan-800" : "text-gray-600") }>
        {Icon ? <Icon className="size-3.5 shrink-0" /> : <span className="size-3.5" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.chevron === "down" ? <ChevronDown className="size-3.5" /> : item.chevron === "right" ? <ChevronRight className="size-3.5" /> : null}
      </div>
      {item.children ? <div className="ml-4 border-l border-gray-200 pl-2">{item.children.map((child) => <SidebarNode item={child} key={child.label} />)}</div> : null}
    </div>
  );
}

function recordId(record: CatalogRecord) {
  if (record.entityType === "handler") return record.handlerId;
  if (record.entityType === "flow") return record.flowId;
  return record.pipelineId;
}

function searchableText(record: CatalogRecord) {
  if (record.entityType === "handler") {
    return [record.handlerId, record.displayName, record.intro, ...record.domains.map((domain) => domainLabels[domain])].join(" ");
  }
  if (record.entityType === "flow") {
    return [record.flowId, record.displayName, ...record.steps.map((step) => step.displayName)].join(" ");
  }
  return [record.pipelineId, record.displayName, ...record.sourceFlowIds, ...record.steps.map((step) => step.displayName)].join(" ");
}

function recordSecondary(record: CatalogRecord) {
  if (record.entityType === "handler") return `${record.domains.map((domain) => domainLabels[domain]).join(" · ")} · ${record.cardinality}`;
  if (record.entityType === "flow") return `${record.steps.length} 个步骤 · ${record.reusable ? "可复用" : "不可复用"}`;
  const inlineCount = record.steps.filter((step) => step.stepKind === "inline").length;
  return `${record.sourceFlowIds.length} 个旧 Flow 来源 · ${record.steps.length} 个步骤 · ${inlineCount} 个内联步骤`;
}
