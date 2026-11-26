"use client";

import { useEffect } from "react";

interface NavbarProps {
  hasActiveReport: boolean;
  repoLabel?: string;
  onReset: () => void;
}

export function Navbar({ hasActiveReport, repoLabel, onReset }: NavbarProps) {
  useEffect(() => {
    if (!hasActiveReport) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasActiveReport, onReset]);

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-[#222226] bg-[#0A0A0B]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Version */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0 text-[#FAFAFA] transition-opacity group-hover:opacity-80"
            >
              <path
                d="M8 4H5C4.44772 4 4 4.44772 4 5V8M16 4H19C19.5523 4 20 4.44772 20 5V8M8 20H5C4.44772 20 4 19.5523 4 19V16M16 20H19C19.5523 20 20 19.5523 20 19V16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
              />
              <rect
                x="8.5"
                y="8.5"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <circle cx="12" cy="12" r="1.25" fill="currentColor" />
            </svg>
            <span className="text-sm font-semibold tracking-tight text-[#FAFAFA]">
              AegisLens
            </span>
          </button>

          <span className="rounded border border-[#222226] px-1.5 py-0.5 font-mono text-xs text-[#71717A]">
            v1.0
          </span>

          {repoLabel ? (
            <span className="hidden items-center gap-2 font-mono text-xs text-[#A1A1AA] sm:inline-flex">
              <span className="text-[#3F3F46]">/</span>
              <span>{repoLabel}</span>
            </span>
          ) : null}
        </div>

        {/* Right: New Scan Action */}
        <div className="flex items-center gap-3">
          {hasActiveReport ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-md border border-[#222226] bg-[#111113] px-2.5 py-1 text-xs font-medium text-[#FAFAFA] transition-colors hover:border-[#34343B] hover:bg-[#18181B]"
            >
              <span>New Scan</span>
              <kbd className="rounded border border-[#27272A] bg-[#0A0A0B] px-1 py-0.5 font-mono text-[10px] text-[#71717A]">
                ESC
              </kbd>
            </button>
          ) : (
            <span className="hidden font-mono text-xs text-[#71717A] sm:inline-block">
              Static &amp; Semantic Codebase Audit
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
