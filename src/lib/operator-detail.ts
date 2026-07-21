import type { OperatorDomain, OperatorRecord } from "@/lib/operator-data";

export const domainLabels: Record<OperatorDomain, string> = {
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

export type OperatorDetailContent = {
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

export type FlowStatus = "current" | "historical";

export type FlowStep = {
  id: string;
  kind: "operator" | "inline" | "external";
  label?: string;
};

export type OperatorFlow = {
  description: string;
  fieldMappings: string[];
  id: string;
  inputFields: string[];
  name: string;
  outputFields: string[];
  status: FlowStatus;
  steps: FlowStep[];
};

export type LineageRelationKind =
  | "cooccurrence"
  | "field_compatible"
  | "flow_use"
  | "sequence";

export type LineageRelation = {
  flowId?: string;
  id: string;
  kind: LineageRelationKind;
  label: string;
  source: string;
  target: string;
};

const operatorFlows: OperatorFlow[] = [
  {
    id: "flow.multimodal-content-review",
    name: "多模态内容理解与质检",
    status: "current",
    description: "把可访问的媒体地址交给模型生成结构化描述，再汇总为质检结果。",
    inputFields: ["urls"],
    outputFields: ["deepseek_output", "quality_result"],
    fieldMappings: ["signed_urls → urls", "deepseek_output → model_result"],
    steps: [
      { id: "tos.sign", kind: "operator" },
      { id: "ai-platform.deepseek", kind: "operator" },
      { id: "quality-schema", kind: "inline", label: "结构校验" },
      { id: "jsonl.agg", kind: "operator" },
    ],
  },
  {
    id: "flow.video-segment-review",
    name: "视频片段理解与人工复核",
    status: "current",
    description: "将长视频切成片段，逐段生成描述，并交给人工复核。",
    inputFields: ["tos_path"],
    outputFields: ["segment_caption", "review_result"],
    fieldMappings: ["split_tos_path → tos_path"],
    steps: [
      { id: "vod.split", kind: "operator" },
      { id: "csv.expand", kind: "operator" },
      { id: "ai-platform.gemini", kind: "operator" },
      { id: "human-review", kind: "external", label: "人工复核" },
    ],
  },
  {
    id: "flow.vod-preview-delivery",
    name: "VOD 预览交付",
    status: "current",
    description: "上传媒体、完成转码并取回可供验收的预览地址。",
    inputFields: ["tos_path"],
    outputFields: ["preview_url"],
    fieldMappings: ["vid → vid", "runid → runid"],
    steps: [
      { id: "vod.upload", kind: "operator" },
      { id: "vod.transcoding.start", kind: "operator" },
      { id: "vod.transcoding.query.v2", kind: "operator" },
      { id: "vod.transcoding.get", kind: "operator" },
    ],
  },
  {
    id: "flow.audio-transcription",
    name: "音频转写入库",
    status: "current",
    description: "提交音频转写任务，查询文本结果并写入数据集。",
    inputFields: ["audio_tos_path", "rowkey"],
    outputFields: ["asr"],
    fieldMappings: ["asr_task_id → asr_task_id", "asr → transcript"],
    steps: [
      { id: "vod.audio.asr.submit", kind: "operator" },
      { id: "vod.audio.asr.query", kind: "operator" },
      { id: "hbase.set.v2", kind: "operator" },
    ],
  },
  {
    id: "flow.image-quality-gate",
    name: "图片质量筛选与汇总",
    status: "current",
    description: "统一图片尺寸，补充质量分，再将通过的数据汇总交付。",
    inputFields: ["tos_path"],
    outputFields: ["merge_tos_path"],
    fieldMappings: ["resize_tos_path → tos_path", "average_ap_score → score"],
    steps: [
      { id: "image.resize", kind: "operator" },
      { id: "cn_clip.artimuse", kind: "operator" },
      { id: "ap_v25.filter", kind: "operator" },
      { id: "csv.merge", kind: "operator" },
    ],
  },
  {
    id: "history.general-model-label-v1",
    name: "通用模型批量标注（旧版）",
    status: "historical",
    description: "曾用于批量读取媒体列表并生成模型标签，当前未注册。",
    inputFields: ["tos_dir"],
    outputFields: ["merge_tos_path"],
    fieldMappings: ["signed_urls → urls"],
    steps: [
      { id: "tos.list", kind: "operator" },
      { id: "tos.sign", kind: "operator" },
      { id: "ai-platform.deepseek", kind: "operator" },
      { id: "csv.merge", kind: "operator" },
    ],
  },
  {
    id: "history.black-border-cleanup-v1",
    name: "视频黑边清理（旧版）",
    status: "historical",
    description: "曾先检测黑边参数再执行裁剪，当前未注册。",
    inputFields: ["tos_path"],
    outputFields: ["crop_tos_path"],
    fieldMappings: ["black_border_crop → crop_config"],
    steps: [
      { id: "vod.crop.blackborder.get", kind: "operator" },
      { id: "vod.crop.blackborder.crop", kind: "operator" },
      { id: "vod.upload.tos", kind: "operator" },
    ],
  },
  {
    id: "history.dataset-write-v1",
    name: "数据集字段回写（旧版）",
    status: "historical",
    description: "曾根据对象路径生成主键并回写字段，当前未注册。",
    inputFields: ["tos_path"],
    outputFields: ["rowkey"],
    fieldMappings: ["rowkey → rowkey"],
    steps: [
      { id: "rowkey", kind: "operator" },
      { id: "hbase.get", kind: "operator" },
      { id: "hbase.set", kind: "operator" },
    ],
  },
];

const fieldRelations: LineageRelation[] = [
  relation("csv.expand", "ai-platform.gemini", "field_compatible", "片段路径可映射为模型输入"),
  relation("csv.expand", "ai-platform.qwen_tmp1", "field_compatible", "展开字段可接自定义模型输入"),
  relation("vod.upload", "vod.transcoding.start", "field_compatible", "上传结果提供 vid"),
  relation("vod.transcoding.start", "vod.transcoding.query.v2", "field_compatible", "启动结果提供 runid"),
  relation("vod.audio.asr.submit", "vod.audio.asr.query", "field_compatible", "提交结果提供任务 ID"),
  relation("vod.crop.blackborder.get", "vod.crop.blackborder.crop", "field_compatible", "检测结果提供裁剪参数"),
  relation("vod_workflow", "video_cls.url", "field_compatible", "下载地址可接视频分类"),
  relation("rowkey", "hbase.get", "field_compatible", "生成的 rowkey 可用于读取"),
  relation("hbase.get", "hbase.set.v2", "field_compatible", "读取字段可继续回写"),
  relation("tos.external_sign", "video_cls.url", "field_compatible", "签名地址可作为分类输入"),
  relation("image.resize", "ai-platform.gemini", "field_compatible", "处理后图片路径可接模型"),
  relation("csv.unique", "jsonl.agg", "field_compatible", "去重结果可继续聚合"),
];

export const lineageRelations = [...buildFlowRelations(operatorFlows), ...fieldRelations];

export function getOperatorFlows(operatorId: string, status: FlowStatus) {
  return operatorFlows.filter(
    (flow) =>
      flow.status === status &&
      flow.steps.some((step) => step.kind === "operator" && step.id === operatorId)
  );
}

export function parseOperatorDetail(operator: OperatorRecord): OperatorDetailContent {
  const decision = extractSection(operator.wiki, "决策");
  const inputSection = extractSection(operator.wiki, "数据输入");
  const configurationSection = extractSection(operator.wiki, "配置");
  const outputSection = extractSection(operator.wiki, "输出");
  const riskSection = extractSection(operator.wiki, "风险");
  const behaviorLine = getDecisionValue(decision, "行为");

  return {
    suitableFor: getDecisionValue(decision, "适用") || operator.intro,
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

function buildFlowRelations(flows: OperatorFlow[]) {
  const relations: LineageRelation[] = [];

  flows.forEach((flow) => {
    const operatorSteps = flow.steps.filter((step) => step.kind === "operator");

    operatorSteps.slice(0, -1).forEach((step, index) => {
      const nextStep = operatorSteps[index + 1];
      relations.push({
        id: `${flow.id}:sequence:${step.id}:${nextStep.id}`,
        source: step.id,
        target: nextStep.id,
        kind: "sequence",
        label: `${flow.name}中的前后步骤`,
        flowId: flow.id,
      });
    });

    if (operatorSteps.length > 2) {
      relations.push({
        id: `${flow.id}:cooccurrence:${operatorSteps[0].id}:${operatorSteps.at(-1)?.id ?? ""}`,
        source: operatorSteps[0].id,
        target: operatorSteps.at(-1)?.id ?? operatorSteps[0].id,
        kind: "cooccurrence",
        label: `共同参与${flow.name}`,
        flowId: flow.id,
      });
    }
  });

  return relations;
}

function relation(
  source: string,
  target: string,
  kind: LineageRelationKind,
  label: string
): LineageRelation {
  return {
    id: `${kind}:${source}:${target}`,
    source,
    target,
    kind,
    label,
  };
}

function extractSection(wiki: string, title: string) {
  const marker = `## ${title}`;
  const start = wiki.indexOf(marker);
  if (start === -1) return "";

  const contentStart = start + marker.length;
  const remaining = wiki.slice(contentStart);
  const nextSection = remaining.search(/\n##\s/);
  return (nextSection === -1 ? remaining : remaining.slice(0, nextSection)).trim();
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
      (item) =>
        item &&
        !item.startsWith("|") &&
        !item.startsWith("源码默认配置表达式")
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
