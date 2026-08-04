export type CatalogEntityType = "handler" | "flow";

export type CatalogStatus =
  | "enabled"
  | "disabled"
  | "published"
  | "unpublished"
  | "archived"
  | "discovered"
  | "needs_confirmation";

export type ProvenanceStatus =
  | "verified"
  | "unknown"
  | "placeholder"
  | "needs_confirmation";

export type RegistrationSource = "inline" | "auto" | "manual" | "auto+manual";

export type PipelineScope = "global" | "project";

export type HandlerDomain =
  | "ai-labeling"
  | "audio"
  | "delivery"
  | "hbase"
  | "image"
  | "metadata"
  | "storage"
  | "tabular"
  | "validation"
  | "video";

export type CostProfile = {
  costUnit: string;
  costValue: number | null;
  currency: string;
  isPlaceholder: boolean;
  sourceStatus: ProvenanceStatus;
};

export type ResourceProfile = {
  isPlaceholder: boolean;
  resourceId: string | null;
  sourceStatus: ProvenanceStatus;
  usageUnit: string;
  usageValue: number | null;
};

export type HandlerRecord = {
  behavior: string;
  cardinality: string;
  costProfile: CostProfile;
  detailMarkdown: string;
  displayName: string;
  domains: HandlerDomain[];
  entityType: "handler";
  handlerId: string;
  initial: string;
  intro: string;
  provenanceStatus: ProvenanceStatus;
  resourceProfile: ResourceProfile;
  status: CatalogStatus;
  testability: "available" | "unavailable" | "unknown";
};

export type FlowRecord = {
  displayName: string;
  entityType: "flow";
  flowId: string;
  inputFields: string[];
  intro: string;
  isDemo: boolean;
  lastUsedAt: string | null;
  outputFields: string[];
  provenanceStatus: ProvenanceStatus;
  recommendable: boolean;
  serviceDomain: string;
  status: "published" | "unpublished" | "archived";
  steps: CatalogStep[];
};

export type CatalogStepKind = "handler" | "inline" | "unknown";

export type CatalogStep = {
  displayName: string;
  entityId: string | null;
  provenanceStatus: ProvenanceStatus;
  sourceReference: string | null;
  stepKind: CatalogStepKind;
  stepOrder: number;
};

export type PipelineRecord = {
  costProfile: CostProfile;
  displayName: string;
  entityType: "pipeline";
  fieldMappings?: string[];
  inputFields?: string[];
  keyField: string | null;
  outputFields: string[];
  pipelineId: string;
  projectName?: string | null;
  provenanceStatus: ProvenanceStatus;
  recommendable: boolean;
  registrationSource: RegistrationSource;
  resourceProfile: ResourceProfile;
  scope?: PipelineScope;
  sourceFlowIds: string[];
  status: CatalogStatus;
  steps: CatalogStep[];
};

export type CatalogRecord = HandlerRecord | FlowRecord;

export const placeholderCostProfile: CostProfile = {
  costUnit: "次",
  costValue: null,
  currency: "CNY",
  isPlaceholder: true,
  sourceStatus: "placeholder",
};

export const placeholderResourceProfile: ResourceProfile = {
  isPlaceholder: true,
  resourceId: null,
  sourceStatus: "placeholder",
  usageUnit: "路并发",
  usageValue: null,
};
