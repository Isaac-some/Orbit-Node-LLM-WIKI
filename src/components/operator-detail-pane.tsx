"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  GitMerge,
  FileInput,
  FileOutput,
  Layers3,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

import {
  behaviorLabels,
  cardinalityLabels,
  domainLabels,
  getOperatorFlows,
  getReusableOperatorPatterns,
  parseOperatorDetail,
  type DetailConfiguration,
  type DetailField,
  type FlowStatus,
  type OperatorFlow,
  type ReusableOperatorPattern,
} from "@/lib/operator-detail";
import type { OperatorRecord } from "@/lib/operator-data";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export function OperatorDetailPane({
  className,
  isStarred,
  onClose,
  onDelete,
  onNext,
  onPrevious,
  onStar,
  operator,
}: {
  className?: string;
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
      <section
        className={cn(
          "h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white",
          className
        )}
      >
        <div className="grid h-full place-items-center px-8 text-center">
          <div>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-gray-100 text-gray-500">
              <Workflow className="size-7" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-950">选择一个算子</h2>
            <p className="mt-2 text-sm text-gray-600">
              这里会显示能力、输入输出、配置项和使用提醒。
            </p>
          </div>
        </div>
      </section>
    );
  }

  const detail = parseOperatorDetail(operator);
  const currentFlows = getOperatorFlows(operator.id, "current");
  const historicalFlows = getOperatorFlows(operator.id, "historical");
  const reusablePatterns = getReusableOperatorPatterns(operator.id);

  return (
    <section
      className={cn(
        "h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white",
        className
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2 text-gray-600">
          <DetailToolIcon icon={X} label="返回算子列表" onClick={onClose} />
          <span className="mx-1 h-4 w-px bg-gray-200" />
          <DetailToolIcon icon={ChevronLeft} label="上一个算子" onClick={onPrevious} />
          <DetailToolIcon icon={ChevronRight} label="下一个算子" onClick={onNext} />
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <button
            aria-pressed={isStarred}
            className={cn(
              "grid size-9 place-items-center rounded-md bg-gray-50 text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isStarred && "text-amber-500"
            )}
            onClick={() => onStar(operator.id)}
            title={isStarred ? "取消收藏" : "收藏"}
            type="button"
          >
            <Star className={cn("size-4", isStarred && "fill-current")} />
          </button>
          <button
            className="grid size-9 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={() => onDelete(operator.id)}
            title="从当前视图移除"
            type="button"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <article className="orbit-scroll min-h-0 flex-1 overflow-y-auto">
        <header className="border-b border-gray-200 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <CircleCheckBig className="size-3.5" />
                  已启用
                </span>
                <span className="text-xs text-gray-500">本周拉起 {operator.weeklyRuns} 次</span>
              </div>
              <h1 className="mt-3 text-xl font-semibold leading-7 text-gray-950 text-balance">
                {operator.displayName}
              </h1>
              <p className="mt-1 font-mono text-xs text-gray-500">{operator.id}</p>
              <p className="mt-3 max-w-[70ch] text-sm leading-6 text-gray-700 text-pretty">
                {operator.intro}
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
              <Layers3 className="size-5" />
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {operator.domains.map((domain) => (
              <span
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                key={domain}
              >
                {domainLabels[domain]}
              </span>
            ))}
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {behaviorLabels[operator.behavior] ?? operator.behavior}
            </span>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
              {cardinalityLabels[operator.cardinality] ?? operator.cardinality}
            </span>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          <WorkflowUsageSection
            flows={currentFlows}
            operatorId={operator.id}
            status="current"
          />
          <WorkflowUsageSection
            flows={historicalFlows}
            operatorId={operator.id}
            status="historical"
          />
          <ReusablePatternSection patterns={reusablePatterns} />

          <section className="overflow-hidden rounded-xl ring-1 ring-gray-200">
            <div className="grid divide-y divide-gray-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <DecisionBlock
                icon={Sparkles}
                label="适合什么时候用"
                text={detail.suitableFor}
                tone="positive"
              />
              <DecisionBlock
                icon={AlertTriangle}
                label="使用前先确认"
                text={detail.avoidWhen}
                tone="warning"
              />
            </div>
            <dl className="grid gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-500">执行方式</dt>
                <dd className="mt-1 text-gray-800">{detail.execution}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">前置依赖</dt>
                <dd className="mt-1 text-gray-800">{detail.dependencies}</dd>
              </div>
            </dl>
          </section>

          <FieldSection
            fields={detail.inputs}
            icon={FileInput}
            note={detail.inputNote}
            title="需要提供什么"
            type="input"
          />

          <ConfigurationSection
            configurations={detail.configurations}
            note={detail.configurationNote}
          />

          <FieldSection
            fields={detail.outputs}
            icon={FileOutput}
            note={detail.outputNote}
            title="会得到什么"
            type="output"
          />

          <section className="rounded-xl bg-amber-50 px-4 py-4 ring-1 ring-amber-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
              <AlertTriangle className="size-4 text-amber-700" />
              使用提醒
            </div>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950/80">
              {(detail.risks.length ? detail.risks : ["暂无已确认的风险说明。"])
                .map((risk) => (
                  <li className="flex gap-2" key={risk}>
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-600" />
                    <span>{risk}</span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </article>
    </section>
  );
}

function WorkflowUsageSection({
  flows,
  operatorId,
  status,
}: {
  flows: OperatorFlow[];
  operatorId: string;
  status: FlowStatus;
}) {
  const isCurrent = status === "current";
  const trackRef = useRef<HTMLDivElement>(null);

  function moveTrack(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>("[data-flow-card]");
    const distance = (firstCard?.offsetWidth ?? track.clientWidth * 0.82) + 12;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      behavior: reducedMotion ? "auto" : "smooth",
      left: distance * direction,
    });
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl ring-1",
        isCurrent ? "bg-blue-50 ring-blue-200" : "bg-amber-50 ring-amber-200"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-stretch gap-3 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between",
          isCurrent ? "border-blue-200" : "border-amber-200"
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-white ring-1",
              isCurrent ? "text-blue-700 ring-blue-200" : "text-amber-700 ring-amber-200"
            )}
          >
            {isCurrent ? <Workflow className="size-5" /> : <Clock3 className="size-5" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-950">
                {isCurrent ? "当前参与的 Flow" : "历史参与的 Flow"}
              </h2>
              {flows.length ? (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                  演示轨迹
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {isCurrent
                ? "当前已注册，可用于选型和串联参考。"
                : "仅用于追溯，历史参与不代表当前可用。"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <span
            className={cn(
              "mr-0.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1",
              isCurrent ? "text-blue-700 ring-blue-200" : "text-amber-800 ring-amber-200"
            )}
          >
            {flows.length ? `${flows.length} 个 Flow` : "暂无 Flow"}
          </span>
          {flows.length > 1 ? (
            <>
              <TrackButton
                icon={ArrowLeft}
                label={`查看上一个${isCurrent ? "当前" : "历史"} Flow`}
                onClick={() => moveTrack(-1)}
              />
              <TrackButton
                icon={ArrowRight}
                label={`查看下一个${isCurrent ? "当前" : "历史"} Flow`}
                onClick={() => moveTrack(1)}
              />
            </>
          ) : null}
        </div>
      </div>

      {flows.length ? (
        <div
          aria-label={`${isCurrent ? "当前" : "历史"} Flow 列表，共 ${flows.length} 条`}
          className="orbit-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth bg-white p-4 motion-reduce:scroll-auto"
          ref={trackRef}
          tabIndex={0}
        >
          {flows.map((flow, index) => (
            <FlowUsageCard
              flow={flow}
              index={index}
              key={flow.id}
              operatorId={operatorId}
              total={flows.length}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/80 px-4 py-4">
            <p className="text-sm font-medium text-gray-800">
              {isCurrent ? "尚未接入当前 Flow 数据" : "暂无已收录的历史参与记录"}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {isCurrent
                ? "接入 Flow 注册数据后，这里会显示服务场景、步骤位置和字段映射。"
                : "只有发现过但当前未注册的 Flow 才会出现在这里。"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function TrackButton({
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
      aria-label={label}
      className="grid size-8 place-items-center rounded-md bg-white text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function FlowUsageCard({
  flow,
  index,
  operatorId,
  total,
}: {
  flow: OperatorFlow;
  index: number;
  operatorId: string;
  total: number;
}) {
  const operatorIndex = flow.steps.findIndex(
    (step) => step.kind === "operator" && step.id === operatorId
  );

  return (
    <article
      className="flex w-[min(420px,calc(100vw-64px))] shrink-0 snap-start flex-col rounded-lg bg-white px-4 py-4 ring-1 ring-gray-200"
      data-flow-card
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
              {flow.serviceDomain}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                flow.status === "current"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {flow.status === "current" ? "已上线" : "已下线"}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-5 text-gray-950">{flow.name}</h3>
        </div>
        <span className="shrink-0 font-mono text-[11px] font-semibold text-gray-500">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <p className="mt-1 break-all font-mono text-[11px] leading-5 text-gray-500">{flow.id}</p>
      <p className="mt-2 text-xs leading-5 text-gray-600">{flow.description}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-[11px]">
        <FlowStat label="步骤" value={`${flow.steps.length} 个`} />
        <FlowStat label="算子位置" value={`第 ${operatorIndex + 1} 步`} />
        <FlowStat
          label={flow.status === "current" ? "最近使用" : "最后使用"}
          value={flow.lastUsedAt.slice(5)}
        />
      </dl>

      <div className="orbit-scroll mt-3 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          {flow.steps.map((step, stepIndex) => (
            <div className="flex items-center gap-2" key={`${flow.id}-${step.id}-${stepIndex}`}>
              {stepIndex > 0 ? <ArrowRight className="size-4 shrink-0 text-gray-300" /> : null}
              <span
                className={cn(
                  "max-w-[180px] whitespace-normal break-all rounded-md px-2.5 py-1.5 text-xs leading-4 ring-1",
                  step.id === operatorId
                    ? "bg-blue-600 font-semibold text-white ring-blue-600"
                    : step.kind === "operator"
                      ? "bg-gray-50 font-mono text-gray-700 ring-gray-200"
                      : "border border-dashed border-gray-300 bg-white text-gray-600 ring-0"
                )}
              >
                {step.label ?? step.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      <dl className="mt-3 grid gap-3 border-t border-gray-100 pt-3 text-xs sm:grid-cols-3">
        <FlowMeta label="入口字段" values={flow.inputFields} />
        <FlowMeta label="输出字段" values={flow.outputFields} />
        <FlowMeta label="字段映射" values={flow.fieldMappings} />
      </dl>
    </article>
  );
}

function FlowStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1 truncate font-medium text-gray-800" title={value}>{value}</dd>
    </div>
  );
}

function FlowMeta({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1 break-words font-mono leading-5 text-gray-800">
        {values.length ? values.join("、") : "暂无"}
      </dd>
    </div>
  );
}

function ReusablePatternSection({
  patterns,
}: {
  patterns: ReusableOperatorPattern[];
}) {
  if (!patterns.length) return null;

  return (
    <section className="overflow-hidden rounded-xl ring-1 ring-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-white text-violet-700 ring-1 ring-gray-200">
            <GitMerge className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-950">可复用组合候选</h2>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              根据当前与历史 Flow 的重复组合汇总，仅作为标准化线索，不等于已上线 Flow。
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 bg-white">
        {patterns.map((pattern) => (
          <PatternEvidence key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </section>
  );
}

function PatternEvidence({ pattern }: { pattern: ReusableOperatorPattern }) {
  const isSequence = pattern.kind === "sequence";

  return (
    <article className="px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            isSequence ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-600"
          )}
        >
          {isSequence ? <GitMerge className="size-4" /> : <Share2 className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all font-mono text-xs font-semibold leading-5 text-gray-950">
              {pattern.operatorIds.join(isSequence ? " → " : " + ")}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isSequence
                  ? "bg-violet-50 text-violet-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {isSequence ? "连续串联 · 可评审" : "同 Flow 共现 · 待验证"}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-gray-700">
            被 {pattern.flowCount} 条 Flow 复用，覆盖 {pattern.serviceDomains.length} 个服务场景；
            当前 {pattern.currentFlowCount} 条，历史 {pattern.historicalFlowCount} 条。
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {pattern.serviceDomains.map((domain) => (
              <span
                className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600"
                key={domain}
              >
                {domain}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            {isSequence
              ? "已具备跨 Flow、跨场景的重复证据；下一步确认字段映射与失败策略，再沉淀为标准 Flow。"
              : "共现不代表并行或可直接封装，仍需确认步骤顺序、输入输出与共同前后置。"}
          </p>

          <details className="group mt-3">
            <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-md bg-gray-50 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none" />
              追溯 {pattern.flowCount} 条证据 Flow
            </summary>
            <div className="orbit-scroll mt-2 max-h-56 overflow-y-auto rounded-lg ring-1 ring-gray-200">
              {pattern.evidenceFlows.map((flow) => (
                <div
                  className="flex items-start justify-between gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0"
                  key={`${pattern.id}-${flow.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-5 text-gray-900">{flow.name}</p>
                    <p className="mt-0.5 break-all font-mono text-[10px] leading-4 text-gray-500">
                      {flow.id}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] leading-5 text-gray-500">
                    <p>{flow.serviceDomain}</p>
                    <p>{flow.status === "current" ? "当前" : "历史"} · {flow.lastUsedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function DecisionBlock({
  icon: Icon,
  label,
  text,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  tone: "positive" | "warning";
}) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
        <Icon className={cn("size-4", tone === "positive" ? "text-blue-600" : "text-amber-700")} />
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-700 text-pretty">{text}</p>
    </div>
  );
}

function FieldSection({
  fields,
  icon: Icon,
  note,
  title,
  type,
}: {
  fields: DetailField[];
  icon: LucideIcon;
  note?: string;
  title: string;
  type: "input" | "output";
}) {
  return (
    <section className="overflow-hidden rounded-xl ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-950">
          <Icon className="size-4 text-blue-600" />
          {title}
        </h2>
        <span className="text-xs text-gray-500">{fields.length ? `${fields.length} 个字段` : "无固定字段"}</span>
      </div>

      {fields.length ? (
        <div className="divide-y divide-gray-100 bg-white">
          {fields.map((field) => (
            <div className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(130px,0.8fr)_minmax(0,1.6fr)]" key={`${type}-${field.field}`}>
              <div className="min-w-0">
                <p className="break-words font-mono text-xs font-semibold text-gray-900">{field.field}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">{field.type}</span>
                  {field.required ? (
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[11px]",
                      field.required === "是"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-500"
                    )}>
                      {field.required === "是" ? "必填" : "选填"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="min-w-0 text-xs leading-5 text-gray-600">
                <p>{formatMeaning(field.meaning)}</p>
                {field.providedBy ? (
                  <p className="mt-1 truncate text-gray-500" title={field.providedBy}>
                    常见来源：{field.providedBy}
                  </p>
                ) : null}
                {field.cardinality ? <p className="mt-1 text-gray-500">数据形态：{formatCardinality(field.cardinality)}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="bg-white px-4 py-4 text-sm leading-6 text-gray-600">
          {note ?? "暂无固定字段说明。"}
        </p>
      )}
    </section>
  );
}

function ConfigurationSection({
  configurations,
  note,
}: {
  configurations: DetailConfiguration[];
  note?: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-950">
          <Settings2 className="size-4 text-blue-600" />
          可配置项
        </h2>
        <span className="text-xs text-gray-500">
          {configurations.length ? `${configurations.length} 项` : "无需配置"}
        </span>
      </div>

      {configurations.length ? (
        <div className="divide-y divide-gray-100 bg-white">
          {configurations.map((configuration) => (
            <div className="grid gap-2 px-4 py-3 text-xs sm:grid-cols-[minmax(140px,1fr)_auto_auto] sm:items-center" key={configuration.name}>
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{configuration.name}</p>
                <p className="mt-1 text-gray-500">{configuration.type}</p>
              </div>
              <span className={cn(
                "w-fit rounded px-2 py-1",
                configuration.required === "是"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-500"
              )}>
                {configuration.required === "是" ? "必填" : "选填"}
              </span>
              <span className="font-mono text-gray-600">默认：{configuration.defaultValue}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="bg-white px-4 py-4 text-sm leading-6 text-gray-600">
          {note ?? "这个算子没有需要用户填写的配置项。"}
        </p>
      )}
    </section>
  );
}

function DetailToolIcon({
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
      className="grid size-9 place-items-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon className="size-4" />
    </button>
  );
}

function formatMeaning(meaning: string) {
  const labels: Record<string, string> = {
    "collection.generic": "列表或集合字段",
    "field.generic": "普通业务字段",
    "media_locator.http": "可访问的网络地址",
    "media_locator.http_list": "一组可访问的网络地址",
    "media_locator.tos": "TOS 文件路径",
    "media_locator.vod_id": "VOD 媒体 ID",
    "record.rowkey": "数据记录主键",
    "task.id": "异步任务 ID",
  };

  return labels[meaning] ?? meaning;
}

function formatCardinality(cardinality: string) {
  const labels: Record<string, string> = {
    dynamic: "由配置决定",
    many: "多值",
    one: "单值",
  };

  return labels[cardinality] ?? cardinality;
}
