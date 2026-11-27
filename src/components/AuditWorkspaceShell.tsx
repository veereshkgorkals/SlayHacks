"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
  GitBranch,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { ArchitectureGraph } from "@/components/ArchitectureGraph";
import { VulnerabilityExplorer } from "@/components/VulnerabilityExplorer";
import { downloadMarkdownReport } from "@/lib/export-report";
import type { AuditReport, Severity } from "@/types/audit";
import { cn } from "@/lib/utils";

type WorkspaceTab = "overview" | "architecture" | "findings";

interface AuditWorkspaceShellProps {
  report: AuditReport;
}

const SEVERITY_BADGE_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
  HIGH: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
  MEDIUM: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  LOW: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
};

export function AuditWorkspaceShell({ report }: AuditWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const scoreBarColor =
    report.securityScore >= 75
      ? "bg-[#10B981]"
      : report.securityScore >= 50
      ? "bg-[#F59E0B]"
      : "bg-[#EF4444]";

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
      {/* Top Summary Card */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-xs">
        <div className="grid grid-cols-1 divide-y divide-[#E2E8F0] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {/* Repository Title & Owner */}
          <div className="p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#0F172A]">
                <GitBranch className="h-4 w-4 text-[#64748B]" />
                <span>
                  {report.owner}/{report.repoName}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={report.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  <span>source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => downloadMarkdownReport(report)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 font-mono text-xs font-medium text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC]"
                >
                  <Download className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Export Report (.md)</span>
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#475569]">
              {report.summary}
            </p>
          </div>

          {/* Security Score & Files Scanned */}
          <div className="grid grid-cols-2 divide-x divide-[#E2E8F0]">
            <div className="flex flex-col justify-center p-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Security Score
              </span>
              <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {report.securityScore}
                </span>
                <span className="text-xs text-[#64748B]">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className={cn("h-full rounded-full", scoreBarColor)}
                  style={{
                    width: `${Math.max(0, Math.min(100, report.securityScore))}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col justify-center p-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Files Scanned
              </span>
              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#0F172A]">
                {report.stats.totalFiles}
              </div>
            </div>
          </div>

          {/* Severity Count Pills */}
          <div className="flex flex-col justify-center p-5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Severity Counts
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] font-medium tabular-nums">
              <span className="rounded border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-[#B91C1C]">
                CRIT {report.stats.criticalCount}
              </span>
              <span className="rounded border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[#C2410C]">
                HIGH {report.stats.highCount}
              </span>
              <span className="rounded border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[#B45309]">
                MED {report.stats.mediumCount}
              </span>
              <span className="rounded border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[#047857]">
                LOW {report.stats.lowCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Underline Tab Bar */}
      <div className="mt-6 flex items-center gap-6 border-b border-[#E2E8F0]">
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
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
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
            {/* System Components */}
            <div className="surface-elevated overflow-hidden rounded-lg">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    System Components
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#64748B]">
                  {report.nodes.length} nodes / {report.edges.length} edges
                </span>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {report.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#0F172A]">
                          {node.label}
                        </span>
                        <span className="rounded border border-[#C7D2FE] bg-[#EEF2FF] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#4338CA]">
                          {node.layer}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-[#64748B]">
                        {node.filePath}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs font-semibold tabular-nums",
                        node.riskScore >= 80
                          ? "text-[#B91C1C]"
                          : node.riskScore >= 50
                          ? "text-[#B45309]"
                          : "text-[#047857]"
                      )}
                    >
                      {node.riskScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Findings */}
            <div className="surface-elevated overflow-hidden rounded-lg">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#64748B]" />
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    Detected Findings
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("findings")}
                  className="font-mono text-xs font-medium text-[#4338CA] transition-colors hover:text-[#312E81]"
                >
                  View diffs →
                </button>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {report.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {vuln.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                          SEVERITY_BADGE_STYLES[vuln.severity]
                        )}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#64748B]">
                      {vuln.filePath} ({vuln.lineRange})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "architecture" ? (
          <ArchitectureGraph
            nodes={report.nodes}
            edges={report.edges}
            vulnerabilities={report.vulnerabilities}
          />
        ) : null}

        {activeTab === "findings" ? (
          <VulnerabilityExplorer vulnerabilities={report.vulnerabilities} />
        ) : null}
      </div>
    </section>
  );
}
