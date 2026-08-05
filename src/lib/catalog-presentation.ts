import type { CatalogRecord, FlowRecord, HandlerRecord } from "@/lib/catalog-types";

export type ActivityMetric = "total" | "7d" | "30d";
export type ActivityHealth = "active" | "dormant" | "steady";
export type BehaviorCategory = "aggregate" | "enrich" | "fanout" | "filter" | "io" | "transform";
export type ResourceLevel = "high" | "low" | "medium" | "very-high";

export type ActivityProfile = {
  calls7d: number;
  calls30d: number;
  health: ActivityHealth;
  lastRunAt: string | null;
  totalCalls: number;
};

export type ConsumptionProfile = {
  costPerRun: number;
  pressureFactor: string;
  resourceLevel: ResourceLevel;
  resourceType: string;
  speed: "fast" | "medium" | "slow";
  typicalDuration: string;
};

export type CatalogPresentation = {
  activity: ActivityProfile;
  behavior: {
    category: BehaviorCategory;
    description: string;
    label: string;
  };
  capabilityDescription: string;
  consumption: ConsumptionProfile;
};

const behaviorDefinitions: Record<BehaviorCategory, CatalogPresentation["behavior"]> = {
  aggregate: { category: "aggregate", description: "聚合多条输入，形成汇总结果。", label: "Aggregate / 聚合" },
  enrich: { category: "enrich", description: "补充、生成或扩展结构化字段。", label: "Enrich / 补充" },
  fanout: { category: "fanout", description: "将单条输入拆分或分发为多条处理单元。", label: "Fanout / 拆分" },
  filter: { category: "filter", description: "校验规则并筛除不满足条件的数据。", label: "Filter / 过滤" },
  io: { category: "io", description: "读取、写入或交付外部数据与文件。", label: "IO / 读写" },
  transform: { category: "transform", description: "转换、规范化或重组已有数据。", label: "Transform / 转换" },
};

const consumptionDefinitions: Record<BehaviorCategory, ConsumptionProfile> = {
  aggregate: { costPerRun: 0.012, pressureFactor: "并发", resourceLevel: "medium", resourceType: "内存聚合", speed: "medium", typicalDuration: "3-8 秒" },
  enrich: { costPerRun: 0.046, pressureFactor: "并发 + QPS", resourceLevel: "very-high", resourceType: "外部模型推理", speed: "slow", typicalDuration: "8-20 秒" },
  fanout: { costPerRun: 0.018, pressureFactor: "并发", resourceLevel: "high", resourceType: "任务分发", speed: "medium", typicalDuration: "2-6 秒" },
  filter: { costPerRun: 0.003, pressureFactor: "QPS", resourceLevel: "low", resourceType: "规则计算", speed: "fast", typicalDuration: "0.1-1 秒" },
  io: { costPerRun: 0.006, pressureFactor: "并发 + QPS", resourceLevel: "medium", resourceType: "网络与存储 I/O", speed: "fast", typicalDuration: "0.5-3 秒" },
  transform: { costPerRun: 0.009, pressureFactor: "并发", resourceLevel: "medium", resourceType: "CPU 数据处理", speed: "medium", typicalDuration: "1-5 秒" },
};

const legacyBehaviorMap: Record<string, BehaviorCategory> = {
  aggregate: "aggregate",
  enrich: "enrich",
  fanout: "fanout",
  filter: "filter",
  io: "io",
  transform: "transform",
  transform_or_write: "io",
  validate_or_filter: "filter",
};

export function getCatalogPresentation(record: CatalogRecord): CatalogPresentation {
  const behavior = record.entityType === "handler" ? getHandlerBehavior(record) : getFlowBehavior(record);
  const baseConsumption = consumptionDefinitions[behavior.category];
  const consumption = record.entityType === "flow"
    ? { ...baseConsumption, costPerRun: Number((baseConsumption.costPerRun * Math.max(record.steps.length, 1) * 0.84).toFixed(3)) }
    : baseConsumption;

  return {
    activity: getActivityProfile(record),
    behavior,
    capabilityDescription: normalizeCapabilityDescription(record.intro),
    consumption,
  };
}

export function getActivityMetricLabel(metric: ActivityMetric) {
  return { "7d": "近 7 天", "30d": "近 30 天", total: "总调用" }[metric];
}

export function getActivityMetricValue(activity: ActivityProfile, metric: ActivityMetric) {
  return metric === "total" ? activity.totalCalls : metric === "7d" ? activity.calls7d : activity.calls30d;
}

export function getActivityHealthLabel(health: ActivityHealth) {
  return {
    active: "Active / 活跃",
    dormant: "Dormant / 休眠",
    steady: "Steady / 常规",
  }[health];
}

export function getActivityHealthTone(health: ActivityHealth) {
  return {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dormant: "bg-red-50 text-red-800 ring-red-200",
    steady: "bg-amber-50 text-amber-900 ring-amber-200",
  }[health];
}

export function getResourceLevelLabel(level: ResourceLevel) {
  return { high: "高", low: "低", medium: "中", "very-high": "极高" }[level];
}

export function getResourceLevelTone(level: ResourceLevel) {
  return {
    high: "bg-amber-50 text-amber-800 ring-amber-200",
    low: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    medium: "bg-blue-50 text-blue-800 ring-blue-200",
    "very-high": "bg-red-50 text-red-800 ring-red-200",
  }[level];
}

export function getSpeedLabel(speed: ConsumptionProfile["speed"]) {
  return { fast: "快速", medium: "中速", slow: "慢速" }[speed];
}

export function formatCallCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function getHandlerBehavior(handler: HandlerRecord) {
  return behaviorDefinitions[legacyBehaviorMap[handler.behavior] ?? "transform"];
}

function getFlowBehavior(flow: FlowRecord) {
  const stepText = flow.steps.map((step) => `${step.displayName} ${step.entityId ?? ""}`).join(" ").toLowerCase();
  if (/过滤|校验|审核|filter/.test(stepText)) return behaviorDefinitions.filter;
  if (/聚合|汇总|merge|agg/.test(stepText)) return behaviorDefinitions.aggregate;
  if (/读取|签名|上传|交付|tos|io/.test(stepText)) return behaviorDefinitions.io;
  return behaviorDefinitions.enrich;
}

function getActivityProfile(record: CatalogRecord): ActivityProfile {
  const id = record.entityType === "handler" ? record.handlerId : record.flowId;
  const seed = stableNumber(id);
  const bucket = seed % 3;
  const calls30d = bucket === 0 ? 4 + (seed % 6) : bucket === 1 ? 10 + (seed % 21) : 31 + (seed % 55);
  const calls7d = Math.max(0, Math.min(calls30d, Math.round(calls30d * (0.16 + ((seed >>> 3) % 18) / 100))));
  const totalCalls = calls30d * (18 + (seed % 39)) + 90 + ((seed >>> 7) % 640);
  const lastRunAt = record.entityType === "flow" && record.lastUsedAt
    ? record.lastUsedAt
    : `2026-08-${String(1 + (seed % 5)).padStart(2, "0")}`;
  return {
    calls7d,
    calls30d,
    health: calls30d < 10 ? "dormant" : calls30d <= 30 ? "steady" : "active",
    lastRunAt,
    totalCalls,
  };
}

function normalizeCapabilityDescription(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "暂无已登记能力描述。";
  return /[。！？]$/.test(trimmed) ? trimmed : `${trimmed.replace(/[，,]$/, "")}。`;
}

function stableNumber(value: string) {
  return Array.from(value).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
}
