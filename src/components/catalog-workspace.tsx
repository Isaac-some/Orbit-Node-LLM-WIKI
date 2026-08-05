"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity, BarChart3, Bot, Boxes, ChevronDown, ChevronRight, Code2, Database, FileBarChart, FileText,
  Image, List, Map as MapIcon, PackageCheck, Plus, Search, ShieldCheck, Sparkles,
  Table2, UserRoundCog, Video, Workflow, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CatalogDetail } from "@/components/catalog-detail";
import { CatalogEditor } from "@/components/catalog-editor";
import type { CatalogEntityType, CatalogRecord, FlowRecord, HandlerDomain } from "@/lib/catalog-types";
import { formatCallCount, getActivityHealthLabel, getActivityHealthTone, getActivityMetricLabel, getActivityMetricValue, getCatalogPresentation, type ActivityMetric } from "@/lib/catalog-presentation";
import { loadDemoCatalog, saveDemoCatalog, trackDemoEvent, type DemoCatalogData } from "@/lib/demo-catalog";
import { flowRecords } from "@/lib/flow-data";
import { handlerRecords } from "@/lib/handler-data";
import { domainLabels } from "@/lib/handler-detail";
import { cn } from "@/lib/utils";

const initialCatalog: DemoCatalogData = { flows: flowRecords, handlers: handlerRecords };
const categoryFilters = [
  { key: "all", label: "全部算子", icon: Boxes }, { key: "ai-labeling", label: "AI 打标与模型", icon: Sparkles },
  { key: "video", label: "视频处理", icon: Video }, { key: "image", label: "图片处理", icon: Image },
  { key: "metadata", label: "媒体元数据", icon: FileBarChart }, { key: "storage", label: "存储、取数与链接", icon: PackageCheck },
  { key: "tabular", label: "表格与字段处理", icon: Table2 }, { key: "validation", label: "校验与过滤", icon: ShieldCheck },
  { key: "delivery", label: "预览与交付", icon: PackageCheck }, { key: "audio", label: "音频处理", icon: Bot }, { key: "hbase", label: "HBase 读写", icon: Database },
] as const;

type CategoryKey = (typeof categoryFilters)[number]["key"];
type CatalogMode = CatalogEntityType;
type EditorState = { initial?: CatalogRecord; type: CatalogEntityType };

const sidebarSections = [
  { label: "AI 数据内控矩阵", items: [
    { label: "图片看班数据集", icon: Database }, { label: "视频看板数据集", icon: FileBarChart },
    { label: "全量可视化（图片）", icon: FileText }, { label: "Demo 交付工具", icon: Bot, chevron: "right" as const },
    { label: "Tos系统", icon: FileBarChart }, { label: "机器标注平台", icon: Code2, chevron: "down" as const, children: [{ label: "资源入库" }, { label: "通用模板" }, { label: "算子地图", active: true }, { label: "项目管理" }] },
    { label: "内部模型工具", icon: FileText }, { label: "AI能力平台", icon: FileText },
  ] },
  { label: "AI 数据开放生态台", items: [{ label: "成品数据台", icon: Database }, { label: "众包&标注平台", icon: FileBarChart }] },
];

export function CatalogWorkspace() {
  const [mode, setMode] = useState<CatalogMode>("handler");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [activityMetric, setActivityMetric] = useState<ActivityMetric>("total");
  const [catalog, setCatalog] = useState<DemoCatalogData>(initialCatalog);
  const [hydrated, setHydrated] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogRecord | null>(null);
  const [toast, setToast] = useState("");
  const [selectedIds, setSelectedIds] = useState({ flow: flowRecords[0]?.flowId ?? "", handler: handlerRecords[0]?.handlerId ?? "" });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCatalog(loadDemoCatalog(initialCatalog));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) saveDemoCatalog(catalog); }, [catalog, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const records = useMemo<CatalogRecord[]>(() => mode === "handler" ? catalog.handlers : catalog.flows, [catalog, mode]);
  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      if (!developerMode && !isPublicRecord(record)) return false;
      if (record.entityType === "handler" && activeCategory !== "all" && !record.domains.includes(activeCategory as HandlerDomain)) return false;
      return !query || searchableText(record).toLowerCase().includes(query);
    });
  }, [activeCategory, developerMode, records, search]);
  const selectedRecord = visibleRecords.find((record) => recordId(record) === selectedIds[mode]);

  function changeMode(nextMode: CatalogMode) {
    setMode(nextMode);
    setActiveCategory("all");
    setSearch("");
    setDetailOpen(false);
  }
  function selectRecord(record: CatalogRecord) {
    const id = recordId(record);
    setSelectedIds((current) => ({ ...current, [record.entityType]: id }));
    setDetailOpen(true);
    trackDemoEvent({ entityId: id, entityType: record.entityType, event: "catalog_detail_view" });
  }
  function toggleDeveloperMode() {
    const next = !developerMode;
    setDeveloperMode(next);
    if (!next) {
      const selectedId = selectedIds[mode];
      const selected = (mode === "handler" ? catalog.handlers : catalog.flows).find((record) => recordId(record) === selectedId);
      if (selected && !isPublicRecord(selected)) {
        setSelectedIds((current) => ({ ...current, [mode]: "" }));
        setDetailOpen(false);
      }
    }
    trackDemoEvent({ event: "developer_mode_change", metadata: { enabled: next } });
  }
  function saveRecord(record: CatalogRecord) {
    const oldId = editor?.initial ? recordId(editor.initial) : "";
    const isEditing = Boolean(editor?.initial);
    setCatalog((current) => record.entityType === "handler"
      ? { ...current, handlers: isEditing ? current.handlers.map((item) => item.handlerId === oldId ? record : item) : [record, ...current.handlers] }
      : { ...current, flows: isEditing ? current.flows.map((item) => item.flowId === oldId ? record : item) : [record, ...current.flows] });
    const id = recordId(record);
    setSelectedIds((current) => ({ ...current, [record.entityType]: id }));
    setMode(record.entityType);
    setDetailOpen(true);
    setEditor(null);
    setToast(`${record.displayName}已${isEditing ? "更新" : "新增"}（演示数据）`);
    trackDemoEvent({ entityId: id, entityType: record.entityType, event: isEditing ? "catalog_update" : "catalog_create" });
  }
  function deleteRecord() {
    if (!deleteTarget) return;
    const id = recordId(deleteTarget);
    setCatalog((current) => deleteTarget.entityType === "handler"
      ? { ...current, handlers: current.handlers.filter((item) => item.handlerId !== id) }
      : { ...current, flows: current.flows.filter((item) => item.flowId !== id) });
    setDetailOpen(false);
    setDeleteTarget(null);
    setToast(`${deleteTarget.displayName}已删除（仅本地演示数据）`);
    trackDemoEvent({ entityId: id, entityType: deleteTarget.entityType, event: "catalog_delete" });
  }

  return (
    <main className="flex min-h-dvh bg-white text-gray-950 xl:h-dvh xl:min-h-[640px] xl:overflow-hidden">
      <PlatformSidebar />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-md bg-gray-950 text-white"><MapIcon className="size-5" /></span><h1 className="text-lg font-semibold">算子地图</h1></div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div aria-label="切换目录类型" className="flex rounded-md bg-gray-100 p-1">
                <ToolbarTab active={mode === "handler"} icon={List} label="算子" onClick={() => changeMode("handler")} />
                <ToolbarTab active={mode === "flow"} icon={Workflow} label="Flow" onClick={() => changeMode("flow")} />
              </div>
              <button aria-pressed={developerMode} className={cn("inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600", developerMode ? "bg-blue-600 text-white ring-blue-600 hover:bg-blue-500" : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50")} onClick={toggleDeveloperMode} type="button"><UserRoundCog className="size-4" />{developerMode ? "演示超管" : "只读视角"}</button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(360px,44%)_minmax(0,1fr)]">
          <section className={cn("min-h-0 min-w-0 flex-col border-r border-gray-200 bg-white xl:flex", detailOpen ? "hidden" : "flex")}>
            <div className="shrink-0 border-b border-gray-200 p-4 pb-3">
              {developerMode ? <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 ring-1 ring-amber-200">演示超管视角可查看未上线和历史数据；修改仅保存在当前浏览器。</p> : null}
              <div className="flex gap-2">
                <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md bg-gray-50 px-3 text-sm text-gray-600 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-600"><Search className="size-4 shrink-0" /><input className="w-full bg-transparent text-gray-950 outline-none placeholder:text-gray-400" onChange={(event) => setSearch(event.target.value)} placeholder={mode === "handler" ? "搜索算子名称、ID、领域..." : "搜索 Flow 名称、ID、步骤..."} ref={searchRef} type="search" value={search} /><kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-500 sm:block">/</kbd></label>
                {developerMode ? <button aria-label={`新增${mode === "handler" ? "算子" : " Flow"}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2" onClick={() => setEditor({ type: mode })} title={`新增${mode === "handler" ? "算子" : " Flow"}`} type="button"><Plus className="size-4" /><span className="hidden sm:inline">新增{mode === "handler" ? "算子" : " Flow"}</span></button> : null}
              </div>
              {mode === "handler" ? <div className="orbit-scroll mt-3 flex gap-2 overflow-x-auto pb-1">{categoryFilters.map(({ icon: Icon, key, label }) => <button aria-label={label} aria-pressed={activeCategory === key} className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600", activeCategory === key && "w-auto gap-2 bg-blue-600 px-3 text-white ring-blue-600 hover:bg-blue-500")} key={key} onClick={() => setActiveCategory(key)} title={label} type="button"><Icon className="size-4" />{activeCategory === key ? <span className="whitespace-nowrap text-xs font-semibold">{label}</span> : null}</button>)}</div> : null}
              {developerMode ? <ActivityMetricControl metric={activityMetric} onChange={setActivityMetric} /> : null}
            </div>
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-gray-200 px-4 text-xs text-gray-500"><span>{visibleRecords.length} 项</span><span>{developerMode ? "含演示超管可见数据" : mode === "flow" ? "仅已上线 Flow" : "仅已启用算子"}</span></div>
            <div className="orbit-scroll min-h-0 flex-1 overflow-y-auto p-2">{visibleRecords.length ? <ul>{visibleRecords.map((record) => <CatalogRow active={recordId(record) === selectedIds[mode]} developerMode={developerMode} key={`${record.entityType}-${recordId(record)}`} metric={activityMetric} onSelect={() => selectRecord(record)} record={record} />)}</ul> : <EmptyState mode={mode} searching={Boolean(search.trim())} />}</div>
          </section>
          <CatalogDetail className={cn(detailOpen ? "flex" : "hidden xl:flex")} developerMode={developerMode} flows={catalog.flows} onClose={() => setDetailOpen(false)} onDelete={setDeleteTarget} onEdit={(record) => setEditor({ initial: record, type: record.entityType })} record={selectedRecord} />
        </div>
      </section>

      {editor ? <CatalogEditor entityType={editor.type} existingIds={[...catalog.handlers.map((item) => item.handlerId), ...catalog.flows.map((item) => item.flowId)]} initial={editor.initial} onCancel={() => setEditor(null)} onSave={saveRecord} /> : null}
      {deleteTarget ? <DeleteDialog onCancel={() => setDeleteTarget(null)} onConfirm={deleteRecord} record={deleteTarget} /> : null}
      {toast ? <div aria-live="polite" className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-md bg-gray-950 px-4 py-3 text-sm font-medium text-white shadow-lg"><span className="size-2 rounded-full bg-emerald-400" />{toast}</div> : null}
    </main>
  );
}

function DeleteDialog({ onCancel, onConfirm, record }: { onCancel: () => void; onConfirm: () => void; record: CatalogRecord }) { return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section aria-labelledby="delete-title" aria-modal="true" className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" role="alertdialog"><div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-gray-950" id="delete-title">删除{record.entityType === "handler" ? "算子" : " Flow"}？</h2><p className="mt-2 text-sm leading-6 text-gray-600">将从当前浏览器的演示目录删除“{record.displayName}”，刷新页面也不会恢复。</p></div><button aria-label="关闭删除确认" className="grid size-11 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-gray-100" onClick={onCancel} type="button"><X className="size-5" /></button></div><div className="mt-5 flex justify-end gap-2"><button className="min-h-11 rounded-md px-4 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50" onClick={onCancel} type="button">取消</button><button className="min-h-11 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500" onClick={onConfirm} type="button">确认删除</button></div></section></div>; }
function ToolbarTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) { return <button aria-pressed={active} className={cn("inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600", active && "bg-white text-gray-950 shadow-sm")} onClick={onClick} type="button"><Icon className="size-4" />{label}</button>; }
function ActivityMetricControl({ metric, onChange }: { metric: ActivityMetric; onChange: (metric: ActivityMetric) => void }) { return <div aria-label="研发视角统计口径" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-blue-50 px-3 py-2 ring-1 ring-blue-100"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900"><BarChart3 className="size-3.5" />列表统计</span><div className="flex rounded-md bg-white p-1 ring-1 ring-blue-100">{(["total", "7d", "30d"] as ActivityMetric[]).map((option) => <button aria-pressed={metric === option} className={cn("min-h-8 rounded px-2.5 text-xs font-semibold text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600", metric === option && "bg-blue-600 text-white shadow-sm")} key={option} onClick={() => onChange(option)} type="button">{getActivityMetricLabel(option)}</button>)}</div></div>; }
function CatalogRow({ active, developerMode, metric, onSelect, record }: { active: boolean; developerMode: boolean; metric: ActivityMetric; onSelect: () => void; record: CatalogRecord }) { const isHandler = record.entityType === "handler"; const presentation = getCatalogPresentation(record); const displayedMetric = developerMode ? metric : "total"; const metricValue = getActivityMetricValue(presentation.activity, displayedMetric); return <li><button aria-current={active ? "true" : undefined} className={cn("grid w-full grid-cols-[42px_minmax(0,1fr)_auto] gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600", active && "bg-blue-50")} onClick={onSelect} type="button"><span className={cn("mt-1 grid size-9 place-items-center rounded-full text-xs font-semibold", isHandler ? "bg-gray-200 text-gray-700" : "bg-amber-100 text-amber-800")}>{isHandler ? record.initial : <Workflow className="size-4" />}</span><span className="min-w-0"><span className="flex min-w-0 flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-gray-950">{record.displayName}</span><StatusBadge record={record} /></span><span className="mt-1 block break-all font-mono text-xs text-gray-500">{recordId(record)}</span><span className="mt-1 block truncate text-xs text-gray-600">{isHandler ? record.domains.map((domain) => domainLabels[domain]).join("；") : `${record.serviceDomain} · ${record.steps.length} 个步骤`}</span><span className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800 ring-1 ring-cyan-200">{presentation.behavior.label}</span><span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-gray-700"><Activity className="size-3 text-gray-500" />{getActivityMetricLabel(displayedMetric)} {formatCallCount(metricValue)}</span>{developerMode ? <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", getActivityHealthTone(presentation.activity.health))}><span className="size-1.5 rounded-full bg-current" />{getActivityHealthLabel(presentation.activity.health)}</span> : null}</span><span className="mt-2 block line-clamp-2 text-xs leading-5 text-gray-600">{presentation.capabilityDescription}</span><span className="mt-1 block text-[11px] text-gray-500">演示统计</span></span><ChevronRight className="mt-2 size-4 text-gray-400" /></button></li>; }
function StatusBadge({ record }: { record: CatalogRecord }) { const status = record.entityType === "handler" ? record.status === "enabled" ? "已启用" : "已禁用" : flowStatusLabel(record.status); const tone = record.entityType === "handler" ? record.status === "enabled" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200" : record.status === "published" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : record.status === "unpublished" ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-gray-100 text-gray-600 ring-gray-200"; return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", tone)}>{status}</span>; }
function EmptyState({ mode, searching }: { mode: CatalogMode; searching: boolean }) { return <div className="grid min-h-64 place-items-center px-6 text-center"><div><Search className="mx-auto size-7 text-gray-400" /><p className="mt-3 text-sm font-medium text-gray-800">{searching ? "没有匹配结果" : "暂无目录数据"}</p>{searching ? <p className="mt-1 text-xs leading-5 text-gray-500">{mode === "flow" ? "可以尝试搜索 Flow 名称、ID 或步骤。" : "可以尝试搜索算子名称、ID 或领域。"}</p> : mode === "flow" ? <p className="mt-1 text-xs leading-5 text-gray-500">只读视角仅展示已上线 Flow。</p> : null}</div></div>; }
function PlatformSidebar() { return <aside className="orbit-scroll hidden w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 xl:block"><div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4"><span className="grid size-8 place-items-center rounded-md bg-gray-950 text-white"><Code2 className="size-4" /></span><div><p className="text-sm font-semibold">机器标注平台</p><p className="text-[11px] text-gray-500">内部能力目录</p></div></div><nav className="px-2 py-3" aria-label="平台导航">{sidebarSections.map((section) => <div className="mb-5" key={section.label}><p className="px-2 pb-2 text-[11px] font-semibold text-gray-400">{section.label}</p><div className="space-y-0.5">{section.items.map((item) => <SidebarNode item={item} key={item.label} />)}</div></div>)}</nav></aside>; }
function SidebarNode({ item }: { item: { active?: boolean; children?: Array<{ active?: boolean; label: string }>; chevron?: "down" | "right"; icon?: LucideIcon; label: string } }) { const Icon = item.icon; return <div><div className={cn("flex min-h-9 items-center gap-2 rounded-md px-2 text-xs", item.active ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-600")}>{Icon ? <Icon className="size-3.5 shrink-0" /> : <span className="size-3.5" />}<span className="min-w-0 flex-1 truncate">{item.label}</span>{item.chevron === "down" ? <ChevronDown className="size-3.5" /> : item.chevron === "right" ? <ChevronRight className="size-3.5" /> : null}</div>{item.children ? <div className="ml-4 border-l border-gray-200 pl-2">{item.children.map((child) => <SidebarNode item={child} key={child.label} />)}</div> : null}</div>; }
function isPublicRecord(record: CatalogRecord) { return record.entityType === "handler" ? record.status === "enabled" : record.status === "published"; }
function recordId(record: CatalogRecord) { return record.entityType === "handler" ? record.handlerId : record.flowId; }
function searchableText(record: CatalogRecord) { const presentation = getCatalogPresentation(record); return record.entityType === "handler" ? [record.handlerId, record.displayName, presentation.capabilityDescription, presentation.behavior.label, ...record.domains.map((domain) => domainLabels[domain])].join(" ") : [record.flowId, record.displayName, presentation.capabilityDescription, presentation.behavior.label, record.serviceDomain, ...record.steps.map((step) => step.displayName)].join(" "); }
function flowStatusLabel(status: FlowRecord["status"]) { return { archived: "历史归档", published: "已上线", unpublished: "未上线" }[status]; }
