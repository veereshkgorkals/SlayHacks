"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroInput } from "@/components/HeroInput";
import { AuditWorkspaceShell } from "@/components/AuditWorkspaceShell";
import type { SamplePreset } from "@/lib/sample-repos";
import type { AuditReport } from "@/types/audit";

export default function Home() {
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleReset = () => {
    clearTimers();
    setIsScanning(false);
    setScanStage(0);
    setStatusMessage(null);
    setActiveReport(null);
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    clearTimers();
    setIsScanning(false);
    setScanStage(0);
    setStatusMessage(null);
    setActiveReport(preset.report);
  };

  const handleSubmitRepo = (repoUrl: string) => {
    clearTimers();
    setStatusMessage(null);
    setIsScanning(true);
    setScanStage(0);

    // Step 1 UI preview of the 3-stage pipeline (wired to /api/audit in Step 2)
    timersRef.current.push(
      setTimeout(() => setScanStage(1), 850),
      setTimeout(() => setScanStage(2), 1700),
      setTimeout(() => {
        setIsScanning(false);
        setScanStage(0);
        setStatusMessage(
          `Pipeline validated for ${repoUrl}. Live /api/audit ingestion will be connected in Step 2 — select an Instant Judge Demo Preset below to explore the workspace now.`
        );
      }, 2600)
    );
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
            statusMessage={statusMessage}
            onSubmitRepo={handleSubmitRepo}
            onSelectPreset={handleSelectPreset}
          />
        )}
      </main>
    </div>
  );
}
