"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroInput } from "@/components/HeroInput";
import { AuditWorkspaceShell } from "@/components/AuditWorkspaceShell";
import type { IngestedRepoPayload } from "@/lib/github-ingestor";
import type { SamplePreset } from "@/lib/sample-repos";
import type { ArchLayer, AuditReport } from "@/types/audit";

function inferLayerFromPath(filePath: string): ArchLayer {
  const lower = filePath.toLowerCase();
  if (lower.includes("/api/") || lower.startsWith("routes/")) return "API";
  if (lower.includes("prisma") || lower.includes("supabase") || lower.includes("db")) {
    return "DATABASE";
  }
  if (lower.includes("ai") || lower.includes("gemini") || lower.includes("llm")) {
    return "AI_SERVICE";
  }
  if (lower.includes("components/") || lower.endsWith(".tsx")) return "FRONTEND";
  return "API";
}

function buildBaselineReport(payload: IngestedRepoPayload): AuditReport {
  return {
    repoName: payload.repoName,
    repoUrl: payload.repoUrl,
    owner: payload.owner,
    analyzedAt: new Date().toISOString(),
    securityScore: 100,
    summary:
      payload.description ??
      `Ingested ${payload.analyzedFiles.length} high-signal files from ${payload.totalTreeFiles} total repository files on branch ${payload.defaultBranch}. Ready for Step 3 Gemini static-semantic audit.`,
    stats: {
      totalFiles: payload.totalTreeFiles,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    },
    nodes: payload.analyzedFiles.slice(0, 8).map((file, idx) => ({
      id: `ingested-${idx}`,
      label: file.path.split("/").pop() ?? file.path,
      layer: inferLayerFromPath(file.path),
      filePath: file.path,
      riskScore: 0,
      summary: `Ingested source file (${file.content.length} chars).`,
    })),
    edges: [],
    vulnerabilities: [],
  };
}

export default function Home() {
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [ingestedRepo, setIngestedRepo] = useState<IngestedRepoPayload | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);

  const handleReset = () => {
    setIsScanning(false);
    setScanStage(0);
    setIngestedRepo(null);
    setActiveReport(null);
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setIsScanning(false);
    setScanStage(0);
    setIngestedRepo(null);
    setActiveReport(preset.report);
  };

  const handleScanStateChange = (scanning: boolean, stage: number) => {
    setIsScanning(scanning);
    setScanStage(stage);
  };

  const handleIngestSuccess = (payload: IngestedRepoPayload) => {
    setIngestedRepo(payload);
    setActiveReport(buildBaselineReport(payload));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        hasActiveReport={Boolean(activeReport)}
        repoLabel={
          activeReport ? `${activeReport.owner}/${activeReport.repoName}` : undefined
        }
        onReset={handleReset}
      />

      <main className="flex-1" data-ingested-repo={ingestedRepo?.repoName ?? ""}>
        {activeReport ? (
          <AuditWorkspaceShell report={activeReport} />
        ) : (
          <HeroInput
            isScanning={isScanning}
            scanStage={scanStage}
            onScanStateChange={handleScanStateChange}
            onIngestSuccess={handleIngestSuccess}
            onSelectPreset={handleSelectPreset}
          />
        )}
      </main>
    </div>
  );
}
