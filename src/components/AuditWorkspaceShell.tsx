"use client";

import { useState } from "react";
import {
  ExternalLink,
  FileCode2,
  GitBranch,
  Layers,
  Network,
  ShieldAlert,
} from "lucide-react";
import type { AuditReport, Severity } from "@/types/audit";
import { cn } from "@/lib/utils";

type WorkspaceTab = "overview" | "architecture" | "findings";

interface AuditWorkspaceShellProps {
  report: AuditReport;
}

const SEVERITY_TEXT_STYLES: Record<Severity, string> = {
  CRITICAL: "border-[#EF4444]/40 text-[#EF4444]",
  HIGH: "border-[#EF4444]/30 text-[#EF4444]",
  MEDIUM: "border-[#F59E0B]/40 text-[#F59E0B]",
  LOW: "border-[#10B981]/40 text-[#10B981]",
};

export function AuditWorkspaceShell({ report }: AuditWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const scoreColor =
    report.securityScore >= 75
      ? "text-[#10B981]"
      : report.securityScore >= 50
      ? "text-[#F59E0B]"
      : "text-[#EF4444]";

  const tabs: { id: WorkspaceTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture Graph" },
    {
      id: "findings",
      label: `Vulnerabilities (${report.vulnerabilities.length})`,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Segmented Metric Strip */}
      <div className="overflow-hidden rounded-lg border border-[#222226] bg-[#111113]">
        <div className="grid grid-cols-1 divide-y divide-[#222226] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {/* Segment 1: Repository */}
          <div className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#FAFAFA]">
                <GitBranch className="h-4 w-4 text-[#71717A]" />
                <span>
                  {report.owner}/{report.repoName}
                </span>
              </div>
              <a
                href={report.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#71717A] transition-colors hover:text-[#FAFAFA]"
              >
                <span>source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#A1A1AA]">
              {report.summary}
            </p>
          </div>

          {/* Segment 2: Security Posture & Files */}
          <div className="grid grid-cols-2 divide-x divide-[#222226]">
            <div className="flex flex-col justify-center p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
                Posture Score
              </span>
              <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                <span className={cn("text-2xl font-bold", scoreColor)}>
                  {report.securityScore}
                </span>
                <span className="text-xs text-[#71717A]">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col justify-center p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
                Files Scanned
              </span>
              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#FAFAFA]">
                {report.stats.totalFiles}
              </div>
            </div>
          </div>

          {/* Segment 3: Severity Breakdown */}
          <div className="flex flex-col justify-center p-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
              Severity Breakdown
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums">
              <span className="rounded border border-[#EF4444]/40 px-1.5 py-0.5 text-[#EF4444]">
                CRIT {report.stats.criticalCount}
              </span>
              <span className="rounded border border-[#EF4444]/30 px-1.5 py-0.5 text-[#EF4444]">
                HIGH {report.stats.highCount}
              </span>
              <span className="rounded border border-[#F59E0B]/40 px-1.5 py-0.5 text-[#F59E0B]">
                MED {report.stats.mediumCount}
              </span>
              <span className="rounded border border-[#10B981]/40 px-1.5 py-0.5 text-[#10B981]">
                LOW {report.stats.lowCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Underline Tab Navigation */}
      <div className="mt-6 flex items-center gap-6 border-b border-[#222226]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#FAFAFA] text-[#FAFAFA]"
                  : "border-transparent text-[#71717A] hover:text-[#A1A1AA]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mapped Components */}
            <div className="rounded-lg border border-[#222226] bg-[#111113]">
              <div className="flex items-center justify-between border-b border-[#222226] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#71717A]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    System Components
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#71717A]">
                  {report.nodes.length} nodes / {report.edges.length} edges
                </span>
              </div>
              <div className="divide-y divide-[#222226]">
                {report.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#FAFAFA]">
                          {node.label}
                        </span>
                        <span className="rounded border border-[#222226] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                          {node.layer}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-[#71717A]">
                        {node.filePath}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs font-medium tabular-nums",
                        node.riskScore >= 80
                          ? "text-[#EF4444]"
                          : node.riskScore >= 50
                          ? "text-[#F59E0B]"
                          : "text-[#10B981]"
                      )}
                    >
                      {node.riskScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Findings Summary */}
            <div className="rounded-lg border border-[#222226] bg-[#111113]">
              <div className="flex items-center justify-between border-b border-[#222226] px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#71717A]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    Detected Findings
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("findings")}
                  className="font-mono text-xs text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
                >
                  View diffs →
                </button>
              </div>
              <div className="divide-y divide-[#222226]">
                {report.vulnerabilities.map((vuln) => (
                  <div key={vuln.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-[#FAFAFA]">
                        {vuln.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium",
                          SEVERITY_TEXT_STYLES[vuln.severity]
                        )}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#71717A]">
                      {vuln.filePath} ({vuln.lineRange})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "architecture" ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-[#222226] bg-[#111113] p-8 text-center">
            <Network className="h-6 w-6 text-[#71717A]" />
            <h2 className="mt-3 text-sm font-semibold text-[#FAFAFA]">
              Deterministic Architecture Graph
            </h2>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#71717A]">
              Step 4 mounts the interactive{" "}
              <code className="font-mono text-[#A1A1AA]">@xyflow/react</code>{" "}
              topology canvas for {report.nodes.length} components and{" "}
              {report.edges.length} data-flow edges.
            </p>
          </div>
        ) : null}

        {activeTab === "findings" ? (
          <div className="divide-y divide-[#222226] rounded-lg border border-[#222226] bg-[#111113]">
            {report.vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-[#71717A]">
                      {vuln.id}
                    </span>
                    <h3 className="text-sm font-semibold text-[#FAFAFA]">
                      {vuln.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 font-mono text-[11px] font-medium",
                      SEVERITY_TEXT_STYLES[vuln.severity]
                    )}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-[#71717A]">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCode2 className="h-3.5 w-3.5" />
                    {vuln.filePath} ({vuln.lineRange})
                  </span>
                  <span>/</span>
                  <span>{vuln.category}</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#A1A1AA]">
                  {vuln.description}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
