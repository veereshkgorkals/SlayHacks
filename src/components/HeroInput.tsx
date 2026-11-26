"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Loader2,
  ShieldAlert,
  Terminal,
  Zap,
} from "lucide-react";
import { SAMPLE_PRESETS, type SamplePreset } from "@/lib/sample-repos";
import { cn } from "@/lib/utils";

const GITHUB_REPO_REGEX =
  /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?\/?$/;

const SCAN_STAGES = [
  "1. Fetching Repository Tree...",
  "2. Mapping System Architecture...",
  "3. Running Red-Team Security Audit...",
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
  const [repoUrl, setRepoUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setValidationError("Enter a public GitHub repository URL or pick a demo preset below.");
      return;
    }
    if (!GITHUB_REPO_REGEX.test(trimmed)) {
      setValidationError(
        "Invalid format. Expected https://github.com/owner/repo"
      );
      return;
    }
    setValidationError(null);
    onSubmitRepo(trimmed);
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8">
      {/* Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F1623] px-3.5 py-1.5 text-xs font-medium text-slate-300"
      >
        <ShieldAlert className="h-3.5 w-3.5 text-[#F43F5E]" />
        <span>Autonomous Architecture Mapping + Red-Team Auto-Patching</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        See every attack path.{" "}
        <span className="bg-gradient-to-r from-[#14B8A6] via-teal-300 to-emerald-400 bg-clip-text text-transparent">
          Ship the patch in seconds.
        </span>
      </motion.h1>

      {/* Value Proposition */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
      >
        Point AegisLens at any GitHub repository to generate an interactive
        system architecture topology, uncover exploit chains, and review
        production-ready security patches.
      </motion.p>

      {/* URL Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-2xl"
        noValidate
      >
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl border bg-[#0F1623]/95 p-2 shadow-2xl transition-colors sm:flex-row sm:items-center",
            validationError
              ? "border-[#F43F5E]/60"
              : "border-white/[0.08] focus-within:border-[#14B8A6]/60"
          )}
        >
          <div className="flex flex-1 items-center gap-3 px-3 py-2">
            <GitBranch className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isScanning}
              placeholder="https://github.com/owner/repo"
              aria-label="GitHub repository URL"
              className="w-full bg-transparent font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="glow-teal inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-5 text-sm font-semibold text-slate-950 transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Audit Repository</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {validationError ? (
          <p className="mt-2.5 text-left font-mono text-xs text-[#F43F5E]">
            {validationError}
          </p>
        ) : null}

        {statusMessage ? (
          <div className="mt-3 rounded-xl border border-teal-500/25 bg-teal-500/10 px-4 py-2.5 text-left text-xs text-teal-200">
            {statusMessage}
          </div>
        ) : null}
      </motion.form>

      {/* Multi-Step Animated Scanning Loader */}
      <AnimatePresence>
        {isScanning ? (
          <motion.div
            key="scanner-loader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="surface-card mt-8 w-full max-w-2xl rounded-2xl p-5 text-left"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-teal-400">
                <Terminal className="h-3.5 w-3.5" />
                <span>AegisLens Pipeline Active</span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Stage {Math.min(scanStage + 1, SCAN_STAGES.length)} /{" "}
                {SCAN_STAGES.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {SCAN_STAGES.map((label, idx) => {
                const isComplete = idx < scanStage;
                const isActive = idx === scanStage;
                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0.45 }}
                    animate={{
                      opacity: isComplete || isActive ? 1 : 0.45,
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-2.5 font-mono text-xs transition-colors",
                      isActive
                        ? "border-[#14B8A6]/45 bg-[#14B8A6]/10 text-teal-200"
                        : isComplete
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
                        : "border-white/[0.06] bg-[#090D16]/60 text-slate-500"
                    )}
                  >
                    <span>{label}</span>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#14B8A6]" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Queued
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Instant Judge Demo Presets */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="mt-10 w-full max-w-2xl"
      >
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Zap className="h-3.5 w-3.5 text-[#14B8A6]" />
          <span>Instant Judge Demo Presets</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isScanning}
              onClick={() => onSelectPreset(preset)}
              className="surface-card group flex flex-col items-start rounded-xl p-4 text-left transition-all hover:border-[#14B8A6]/50 hover:bg-[#131C2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-slate-100 group-hover:text-teal-300">
                  {preset.label}
                </span>
                <span className="rounded-full border border-[#F43F5E]/30 bg-[#F43F5E]/10 px-2 py-0.5 font-mono text-[11px] font-medium text-rose-300">
                  {preset.tag}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
