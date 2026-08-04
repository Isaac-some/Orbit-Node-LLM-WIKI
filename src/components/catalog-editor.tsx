"use client";

import { AlertCircle, Plus, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  CatalogEntityType,
  CatalogRecord,
  CatalogStep,
  FlowRecord,
  HandlerDomain,
  HandlerRecord,
} from "@/lib/catalog-types";
import { placeholderCostProfile, placeholderResourceProfile } from "@/lib/catalog-types";
import { domainLabels, parseHandlerDetail } from "@/lib/handler-detail";

type EditorProps = {
  entityType: CatalogEntityType;
  existingIds: string[];
  initial?: CatalogRecord;
  onCancel: () => void;
  onSave: (record: CatalogRecord) => void;
};

const inputClass = "mt-1.5 min-h-11 w-full rounded-md bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-600";
const textareaClass = `${inputClass} min-h-24 resize-y py-2 leading-6`;
const handlerDomains = Object.entries(domainLabels) as Array<[HandlerDomain, string]>;

export function CatalogEditor({ entityType, existingIds, initial, onCancel, onSave }: EditorProps) {
  const initialValues = useMemo(() => getInitialValues(entityType, initial), [entityType, initial]);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const editingId = initial ? recordId(initial) : "";
  const isHandler = entityType === "handler";

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  function update(name: keyof EditorValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = values.id.trim();
    if (!id || !values.name.trim() || !values.intro.trim()) {
      setError("名称、正式 ID 和简介必填。");
      return;
    }
    if (existingIds.includes(id) && id !== editingId) {
      setError(`ID ${id} 已存在，请换一个。`);
      return;
    }
    if (!isHandler && !values.steps.trim()) {
      setError("Flow 至少需要一个步骤。");
      return;
    }
    onSave(isHandler ? buildHandler(values, initial) : buildFlow(values, initial));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-6" role="presentation">
      <section aria-labelledby="catalog-editor-title" aria-modal="true" className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-lg bg-white shadow-xl sm:max-w-3xl sm:rounded-lg" role="dialog">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700"><Plus className="size-4" /></span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-gray-950" id="catalog-editor-title">{initial ? "编辑" : "新增"}{isHandler ? "算子" : " Flow"}</h2>
              <p className="text-xs text-gray-500">演示数据仅保存在当前浏览器，不代表已发布事实。</p>
            </div>
          </div>
          <button aria-label="关闭编辑器" className="grid size-11 place-items-center rounded-md text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" onClick={onCancel} type="button"><X className="size-5" /></button>
        </header>

        <form className="orbit-scroll min-h-0 flex-1 overflow-y-auto" onSubmit={submit}>
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="名称" required><input autoFocus className={inputClass} onChange={(event) => update("name", event.target.value)} value={values.name} /></Field>
            <Field label="正式 ID" required><input className={`${inputClass} font-mono`} onChange={(event) => update("id", event.target.value)} value={values.id} /></Field>
            <Field className="sm:col-span-2" label="简介" required><textarea className={textareaClass} onChange={(event) => update("intro", event.target.value)} value={values.intro} /></Field>

            {isHandler ? (
              <>
                <Field label="启用状态"><select className={inputClass} onChange={(event) => update("status", event.target.value)} value={values.status}><option value="enabled">已启用</option><option value="disabled">已禁用</option></select></Field>
                <Field label="领域"><select className={inputClass} onChange={(event) => update("domain", event.target.value)} value={values.domain}>{handlerDomains.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                <Field label="处理方式"><select className={inputClass} onChange={(event) => update("behavior", event.target.value)} value={values.behavior}><option value="enrich">补充字段</option><option value="transform">转换数据</option><option value="validate_or_filter">校验或过滤</option><option value="fanout">拆分数据</option><option value="aggregate">聚合数据</option><option value="transform_or_write">转换并写入</option></select></Field>
                <Field label="执行方式"><select className={inputClass} onChange={(event) => update("execution", event.target.value)} value={values.execution}><option value="sync">同步处理</option><option value="async_submit">异步提交</option><option value="external_service_sync">同步调用外部服务</option><option value="external_model_sync">同步调用外部模型</option></select></Field>
                <Field label="前置依赖"><input className={inputClass} onChange={(event) => update("dependencies", event.target.value)} value={values.dependencies} /></Field>
                <Field label="输入字段" hint="逗号分隔"><input className={`${inputClass} font-mono`} onChange={(event) => update("inputs", event.target.value)} value={values.inputs} /></Field>
                <Field label="输出字段" hint="逗号分隔"><input className={`${inputClass} font-mono`} onChange={(event) => update("outputs", event.target.value)} value={values.outputs} /></Field>
                <Field className="sm:col-span-2" label="配置项" hint="每行：名称 | 类型 | 默认值"><textarea className={`${textareaClass} font-mono`} onChange={(event) => update("configurations", event.target.value)} value={values.configurations} /></Field>
                <Field className="sm:col-span-2" label="风险说明" hint="每行一条"><textarea className={textareaClass} onChange={(event) => update("risks", event.target.value)} value={values.risks} /></Field>
              </>
            ) : (
              <>
                <Field label="上线状态"><select className={inputClass} onChange={(event) => update("status", event.target.value)} value={values.status}><option value="published">已上线</option><option value="unpublished">未上线</option><option value="archived">历史归档</option></select></Field>
                <Field label="服务场景"><input className={inputClass} onChange={(event) => update("serviceDomain", event.target.value)} value={values.serviceDomain} /></Field>
                <Field className="sm:col-span-2" label="步骤顺序" hint="每行：handler:算子 ID | 显示名，或 inline:步骤名" required><textarea className={`${textareaClass} min-h-36 font-mono`} onChange={(event) => update("steps", event.target.value)} value={values.steps} /></Field>
                <Field label="入口字段" hint="逗号分隔"><input className={`${inputClass} font-mono`} onChange={(event) => update("inputs", event.target.value)} value={values.inputs} /></Field>
                <Field label="输出字段" hint="逗号分隔"><input className={`${inputClass} font-mono`} onChange={(event) => update("outputs", event.target.value)} value={values.outputs} /></Field>
              </>
            )}
          </div>

          {error ? <div className="mx-4 mb-4 flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200 sm:mx-5" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
          <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
            <button className="min-h-11 rounded-md px-4 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50" onClick={onCancel} type="button">取消</button>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2" type="submit"><Save className="size-4" />保存演示数据</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

type EditorValues = {
  behavior: string;
  configurations: string;
  dependencies: string;
  domain: string;
  execution: string;
  id: string;
  inputs: string;
  intro: string;
  name: string;
  outputs: string;
  risks: string;
  serviceDomain: string;
  status: string;
  steps: string;
};

function getInitialValues(entityType: CatalogEntityType, initial?: CatalogRecord): EditorValues {
  const base: EditorValues = { behavior: "enrich", configurations: "", dependencies: "无已知硬依赖", domain: "ai-labeling", execution: "sync", id: "", inputs: "", intro: "", name: "", outputs: "", risks: "", serviceDomain: "", status: entityType === "handler" ? "enabled" : "unpublished", steps: "" };
  if (!initial) return base;
  if (initial.entityType === "handler") {
    const detail = parseHandlerDetail(initial);
    return { ...base, behavior: initial.behavior, configurations: detail.configurations.map((item) => `${item.name} | ${item.type} | ${item.defaultValue}`).join("\n"), dependencies: detail.dependencies, domain: initial.domains[0] ?? "ai-labeling", execution: executionValue(detail.execution), id: initial.handlerId, inputs: detail.inputs.map((item) => item.field).join(", "), intro: initial.intro, name: initial.displayName, outputs: detail.outputs.map((item) => item.field).join(", "), risks: detail.risks.join("\n"), status: initial.status };
  }
  return { ...base, id: initial.flowId, inputs: initial.inputFields.join(", "), intro: initial.intro, name: initial.displayName, outputs: initial.outputFields.join(", "), serviceDomain: initial.serviceDomain, status: initial.status, steps: initial.steps.map((step) => step.stepKind === "handler" ? `handler:${step.entityId ?? ""} | ${step.displayName}` : `inline:${step.displayName}`).join("\n") };
}

function buildHandler(values: EditorValues, initial?: CatalogRecord): HandlerRecord {
  const prior = initial?.entityType === "handler" ? initial : undefined;
  const inputs = splitComma(values.inputs);
  const outputs = splitComma(values.outputs);
  const configs = values.configurations.split(/\r?\n/).map((line) => line.split("|").map((item) => item.trim())).filter((items) => items[0]);
  const risks = values.risks.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const detailMarkdown = [
    `# \`${values.id.trim()}\` — ${values.name.trim()}`,
    "## 决策",
    `- **适用**：${values.intro.trim()}`,
    "- **不适用**：输入不满足字段要求时请先校验。",
    `- **行为**：\`${values.behavior}\`；基数 \`1:1\`；执行 \`${values.execution}\`。`,
    `- **硬依赖**：${values.dependencies.trim() || "无已知硬依赖"}`,
    "## 数据输入",
    "| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...inputs.map((field) => `| ${field} | String | 是 | 演示注册字段 | one | 手动传入 |`),
    "## 配置",
    "| 配置 | 类型 | 必需 | 默认值 |",
    "| --- | --- | --- | --- |",
    ...configs.map(([name, type, defaultValue]) => `| ${name} | ${type || "String"} | 否 | ${defaultValue || "待确认"} |`),
    "## 输出",
    "| 字段 | 类型 | 语义 | 基数 |",
    "| --- | --- | --- | --- |",
    ...outputs.map((field) => `| ${field} | String | 演示注册字段 | one |`),
    "## 风险",
    ...(risks.length ? risks.map((risk) => `- ${risk}`) : ["- 暂无已登记风险。"]),
  ].join("\n\n");
  return { behavior: values.behavior, cardinality: "1:1", costProfile: prior?.costProfile ?? placeholderCostProfile, detailMarkdown, displayName: values.name.trim(), domains: [values.domain as HandlerDomain], entityType: "handler", handlerId: values.id.trim(), initial: values.name.trim().slice(0, 1).toUpperCase(), intro: values.intro.trim(), provenanceStatus: "placeholder", resourceProfile: prior?.resourceProfile ?? placeholderResourceProfile, status: values.status === "disabled" ? "disabled" : "enabled", testability: "available" };
}

function buildFlow(values: EditorValues, initial?: CatalogRecord): FlowRecord {
  const prior = initial?.entityType === "flow" ? initial : undefined;
  const status = values.status === "published" || values.status === "archived" ? values.status : "unpublished";
  return { displayName: values.name.trim(), entityType: "flow", flowId: values.id.trim(), inputFields: splitComma(values.inputs), intro: values.intro.trim(), isDemo: true, lastUsedAt: prior?.lastUsedAt ?? null, outputFields: splitComma(values.outputs), provenanceStatus: "placeholder", recommendable: status === "published", serviceDomain: values.serviceDomain.trim() || "未分类", status, steps: values.steps.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(parseStep) };
}

function parseStep(line: string, index: number): CatalogStep {
  const [raw, label] = line.split("|").map((item) => item.trim());
  const isHandler = raw.startsWith("handler:");
  const value = raw.replace(/^(handler|inline):/, "").trim();
  return { displayName: label || value, entityId: isHandler ? value : null, provenanceStatus: "placeholder", sourceReference: isHandler ? null : value, stepKind: isHandler ? "handler" : "inline", stepOrder: index + 1 };
}

function executionValue(label: string) {
  return ({ "同步处理": "sync", "异步提交": "async_submit", "同步调用外部服务": "external_service_sync", "同步调用外部模型": "external_model_sync" } as Record<string, string>)[label] ?? "sync";
}

function splitComma(value: string) { return value.split(/[,，]/).map((item) => item.trim()).filter(Boolean); }
function recordId(record: CatalogRecord) { return record.entityType === "handler" ? record.handlerId : record.flowId; }
function Field({ children, className, hint, label, required }: { children: React.ReactNode; className?: string; hint?: string; label: string; required?: boolean }) { return <label className={className}><span className="text-sm font-medium text-gray-800">{label}{required ? <span className="ml-1 text-red-600">*</span> : null}</span>{hint ? <span className="ml-2 text-xs text-gray-500">{hint}</span> : null}{children}</label>; }
