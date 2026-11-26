"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FileCode2, ShieldAlert, X } from "lucide-react";
import type {
  ArchEdgeData,
  ArchLayer,
  ArchNodeData,
  Severity,
  VulnerabilityItem,
} from "@/types/audit";
import { cn } from "@/lib/utils";

interface ArchitectureGraphProps {
  nodes: ArchNodeData[];
  edges: ArchEdgeData[];
  vulnerabilities: VulnerabilityItem[];
}

type ArchFlowNodeData = ArchNodeData & Record<string, unknown>;
type ArchFlowNode = Node<ArchFlowNodeData, "archNode">;

const LAYER_ORDER: ArchLayer[] = [
  "FRONTEND",
  "API",
  "AI_SERVICE",
  "DATABASE",
  "EXTERNAL",
];

const LAYER_BADGE_STYLES: Record<ArchLayer, string> = {
  FRONTEND: "border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]",
  API: "border-[#BAE6FD] bg-[#F0F9FF] text-[#0369A1]",
  AI_SERVICE: "border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9]",
  DATABASE: "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]",
  EXTERNAL: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
};

const SEVERITY_BADGE_STYLES: Record<Severity, string> = {
  CRITICAL: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
  HIGH: "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]",
  MEDIUM: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
  LOW: "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]",
};

function getRiskBadgeStyle(riskScore: number): string {
  if (riskScore >= 70) {
    return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
  }
  if (riskScore >= 40) {
    return "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]";
  }
  return "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]";
}

function ArchNodeCard({ data, selected }: NodeProps<ArchFlowNode>) {
  return (
    <div
      className={cn(
        "w-[252px] rounded-lg border bg-white px-3.5 py-3 shadow-xs transition-all",
        selected
          ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
          : "border-[#E2E8F0] hover:border-[#94A3B8]"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border !border-white !bg-[#64748B]"
      />

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
            LAYER_BADGE_STYLES[data.layer]
          )}
        >
          {data.layer}
        </span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
            getRiskBadgeStyle(data.riskScore)
          )}
        >
          Risk: {data.riskScore}/100
        </span>
      </div>

      <div className="mt-2 truncate text-xs font-semibold text-[#0F172A]">
        {data.label}
      </div>
      <div className="mt-0.5 truncate font-mono text-[11px] text-[#64748B]">
        {data.filePath}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border !border-white !bg-[#64748B]"
      />
    </div>
  );
}

const nodeTypes = {
  archNode: ArchNodeCard,
};

function computeTieredLayout(rawNodes: ArchNodeData[]): ArchFlowNode[] {
  const buckets = new Map<ArchLayer, ArchNodeData[]>();
  for (const layer of LAYER_ORDER) {
    buckets.set(layer, []);
  }
  for (const node of rawNodes) {
    const list = buckets.get(node.layer) ?? [];
    list.push(node);
    buckets.set(node.layer, list);
  }

  const activeLayers = LAYER_ORDER.filter(
    (layer) => (buckets.get(layer)?.length ?? 0) > 0
  );

  const COL_SPACING = 320;
  const ROW_SPACING = 148;
  const positioned: ArchFlowNode[] = [];

  activeLayers.forEach((layer, colIdx) => {
    const group = buckets.get(layer) ?? [];
    const totalHeight = (group.length - 1) * ROW_SPACING;
    const startY = Math.max(40, 220 - totalHeight / 2);

    group.forEach((node, rowIdx) => {
      positioned.push({
        id: node.id,
        type: "archNode",
        position: {
          x: 40 + colIdx * COL_SPACING,
          y: startY + rowIdx * ROW_SPACING,
        },
        data: { ...node },
      });
    });
  });

  return positioned;
}

export function ArchitectureGraph({
  nodes,
  edges,
  vulnerabilities,
}: ArchitectureGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    nodes[0]?.id ?? null
  );

  const flowNodes = useMemo(() => computeTieredLayout(nodes), [nodes]);

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "default",
        animated: true,
        label: edge.protocol ? `${edge.label} · ${edge.protocol}` : edge.label,
        labelStyle: {
          fill: "#334155",
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "var(--font-jetbrains-mono), monospace",
        },
        labelBgStyle: {
          fill: "#FFFFFF",
          fillOpacity: 0.94,
          stroke: "#E2E8F0",
          strokeWidth: 1,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: "#94A3B8",
          strokeWidth: 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#64748B",
          width: 16,
          height: 16,
        },
      })),
    [edges]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const linkedVulns = useMemo(() => {
    if (!selectedNode) return [];
    return vulnerabilities.filter(
      (v) =>
        v.filePath === selectedNode.filePath ||
        v.filePath.includes(selectedNode.filePath) ||
        selectedNode.filePath.includes(v.filePath)
    );
  }, [selectedNode, vulnerabilities]);

  if (nodes.length === 0) {
    return (
      <div className="surface-elevated flex min-h-[420px] items-center justify-center rounded-lg p-8 text-center">
        <p className="font-mono text-xs text-[#64748B]">
          No architecture nodes were extracted for this repository.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* React Flow Canvas */}
      <div
        className={cn(
          "surface-elevated relative h-[540px] overflow-hidden rounded-lg",
          selectedNode ? "lg:col-span-8" : "lg:col-span-12"
        )}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#CBD5E1" gap={20} size={1} />
          <Controls className="!border-[#E2E8F0] !bg-white !shadow-xs" />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              const risk =
                typeof n.data?.riskScore === "number" ? n.data.riskScore : 0;
              if (risk >= 70) return "#EF4444";
              if (risk >= 40) return "#F59E0B";
              return "#10B981";
            }}
            className="!border !border-[#E2E8F0] !bg-white/95"
          />
        </ReactFlow>
      </div>

      {/* Node Inspector Side Drawer */}
      {selectedNode ? (
        <aside className="surface-elevated flex flex-col rounded-lg p-5 lg:col-span-4">
          <div className="flex items-start justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    LAYER_BADGE_STYLES[selectedNode.layer]
                  )}
                >
                  {selectedNode.layer}
                </span>
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
                    getRiskBadgeStyle(selectedNode.riskScore)
                  )}
                >
                  Risk {selectedNode.riskScore}/100
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">
                {selectedNode.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              aria-label="Close node inspector"
              className="rounded p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 font-mono text-xs text-[#475569]">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
            <span className="break-all">{selectedNode.filePath}</span>
          </div>

          <div className="mt-4">
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Component Role
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
              {selectedNode.summary}
            </p>
          </div>

          <div className="mt-5 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Linked Vulnerabilities
              </h4>
              <span className="font-mono text-xs text-[#64748B]">
                {linkedVulns.length}
              </span>
            </div>

            {linkedVulns.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No vulnerabilities directly mapped to this file path.
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {linkedVulns.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[#64748B]">
                        <ShieldAlert className="h-3 w-3 text-[#B91C1C]" />
                        {vuln.id}
                      </span>
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                          SEVERITY_BADGE_STYLES[vuln.severity]
                        )}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#0F172A]">
                      {vuln.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
