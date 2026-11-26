"use client";

import { useState, type FormEvent } from "react";
import { Check, GitBranch, Loader2 } from "lucide-react";
import { SAMPLE_PRESETS, type SamplePreset } from "@/lib/sample-repos";
import { cn } from "@/lib/utils";

const FULL_GITHUB_REGEX =
  /^https?:\/\/(www\.)?github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(\.git)?\/?$/;
const OWNER_REPO_REGEX = /^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/;

const SCAN_STAGES = [
  { code: "[01]", label: "Fetching repository tree..." },
  { code: "[02]", label: "Resolving dependency graph..." },
  { code: "[03]", label: "Auditing attack surfaces..." },
];

interface HeroInputProps {
  isScanning: boolean;
  scanStage: number;
  statusMessage?: string | null;
  onSubmitRepo: (repoUrl: string) => void;
  onSelectPreset: (preset: SamplePreset) => void;
}

export function HeroInput({
  isScanning,
  scanStage,
  statusMessage,
  onSubmitRepo,
  onSelectPreset,
}: HeroInputProps) {
  const [repoInput, setRepoInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = repoInput.trim();
    if (!trimmed) {
      setValidationError("Enter owner/repo or select a sample repository below.");
      return;
    }

    const fullMatch = trimmed.match(FULL_GITHUB_REGEX);
    if (fullMatch) {
      setValidationError(null);
      onSubmitRepo(`https://github.com/${fullMatch[2]}`);
      return;
    }

    const shortMatch = trimmed.match(OWNER_REPO_REGEX);
    if (shortMatch) {
      setValidationError(null);
      onSubmitRepo(`https://github.com/${shortMatch[1]}`);
      return;
    }

    setValidationError(
      "Expected owner/repo or https://github.com/owner/repo"
    );
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
      {/* Eyebrow Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#222226] bg-[#111113] px-3 py-1 font-mono text-[11px] font-medium tracking-wider text-[#A1A1AA]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        <span>SECURITY &amp; ARCHITECTURE INTELLIGENCE</span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#FAFAFA] sm:text-5xl sm:leading-[1.12]">
        Map system topology.{" "}
        <span className="block text-[#A1A1AA]">
          Expose hidden vulnerabilities.
        </span>
      </h1>

      {/* Subcopy */}
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#71717A] sm:text-base">
        Deterministic architecture graph and static-semantic red-team audit for
        GitHub repositories, with verified remediation diffs.
      </p>

      {/* Command-Bar Style Repository Input */}
      <form
        onSubmit={handleSubmit}
        className="mt-10 w-full"
        noValidate
      >
        <div
          className={cn(
            "flex flex-col gap-1.5 rounded-lg border bg-[#111113] p-1.5 transition-colors sm:flex-row sm:items-center",
            validationError
              ? "border-[#EF4444]/70"
              : "border-[#27272A] focus-within:border-[#52525B]"
          )}
        >
          <div className="flex flex-1 items-center px-2.5 py-1.5">
            <span className="select-none font-mono text-sm text-[#71717A]">
              github.com/
            </span>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isScanning}
              placeholder="owner/repository"
              aria-label="GitHub repository owner and name"
              className="w-full bg-transparent font-mono text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0A0A0B] transition-colors hover:bg-[#E4E4E7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running</span>
              </>
            ) : (
              <span>Run Audit</span>
            )}
          </button>
        </div>

        {validationError ? (
          <p className="mt-2 text-left font-mono text-xs text-[#EF4444]">
            {validationError}
          </p>
        ) : null}

        {statusMessage ? (
          <div className="mt-3 rounded-md border border-[#222226] bg-[#111113] px-3.5 py-2.5 text-left font-mono text-xs text-[#A1A1AA]">
            {statusMessage}
          </div>
        ) : null}
      </form>

      {/* Terminal-Grade Vertical Step Tracker */}
      {isScanning ? (
        <div className="mt-6 w-full rounded-lg border border-[#222226] bg-[#111113] p-4 text-left">
          <div className="mb-3 flex items-center justify-between border-b border-[#222226] pb-2.5 font-mono text-[11px] text-[#71717A]">
            <span>PIPELINE EXECUTION</span>
            <span>
              {Math.min(scanStage + 1, SCAN_STAGES.length)}/{SCAN_STAGES.length}
            </span>
          </div>
          <div className="space-y-2">
            {SCAN_STAGES.map((stage, idx) => {
              const isComplete = idx < scanStage;
              const isActive = idx === scanStage;
              return (
                <div
                  key={stage.code}
                  className={cn(
                    "flex items-center justify-between font-mono text-xs",
                    isActive
                      ? "text-[#FAFAFA]"
                      : isComplete
                      ? "text-[#10B981]"
                      : "text-[#52525B]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#71717A]">{stage.code}</span>
                    <span>{stage.label}</span>
                  </div>
                  <span className="text-[11px]">
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FAFAFA]" />
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

      {/* Minimal Monospace Repository Quick-Links */}
      <div className="mt-8 flex w-full flex-col items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#52525B]">
          Sample Repositories
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isScanning}
              onClick={() => onSelectPreset(preset)}
              className="group inline-flex items-center gap-2 rounded-md border border-[#222226] bg-[#111113] px-3 py-1.5 font-mono text-xs text-[#A1A1AA] transition-colors hover:border-[#34343B] hover:text-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GitBranch className="h-3.5 w-3.5 text-[#71717A] transition-colors group-hover:text-[#FAFAFA]" />
              <span>samples / {preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
