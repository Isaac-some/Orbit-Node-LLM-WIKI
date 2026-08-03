"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Braces,
  CheckCircle2,
  CircleDollarSign,
  FileInput,
  FileOutput,
  FlaskConical,
  Layers3,
  Play,
  ServerCog,
  Settings2,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  CatalogRecord,
  CatalogStep,
  FlowRecord,
  HandlerRecord,
  PipelineRecord,
} from "@/lib/catalog-types";
import {
  behaviorLabels,
  cardinalityLabels,
  domainLabels,
  parseHandlerDetail,
  type DetailConfiguration,
  type DetailField,
} from "@/lib/handler-detail";
import { cn } from "@/lib/utils";

export function CatalogDetail({
  className,
  onClose,
  record,
}: {
  className?: string;
  onClose: () => void;
  record?: CatalogRecord;
}) {
  if (!record) {
    return (
      <section className={cn("h-full min-h-0 min-w-0 bg-white", className)}>
        <div className="grid h-full place-items-center px-8 text-center">
          <div>
            <Boxes className="mx-auto size-8 text-gray-400" />
            <h2 className="mt-4 text-base font-semibold text-gray-950">选择一项查看详情</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white", className)}>
      <div className="flex h-12 shrink-0 items-center border-b border-gray-200 px-3 sm:px-4 lg:hidden">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft className="size-4" />
          返回列表
        </button>
      </div>

      <article className="orbit-scroll min-h-0 flex-1 overflow-y-auto">
        {record.entityType === "handler" ? <HandlerDetail handler={record} /> : null}
        {record.entityType === "flow" ? <FlowDetail flow={record} /> : null}
        {record.entityType === "pipeline" ? <PipelineDetail pipeline={record} /> : null}
      </article>
    </section>
  );
}

function HandlerDetail({ handler }: { handler: HandlerRecord }) {
  const detail = parseHandlerDetail(handler);
  const [testOpen, setTestOpen] = useState(false);

  return (
    <>
      <DetailHeader
        description={handler.intro}
        icon={Layers3}
        id={handler.handlerId}
        title={handler.displayName}
        tone="handler"
        typeLabel="Handler / 算子"
      >
        <StatusPill label="已启用" tone="success" />
        <StatusPill label="来源已验证" tone="neutral" />
      </DetailHeader>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3 sm:px-5">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          onClick={() => setTestOpen((current) => !current)}
          type="button"
        >
          <FlaskConical className="size-4" />
          开始测试
        </button>
        <button
          className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md bg-gray-100 px-3 text-sm font-semibold text-gray-500 ring-1 ring-gray-200"
          disabled
          title="目录写入 API 尚未配置"
          type="button"
        >
          <Settings2 className="size-4" />
          编辑
        </button>
      </div>

      {testOpen ? <HandlerTestPanel handlerId={handler.handlerId} /> : null}

      <ProfileSummary
        costLabel="待统计（占位数据）"
        provenanceLabel="已验证"
        resourceLabel="待统计（占位数据）"
      />

      <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
        <div className="flex flex-wrap gap-2">
          {handler.domains.map((domain) => (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700" key={domain}>
              {domainLabels[domain]}
            </span>
          ))}
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs text-cyan-800 ring-1 ring-cyan-200">
            {behaviorLabels[handler.behavior] ?? handler.behavior}
          </span>
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
            {cardinalityLabels[handler.cardinality] ?? handler.cardinality}
          </span>
        </div>
      </section>

      <DecisionSection suitableFor={detail.suitableFor} avoidWhen={detail.avoidWhen} />
      <FactsSection execution={detail.execution} dependencies={detail.dependencies} />
      <FieldSection fields={detail.inputs} icon={FileInput} note={detail.inputNote} title="输入" />
      <ConfigurationSection configurations={detail.configurations} note={detail.configurationNote} />
      <FieldSection fields={detail.outputs} icon={FileOutput} note={detail.outputNote} title="输出" />

      <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
        <SectionHeading icon={Workflow} title="所属 Flow" />
        <p className="mt-3 text-sm text-gray-600">暂无已登记关系。</p>
      </section>

      <section className="px-4 py-5 sm:px-5">
        <SectionHeading icon={AlertTriangle} title="使用提醒" />
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
          {(detail.risks.length ? detail.risks : ["暂无已确认的风险说明。"]).map((risk) => (
            <li className="flex gap-2" key={risk}>
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-600" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function FlowDetail({ flow }: { flow: FlowRecord }) {
  return (
    <>
      <DetailHeader
        description="由多个 Handler 组成的局部能力组合。"
        icon={Boxes}
        id={flow.flowId}
        title={flow.displayName}
        tone="flow"
        typeLabel="Flow / Handler 组"
      >
        <StatusPill label={flow.reusable ? "可复用" : "不可复用"} tone={flow.reusable ? "success" : "warning"} />
        <StatusPill label={sourceLabel(flow.registrationSource)} tone="neutral" />
      </DetailHeader>
      <ProfileSummary
        costLabel="待统计（占位数据）"
        provenanceLabel={provenanceLabel(flow.provenanceStatus)}
        resourceLabel="待统计（占位数据）"
      />
      <StepSection steps={flow.steps} title="Handler 组合" />
      <FieldPills fields={flow.inputFields} title="输入字段" />
      <FieldPills fields={flow.outputFields} title="输出字段" />
    </>
  );
}

function PipelineDetail({ pipeline }: { pipeline: PipelineRecord }) {
  return (
    <>
      <DetailHeader
        description="由旧源码 aigc.Flow 扫描得到的 Pipeline 候选，归并关系尚待业务确认。"
        icon={Workflow}
        id={pipeline.pipelineId}
        title={pipeline.displayName}
        tone="pipeline"
        typeLabel="Pipeline / 业务链路"
      >
        <StatusPill label="待归并确认" tone="warning" />
        <StatusPill label="不可推荐" tone="danger" />
      </DetailHeader>
      <ProfileSummary
        costLabel="待统计（占位数据）"
        provenanceLabel="待确认"
        resourceLabel="待统计（占位数据）"
      />

      <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
        <SectionHeading icon={Braces} title="来源映射" />
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">旧源码 Flow ID</dt>
            <dd className="mt-1 break-all font-mono text-gray-900">{pipeline.sourceFlowIds.join("、")}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Key 字段</dt>
            <dd className="mt-1 break-all font-mono text-gray-900">{pipeline.keyField ?? "未显式设置"}</dd>
          </div>
        </dl>
      </section>

      <StepSection steps={pipeline.steps} title="业务链路" />
      <FieldPills fields={pipeline.outputFields} title="输出字段" />
    </>
  );
}

function HandlerTestPanel({ handlerId }: { handlerId: string }) {
  const [paths, setPaths] = useState("");
  const validation = useMemo(() => {
    const items = paths.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    const invalid = items.filter((item) => !item.startsWith("tos://"));
    return { invalid, items, tooMany: items.length > 20 };
  }, [paths]);

  return (
    <section className="border-b border-cyan-200 bg-cyan-50/60 px-4 py-5 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-cyan-800 ring-1 ring-cyan-200">
          <FlaskConical className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-950">Handler 小批量测试</h2>
          <p className="mt-1 break-all font-mono text-xs text-gray-500">{handlerId}</p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-gray-700">TOS 路径</span>
        <textarea
          className="mt-1.5 min-h-32 w-full resize-y rounded-md bg-white px-3 py-2 font-mono text-base leading-6 text-gray-900 outline-none ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-600"
          onChange={(event) => setPaths(event.target.value)}
          placeholder={"tos://bucket/path/a.mp4\ntos://bucket/path/b.mp4"}
          value={paths}
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-gray-600">
          {validation.tooMany ? (
            <span className="font-medium text-red-700">超过 20 条硬上限</span>
          ) : validation.invalid.length ? (
            <span className="font-medium text-red-700">{validation.invalid.length} 条路径格式非法</span>
          ) : (
            <span>{validation.items.length} 条有效输入</span>
          )}
        </div>
        <button
          className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md bg-gray-200 px-3 text-sm font-semibold text-gray-500"
          disabled
          title="测试执行 API 尚未配置"
          type="button"
        >
          <Play className="size-4" />
          提交测试
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-600">测试环境执行入口待接入。</p>
    </section>
  );
}

function DetailHeader({
  children,
  description,
  icon: Icon,
  id,
  title,
  tone,
  typeLabel,
}: {
  children: React.ReactNode;
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
  tone: "handler" | "flow" | "pipeline";
  typeLabel: string;
}) {
  const tones = {
    handler: "bg-cyan-700 text-white",
    flow: "bg-emerald-700 text-white",
    pipeline: "bg-amber-500 text-gray-950",
  };

  return (
    <header className="border-b border-gray-200 px-4 py-5 sm:px-5">
      <div className="flex items-start gap-4">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-md", tones[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase text-gray-500">{typeLabel}</span>
            {children}
          </div>
          <h1 className="mt-2 break-words text-xl font-semibold leading-7 text-gray-950">{title}</h1>
          <p className="mt-1 break-all font-mono text-xs text-gray-500">{id}</p>
          <p className="mt-3 max-w-[75ch] text-sm leading-6 text-gray-700">{description}</p>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "danger" | "neutral" | "success" | "warning" }) {
  const tones = {
    danger: "bg-red-50 text-red-700 ring-red-200",
    neutral: "bg-gray-50 text-gray-700 ring-gray-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-50 text-amber-800 ring-amber-200",
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", tones[tone])}>{label}</span>;
}

function ProfileSummary({
  costLabel,
  provenanceLabel: source,
  resourceLabel,
}: {
  costLabel: string;
  provenanceLabel: string;
  resourceLabel: string;
}) {
  return (
    <dl className="grid border-b border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-gray-200">
      <SummaryItem icon={CircleDollarSign} label="单次成本" value={costLabel} />
      <SummaryItem icon={ServerCog} label="资源占用" value={resourceLabel} />
      <SummaryItem icon={CheckCircle2} label="数据来源" value={source} />
    </dl>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-3 border-t border-gray-200 px-4 py-3 first:border-t-0 sm:border-t-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-gray-500" />
      <div className="min-w-0">
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="mt-1 break-words text-sm font-medium text-gray-900">{value}</dd>
      </div>
    </div>
  );
}

function DecisionSection({ avoidWhen, suitableFor }: { avoidWhen: string; suitableFor: string }) {
  return (
    <section className="grid border-b border-gray-200 md:grid-cols-2 md:divide-x md:divide-gray-200">
      <div className="px-4 py-5 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-950">适合什么时候用</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{suitableFor}</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 md:border-t-0 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-950">使用前先确认</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{avoidWhen}</p>
      </div>
    </section>
  );
}

function FactsSection({ dependencies, execution }: { dependencies: string; execution: string }) {
  return (
    <dl className="grid border-b border-gray-200 px-4 py-4 text-sm sm:grid-cols-2 sm:gap-6 sm:px-5">
      <div>
        <dt className="text-xs font-medium text-gray-500">执行方式</dt>
        <dd className="mt-1 text-gray-900">{execution}</dd>
      </div>
      <div className="mt-3 sm:mt-0">
        <dt className="text-xs font-medium text-gray-500">前置依赖</dt>
        <dd className="mt-1 text-gray-900">{dependencies}</dd>
      </div>
    </dl>
  );
}

function FieldSection({ fields, icon, note, title }: { fields: DetailField[]; icon: LucideIcon; note?: string; title: string }) {
  return (
    <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
      <SectionHeading icon={icon} title={title} />
      {fields.length ? (
        <div className="mt-3 overflow-x-auto rounded-md ring-1 ring-gray-200">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr><th className="px-3 py-2 font-medium">字段</th><th className="px-3 py-2 font-medium">类型</th><th className="px-3 py-2 font-medium">必需</th><th className="px-3 py-2 font-medium">说明</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((field) => (
                <tr key={`${title}-${field.field}`}>
                  <td className="break-all px-3 py-2.5 font-mono text-gray-950">{field.field}</td>
                  <td className="px-3 py-2.5 text-gray-700">{field.type}</td>
                  <td className="px-3 py-2.5 text-gray-700">{field.required ?? "-"}</td>
                  <td className="px-3 py-2.5 leading-5 text-gray-700">{field.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-3 text-sm text-gray-600">{note ?? "暂无固定字段说明。"}</p>}
    </section>
  );
}

function ConfigurationSection({ configurations, note }: { configurations: DetailConfiguration[]; note?: string }) {
  return (
    <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
      <SectionHeading icon={Settings2} title="配置" />
      {configurations.length ? (
        <div className="mt-3 grid gap-px overflow-hidden rounded-md bg-gray-200 ring-1 ring-gray-200 sm:grid-cols-2">
          {configurations.map((configuration) => (
            <div className="min-w-0 bg-white px-3 py-3" key={configuration.name}>
              <p className="break-all font-mono text-xs font-semibold text-gray-950">{configuration.name}</p>
              <p className="mt-1 text-xs leading-5 text-gray-600">{configuration.type} · {configuration.required} · 默认 {configuration.defaultValue}</p>
            </div>
          ))}
        </div>
      ) : <p className="mt-3 text-sm text-gray-600">{note ?? "无用户配置。"}</p>}
    </section>
  );
}

function StepSection({ steps, title }: { steps: CatalogStep[]; title: string }) {
  return (
    <section className="border-b border-gray-200 px-4 py-5 sm:px-5">
      <SectionHeading icon={Workflow} title={title} />
      {steps.length ? (
        <ol className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
          {steps.map((step) => (
            <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-3" key={`${step.stepOrder}-${step.sourceReference}`}>
              <span className="grid size-8 place-items-center rounded-md bg-gray-100 font-mono text-xs text-gray-600">{step.stepOrder}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-950">{step.displayName}</span>
                  <StatusPill label={stepKindLabel(step.stepKind)} tone={step.stepKind === "inline" ? "neutral" : step.provenanceStatus === "verified" ? "success" : "warning"} />
                </div>
                {step.entityId || step.sourceReference ? <p className="mt-1 break-all font-mono text-xs text-gray-500">{step.entityId ?? step.sourceReference}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <p className="mt-3 text-sm text-gray-600">暂无已确认步骤。</p>}
    </section>
  );
}

function FieldPills({ fields, title }: { fields: string[]; title: string }) {
  return (
    <section className="border-b border-gray-200 px-4 py-5 last:border-b-0 sm:px-5">
      <SectionHeading icon={FileOutput} title={title} />
      {fields.length ? <div className="mt-3 flex flex-wrap gap-2">{fields.map((field) => <span className="max-w-full break-all rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700" key={field}>{field}</span>)}</div> : <p className="mt-3 text-sm text-gray-600">暂无已确认字段。</p>}
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return <div className="flex items-center gap-2"><Icon className="size-4 text-gray-500" /><h2 className="text-sm font-semibold text-gray-950">{title}</h2></div>;
}

function sourceLabel(source: FlowRecord["registrationSource"]) {
  return { auto: "自动注册", manual: "手动注册", inline: "内联来源", "auto+manual": "自动 + 手动" }[source];
}

function provenanceLabel(status: FlowRecord["provenanceStatus"]) {
  return { verified: "已验证", unknown: "未知", placeholder: "占位数据", needs_confirmation: "待确认" }[status];
}

function stepKindLabel(kind: CatalogStep["stepKind"]) {
  return { handler: "Handler", flow: "Flow", inline: "内联步骤", unknown: "未知步骤" }[kind];
}
