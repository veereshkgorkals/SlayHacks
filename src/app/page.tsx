"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroInput } from "@/components/HeroInput";
import { AuditWorkspaceShell } from "@/components/AuditWorkspaceShell";
import type { SamplePreset } from "@/lib/sample-repos";
import type { AuditReport } from "@/types/audit";

export default function Home() {
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);

  const handleReset = () => {
    setIsScanning(false);
    setScanStage(0);
    setActiveReport(null);
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setIsScanning(false);
    setScanStage(0);
    setActiveReport(preset.report);
  };

  const handleScanStateChange = (scanning: boolean, stage: number) => {
    setIsScanning(scanning);
    setScanStage(stage);
  };

  const handleAuditComplete = (report: AuditReport) => {
    setIsScanning(false);
    setScanStage(0);
    setActiveReport(report);
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

      <main className="flex-1">
        {activeReport ? (
          <AuditWorkspaceShell report={activeReport} />
        ) : (
          <HeroInput
            isScanning={isScanning}
            scanStage={scanStage}
            onScanStateChange={handleScanStateChange}
            onAuditComplete={handleAuditComplete}
            onSelectPreset={handleSelectPreset}
          />
        )}
      </main>
    </div>
  );
}
