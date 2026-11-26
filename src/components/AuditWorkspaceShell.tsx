"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  FileCode2,
  Layers,
  Network,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { AuditReport, Severity } from "@/types/audit";
import { cn } from "@/lib/utils";

type WorkspaceTab = "overview" | "architecture" | "findings";

interface AuditWorkspaceShellProps {
  report: AuditReport;
}

const SEVERITY_BADGE_STYLES: Record<Severity, string> = {
  CRITICAL: "border-[#F43F5E]/40 bg-[#F43F5E]/15 text-rose-300",
  HIGH: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  MEDIUM: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  LOW: "border-teal-500/40 bg-teal-500/15 text-teal-300",
};

function SecurityScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const strokeColor =
    clamped >= 75 ? "#14B8A6" : clamped >= 50 ? "#F59E0B" : "#F43F5E";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-white">
            {clamped}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Security Posture
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-100">
          {clamped >= 75
            ? "Hardened"
            : clamped >= 50
            ? "Moderate Risk"
            : "Critical Exposure"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Weighted across {clamped < 50 ? "high-impact" : "detected"} exploit
          paths
        </p>
      </div>
    </div>
  );
}

export function AuditWorkspaceShell({ report }: AuditWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const tabs: { id: WorkspaceTab; label: string; icon: typeof Activity }[] = [
    { id: "overview", label: "Overview & Metrics", icon: Activity },
    { id: "architecture", label: "Architecture Graph", icon: Network },
    {
      id: "findings",
      label: `Security Findings & Patches (${report.vulnerabilities.length})`,
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Summary Header */}
      <div className="surface-card rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md border border-[#14B8A6]/30 bg-[#14B8A6]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-teal-300">
                AUDIT COMPLETE
              </span>
              <h1 className="font-mono text-xl font-bold text-white sm:text-2xl">
                {report.owner}/{report.repoName}
              </h1>
              <a
                href={report.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-teal-300"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
              {report.summary}
            </p>
          </div>

          <SecurityScoreGauge score={report.securityScore} />
        </div>

        {/* Severity Counters */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-5">
          <div className="rounded-xl border border-white/[0.06] bg-[#090D16]/70 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Total Files
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-100">
              {report.stats.totalFiles}
            </p>
          </div>
          <div className="rounded-xl border border-[#F43F5E]/25 bg-[#F43F5E]/5 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-rose-300">
              Critical
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#F43F5E]">
              {report.stats.criticalCount}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-orange-300">
              High
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-orange-400">
              {report.stats.highCount}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-300">
              Medium
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-400">
              {report.stats.mediumCount}
            </p>
          </div>
          <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-teal-300">
              Low
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-teal-400">
              {report.stats.lowCount}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/[0.08] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                isActive
                  ? "border border-[#14B8A6]/40 bg-[#14B8A6]/15 text-teal-200"
                  : "border border-transparent text-slate-400 hover:bg-[#0F1623] hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mapped Components Summary */}
            <div className="surface-card rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#14B8A6]" />
                  <h2 className="text-base font-bold text-white">
                    Mapped Architecture Components
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {report.nodes.length} nodes · {report.edges.length} edges
                </span>
              </div>
              <div className="space-y-2.5">
                {report.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#090D16]/70 px-4 py-3"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-100">
                          {node.label}
                        </span>
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                          {node.layer}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        {node.filePath}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs font-bold",
                        node.riskScore >= 80
                          ? "text-[#F43F5E]"
                          : node.riskScore >= 50
                          ? "text-amber-400"
                          : "text-teal-400"
                      )}
                    >
                      Risk {node.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Findings Preview */}
            <div className="surface-card rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#F43F5E]" />
                  <h2 className="text-base font-bold text-white">
                    Top Red-Team Findings
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("findings")}
                  className="font-mono text-xs font-semibold text-teal-400 hover:text-teal-300"
                >
                  Inspect Patches →
                </button>
              </div>
              <div className="space-y-3">
                {report.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="rounded-xl border border-white/[0.06] bg-[#090D16]/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-100">
                        {vuln.title}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold",
                          SEVERITY_BADGE_STYLES[vuln.severity]
                        )}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {vuln.filePath} ({vuln.lineRange})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "architecture" ? (
          <div className="surface-card flex min-h-[420px] flex-col items-center justify-center rounded-2xl p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#14B8A6]/30 bg-[#14B8A6]/10">
              <Network className="h-7 w-7 text-[#14B8A6]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">
              Interactive Architecture Topology Canvas
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Step 4 will mount the interactive{" "}
              <code className="font-mono text-teal-300">@xyflow/react</code>{" "}
              graph here, visualizing all {report.nodes.length} nodes and{" "}
              {report.edges.length} data-flow edges with risk heatmaps.
            </p>
          </div>
        ) : null}

        {activeTab === "findings" ? (
          <div className="space-y-4">
            <div className="surface-card flex items-center justify-between rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
                  <Wrench className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Auto-Patch &amp; Side-by-Side Diff Workspace
                  </h2>
                  <p className="text-xs text-slate-400">
                    Step 5 will upgrade this panel with interactive side-by-side
                    code diffs and one-click patch export.
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#090D16] px-3 py-1 font-mono text-xs text-slate-300 sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                {report.vulnerabilities.length} Patches Ready
              </span>
            </div>

            {report.vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="surface-card rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400">
                      {vuln.id}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {vuln.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold",
                      SEVERITY_BADGE_STYLES[vuln.severity]
                    )}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <FileCode2 className="h-3.5 w-3.5 text-teal-400" />
                    {vuln.filePath} ({vuln.lineRange})
                  </span>
                  <span>·</span>
                  <span>{vuln.category}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
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
