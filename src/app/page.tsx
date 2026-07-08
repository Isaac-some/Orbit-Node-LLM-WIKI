"use client";

import type { FormEvent, ReactNode, RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FileBarChart,
  FileText,
  HardDrive,
  Image,
  Layers3,
  Map,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Trash2,
  Video,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { operatorRecords, type OperatorDomain, type OperatorRecord } from "@/lib/operator-data";

const categoryFilters = [
  { key: "all", label: "全部算子", icon: Boxes },
  { key: "ai-labeling", label: "AI 打标与模型", icon: Sparkles },
  { key: "video", label: "视频处理", icon: Video },
  { key: "image", label: "图片处理", icon: Image },
  { key: "metadata", label: "媒体元数据", icon: FileBarChart },
  { key: "storage", label: "存储、取数与链接", icon: HardDrive },
  { key: "tabular", label: "CSV、JSONL 与字段处理", icon: Table2 },
  { key: "validation", label: "校验与过滤", icon: ShieldCheck },
  { key: "delivery", label: "预览与交付", icon: PackageCheck },
  { key: "audio", label: "音频处理", icon: Bot },
  { key: "hbase", label: "HBase 读写", icon: Database },
] as const;

type CategoryKey = (typeof categoryFilters)[number]["key"];

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

const domainLabels: Record<OperatorDomain, string> = {
  "ai-labeling": "AI 打标与模型",
  audio: "音频处理",
  delivery: "预览与交付",
  hbase: "HBase 读写",
  image: "图片处理",
  metadata: "媒体元数据",
  storage: "存储、取数与链接",
  tabular: "CSV、JSONL 与字段处理",
  validation: "校验与过滤",
  video: "视频处理",
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

  function selectAdjacent(direction: 1 | -1) {
    if (!selectedOperator || visibleOperators.length === 0) return;
    const index = visibleOperators.findIndex((operator) => operator.id === selectedOperator.id);
    const nextIndex = Math.min(Math.max(index + direction, 0), visibleOperators.length - 1);
    setSelectedId(visibleOperators[nextIndex].id);
  }

  function deleteOperator(id: string) {
    setRemovedIds((current) => [...current, id]);
    setSelectedId("");
    setToast("已从当前视图移除");
  }

  function toggleStar(id: string) {
    setStarredIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
    setToast("收藏状态已更新");
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
    const wiki =
      operatorForm.wiki.trim() ||
      `# \`${id}\` — ${displayName}\n\n## 决策\n\n- **适用**：${intro}\n- **行为**：\`${operatorForm.behavior.trim() || "unknown"}\`；基数 \`${operatorForm.cardinality.trim() || "unknown"}\`。\n\n## 数据输入\n\n待补充。\n\n## 配置\n\n待补充。\n\n## 输出\n\n待补充。\n\n## 风险\n\n- 待补充。`;

    const newOperator: OperatorRecord = {
      id,
      displayName,
      initial: displayName.slice(0, 1).toUpperCase(),
      domains: operatorForm.domains,
      behavior: operatorForm.behavior.trim() || "unknown",
      cardinality: operatorForm.cardinality.trim() || "unknown",
      intro,
      weeklyRuns: operatorForm.weeklyRuns.trim() || "0",
      wiki,
    };

    setCustomOperators((current) => [newOperator, ...current]);
    setSelectedId(newOperator.id);
    setActiveCategory("all");
    setAddOpen(false);
    setOperatorForm(createBlankOperatorForm());
    setToast("算子已添加到当前视图");
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === "/" && !isTyping && !addOpen) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        if (addOpen) setAddOpen(false);
        else setSelectedId("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addOpen]);

  return (
    <main className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#111112] text-zinc-100">
      <div className="grid h-full min-h-0 overflow-hidden bg-[#111112] lg:grid-cols-[260px_minmax(430px,580px)_minmax(480px,1fr)]">
        <PlatformSidebar />

        <OperatorList
          activeCategory={activeCategory}
          onAdd={() => setAddOpen(true)}
          onCategory={setActiveCategory}
          onChoose={(operator) => setSelectedId(operator.id)}
          onSearch={setSearch}
          operators={visibleOperators}
          search={search}
          searchRef={searchRef}
          selectedId={selectedOperator?.id}
          starredIds={starredIds}
        />

        <OperatorDetail
          isStarred={selectedOperator ? starredIds.includes(selectedOperator.id) : false}
          onClose={() => setSelectedId("")}
          onDelete={deleteOperator}
          onNext={() => selectAdjacent(1)}
          onPrevious={() => selectAdjacent(-1)}
          onStar={toggleStar}
          operator={selectedId ? selectedOperator : undefined}
        />
      </div>

      <div className="pointer-events-none fixed bottom-3 right-5 z-40 rounded-full bg-zinc-950/90 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">
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

function PlatformSidebar() {
  return (
    <aside className="hidden h-full min-h-0 min-w-0 overflow-hidden border-r border-white/10 bg-[#0f0f10] px-5 py-6 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-white text-zinc-950">
          <Map className="size-5" />
        </div>
        <h1 className="text-lg font-semibold text-white">AI 数据服务平台</h1>
      </div>

      <div className="orbit-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        {sidebarSections.map((section) => (
          <section className="mb-8" key={section.label}>
            <p className="mb-3 text-sm text-zinc-500">{section.label}</p>
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
          "flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white",
          item.active && "bg-white/10 text-blue-400",
          depth > 0 && "text-zinc-400"
        )}
        style={{ paddingLeft: `${8 + depth * 18}px` }}
        type="button"
      >
        {Icon ? <Icon className="size-4 shrink-0 text-zinc-500" /> : <span className="w-4 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.chevron === "right" ? <ChevronRight className="size-4 text-zinc-500" /> : null}
        {item.chevron === "down" ? <ChevronDown className="size-4 text-zinc-500" /> : null}
      </button>
      {hasChildren ? (
        <div className={cn("ml-4 mt-1 border-l border-white/10", depth > 0 && "ml-7")}>
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
  onAdd,
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
  onAdd: () => void;
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
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-white/10 bg-[#151515]">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
        <button
          className="inline-flex h-8 items-center gap-2 rounded-md bg-white/5 px-2 text-sm font-semibold text-white ring-1 ring-white/10"
          type="button"
        >
          <Layers3 className="size-4 text-zinc-400" />
          算子地图
        </button>
        <button
          className="grid size-9 place-items-center rounded-md bg-blue-600 text-white ring-1 ring-blue-500 transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300"
          onClick={onAdd}
          title="新增算子"
          type="button"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="border-b border-white/10 p-5 pb-3">
        <label className="flex h-10 items-center gap-3 rounded-md bg-[#0f0f10] px-3 text-sm text-zinc-400 ring-1 ring-white/10 focus-within:ring-blue-500">
          <Search className="size-4" />
          <input
            className="w-full bg-transparent text-zinc-200 outline-none placeholder:text-zinc-500"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="搜索算子名称、ID、标签..."
            ref={searchRef}
            value={search}
          />
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
          <div className="grid h-full place-items-center px-8 text-center text-sm text-zinc-500">
            没有匹配这个分类或搜索条件的算子。
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
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-zinc-800 px-3 text-xs font-medium text-zinc-300 ring-1 ring-white/10 transition hover:bg-zinc-700",
        active ? "min-w-32 bg-blue-600 text-white ring-blue-500" : "w-9 px-0"
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
    <article
      className={cn(
        "group grid cursor-pointer grid-cols-[42px_1fr_auto] gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-zinc-800/70",
        selected && "bg-zinc-800/95"
      )}
      onClick={() => onChoose(operator)}
    >
      <div className="relative mt-1 grid size-9 place-items-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300 ring-1 ring-white/5">
        {operator.initial}
        {starred ? (
          <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-amber-400 text-zinc-950 ring-2 ring-[#151515]">
            <Star className="size-2.5 fill-current" />
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-white">{operator.displayName}</p>
          <span className="truncate text-xs text-zinc-500">{operator.id}</span>
        </div>
        <p className="mt-1 truncate text-zinc-400">
          {operator.domains.map((domain) => domainLabels[domain]).join("；")}
        </p>
        <p className="mt-2 truncate text-xs leading-5 text-zinc-400">{operator.intro}</p>
      </div>

      <div className="flex min-w-20 flex-col items-end gap-1">
        <span className="mt-1 whitespace-nowrap text-xs text-zinc-500">本周拉起次数</span>
        <span className="font-mono text-sm font-semibold text-zinc-200">{operator.weeklyRuns}</span>
      </div>
    </article>
  );
}

function OperatorDetail({
  isStarred,
  onClose,
  onDelete,
  onNext,
  onPrevious,
  onStar,
  operator,
}: {
  isStarred: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onStar: (id: string) => void;
  operator?: OperatorRecord;
}) {
  if (!operator) {
    return (
      <section className="hidden h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#151515] xl:flex">
        <div className="grid h-full place-items-center px-8 text-center">
          <div>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-zinc-900 text-zinc-500">
              <Workflow className="size-7" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">选择一个算子</h2>
            <p className="mt-2 text-sm text-zinc-500">右侧会显示 Wiki 决策、输入、输出和风险。</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hidden h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#151515] xl:flex">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-4 text-zinc-400">
          <ToolIcon icon={X} label="关闭" onClick={onClose} />
          <span className="h-4 w-px bg-white/10" />
          <ToolIcon icon={ChevronLeft} label="上一个算子" onClick={onPrevious} />
          <ToolIcon icon={ChevronRight} label="下一个算子" onClick={onNext} />
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <button
            className={cn(
              "grid size-8 place-items-center rounded-md bg-white/5 text-zinc-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white",
              isStarred && "text-amber-400"
            )}
            onClick={() => onStar(operator.id)}
            title="收藏"
            type="button"
          >
            <Star className={cn("size-4", isStarred && "fill-current")} />
          </button>
          <button
            className="grid size-8 place-items-center rounded-md bg-red-500/15 text-red-400 ring-1 ring-red-500/20 transition hover:bg-red-500/20"
            onClick={() => onDelete(operator.id)}
            title="删除"
            type="button"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-7 text-white">{operator.displayName}</h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">{operator.id}</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-600 text-white">
            <Layers3 className="size-5" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {operator.domains.map((domain) => (
            <span
              className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white ring-1 ring-white/10"
              key={domain}
            >
              {domainLabels[domain]}
            </span>
          ))}
          <span className="text-zinc-500">|</span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
            {operator.behavior}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
            {operator.cardinality}
          </span>
        </div>
      </div>

      <article className="orbit-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <pre className="whitespace-pre-wrap break-words rounded-lg bg-zinc-900/60 p-5 font-sans text-sm leading-7 text-zinc-200 ring-1 ring-white/10">
          {operator.wiki}
        </pre>
      </article>
    </section>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-4">
      <section className="flex max-h-[calc(100dvh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-[#181818] ring-1 ring-white/10">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div>
            <h2 className="text-sm font-semibold text-white">添加算子</h2>
            <p className="mt-0.5 text-xs text-zinc-500">新增内容会先保存到当前前端视图</p>
          </div>
          <button
            className="grid size-8 place-items-center rounded-md bg-white/5 text-zinc-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
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
                className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
                onChange={(event) => updateDraft({ displayName: event.target.value })}
                placeholder="例如：视频分割"
                value={draft.displayName}
              />
            </Field>

            <Field label="正式 ID">
              <input
                className="h-10 w-full rounded-md bg-zinc-950 px-3 font-mono text-sm text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
                onChange={(event) => updateDraft({ id: event.target.value })}
                placeholder="例如：vod.split.custom"
                value={draft.id}
              />
            </Field>

            <Field label="行为">
              <input
                className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
                onChange={(event) => updateDraft({ behavior: event.target.value })}
                placeholder="enrich / fanout / validate_or_filter"
                value={draft.behavior}
              />
            </Field>

            <Field label="基数">
              <input
                className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
                onChange={(event) => updateDraft({ cardinality: event.target.value })}
                placeholder="1:1 / 1:N / N:1"
                value={draft.cardinality}
              />
            </Field>

            <Field label="本周拉起次数">
              <input
                className="h-10 w-full rounded-md bg-zinc-950 px-3 font-mono text-sm text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
                onChange={(event) => updateDraft({ weeklyRuns: event.target.value })}
                placeholder="0"
                value={draft.weeklyRuns}
              />
            </Field>

            <Field label="分类标签">
              <div className="grid max-h-32 gap-2 overflow-y-auto rounded-md bg-zinc-950 p-2 ring-1 ring-white/10">
                {domainEntries.map(([domain, label]) => (
                  <label
                    className="flex min-h-8 items-center gap-2 rounded px-2 text-sm text-zinc-300 hover:bg-white/5"
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

          <Field className="mt-4" label="算子简介">
            <textarea
              className="min-h-20 w-full resize-none rounded-md bg-zinc-950 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
              onChange={(event) => updateDraft({ intro: event.target.value })}
              placeholder="一句话说明这个算子什么时候使用"
              value={draft.intro}
            />
          </Field>

          <Field className="mt-4" label="Wiki 详情">
            <textarea
              className="min-h-52 w-full resize-y rounded-md bg-zinc-950 px-3 py-2 font-mono text-sm leading-6 text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-blue-500"
              onChange={(event) => updateDraft({ wiki: event.target.value })}
              placeholder={"# `operator.id` — 算子名称\n\n## 决策\n\n- **适用**：...\n\n## 数据输入\n\n...\n\n## 风险\n\n- ..."}
              value={draft.wiki}
            />
          </Field>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <button
              className="h-9 rounded-md bg-white/5 px-4 text-sm font-semibold text-zinc-300 ring-1 ring-white/10 hover:bg-white/10"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white ring-1 ring-blue-500 hover:bg-blue-500"
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
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function ToolIcon({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="grid size-8 place-items-center rounded-md bg-white/5 text-zinc-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon className="size-4" />
    </button>
  );
}
