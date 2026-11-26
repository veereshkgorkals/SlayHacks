"use client";

import { RotateCcw, Sparkles } from "lucide-react";

interface NavbarProps {
  hasActiveReport: boolean;
  repoLabel?: string;
  onReset: () => void;
}

export function Navbar({ hasActiveReport, repoLabel, onReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090D16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={onReset}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-500/10 shadow-[0_0_20px_-4px_rgba(20,184,166,0.45)] transition-transform group-hover:scale-105">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 2.5L4 6V11.5C4 16.75 7.4 21.55 12 22.8C16.6 21.55 20 16.75 20 11.5V6L12 2.5Z"
                stroke="#14B8A6"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3.25"
                stroke="#5EEAD4"
                strokeWidth="1.75"
              />
              <circle cx="12" cy="12" r="1.2" fill="#14B8A6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-100">
                AegisLens
              </span>
              {repoLabel ? (
                <span className="hidden rounded border border-white/[0.08] bg-[#0F1623] px-2 py-0.5 font-mono text-xs text-slate-300 sm:inline-block">
                  {repoLabel}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] font-medium tracking-wide text-slate-400">
              AI Architecture &amp; Red-Team Auditor
            </span>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span>Gemini 4 Powered</span>
          </div>

          {hasActiveReport ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#0F1623] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-teal-500/40 hover:bg-slate-800/80 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 text-teal-400" />
              <span>Reset / New Scan</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
