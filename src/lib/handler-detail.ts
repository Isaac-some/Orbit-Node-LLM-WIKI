import type { HandlerDomain, HandlerRecord } from "@/lib/catalog-types";

export const domainLabels: Record<HandlerDomain, string> = {
  "ai-labeling": "AI 打标与模型",
  audio: "音频处理",
  delivery: "预览与交付",
  hbase: "HBase 读写",
  image: "图片处理",
  metadata: "媒体元数据",
  storage: "存储、取数与链接",
  tabular: "表格与字段处理",
  validation: "校验与过滤",
  video: "视频处理",
};

export const behaviorLabels: Record<string, string> = {
  aggregate: "聚合多条数据",
  enrich: "补充字段",
  fanout: "拆分为多条数据",
  transform: "转换数据",
  transform_or_write: "转换并写入",
  validate_or_filter: "校验或过滤",
};

export const cardinalityLabels: Record<string, string> = {
  "1:1": "每条输入对应一条输出",
  "1:N": "一条输入可拆分为多条输出",
  "N:1": "多条输入聚合为一条输出",
};

export type DetailField = {
  cardinality?: string;
  field: string;
  meaning: string;
  providedBy?: string;
  required?: string;
  type: string;
};

export type DetailConfiguration = {
  defaultValue: string;
  name: string;
  required: string;
  type: string;
};

export type HandlerDetailContent = {
  avoidWhen: string;
  configurations: DetailConfiguration[];
  configurationNote?: string;
  dependencies: string;
  execution: string;
  inputs: DetailField[];
  inputNote?: string;
  outputs: DetailField[];
  outputNote?: string;
  risks: string[];
  suitableFor: string;
};

export function parseHandlerDetail(handler: HandlerRecord): HandlerDetailContent {
  const decision = extractSection(handler.detailMarkdown, "决策");
  const inputSection = extractSection(handler.detailMarkdown, "数据输入");
  const configurationSection = extractSection(handler.detailMarkdown, "配置");
  const outputSection = extractSection(handler.detailMarkdown, "输出");
  const riskSection = extractSection(handler.detailMarkdown, "风险");
  const behaviorLine = getDecisionValue(decision, "行为");

  return {
    suitableFor: getDecisionValue(decision, "适用") || handler.intro,
    avoidWhen: getDecisionValue(decision, "不适用") || "暂无明确限制说明。",
    dependencies: getDecisionValue(decision, "硬依赖") || "无已知硬依赖",
    execution: extractExecution(behaviorLine),
    inputs: parseFieldTable(inputSection, true),
    inputNote: parsePlainSectionNote(inputSection),
    configurations: parseConfigurationTable(configurationSection),
    configurationNote: parsePlainSectionNote(configurationSection),
    outputs: parseFieldTable(outputSection, false),
    outputNote: parsePlainSectionNote(outputSection),
    risks: riskSection
      .split("\n")
      .filter((line) => line.trim().startsWith("- "))
      .map((line) => cleanText(line.replace(/^\s*-\s*/, "")))
      .filter(Boolean),
  };
}

function extractSection(markdown: string, title: string) {
  const marker = `## ${title}`;
  const start = markdown.indexOf(marker);
  if (start === -1) return "";
  const content = markdown.slice(start + marker.length);
  const nextSection = content.search(/\n##\s/);
  return (nextSection === -1 ? content : content.slice(0, nextSection)).trim();
}

function getDecisionValue(section: string, label: string) {
  const prefix = `- **${label}**：`;
  const line = section.split("\n").find((item) => item.trim().startsWith(prefix));
  return line ? cleanText(line.trim().slice(prefix.length)) : "";
}

function extractExecution(behaviorLine: string) {
  const match = behaviorLine.match(/执行\s+([^。；]+)/);
  const execution = match?.[1]?.trim();
  if (!execution || execution === "unknown") return "执行方式待确认";

  const labels: Record<string, string> = {
    async_poll: "异步查询",
    async_submit: "异步提交",
    external_model_sync: "同步调用外部模型",
    external_service_sync: "同步调用外部服务",
    sync: "同步处理",
  };
  return labels[execution] ?? execution;
}

function parseFieldTable(section: string, includesRequired: boolean): DetailField[] {
  const rows = parseTable(section);
  if (rows.length < 2) return [];

  return rows.slice(1).map((row) => ({
    field: cleanText(row[0] ?? ""),
    type: cleanText(row[1] ?? "待确认"),
    required: includesRequired ? cleanText(row[2] ?? "待确认") : undefined,
    meaning: cleanText(row[includesRequired ? 3 : 2] ?? "暂无说明"),
    cardinality: cleanText(row[includesRequired ? 4 : 3] ?? ""),
    providedBy: includesRequired ? cleanText(row[5] ?? "") : undefined,
  }));
}

function parseConfigurationTable(section: string): DetailConfiguration[] {
  const rows = parseTable(section);
  if (rows.length < 2) return [];

  return rows.slice(1).map((row) => ({
    name: cleanText(row[0] ?? ""),
    type: cleanText(row[1] ?? "待确认"),
    required: cleanText(row[2] ?? "待确认"),
    defaultValue: normalizeUnknown(cleanText(row[3] ?? "待确认")),
  }));
}

function parseTable(section: string) {
  return section
    .split("\n")
    .filter((line) => line.trim().startsWith("|") && line.trim().endsWith("|"))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
}

function parsePlainSectionNote(section: string) {
  const line = section
    .split("\n")
    .map((item) => item.trim())
    .find(
      (item) => item && !item.startsWith("|") && !item.startsWith("源码默认配置表达式")
    );
  return line ? cleanText(line) : undefined;
}

function cleanText(value: string) {
  return normalizeUnknown(
    value
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/`/g, "")
      .replace(/\*\*/g, "")
      .replace(/\\-/g, "-")
      .replace(/,$/, "。")
      .trim()
  );
}

function normalizeUnknown(value: string) {
  return value === "unknown" ? "待确认" : value;
}
