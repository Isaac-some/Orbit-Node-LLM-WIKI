"use client";

import {
  ArrowRight,
  Focus,
  GitBranch,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  domainLabels,
  lineageRelations,
  type LineageRelationKind,
} from "@/lib/operator-detail";
import type { OperatorDomain, OperatorRecord } from "@/lib/operator-data";
import { cn } from "@/lib/utils";

const graphWidth = 1440;
const graphHeight = 860;

const clusterCenters: Record<OperatorDomain, { x: number; y: number }> = {
  "ai-labeling": { x: 410, y: 210 },
  audio: { x: 990, y: 500 },
  delivery: { x: 570, y: 725 },
  hbase: { x: 1240, y: 515 },
  image: { x: 735, y: 245 },
  metadata: { x: 770, y: 500 },
  storage: { x: 790, y: 725 },
  tabular: { x: 1120, y: 210 },
  validation: { x: 1120, y: 710 },
  video: { x: 390, y: 555 },
};

const domainOrder = Object.keys(clusterCenters) as OperatorDomain[];

const relationLabels: Record<LineageRelationKind, string> = {
  cooccurrence: "共同参与同一 Flow",
  field_compatible: "字段可接",
  flow_use: "Flow 使用",
  sequence: "Flow 前后步骤",
};

type GraphNode = {
  operator: OperatorRecord;
  x: number;
  y: number;
};

export function OperatorLineageMap({
  onOpenDetail,
  operators,
  selectedId,
}: {
  onOpenDetail: (operatorId: string) => void;
  operators: OperatorRecord[];
  selectedId?: string;
}) {
  const [focusedId, setFocusedId] = useState(selectedId ?? operators[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState("");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ height: 800, width: 1180 });
  const containerRef = useRef<HTMLElement>(null);

  const nodes = useMemo(() => buildGraphNodes(operators), [operators]);
  const nodeLookup = useMemo(
    () => new Map(nodes.map((node) => [node.operator.id, node])),
    [nodes]
  );
  const visibleRelations = useMemo(
    () =>
      lineageRelations.filter(
        (relation) => nodeLookup.has(relation.source) && nodeLookup.has(relation.target)
      ),
    [nodeLookup]
  );
  const focusedOperator = operators.find((operator) => operator.id === focusedId);
  const focusedNode = nodeLookup.get(focusedId);
  const hoveredNeighborIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();

    const ids = new Set<string>([hoveredId]);
    visibleRelations.forEach((relation) => {
      if (relation.source === hoveredId) ids.add(relation.target);
      if (relation.target === hoveredId) ids.add(relation.source);
    });
    return ids;
  }, [hoveredId, visibleRelations]);
  const normalizedQuery = query.trim().toLowerCase();
  const matchedIds = useMemo(
    () =>
      new Set(
        normalizedQuery
          ? operators
              .filter((operator) =>
                [operator.id, operator.displayName, ...operator.domains.map((domain) => domainLabels[domain])]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizedQuery)
              )
              .map((operator) => operator.id)
          : []
      ),
    [normalizedQuery, operators]
  );

  const canvasAspect = canvasSize.width / Math.max(canvasSize.height, 1);
  const graphAspect = graphWidth / graphHeight;
  const baseWidth = canvasAspect >= graphAspect ? graphWidth : graphHeight * canvasAspect;
  const baseHeight = canvasAspect >= graphAspect ? graphWidth / canvasAspect : graphHeight;
  const visibleWidth = baseWidth / zoom;
  const visibleHeight = baseHeight / zoom;
  const useFocusedCenter = canvasSize.width < 720;
  const centerX = useFocusedCenter && focusedNode ? focusedNode.x : graphWidth / 2;
  const centerY = useFocusedCenter && focusedNode ? focusedNode.y : graphHeight / 2;
  const viewX = clamp(centerX - visibleWidth / 2, 0, graphWidth - visibleWidth);
  const viewY = clamp(centerY - visibleHeight / 2, 0, graphHeight - visibleHeight);
  const viewBox = `${viewX} ${viewY} ${visibleWidth} ${visibleHeight}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const bounds = container.getBoundingClientRect();
      setCanvasSize({
        height: Math.max(bounds.height, 1),
        width: Math.max(bounds.width, 1),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function selectFirstMatch() {
    const firstMatch = nodes.find((node) => matchedIds.has(node.operator.id));
    if (firstMatch) setFocusedId(firstMatch.operator.id);
  }

  return (
    <section
      className="lineage-map-enter relative min-h-0 flex-1 overflow-hidden bg-white"
      ref={containerRef}
    >
      <div className="absolute left-4 top-4 z-20 flex w-[calc(100%-32px)] items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200 shadow-[0_2px_8px_rgb(15_23_42/0.08)] sm:w-[min(360px,calc(100%-112px))]">
        <Search className="size-4 shrink-0 text-gray-500" />
        <input
          aria-label="搜索关系图中的算子"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") selectFirstMatch();
          }}
          placeholder="搜索算子名称或 ID"
          value={query}
        />
        {query ? (
          <button
            aria-label="清空搜索"
            className="grid size-7 place-items-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setQuery("")}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="absolute right-4 top-16 z-20 flex items-center rounded-lg bg-white p-1 ring-1 ring-gray-200 shadow-[0_2px_8px_rgb(15_23_42/0.08)] sm:top-4">
        <GraphControl
          disabled={zoom <= 1}
          icon={Minus}
          label="缩小"
          onClick={() => setZoom((current) => Math.max(1, current - 0.15))}
        />
        <span className="w-12 text-center font-mono text-[11px] text-gray-500">
          {Math.round(zoom * 100)}%
        </span>
        <GraphControl
          disabled={zoom >= 1.6}
          icon={Plus}
          label="放大"
          onClick={() => setZoom((current) => Math.min(1.6, current + 0.15))}
        />
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <GraphControl
          icon={Focus}
          label="重置视图"
          onClick={() => setZoom(1)}
        />
      </div>

      <svg
        aria-label="算子血缘关系图"
        className="h-full min-h-[520px] w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={viewBox}
      >
        <defs>
          <pattern height="24" id="graph-grid" patternUnits="userSpaceOnUse" width="24">
            <circle cx="1" cy="1" fill="#d9dee7" opacity="0.48" r="1" />
          </pattern>
          <filter height="180%" id="selected-glow" width="180%" x="-40%" y="-40%">
            <feGaussianBlur result="blur" stdDeviation="6" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect fill="url(#graph-grid)" height={graphHeight} width={graphWidth} x="0" y="0" />

        <g aria-hidden="true">
          {domainOrder.map((domain) => {
            const center = clusterCenters[domain];
            return (
              <g key={domain}>
                <circle cx={center.x} cy={center.y} fill="#4b5563" opacity="0.92" r="10" />
                <text
                  fill="#374151"
                  fontSize="14"
                  fontWeight="600"
                  textAnchor="middle"
                  x={center.x}
                  y={center.y + 28}
                >
                  {domainLabels[domain]}
                </text>
              </g>
            );
          })}
        </g>

        <g aria-label="关系连线">
          {visibleRelations.map((relation) => {
            const source = nodeLookup.get(relation.source);
            const target = nodeLookup.get(relation.target);
            if (!source || !target) return null;

            const touchesHovered =
              !hoveredId || relation.source === hoveredId || relation.target === hoveredId;
            const queryMatches =
              !normalizedQuery || matchedIds.has(relation.source) || matchedIds.has(relation.target);

            return (
              <line
                key={relation.id}
                opacity={touchesHovered && queryMatches ? 0.72 : 0.1}
                stroke={relation.kind === "sequence" ? "#94a3b8" : "#cbd5e1"}
                strokeDasharray={relation.kind === "field_compatible" ? "5 5" : undefined}
                strokeLinecap="round"
                strokeWidth={relation.kind === "sequence" ? 1.5 : 1}
                x1={source.x}
                x2={target.x}
                y1={source.y}
                y2={target.y}
              >
                <title>{relationLabels[relation.kind]}：{relation.label}</title>
              </line>
            );
          })}
        </g>

        <g aria-label="算子节点">
          {nodes.map((node) => {
            const isFocused = node.operator.id === focusedId;
            const isHovered = node.operator.id === hoveredId;
            const isNeighbor = !hoveredId || hoveredNeighborIds.has(node.operator.id);
            const matchesQuery = !normalizedQuery || matchedIds.has(node.operator.id);
            const opacity = isNeighbor && matchesQuery ? 1 : 0.16;

            return (
              <g
                aria-label={`${node.operator.displayName}，${node.operator.id}`}
                className="cursor-pointer outline-none focus-visible:[&_circle:last-of-type]:stroke-blue-600"
                key={node.operator.id}
                onBlur={() => setHoveredId("")}
                onClick={() => setFocusedId(node.operator.id)}
                onFocus={() => setHoveredId(node.operator.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFocusedId(node.operator.id);
                  }
                }}
                onMouseEnter={() => setHoveredId(node.operator.id)}
                onMouseLeave={() => setHoveredId("")}
                opacity={opacity}
                role="button"
                tabIndex={0}
              >
                <rect
                  fill="transparent"
                  height="42"
                  rx="6"
                  width="150"
                  x={node.x - 75}
                  y={node.y - 14}
                />
                {isFocused ? (
                  <circle
                    className="lineage-node-pulse"
                    cx={node.x}
                    cy={node.y}
                    fill="#60a5fa"
                    filter="url(#selected-glow)"
                    opacity="0.38"
                    r="15"
                  />
                ) : null}
                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={isFocused || isHovered ? "#2563eb" : "#5f6368"}
                  r={isFocused ? 8 : isHovered ? 7 : 5.5}
                  stroke={isFocused ? "#bfdbfe" : "#ffffff"}
                  strokeWidth={isFocused ? 3 : 1.5}
                />
                <text
                  fill={isFocused || isHovered ? "#1d4ed8" : "#3f3f46"}
                  fontSize={isFocused ? "13" : "12"}
                  fontWeight={isFocused || isHovered ? "600" : "450"}
                  textAnchor="middle"
                  x={node.x}
                  y={node.y + 20}
                >
                  {truncateLabel(node.operator.id)}
                </text>
                <title>{node.operator.displayName} · {node.operator.id}</title>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4">
        {focusedOperator ? (
          <aside className="pointer-events-auto w-[min(390px,calc(100vw-32px))] rounded-xl bg-white p-4 ring-1 ring-gray-200 shadow-[0_4px_8px_rgb(15_23_42/0.1)]">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                <GitBranch className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-950">
                  {focusedOperator.displayName}
                </p>
                <p className="mt-1 truncate font-mono text-[11px] text-gray-500">
                  {focusedOperator.id}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">
                  {focusedOperator.intro}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <span className="truncate text-xs text-gray-500">
                {focusedOperator.domains.map((domain) => domainLabels[domain]).join(" · ")}
              </span>
              <button
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                onClick={() => onOpenDetail(focusedOperator.id)}
                type="button"
              >
                查看详情
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </aside>
        ) : <span />}

        <div className="pointer-events-auto hidden rounded-lg bg-white/96 px-3 py-2 text-[11px] text-gray-600 ring-1 ring-gray-200 shadow-[0_2px_8px_rgb(15_23_42/0.08)] sm:block">
          <div className="flex items-center gap-4">
            <LegendLine label="Flow 前后步骤" />
            <LegendLine dashed label="字段可接" />
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-600" />
              当前选中
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function GraphControl({
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-8 place-items-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-35"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon className="size-4" />
    </button>
  );
}

function LegendLine({ dashed = false, label }: { dashed?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "block w-6 border-t border-gray-400",
          dashed && "border-dashed"
        )}
      />
      {label}
    </span>
  );
}

function buildGraphNodes(operators: OperatorRecord[]): GraphNode[] {
  const grouped = new Map<OperatorDomain, OperatorRecord[]>(
    domainOrder.map((domain) => [domain, []])
  );

  operators.forEach((operator) => {
    const primaryDomain = operator.domains[0] ?? "ai-labeling";
    grouped.get(primaryDomain)?.push(operator);
  });

  return domainOrder.flatMap((domain, domainIndex) => {
    const center = clusterCenters[domain];
    const domainOperators = grouped.get(domain) ?? [];

    return domainOperators.map((operator, index) => {
      const ring = Math.floor(index / 7);
      const positionInRing = index % 7;
      const itemsInRing = Math.min(7, domainOperators.length - ring * 7);
      const angle =
        (positionInRing / Math.max(itemsInRing, 1)) * Math.PI * 2 + domainIndex * 0.47;
      const radius = 68 + ring * 58;

      return {
        operator,
        x: clamp(center.x + Math.cos(angle) * radius, 70, graphWidth - 70),
        y: clamp(center.y + Math.sin(angle) * radius, 55, graphHeight - 55),
      };
    });
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function truncateLabel(label: string) {
  return label.length > 25 ? `${label.slice(0, 23)}…` : label;
}
