"use client";

import type { FormEvent, ReactNode, RefObject } from "react";
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
  GitBranch,
  HardDrive,
  Image,
  Layers3,
  List,
  Map as MapIcon,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { OperatorDetailPane } from "@/components/operator-detail-pane";
import { OperatorLineageMap } from "@/components/operator-lineage-map";
import { domainLabels } from "@/lib/operator-detail";
import { operatorRecords, type OperatorDomain, type OperatorRecord } from "@/lib/operator-data";
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
type WorkspaceView = "catalog" | "lineage";

type SidebarItem = {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  chevron?: "right" | "down";
  children?: SidebarItem[];
};

type OperatorFormState = {
  id: string;
  displayName: string;
  domains: OperatorDomain[];
  intro: string;
  behavior: string;
  cardinality: string;
  weeklyRuns: string;
  wiki: string;
};

const sidebarSections: Array<{ label: string; items: SidebarItem[] }> = [
  {
    label: "AI 数据内控矩阵",
    items: [
      { label: "图片看班数据集", icon: Database },
      { label: "视频看板数据集", icon: FileBarChart },
      { label: "全量可视化（图片）", icon: FileText },
      { label: "Demo 交付工具", icon: Bot, chevron: "right" },
      { label: "Tos系统", icon: FileBarChart },
      {
        label: "机器标注平台",
        icon: Code2,
        chevron: "down",
        children: [
          {
            label: "资源入库",
            children: [{ label: "新建项目" }, { label: "历史记录" }],
          },
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

function createBlankOperatorForm(): OperatorFormState {
  return {
    id: "",
    displayName: "",
    domains: ["ai-labeling"],
    intro: "",
    behavior: "enrich",
    cardinality: "1:1",
    weeklyRuns: "0",
    wiki: "",
  };
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [selectedId, setSelectedId] = useState(operatorRecords[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("catalog");
  const [compactDetailOpen, setCompactDetailOpen] = useState(false);
  const [customOperators, setCustomOperators] = useState<OperatorRecord[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>([operatorRecords[0]?.id ?? ""]);
  const [addOpen, setAddOpen] = useState(false);
  const [operatorForm, setOperatorForm] = useState<OperatorFormState>(() =>
    createBlankOperatorForm()
  );
  const [toast, setToast] = useState("算子地图已就绪");
  const searchRef = useRef<HTMLInputElement>(null);

  const allOperators = useMemo(
    () => [...customOperators, ...operatorRecords],
    [customOperators]
  );

  const visibleOperators = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allOperators.filter((operator) => {
      if (removedIds.includes(operator.id)) return false;
      if (activeCategory !== "all" && !operator.domains.includes(activeCategory)) return false;
      if (!query) return true;

      return [
        operator.id,
        operator.displayName,
        operator.intro,
        operator.behavior,
        operator.cardinality,
        operator.domains.map((domain) => domainLabels[domain]).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [activeCategory, allOperators, removedIds, search]);

  const selectedOperator =
    visibleOperators.find((operator) => operator.id === selectedId) ?? visibleOperators[0];

  function chooseOperator(operator: OperatorRecord) {
    setSelectedId(operator.id);
    setCompactDetailOpen(true);
  }

  function selectAdjacent(direction: 1 | -1) {
    if (!selectedOperator || visibleOperators.length === 0) return;
    const index = visibleOperators.findIndex((operator) => operator.id === selectedOperator.id);
    const nextIndex = Math.min(Math.max(index + direction, 0), visibleOperators.length - 1);
    setSelectedId(visibleOperators[nextIndex].id);
  }

  function closeDetail() {
    setCompactDetailOpen(false);
    setSelectedId("");
  }

  function deleteOperator(id: string) {
    setRemovedIds((current) => [...current, id]);
    setSelectedId("");
    setCompactDetailOpen(false);
    setToast("已从当前视图移除");
  }

  function toggleStar(id: string) {
    setStarredIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
    setToast("收藏状态已更新");
  }

  function openDetailFromMap(operatorId: string) {
    setSelectedId(operatorId);
    setCompactDetailOpen(true);
    setWorkspaceView("catalog");
  }

  function toggleFormDomain(domain: OperatorDomain) {
    setOperatorForm((current) => {
      const hasDomain = current.domains.includes(domain);
      if (hasDomain && current.domains.length === 1) return current;

      return {
        ...current,
        domains: hasDomain
          ? current.domains.filter((item) => item !== domain)
          : [...current.domains, domain],
      };
    });
  }

  function submitOperator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const id = operatorForm.id.trim();
    const displayName = operatorForm.displayName.trim();

    if (!id || !displayName) {
      setToast("请先填写算子 ID 和算子名称");
      return;
    }

    if (allOperators.some((operator) => operator.id === id)) {
      setToast("这个算子 ID 已存在");
      return;
    }

    const intro = operatorForm.intro.trim() || "待补充算子简介。";
    const detailedDescription = operatorForm.wiki.trim() || intro;
    const behavior = operatorForm.behavior.trim() || "unknown";
    const cardinality = operatorForm.cardinality.trim() || "unknown";
    const wiki = `# ${id} — ${displayName}\n\n## 决策\n\n- **适用**：${detailedDescription}\n- **不适用**：暂无明确限制说明。\n- **行为**：${behavior}；基数 ${cardinality}；执行 unknown。\n- **硬依赖**：无已知硬依赖\n\n## 数据输入\n\n暂无固定字段说明。\n\n## 配置\n\n无用户配置。\n\n## 输出\n\n暂无固定字段说明。\n\n## 风险\n\n- 上线前请补充输入输出和失败处理说明。`;

    const newOperator: OperatorRecord = {
      id,
      displayName,
      initial: displayName.slice(0, 1).toUpperCase(),
      domains: operatorForm.domains,
      behavior,
      cardinality,
      intro,
      weeklyRuns: operatorForm.weeklyRuns.trim() || "0",
      wiki,
    };

    setCustomOperators((current) => [newOperator, ...current]);
    setSelectedId(newOperator.id);
    setCompactDetailOpen(true);
    setActiveCategory("all");
    setWorkspaceView("catalog");
    setAddOpen(false);
    setOperatorForm(createBlankOperatorForm());
    setToast("算子已添加到当前视图");
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === "/" && !isTyping && !addOpen && workspaceView === "catalog") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        if (addOpen) setAddOpen(false);
        else if (compactDetailOpen) setCompactDetailOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addOpen, compactDetailOpen, workspaceView]);

  return (
    <main className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-gray-100 text-gray-950">
      <div className="grid h-full min-h-0 overflow-hidden bg-gray-100 lg:grid-cols-[260px_minmax(0,1fr)]">
        <PlatformSidebar />

        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          <WorkspaceHeader
            onAdd={() => setAddOpen(true)}
            onViewChange={setWorkspaceView}
            view={workspaceView}
          />

          {workspaceView === "catalog" ? (
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(430px,580px)_minmax(480px,1fr)]">
              <OperatorList
                activeCategory={activeCategory}
                className={compactDetailOpen ? "hidden xl:flex" : "flex"}
                onCategory={setActiveCategory}
                onChoose={chooseOperator}
                onSearch={setSearch}
                operators={visibleOperators}
                search={search}
                searchRef={searchRef}
                selectedId={selectedOperator?.id}
                starredIds={starredIds}
              />

              <OperatorDetailPane
                className={compactDetailOpen ? "flex" : "hidden xl:flex"}
                isStarred={selectedOperator ? starredIds.includes(selectedOperator.id) : false}
                onClose={closeDetail}
                onDelete={deleteOperator}
                onNext={() => selectAdjacent(1)}
                onPrevious={() => selectAdjacent(-1)}
                onStar={toggleStar}
                operator={selectedId ? selectedOperator : undefined}
              />
            </div>
          ) : (
            <OperatorLineageMap
              onOpenDetail={openDetailFromMap}
              operators={allOperators.filter((operator) => !removedIds.includes(operator.id))}
              selectedId={selectedOperator?.id}
            />
          )}
        </section>
      </div>

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-3 right-5 z-40 rounded-full bg-gray-950/88 px-3 py-1.5 text-xs text-gray-100"
      >
        {toast}
      </div>

      {addOpen ? (
        <AddOperatorDialog
          draft={operatorForm}
          onChange={setOperatorForm}
          onClose={() => setAddOpen(false)}
          onSubmit={submitOperator}
          onToggleDomain={toggleFormDomain}
        />
      ) : null}
    </main>
  );
}

function WorkspaceHeader({
  onAdd,
  onViewChange,
  view,
}: {
  onAdd: () => void;
  onViewChange: (view: WorkspaceView) => void;
  view: WorkspaceView;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5">
      <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-50 px-3 text-sm font-semibold text-gray-950 ring-1 ring-gray-200">
        <Layers3 className="size-4 text-gray-600" />
        {view === "catalog" ? "算子地图" : "算子关系图"}
      </div>

      <div className="flex items-center gap-2">
        <div aria-label="切换工作区视图" className="inline-flex rounded-lg bg-gray-100 p-1" role="group">
          <WorkspaceViewButton
            active={view === "catalog"}
            icon={List}
            label="列表"
            onClick={() => onViewChange("catalog")}
          />
          <WorkspaceViewButton
            active={view === "lineage"}
            icon={GitBranch}
            label="血缘图"
            onClick={() => onViewChange("lineage")}
          />
        </div>
        <button
          className="grid size-10 place-items-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          onClick={onAdd}
          title="新增算子"
          type="button"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </header>
  );
}

function WorkspaceViewButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "bg-white text-gray-950 shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
          : "text-gray-600 hover:text-gray-950"
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function PlatformSidebar() {
  return (
    <aside className="hidden h-full min-h-0 min-w-0 overflow-hidden border-r border-gray-200 bg-gray-50 px-5 py-6 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-gray-950 text-white">
          <MapIcon className="size-5" />
        </div>
        <h1 className="text-lg font-semibold text-gray-950">AI 数据服务平台</h1>
      </div>

      <div className="orbit-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        {sidebarSections.map((section) => (
          <section className="mb-8" key={section.label}>
            <p className="mb-3 text-sm text-gray-500">{section.label}</p>
            <nav className="space-y-1.5">
              {section.items.map((item) => (
                <SidebarNode item={item} key={item.label} />
              ))}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  );
}

function SidebarNode({ item, depth = 0 }: { item: SidebarItem; depth?: number }) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  return (
    <div>
      <button
        className={cn(
          "flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          item.active && "bg-gray-100 text-blue-600",
          depth > 0 && "text-gray-600"
        )}
        style={{ paddingLeft: `${8 + depth * 18}px` }}
        type="button"
      >
        {Icon ? <Icon className="size-4 shrink-0 text-gray-500" /> : <span className="w-4 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.chevron === "right" ? <ChevronRight className="size-4 text-gray-500" /> : null}
        {item.chevron === "down" ? <ChevronDown className="size-4 text-gray-500" /> : null}
      </button>
      {hasChildren ? (
        <div className={cn("ml-4 mt-1 border-l border-gray-200", depth > 0 && "ml-7")}>
          {item.children?.map((child) => (
            <SidebarNode depth={depth + 1} item={child} key={child.label} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OperatorList({
  activeCategory,
  className,
  onCategory,
  onChoose,
  onSearch,
  operators,
  search,
  searchRef,
  selectedId,
  starredIds,
}: {
  activeCategory: CategoryKey;
  className?: string;
  onCategory: (category: CategoryKey) => void;
  onChoose: (operator: OperatorRecord) => void;
  onSearch: (value: string) => void;
  operators: OperatorRecord[];
  search: string;
  searchRef: RefObject<HTMLInputElement | null>;
  selectedId?: string;
  starredIds: string[];
}) {
  return (
    <section
      className={cn(
        "h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white xl:border-r xl:border-gray-200",
        className
      )}
    >
      <div className="border-b border-gray-200 p-4 pb-3 sm:p-5 sm:pb-3">
        <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-50 px-3 text-sm text-gray-600 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="size-4" />
          <input
            className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-500"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="搜索算子名称、ID、标签..."
            ref={searchRef}
            value={search}
          />
          <span className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-500 sm:block">/</span>
        </label>

        <div className="orbit-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map((filter) => (
            <CategoryButton
              active={activeCategory === filter.key}
              filter={filter}
              key={filter.key}
              onClick={() => onCategory(filter.key)}
            />
          ))}
        </div>
      </div>

      <div className="orbit-scroll min-h-0 flex-1 overflow-y-auto p-2">
        {operators.length ? (
          operators.map((operator) => (
            <OperatorRow
              key={operator.id}
              onChoose={onChoose}
              operator={operator}
              selected={operator.id === selectedId}
              starred={starredIds.includes(operator.id)}
            />
          ))
        ) : (
          <div className="grid h-full place-items-center px-8 text-center">
            <div>
              <Search className="mx-auto size-6 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-800">没有找到匹配的算子</p>
              <p className="mt-1 text-xs text-gray-500">换一个关键词或分类再试试。</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryButton({
  active,
  filter,
  onClick,
}: {
  active: boolean;
  filter: (typeof categoryFilters)[number];
  onClick: () => void;
}) {
  const Icon = filter.icon;

  return (
    <button
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-gray-100 px-3 text-xs font-medium text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active ? "min-w-32 bg-blue-600 text-white ring-blue-600 hover:bg-blue-500" : "w-9 px-0"
      )}
      onClick={onClick}
      title={filter.label}
      type="button"
    >
      <Icon className="size-4 shrink-0" />
      {active ? <span className="truncate">{filter.label}</span> : <span className="sr-only">{filter.label}</span>}
    </button>
  );
}

function OperatorRow({
  operator,
  onChoose,
  selected,
  starred,
}: {
  operator: OperatorRecord;
  onChoose: (operator: OperatorRecord) => void;
  selected: boolean;
  starred: boolean;
}) {
  return (
    <button
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group grid w-full grid-cols-[42px_minmax(0,1fr)_auto] gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
        selected && "bg-blue-50"
      )}
      onClick={() => onChoose(operator)}
      type="button"
    >
      <span className="relative mt-1 grid size-9 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
        {operator.initial}
        {starred ? (
          <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-amber-400 text-gray-950 ring-2 ring-white">
            <Star className="size-2.5 fill-current" />
          </span>
        ) : null}
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-gray-950">{operator.displayName}</span>
          <span className="truncate font-mono text-xs text-gray-500">{operator.id}</span>
        </span>
        <span className="mt-1 block truncate text-gray-600">
          {operator.domains.map((domain) => domainLabels[domain]).join("；")}
        </span>
        <span className="mt-2 block truncate text-xs leading-5 text-gray-600">{operator.intro}</span>
      </span>

      <span className="flex min-w-20 flex-col items-end gap-1">
        <span className="mt-1 whitespace-nowrap text-xs text-gray-500">本周拉起</span>
        <span className="font-mono text-sm font-semibold text-gray-800">{operator.weeklyRuns}</span>
      </span>
    </button>
  );
}

function AddOperatorDialog({
  draft,
  onChange,
  onClose,
  onSubmit,
  onToggleDomain,
}: {
  draft: OperatorFormState;
  onChange: (draft: OperatorFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleDomain: (domain: OperatorDomain) => void;
}) {
  const domainEntries = Object.entries(domainLabels) as Array<[OperatorDomain, string]>;

  function updateDraft(patch: Partial<OperatorFormState>) {
    onChange({ ...draft, ...patch });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 p-4">
      <section
        aria-labelledby="add-operator-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white"
        role="dialog"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-950" id="add-operator-title">添加算子</h2>
            <p className="mt-0.5 text-xs text-gray-500">新增内容只保存在当前前端视图</p>
          </div>
          <button
            className="grid size-9 place-items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={onClose}
            title="关闭"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="orbit-scroll min-h-0 flex-1 overflow-y-auto p-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="算子名称">
              <input
                className="h-10 w-full rounded-md bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => updateDraft({ displayName: event.target.value })}
                placeholder="例如：视频分割"
                value={draft.displayName}
              />
            </Field>

            <Field label="正式 ID">
              <input
                className="h-10 w-full rounded-md bg-white px-3 font-mono text-sm text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => updateDraft({ id: event.target.value })}
                placeholder="例如：vod.split.custom"
                value={draft.id}
              />
            </Field>

            <Field label="处理方式">
              <input
                className="h-10 w-full rounded-md bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => updateDraft({ behavior: event.target.value })}
                placeholder="例如：enrich"
                value={draft.behavior}
              />
            </Field>

            <Field label="数据对应关系">
              <input
                className="h-10 w-full rounded-md bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => updateDraft({ cardinality: event.target.value })}
                placeholder="例如：1:1 / 1:N / N:1"
                value={draft.cardinality}
              />
            </Field>

            <Field label="本周拉起次数">
              <input
                className="h-10 w-full rounded-md bg-white px-3 font-mono text-sm text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                inputMode="numeric"
                onChange={(event) => updateDraft({ weeklyRuns: event.target.value })}
                placeholder="0"
                value={draft.weeklyRuns}
              />
            </Field>

            <Field label="分类标签">
              <div className="grid max-h-32 gap-1 overflow-y-auto rounded-md bg-white p-2 ring-1 ring-gray-200">
                {domainEntries.map(([domain, label]) => (
                  <label
                    className="flex min-h-8 items-center gap-2 rounded px-2 text-sm text-gray-700 hover:bg-gray-50"
                    key={domain}
                  >
                    <input
                      checked={draft.domains.includes(domain)}
                      className="size-4 accent-blue-600"
                      onChange={() => onToggleDomain(domain)}
                      type="checkbox"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <Field className="mt-4" label="一句话简介">
            <textarea
              className="min-h-20 w-full resize-none rounded-md bg-white px-3 py-2 text-sm leading-6 text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
              onChange={(event) => updateDraft({ intro: event.target.value })}
              placeholder="说明它解决什么问题"
              value={draft.intro}
            />
          </Field>

          <Field className="mt-4" label="详细说明（可选）">
            <textarea
              className="min-h-32 w-full resize-y rounded-md bg-white px-3 py-2 text-sm leading-6 text-gray-950 outline-none ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
              onChange={(event) => updateDraft({ wiki: event.target.value })}
              placeholder="补充适用场景、输入输出、使用限制等信息"
              value={draft.wiki}
            />
          </Field>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              className="h-9 rounded-md bg-gray-50 px-4 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              type="submit"
            >
              <Plus className="size-4" />
              添加算子
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}
