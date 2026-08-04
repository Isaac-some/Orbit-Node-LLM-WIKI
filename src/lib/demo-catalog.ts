import type { CatalogRecord, FlowRecord, HandlerRecord } from "@/lib/catalog-types";

const CATALOG_STORAGE_KEY = "operator-map.demo-catalog.v2";
const EVENT_STORAGE_KEY = "operator-map.demo-events.v1";
const MAX_EVENTS = 500;

export type DemoCatalogData = {
  flows: FlowRecord[];
  handlers: HandlerRecord[];
};

type DemoEvent = {
  at: string;
  entityId?: string;
  entityType?: CatalogRecord["entityType"];
  event:
    | "catalog_create"
    | "catalog_delete"
    | "catalog_detail_view"
    | "catalog_update"
    | "developer_mode_change"
    | "handler_test_sample_loaded"
    | "handler_test_submitted";
  metadata?: Record<string, boolean | number | string>;
};

export function loadDemoCatalog(fallback: DemoCatalogData): DemoCatalogData {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<DemoCatalogData>;
    if (!Array.isArray(parsed.handlers) || !Array.isArray(parsed.flows)) return fallback;
    return { handlers: parsed.handlers, flows: parsed.flows };
  } catch {
    return fallback;
  }
}

export function saveDemoCatalog(data: DemoCatalogData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));
}

export function trackDemoEvent(event: Omit<DemoEvent, "at">) {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem(EVENT_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as DemoEvent[]) : [];
    const events = Array.isArray(parsed) ? parsed : [];
    events.push({ ...event, at: new Date().toISOString() });
    window.localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Demo telemetry must never block the user's primary action.
  }
}
