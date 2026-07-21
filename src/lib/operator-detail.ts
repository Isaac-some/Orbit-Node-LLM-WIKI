import type { OperatorDomain, OperatorRecord } from "@/lib/operator-data";
import {
  operatorFlows,
  type FlowStatus,
  type OperatorFlow,
} from "@/lib/operator-flow-data";

export type { FlowStatus, FlowStep, OperatorFlow } from "@/lib/operator-flow-data";

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

export type LineageRelationKind =
  | "cooccurrence"
  | "field_compatible"
  | "flow_use"
  | "sequence";

export type LineageRelation = {
  flowIds?: string[];
  id: string;
  kind: LineageRelationKind;
  label: string;
  serviceDomains?: string[];
  source: string;
  target: string;
};

export type ReusableOperatorPattern = {
  currentFlowCount: number;
  evidenceFlows: OperatorFlow[];
  flowCount: number;
  historicalFlowCount: number;
  id: string;
  kind: "cooccurrence" | "sequence";
  operatorIds: [string, string];
  serviceDomains: string[];
};

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

export function getReusableOperatorPatterns(operatorId: string): ReusableOperatorPattern[] {
  const relevantFlows = operatorFlows.filter((flow) =>
    flow.steps.some((step) => step.kind === "operator" && step.id === operatorId)
  );
  const patterns = new Map<
    string,
    {
      flowIds: Set<string>;
      kind: "cooccurrence" | "sequence";
      operatorIds: [string, string];
      serviceDomains: Set<string>;
    }
  >();

  function addPattern(
    kind: "cooccurrence" | "sequence",
    operatorIds: [string, string],
    flow: OperatorFlow
  ) {
    const id = `${kind}:${operatorIds.join(":")}`;
    const existing = patterns.get(id);

    if (existing) {
      existing.flowIds.add(flow.id);
      existing.serviceDomains.add(flow.serviceDomain);
      return;
    }

    patterns.set(id, {
      flowIds: new Set([flow.id]),
      kind,
      operatorIds,
      serviceDomains: new Set([flow.serviceDomain]),
    });
  }

  relevantFlows.forEach((flow) => {
    flow.steps.slice(0, -1).forEach((step, index) => {
      const nextStep = flow.steps[index + 1];

      if (
        step.kind === "operator" &&
        nextStep.kind === "operator" &&
        (step.id === operatorId || nextStep.id === operatorId)
      ) {
        addPattern("sequence", [step.id, nextStep.id], flow);
      }
    });

    const operatorIds = [
      ...new Set(
        flow.steps
          .filter((step) => step.kind === "operator")
          .map((step) => step.id)
      ),
    ];

    operatorIds.forEach((otherId) => {
      if (otherId === operatorId) return;
      addPattern(
        "cooccurrence",
        [operatorId, otherId].sort() as [string, string],
        flow
      );
    });
  });

  const materialized = [...patterns.entries()]
    .map(([id, pattern]) => {
      const evidenceFlows = relevantFlows
        .filter((flow) => pattern.flowIds.has(flow.id))
        .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));

      return {
        id,
        kind: pattern.kind,
        operatorIds: pattern.operatorIds,
        flowCount: evidenceFlows.length,
        currentFlowCount: evidenceFlows.filter((flow) => flow.status === "current").length,
        historicalFlowCount: evidenceFlows.filter((flow) => flow.status === "historical").length,
        serviceDomains: [...pattern.serviceDomains].sort(),
        evidenceFlows,
      } satisfies ReusableOperatorPattern;
    })
    .filter((pattern) => pattern.flowCount >= 2 && pattern.serviceDomains.length >= 2);

  const sequencePatterns = materialized
    .filter((pattern) => pattern.kind === "sequence")
    .sort(comparePatterns);
  const sequencePairs = new Set(
    sequencePatterns.map((pattern) => [...pattern.operatorIds].sort().join(":"))
  );
  const cooccurrencePatterns = materialized
    .filter(
      (pattern) =>
        pattern.kind === "cooccurrence" &&
        !sequencePairs.has([...pattern.operatorIds].sort().join(":"))
    )
    .sort(comparePatterns);

  return [...sequencePatterns.slice(0, 2), ...cooccurrencePatterns.slice(0, 1)];
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
  const relations = new Map<
    string,
    {
      flowIds: Set<string>;
      kind: "cooccurrence" | "sequence";
      serviceDomains: Set<string>;
      source: string;
      target: string;
    }
  >();

  function addRelation(
    kind: "cooccurrence" | "sequence",
    source: string,
    target: string,
    flow: OperatorFlow
  ) {
    const endpoints = kind === "cooccurrence" ? [source, target].sort() : [source, target];
    const id = `${kind}:${endpoints.join(":")}`;
    const existing = relations.get(id);

    if (existing) {
      existing.flowIds.add(flow.id);
      existing.serviceDomains.add(flow.serviceDomain);
      return;
    }

    relations.set(id, {
      flowIds: new Set([flow.id]),
      kind,
      serviceDomains: new Set([flow.serviceDomain]),
      source: endpoints[0],
      target: endpoints[1],
    });
  }

  flows.forEach((flow) => {
    flow.steps.slice(0, -1).forEach((step, index) => {
      const nextStep = flow.steps[index + 1];
      if (step.kind === "operator" && nextStep.kind === "operator") {
        addRelation("sequence", step.id, nextStep.id, flow);
      }
    });

    const operatorIds = [
      ...new Set(
        flow.steps
          .filter((step) => step.kind === "operator")
          .map((step) => step.id)
      ),
    ];

    operatorIds.forEach((source, sourceIndex) => {
      operatorIds.slice(sourceIndex + 1).forEach((target) => {
        addRelation("cooccurrence", source, target, flow);
      });
    });
  });

  const sequencePairs = new Set(
    [...relations.values()]
      .filter((item) => item.kind === "sequence")
      .map((item) => [item.source, item.target].sort().join(":"))
  );

  return [...relations.entries()]
    .filter(([, item]) => {
      if (item.kind === "sequence") return true;
      return (
        item.flowIds.size >= 2 &&
        !sequencePairs.has([item.source, item.target].sort().join(":"))
      );
    })
    .map(([id, item]) => {
      const flowIds = [...item.flowIds];
      const serviceDomains = [...item.serviceDomains].sort();
      const relationLabel =
        item.kind === "sequence"
          ? `在 ${flowIds.length} 个 Flow 中连续串联`
          : `在 ${flowIds.length} 个 Flow 中共同使用`;

      return {
        id,
        source: item.source,
        target: item.target,
        kind: item.kind,
        label: `${relationLabel}，覆盖 ${serviceDomains.length} 个服务场景`,
        flowIds,
        serviceDomains,
      } satisfies LineageRelation;
    });
}

function comparePatterns(a: ReusableOperatorPattern, b: ReusableOperatorPattern) {
  return b.flowCount - a.flowCount || b.serviceDomains.length - a.serviceDomains.length;
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
