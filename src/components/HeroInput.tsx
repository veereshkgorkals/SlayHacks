"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Check, GitBranch, Loader2 } from "lucide-react";
import { SAMPLE_PRESETS, type SamplePreset } from "@/lib/sample-repos";
import { cn } from "@/lib/utils";
import type { AuditReport } from "@/types/audit";

const FULL_GITHUB_REGEX =
  /^https?:\/\/(www\.)?github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(\.git)?\/?$/;
const OWNER_REPO_REGEX = /^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/;

const SCAN_STAGES = [
  { code: "[01]", label: "Fetching repository tree..." },
  { code: "[02]", label: "Mapping system architecture..." },
  { code: "[03]", label: "Running red-team security audit..." },
];

interface HeroInputProps {
  isScanning: boolean;
  scanStage: number;
  onScanStateChange: (scanning: boolean, stage: number) => void;
  onAuditComplete: (report: AuditReport) => void;
  onSelectPreset: (preset: SamplePreset) => void;
}

export function HeroInput({
  isScanning,
  scanStage,
  onScanStateChange,
  onAuditComplete,
  onSelectPreset,
}: HeroInputProps) {
  const [repoInput, setRepoInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStageTimers = () => {
    for (const timer of stageTimersRef.current) {
      clearTimeout(timer);
    }
    stageTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearStageTimers();
  }, []);

  const normalizeRepoUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    const fullMatch = trimmed.match(FULL_GITHUB_REGEX);
    if (fullMatch) {
      return `https://github.com/${fullMatch[2].replace(/\.git$/i, "")}`;
    }
    const shortMatch = trimmed.match(OWNER_REPO_REGEX);
    if (shortMatch) {
      return `https://github.com/${shortMatch[1].replace(/\.git$/i, "")}`;
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = repoInput.trim();
    if (!trimmed) {
      setValidationError("Enter owner/repo or select a sample repository below.");
      setApiError(null);
      return;
    }

    const canonicalUrl = normalizeRepoUrl(trimmed);
    if (!canonicalUrl) {
      setValidationError("Expected owner/repo or https://github.com/owner/repo");
      setApiError(null);
      return;
    }

    clearStageTimers();
    setValidationError(null);
    setApiError(null);
    onScanStateChange(true, 0);

    stageTimersRef.current.push(
      setTimeout(() => onScanStateChange(true, 1), 1600),
      setTimeout(() => onScanStateChange(true, 2), 3800)
    );

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: canonicalUrl }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        report?: AuditReport;
        error?: string;
      };

      clearStageTimers();

      if (!response.ok || !payload.success || !payload.report) {
        setApiError(
          payload.error ??
            "Unable to complete audit. Verify the repository is public and try again."
        );
        onScanStateChange(false, 0);
        return;
      }

      onScanStateChange(false, 0);
      onAuditComplete(payload.report);
    } catch {
      clearStageTimers();
      setApiError("Network error while contacting /api/audit. Please try again.");
      onScanStateChange(false, 0);
    }
  };

  const progressPercent = isScanning
    ? Math.round(((scanStage + 1) / SCAN_STAGES.length) * 100)
    : 0;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
      {/* Eyebrow Pill */}
      <div className="mb-6 inline-flex items-center rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-[#4338CA]">
        SYSTEM TOPOLOGY &amp; SECURITY AUDIT
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-5xl sm:leading-[1.12]">
        Map system architecture.{" "}
        <span className="block text-[#64748B]">
          Expose hidden vulnerabilities.
        </span>
      </h1>

      {/* Subcopy */}
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#475569] sm:text-base">
        Deterministic architecture graph and static-semantic red-team audit for
        GitHub repositories, with verified remediation diffs.
      </p>

      {/* Elevated Input Bar */}
      <form onSubmit={handleSubmit} className="mt-10 w-full" noValidate>
        <div
          className={cn(
            "flex flex-col gap-1.5 rounded-lg border bg-white p-1.5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] transition-all sm:flex-row sm:items-center",
            validationError || apiError
              ? "border-[#FECACA] ring-4 ring-[#EF4444]/10"
              : "border-[#CBD5E1] focus-within:border-[#4F46E5] focus-within:ring-4 focus-within:ring-[#4F46E5]/10"
          )}
        >
          <div className="flex flex-1 items-center gap-2 px-1.5 py-1">
            <span className="select-none rounded border border-[#E2E8F0] bg-[#F1F5F9] px-2 py-1 font-mono text-xs text-[#64748B]">
              github.com/
            </span>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                if (validationError) setValidationError(null);
                if (apiError) setApiError(null);
              }}
              disabled={isScanning}
              placeholder="owner/repository"
              aria-label="GitHub repository owner and name"
              className="w-full bg-transparent font-mono text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0F172A] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing</span>
              </>
            ) : (
              <span>Run Audit</span>
            )}
          </button>
        </div>

        {validationError ? (
          <p className="mt-2 text-left font-mono text-xs text-[#B91C1C]">
            {validationError}
          </p>
        ) : null}

        {apiError ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-left text-xs text-[#B91C1C]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
            <span>{apiError}</span>
          </div>
        ) : null}
      </form>

      {/* Scanning Progress Card */}
      {isScanning ? (
        <div className="surface-elevated mt-6 w-full overflow-hidden rounded-lg text-left">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-2.5 font-mono text-[11px] text-[#64748B]">
            <span>PIPELINE EXECUTION</span>
            <span>
              {Math.min(scanStage + 1, SCAN_STAGES.length)}/{SCAN_STAGES.length}
            </span>
          </div>
          <div className="h-0.5 w-full bg-[#F1F5F9]">
            <div
              className="h-full bg-[#4F46E5] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {SCAN_STAGES.map((stage, idx) => {
              const isComplete = idx < scanStage;
              const isActive = idx === scanStage;
              return (
                <div
                  key={stage.code}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 font-mono text-xs",
                    isActive
                      ? "font-medium text-[#0F172A]"
                      : isComplete
                      ? "text-[#047857]"
                      : "text-[#94A3B8]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#64748B]">{stage.code}</span>
                    <span>{stage.label}</span>
                  </div>
                  <span className="text-[11px]">
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5 text-[#047857]" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />
                    ) : (
                      "PENDING"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Sample Repository Presets */}
      <div className="mt-8 w-full">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
          Sample Repositories
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isScanning}
              onClick={() => onSelectPreset(preset)}
              className="group flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-left shadow-xs transition-colors hover:border-[#94A3B8] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-[#64748B] transition-colors group-hover:text-[#0F172A]" />
                <span className="truncate font-mono text-xs font-medium text-[#0F172A]">
                  samples/{preset.label}
                </span>
              </div>
              <span className="ml-3 shrink-0 font-mono text-[11px] font-medium text-[#4338CA] opacity-80 transition-opacity group-hover:opacity-100">
                Preview Audit →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
