import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  FileInput,
  FileOutput,
  Layers3,
  Settings2,
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
  parseOperatorDetail,
  type DetailConfiguration,
  type DetailField,
  type FlowStatus,
  type OperatorFlow,
} from "@/lib/operator-detail";
import type { OperatorRecord } from "@/lib/operator-data";
import { cn } from "@/lib/utils";

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

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl ring-1",
        isCurrent ? "bg-blue-50 ring-blue-200" : "bg-amber-50 ring-amber-200"
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-4 border-b px-4 py-3",
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
            <h2 className="text-sm font-semibold text-gray-950">
              {isCurrent ? "当前服务工作流" : "历史服务工作流"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {isCurrent
                ? "当前已注册，可作为算子选型和串联时的参考。"
                : "历史参与不代表当前可用或可推荐。"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1",
            isCurrent ? "text-blue-700 ring-blue-200" : "text-amber-800 ring-amber-200"
          )}
        >
          {flows.length ? `${flows.length} 个 Flow` : "暂无 Flow"}
        </span>
      </div>

      {flows.length ? (
        <div className="divide-y divide-gray-200/80 bg-white">
          {flows.map((flow) => (
            <FlowUsageRow flow={flow} key={flow.id} operatorId={operatorId} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/80 px-4 py-4">
            <p className="text-sm font-medium text-gray-800">
              {isCurrent ? "尚未接入当前工作流数据" : "暂无已收录的历史参与记录"}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {isCurrent
                ? "接入 Flow 注册数据后，这里会显示名称、步骤位置、入口输出和字段映射。"
                : "只有发现过但当前未注册的 Flow 才会出现在这里。"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function FlowUsageRow({ flow, operatorId }: { flow: OperatorFlow; operatorId: string }) {
  const operatorSteps = flow.steps.filter((step) => step.kind === "operator");
  const operatorIndex = operatorSteps.findIndex((step) => step.id === operatorId);

  return (
    <article className="px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-950">{flow.name}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                flow.status === "current"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {flow.status === "current" ? "已上线" : "未上线"}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-gray-500">{flow.id}</p>
          <p className="mt-2 text-xs leading-5 text-gray-600">{flow.description}</p>
        </div>
        <div className="flex shrink-0 gap-2 text-[11px] text-gray-600">
          <span className="rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
            {flow.steps.length} 个步骤
          </span>
          <span className="rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
            位于第 {operatorIndex + 1} 步
          </span>
        </div>
      </div>

      <div className="orbit-scroll mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          {flow.steps.map((step, index) => (
            <div className="flex items-center gap-2" key={`${flow.id}-${step.id}`}>
              {index > 0 ? <ArrowRight className="size-4 shrink-0 text-gray-300" /> : null}
              <span
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs ring-1",
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

      <dl className="mt-4 grid gap-3 border-t border-gray-100 pt-3 text-xs sm:grid-cols-3">
        <FlowMeta label="入口字段" values={flow.inputFields} />
        <FlowMeta label="输出字段" values={flow.outputFields} />
        <FlowMeta label="字段映射" values={flow.fieldMappings} />
      </dl>
    </article>
  );
}

function FlowMeta({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1 truncate font-mono text-gray-800" title={values.join("、")}>
        {values.length ? values.join("、") : "暂无"}
      </dd>
    </div>
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
